import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { query } from '../config/db.js';
import { validatePassword } from '../utils/auth.helpers.js';
import { formatRelativeTime, logActivity } from '../utils/admin.helpers.js';
import { isPdfFile } from '../middleware/upload.middleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.join(__dirname, '../../uploads');

function sendCvFile(res, cvUrl, downloadName = null) {
  const relative = String(cvUrl).replace(/^\/uploads\//, '');
  const absolute = path.resolve(uploadsRoot, relative);
  const root = path.resolve(uploadsRoot);

  if (!absolute.startsWith(root) || !fs.existsSync(absolute)) {
    return res.status(404).json({ error: 'Fichier CV introuvable' });
  }

  if (!isPdfFile(absolute)) {
    return res.status(422).json({
      error: 'Le fichier joint n\'est pas un PDF valide. Rejoignez un CV exporté au format PDF.',
    });
  }

  const name = downloadName || path.basename(absolute);
  res.setHeader('Content-Type', 'application/pdf');
  return res.download(absolute, name.endsWith('.pdf') ? name : `${name}.pdf`);
}

const MONTH_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const DAY_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const DAY_SHORT_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

function formatTimeRange(start, end) {
  const fmt = (t) => {
    const s = String(t).slice(0, 5);
    return s.replace(':', 'h');
  };
  return `${fmt(start)} - ${fmt(end)}`;
}

function formatDuration(hours) {
  const h = Number(hours) || 0;
  const whole = Math.floor(h);
  const mins = Math.round((h - whole) * 60);
  return `${whole}h ${String(mins).padStart(2, '0')}m`;
}

function formatPeriod(startDate, endDate) {
  if (!startDate || !endDate) return '';
  const start = new Date(startDate);
  const end = new Date(endDate);
  return `${MONTH_FR[start.getMonth()]} - ${MONTH_FR[end.getMonth()]}`;
}

function formatResponsableName(firstName, lastName) {
  const initial = firstName?.[0] ? `${firstName[0]}. ` : '';
  return `${initial}${lastName || ''}`.trim() || 'Responsable';
}

function parseTags(skills) {
  if (!skills) return [];
  return String(skills)
    .split(/[,;]/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => t.toUpperCase());
}

function mapApplicationStatus(status) {
  const map = {
    pending: 'en_attente',
    accepted: 'acceptee',
    rejected: 'refusee',
    withdrawn: 'retiree',
  };
  return map[status] || status;
}

function mapSessionStatus(sessionStatus, assignmentStatus) {
  if (assignmentStatus === 'cancelled_by_student' || sessionStatus === 'cancelled') return 'annulé';
  if (sessionStatus === 'completed' || assignmentStatus === 'completed') return 'passé';
  return 'prévu';
}

function mapHourStatus(status) {
  const map = {
    pending: 'en_attente',
    validated: 'validee',
    rejected: 'refusee',
    cancelled: 'annulee',
  };
  return map[status] || status;
}

function makeSigle(subject) {
  if (!subject) return 'TP';
  const words = subject.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.map((w) => w[0]).join('').slice(0, 4).toUpperCase();
}

function formatDateLong(dateStr) {
  const d = new Date(dateStr);
  return `${DAY_SHORT_FR[d.getDay()]} ${String(d.getDate()).padStart(2, '0')} ${MONTH_FR[d.getMonth()]}`;
}

async function getStudentOrFail(studentId, schoolId) {
  const rows = await query(
    `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active,
            sp.student_number, sp.major, sp.study_year, sp.account_holder, sp.iban, sp.bic,
            sp.filiere_id, f.name AS filiere_name, s.name AS school_name
     FROM users u
     JOIN student_profiles sp ON sp.user_id = u.id
     JOIN schools s ON s.id = u.school_id
     LEFT JOIN filieres f ON f.id = sp.filiere_id
     WHERE u.id = ? AND u.school_id = ? AND u.role = 'etudiant'
     LIMIT 1`,
    [studentId, schoolId]
  );
  return rows[0] || null;
}

function mapNotifType(type) {
  if (type === 'application_accepted' || type === 'success') return 'success';
  if (type === 'iban_missing' || type === 'application_rejected' || type === 'warning') return 'warning';
  return 'info';
}

/**
 * Synchronise les notifications dérivées (IBAN, décisions candidatures)
 * dans la table notifications pour l'étudiant.
 */
async function syncStudentNotifications(studentId, student) {
  if (!student.iban) {
    const existing = await query(
      `SELECT id FROM notifications
       WHERE user_id = ? AND type = 'iban_missing' AND is_read = 0
       LIMIT 1`,
      [studentId]
    );
    if (!existing[0]) {
      await query(
        `INSERT INTO notifications (user_id, type, title, message, related_entity_type)
         VALUES (?, 'iban_missing', 'IBAN manquant', ?, 'profile')`,
        [studentId, "N'oubliez pas de renseigner votre IBAN dans votre profil."]
      );
    }
  } else {
    await query(
      `UPDATE notifications SET is_read = 1
       WHERE user_id = ? AND type = 'iban_missing' AND is_read = 0`,
      [studentId]
    );
  }

  const apps = await query(
    `SELECT a.id, a.status, a.reviewed_at, o.subject
     FROM applications a
     JOIN offers o ON o.id = a.offer_id
     WHERE a.student_id = ? AND a.status IN ('accepted', 'rejected')`,
    [studentId]
  );

  for (const app of apps) {
    const type = app.status === 'accepted' ? 'application_accepted' : 'application_rejected';
    const existing = await query(
      `SELECT id FROM notifications
       WHERE user_id = ? AND related_entity_type = 'application' AND related_entity_id = ?
       LIMIT 1`,
      [studentId, app.id]
    );
    if (existing[0]) continue;

    await query(
      `INSERT INTO notifications (user_id, type, title, message, related_entity_type, related_entity_id, created_at)
       VALUES (?, ?, ?, ?, 'application', ?, COALESCE(?, CURRENT_TIMESTAMP))`,
      [
        studentId,
        type,
        app.status === 'accepted' ? 'Candidature acceptée' : 'Candidature refusée',
        app.status === 'accepted'
          ? `Votre candidature pour '${app.subject}' a été acceptée !`
          : `Votre candidature pour '${app.subject}' a été refusée.`,
        app.id,
        app.reviewed_at,
      ]
    );
  }
}

/**
 * GET /api/etudiant/notifications
 */
export async function getNotifications(req, res, next) {
  try {
    const studentId = req.user.id;
    const schoolId = req.user.schoolId;
    const student = await getStudentOrFail(studentId, schoolId);
    if (!student) return res.status(404).json({ error: 'Profil introuvable' });

    await syncStudentNotifications(studentId, student);

    const rows = await query(
      `SELECT id, type, title, message, is_read, created_at, related_entity_type, related_entity_id
       FROM notifications
       WHERE user_id = ?
       ORDER BY is_read ASC, created_at DESC
       LIMIT 30`,
      [studentId]
    );

    return res.json({
      notifications: rows.map((n) => ({
        id: n.id,
        text: n.message,
        title: n.title,
        time: n.type === 'iban_missing' && !n.is_read ? 'À faire' : formatRelativeTime(n.created_at),
        read: Boolean(n.is_read),
        type: mapNotifType(n.type),
        relatedType: n.related_entity_type,
        relatedId: n.related_entity_id,
      })),
      unreadCount: rows.filter((n) => !n.is_read).length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/etudiant/notifications/read-all
 */
export async function markNotificationsRead(req, res, next) {
  try {
    await query(
      `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0`,
      [req.user.id]
    );
    return res.json({ message: 'Notifications marquées comme lues' });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/etudiant/dashboard
 * Résumé accueil (IBAN, compteurs).
 */
export async function getDashboard(req, res, next) {
  try {
    const studentId = req.user.id;
    const schoolId = req.user.schoolId;

    const student = await getStudentOrFail(studentId, schoolId);
    if (!student) return res.status(404).json({ error: 'Profil introuvable' });

    const [stats] = await query(
      `SELECT
         (SELECT COUNT(*) FROM applications WHERE student_id = ? AND status = 'pending') AS candidatures_attente,
         (SELECT COUNT(*) FROM applications WHERE student_id = ? AND status = 'accepted') AS candidatures_acceptees,
         (SELECT COUNT(*) FROM session_assignments sa
          JOIN sessions s ON s.id = sa.session_id
          WHERE sa.student_id = ? AND sa.status = 'assigned' AND s.status = 'scheduled'
            AND s.session_date >= CURDATE()) AS seances_a_venir,
         (SELECT COALESCE(SUM(duration_hours), 0) FROM hour_records
          WHERE student_id = ? AND status = 'validated') AS heures_validees`,
      [studentId, studentId, studentId, studentId]
    );

    return res.json({
      profile: {
        name: `${student.first_name} ${student.last_name}`,
        firstName: student.first_name,
        major: student.major,
        school: student.school_name,
      },
      ibanMissing: !student.iban,
      stats: {
        candidaturesAttente: Number(stats?.candidatures_attente || 0),
        candidaturesAcceptees: Number(stats?.candidatures_acceptees || 0),
        seancesAVenir: Number(stats?.seances_a_venir || 0),
        heuresValidees: Number(stats?.heures_validees || 0),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/etudiant/offres
 * Offres actives de l'école + statutCandidature de l'étudiant.
 */
export async function getOffres(req, res, next) {
  try {
    const studentId = req.user.id;
    const schoolId = req.user.schoolId;

    const rows = await query(
      `SELECT o.id, o.subject, o.level, o.weekly_hours, o.start_date, o.end_date,
              o.description, o.required_skills, o.min_grade,
              u.first_name AS resp_first, u.last_name AS resp_last,
              a.status AS application_status
       FROM offers o
       JOIN users u ON u.id = o.responsable_id
       LEFT JOIN applications a ON a.offer_id = o.id AND a.student_id = ?
       WHERE o.school_id = ? AND o.status = 'active'
       ORDER BY o.created_at DESC`,
      [studentId, schoolId]
    );

    const offres = rows.map((o) => {
      const applied = o.application_status && o.application_status !== 'withdrawn';
      return {
        id: o.id,
        titre: o.subject,
        responsable: formatResponsableName(o.resp_first, o.resp_last),
        volume: `${Number(o.weekly_hours)}h / semaine`,
        periode: formatPeriod(o.start_date, o.end_date),
        description: o.description,
        tags: parseTags(o.required_skills),
        niveau: o.level,
        minGrade: o.min_grade != null ? Number(o.min_grade) : null,
        statutCandidature: applied ? 'postule' : null,
        applicationStatus: o.application_status
          ? mapApplicationStatus(o.application_status)
          : null,
      };
    });

    return res.json({ offres });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/etudiant/candidatures
 * JSON ou multipart/form-data (champ fichier: cv)
 * Body: { offreId, phone?, grade?, motivation, availability? }
 */
export async function createCandidature(req, res, next) {
  try {
    const studentId = req.user.id;
    const schoolId = req.user.schoolId;
    const {
      offreId,
      offerId,
      phone,
      grade,
      motivation,
      availability,
    } = req.body;

    const resolvedOfferId = Number(offreId || offerId);
    if (!resolvedOfferId || !motivation?.trim()) {
      return res.status(400).json({ error: 'offreId et motivation sont obligatoires' });
    }

    const offers = await query(
      `SELECT id, subject, min_grade, status
       FROM offers
       WHERE id = ? AND school_id = ? AND status = 'active'
       LIMIT 1`,
      [resolvedOfferId, schoolId]
    );
    if (!offers[0]) {
      return res.status(404).json({ error: 'Offre introuvable ou fermée' });
    }

    const gradeValue = grade != null && grade !== '' ? Number(grade) : null;
    if (gradeValue != null && (Number.isNaN(gradeValue) || gradeValue < 0 || gradeValue > 20)) {
      return res.status(400).json({ error: 'La note doit être entre 0 et 20' });
    }

    const requiredMin = offers[0].min_grade != null ? Number(offers[0].min_grade) : null;
    // Ignore les seuils invalides (>20) issus de mauvaises saisies
    if (requiredMin != null && requiredMin >= 0 && requiredMin <= 20 && gradeValue != null && gradeValue < requiredMin) {
      return res.status(400).json({
        error: `Note insuffisante (minimum ${requiredMin}/20 requis)`,
      });
    }

    const existing = await query(
      `SELECT id, status, cv_url FROM applications WHERE offer_id = ? AND student_id = ? LIMIT 1`,
      [resolvedOfferId, studentId]
    );

    if (existing[0] && existing[0].status !== 'withdrawn') {
      return res.status(409).json({ error: 'Vous avez déjà candidaté à cette offre' });
    }

    if (phone?.trim()) {
      await query(`UPDATE users SET phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [
        phone.trim(),
        studentId,
      ]);
    }

    const availabilityJson = availability
      ? JSON.stringify(Array.isArray(availability) ? availability : availability)
      : null;

    const cvUrl = req.file ? `/uploads/cvs/${req.file.filename}` : null;
    let applicationId;

    if (existing[0]?.status === 'withdrawn') {
      await query(
        `UPDATE applications SET
           motivation = ?, grade_obtained = ?, availability = ?,
           cv_url = COALESCE(?, cv_url),
           status = 'pending', rejection_reason = NULL, reviewer_comment = NULL,
           applied_at = CURRENT_TIMESTAMP, reviewed_at = NULL, reviewed_by = NULL
         WHERE id = ?`,
        [motivation.trim(), gradeValue, availabilityJson, cvUrl, existing[0].id]
      );
      applicationId = existing[0].id;
    } else {
      const result = await query(
        `INSERT INTO applications (offer_id, student_id, motivation, grade_obtained, availability, cv_url, status)
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [resolvedOfferId, studentId, motivation.trim(), gradeValue, availabilityJson, cvUrl]
      );
      applicationId = result.insertId;
    }

    await logActivity(
      schoolId,
      studentId,
      'application_submitted',
      `Candidature envoyée pour "${offers[0].subject}"${cvUrl ? ' (CV joint)' : ''}`
    );

    return res.status(201).json({
      message: 'Candidature envoyée',
      id: applicationId,
      statutCandidature: 'postule',
      cvUrl,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/etudiant/candidatures/:id/cv
 * Télécharge le CV de sa propre candidature.
 */
export async function downloadOwnCv(req, res, next) {
  try {
    const studentId = req.user.id;
    const { id } = req.params;

    const rows = await query(
      `SELECT cv_url FROM applications WHERE id = ? AND student_id = ? LIMIT 1`,
      [id, studentId]
    );
    if (!rows[0]?.cv_url) {
      return res.status(404).json({ error: 'CV introuvable pour cette candidature' });
    }

    return sendCvFile(res, rows[0].cv_url);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/etudiant/candidatures
 */
export async function getCandidatures(req, res, next) {
  try {
    const studentId = req.user.id;
    const { status = '' } = req.query;

    let sql = `
      SELECT a.id, a.motivation, a.grade_obtained, a.status, a.applied_at,
             a.rejection_reason, a.reviewer_comment, a.cv_url,
             o.subject, o.level, o.description,
             u.first_name AS resp_first, u.last_name AS resp_last,
             u.email AS resp_email, u.phone AS resp_phone
      FROM applications a
      JOIN offers o ON o.id = a.offer_id
      JOIN users u ON u.id = o.responsable_id
      WHERE a.student_id = ?
    `;
    const params = [studentId];

    if (status && status !== 'toutes' && status !== 'all') {
      const dbStatus =
        status === 'en_attente'
          ? 'pending'
          : status === 'acceptee'
            ? 'accepted'
            : status === 'refusee'
              ? 'rejected'
              : status === 'retiree'
                ? 'withdrawn'
                : status;
      sql += ` AND a.status = ?`;
      params.push(dbStatus);
    }

    sql += ` ORDER BY a.applied_at DESC`;

    const rows = await query(sql, params);

    const candidatures = rows.map((a) => {
      const mapped = mapApplicationStatus(a.status);
      let feedback = null;
      let feedbackAuthor = null;

      if (a.status === 'accepted') {
        feedback = a.reviewer_comment
          ? `"${a.reviewer_comment}"`
          : '"Candidature acceptée. Bienvenue dans l\'équipe !"';
        feedbackAuthor = 'RESPONSABLE PÉDAGOGIQUE';
      } else if (a.status === 'rejected') {
        feedback = a.rejection_reason || a.reviewer_comment || 'Candidature refusée.';
        feedbackAuthor = 'MOTIF DU REFUS';
      } else if (a.status === 'pending') {
        feedback = 'Analyse en cours par le responsable';
      }

      return {
        id: a.id,
        module: a.level || '',
        titre: a.subject,
        description: a.description,
        date: `Soumis le ${new Date(a.applied_at).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}`,
        appliedAt: a.applied_at,
        status: mapped,
        feedback,
        feedbackAuthor,
        responsable: formatResponsableName(a.resp_first, a.resp_last),
        responsableEmail: a.resp_email || null,
        responsablePhone: a.resp_phone || null,
        grade: a.grade_obtained != null ? Number(a.grade_obtained) : null,
        relativeDate: formatRelativeTime(a.applied_at),
        hasCv: Boolean(a.cv_url),
      };
    });

    const stats = {
      total: candidatures.length,
      acceptees: candidatures.filter((c) => c.status === 'acceptee').length,
      en_attente: candidatures.filter((c) => c.status === 'en_attente').length,
      refusees: candidatures.filter((c) => c.status === 'refusee').length,
    };

    return res.json({ candidatures, stats });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/etudiant/candidatures/:id/withdraw
 */
export async function withdrawCandidature(req, res, next) {
  try {
    const studentId = req.user.id;
    const { id } = req.params;

    const rows = await query(
      `SELECT id, status FROM applications WHERE id = ? AND student_id = ? LIMIT 1`,
      [id, studentId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Candidature introuvable' });
    if (rows[0].status !== 'pending') {
      return res.status(400).json({ error: 'Seules les candidatures en attente peuvent être retirées' });
    }

    await query(
      `UPDATE applications SET status = 'withdrawn', reviewed_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [id]
    );

    return res.json({ message: 'Candidature retirée', status: 'retiree' });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/etudiant/seances
 */
export async function getSeances(req, res, next) {
  try {
    const studentId = req.user.id;

    const rows = await query(
      `SELECT s.id, s.session_date, s.start_time, s.end_time, s.room, s.status AS session_status,
              o.subject,
              sa.status AS assignment_status, sa.cancellation_reason,
              u.first_name AS resp_first, u.last_name AS resp_last
       FROM session_assignments sa
       JOIN sessions s ON s.id = sa.session_id
       JOIN offers o ON o.id = s.offer_id
       JOIN users u ON u.id = s.responsable_id
       WHERE sa.student_id = ?
       ORDER BY s.session_date DESC, s.start_time ASC`,
      [studentId]
    );

    const seances = rows.map((s) => {
      const date = new Date(s.session_date);
      const statut = mapSessionStatus(s.session_status, s.assignment_status);

      return {
        id: s.id,
        date: s.session_date,
        dateStr: String(date.getDate()).padStart(2, '0'),
        dateL: formatDateLong(s.session_date),
        matiere: s.subject,
        sigle: makeSigle(s.subject),
        horaire: formatTimeRange(s.start_time, s.end_time),
        salle: s.room,
        statut,
        jour: DAY_FR[date.getDay()],
        responsable: formatResponsableName(s.resp_first, s.resp_last),
        motifAnnulation: s.cancellation_reason || null,
        canCancel:
          statut === 'prévu' &&
          date > new Date(new Date().toDateString()),
      };
    });

    return res.json({ seances });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/etudiant/seances/:id/cancel
 * Body: { motif }
 * Règle : annulation possible uniquement à J-1 minimum (pas le jour même ni après).
 */
export async function cancelSeance(req, res, next) {
  try {
    const studentId = req.user.id;
    const schoolId = req.user.schoolId;
    const { id } = req.params;
    const { motif } = req.body;

    if (!motif?.trim()) {
      return res.status(400).json({ error: "Le motif d'annulation est obligatoire" });
    }

    const rows = await query(
      `SELECT sa.id AS assignment_id, sa.status AS assignment_status,
              s.id AS session_id, s.session_date, s.status AS session_status,
              s.responsable_id, o.subject
       FROM session_assignments sa
       JOIN sessions s ON s.id = sa.session_id
       JOIN offers o ON o.id = s.offer_id
       WHERE sa.session_id = ? AND sa.student_id = ?
       LIMIT 1`,
      [id, studentId]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'Séance introuvable ou non assignée' });
    }

    const row = rows[0];

    if (row.assignment_status === 'cancelled_by_student') {
      return res.status(400).json({ error: 'Cette séance est déjà annulée' });
    }

    if (row.assignment_status !== 'assigned') {
      return res.status(400).json({ error: 'Impossible d\'annuler cette séance' });
    }

    const sessionDate = new Date(row.session_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    sessionDate.setHours(0, 0, 0, 0);

    // J-1 minimum : la séance doit être au moins demain
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (sessionDate < tomorrow) {
      return res.status(400).json({
        error: 'Annulation impossible : vous devez annuler au plus tard la veille (J-1)',
      });
    }

    await query(
      `UPDATE session_assignments
       SET status = 'cancelled_by_student',
           cancelled_at = CURRENT_TIMESTAMP,
           cancellation_reason = ?
       WHERE id = ?`,
      [motif.trim(), row.assignment_id]
    );

    await query(
      `UPDATE hour_records
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE session_id = ? AND student_id = ? AND status = 'pending'`,
      [row.session_id, studentId]
    );

    await query(
      `INSERT INTO notifications (user_id, type, title, message, related_entity_type, related_entity_id)
       VALUES (?, 'session_cancelled', ?, ?, 'session', ?)`,
      [
        row.responsable_id,
        'Annulation de séance',
        `Un assistant a annulé la séance "${row.subject}" du ${sessionDate.toLocaleDateString('fr-FR')}. Motif : ${motif.trim()}`,
        row.session_id,
      ]
    );

    await logActivity(
      schoolId,
      studentId,
      'session_cancelled_by_student',
      `Séance "${row.subject}" annulée — ${motif.trim()}`
    );

    return res.json({
      message: 'Séance annulée',
      statut: 'annulé',
      motif: motif.trim(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/etudiant/heures
 * Query: month=YYYY-MM (optionnel)
 */
export async function getHeures(req, res, next) {
  try {
    const studentId = req.user.id;
    const { month } = req.query;

    let sql = `
      SELECT hr.id, hr.duration_hours, hr.status, hr.rejection_reason, hr.created_at, hr.validated_at,
             s.session_date, s.start_time, s.end_time,
             o.subject
      FROM hour_records hr
      JOIN sessions s ON s.id = hr.session_id
      JOIN offers o ON o.id = s.offer_id
      WHERE hr.student_id = ?
    `;
    const params = [studentId];

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      sql += ` AND DATE_FORMAT(s.session_date, '%Y-%m') = ?`;
      params.push(month);
    }

    sql += ` ORDER BY s.session_date DESC`;

    const rows = await query(sql, params);

    const heures = rows.map((h) => ({
      id: h.id,
      date: new Date(h.session_date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      sessionDate: h.session_date,
      matiere: h.subject,
      horaire: formatTimeRange(h.start_time, h.end_time),
      duree: formatDuration(h.duration_hours),
      durationHours: Number(h.duration_hours),
      statut: mapHourStatus(h.status),
      motif: h.rejection_reason || null,
    }));

    const sumBy = (predicate) =>
      heures.filter(predicate).reduce((acc, h) => acc + h.durationHours, 0);

    const stats = {
      total: sumBy(() => true),
      validees: sumBy((h) => h.statut === 'validee'),
      en_attente: sumBy((h) => h.statut === 'en_attente'),
      refusees: sumBy((h) => h.statut === 'refusee'),
    };

    // Mois disponibles pour le sélecteur frontend
    const monthRows = await query(
      `SELECT DISTINCT DATE_FORMAT(s.session_date, '%Y-%m') AS ym
       FROM hour_records hr
       JOIN sessions s ON s.id = hr.session_id
       WHERE hr.student_id = ?
       ORDER BY ym DESC`,
      [studentId]
    );

    const months = monthRows.map((m) => {
      const [y, mo] = m.ym.split('-');
      return {
        value: m.ym,
        label: `${MONTH_FR[Number(mo) - 1]} ${y}`,
      };
    });

    return res.json({ heures, stats, months });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/etudiant/heures/declarables
 * Séances assignées sans heure déjà déclarée.
 */
export async function getDeclarableSessions(req, res, next) {
  try {
    const studentId = req.user.id;

    const rows = await query(
      `SELECT sa.id AS assignment_id, s.id AS session_id, s.session_date, s.start_time, s.end_time, s.room,
              o.subject, s.responsable_id,
              ROUND(TIMESTAMPDIFF(MINUTE, s.start_time, s.end_time) / 60, 2) AS duration_hours
       FROM session_assignments sa
       JOIN sessions s ON s.id = sa.session_id
       JOIN offers o ON o.id = s.offer_id
       WHERE sa.student_id = ?
         AND sa.status IN ('assigned', 'completed')
         AND s.status IN ('scheduled', 'completed')
         AND NOT EXISTS (
           SELECT 1 FROM hour_records hr
           WHERE hr.session_id = s.id AND hr.student_id = sa.student_id
             AND hr.status IN ('pending', 'validated')
         )
       ORDER BY s.session_date DESC`,
      [studentId]
    );

    return res.json({
      seances: rows.map((r) => ({
        assignmentId: r.assignment_id,
        sessionId: r.session_id,
        matiere: r.subject,
        date: r.session_date,
        dateLabel: new Date(r.session_date).toLocaleDateString('fr-FR', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        horaire: formatTimeRange(r.start_time, r.end_time),
        startTime: String(r.start_time).slice(0, 5),
        endTime: String(r.end_time).slice(0, 5),
        salle: r.room,
        durationHours: Number(r.duration_hours) || 0,
        label: `${r.subject} — ${new Date(r.session_date).toLocaleDateString('fr-FR')} (${formatTimeRange(r.start_time, r.end_time)})`,
      })),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/etudiant/heures
 * Body: { sessionId }
 */
export async function declareHeures(req, res, next) {
  try {
    const studentId = req.user.id;
    const schoolId = req.user.schoolId;
    const sessionId = Number(req.body.sessionId);

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId est obligatoire' });
    }

    const rows = await query(
      `SELECT sa.id AS assignment_id, sa.status AS assign_status,
              s.id AS session_id, s.responsable_id, s.start_time, s.end_time, s.status AS session_status,
              o.subject,
              ROUND(TIMESTAMPDIFF(MINUTE, s.start_time, s.end_time) / 60, 2) AS duration_hours
       FROM session_assignments sa
       JOIN sessions s ON s.id = sa.session_id
       JOIN offers o ON o.id = s.offer_id
       WHERE sa.session_id = ? AND sa.student_id = ?
       LIMIT 1`,
      [sessionId, studentId]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'Séance introuvable ou non assignée' });
    }

    const row = rows[0];
    if (row.assign_status === 'cancelled_by_student') {
      return res.status(400).json({ error: 'Impossible de déclarer des heures pour une séance annulée' });
    }

    const existing = await query(
      `SELECT id, status FROM hour_records
       WHERE session_id = ? AND student_id = ? AND status IN ('pending', 'validated')
       LIMIT 1`,
      [sessionId, studentId]
    );
    if (existing[0]) {
      return res.status(409).json({ error: 'Des heures sont déjà déclarées pour cette séance' });
    }

    let duration = Number(row.duration_hours);
    if (!duration || duration <= 0) {
      duration = 2;
    }

    const result = await query(
      `INSERT INTO hour_records
         (session_id, assignment_id, student_id, responsable_id, duration_hours, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [row.session_id, row.assignment_id, studentId, row.responsable_id, duration]
    );

    await logActivity(
      schoolId,
      studentId,
      'hours_declared',
      `Déclaration de ${duration}h pour "${row.subject}"`
    );

    return res.status(201).json({
      message: 'Heures déclarées — en attente de validation',
      id: result.insertId,
      durationHours: duration,
      status: 'en_attente',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/etudiant/profil
 */
export async function getProfil(req, res, next) {
  try {
    const student = await getStudentOrFail(req.user.id, req.user.schoolId);
    if (!student) return res.status(404).json({ error: 'Profil introuvable' });

    const studyYearLabels = {
      L1: 'Licence 1 (L1)',
      L2: 'Licence 2 (L2)',
      L3: 'Licence 3 (L3)',
      M1: 'Master 1 (M1)',
      M2: 'Master 2 (M2)',
    };

    return res.json({
      profile: {
        firstName: student.first_name,
        lastName: student.last_name,
        email: student.email,
        studentId: student.student_number,
        school: student.school_name,
        role: student.major,
        verified: Boolean(student.is_active),
        phone: student.phone || '',
        filiere: student.filiere_name || student.major,
        filiereId: student.filiere_id,
        annee: studyYearLabels[student.study_year] || student.study_year,
        studyYear: student.study_year,
        banque: {
          titulaire: student.account_holder || `${student.first_name} ${student.last_name}`,
          iban: student.iban || '',
          bic: student.bic || '',
        },
        ibanMissing: !student.iban,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/etudiant/profil
 * Body: { phone?, accountHolder?, iban?, bic? }
 */
export async function updateProfil(req, res, next) {
  try {
    const studentId = req.user.id;
    const schoolId = req.user.schoolId;
    const { phone, accountHolder, titulaire, iban, bic } = req.body;

    const student = await getStudentOrFail(studentId, schoolId);
    if (!student) return res.status(404).json({ error: 'Profil introuvable' });

    if (phone !== undefined) {
      await query(`UPDATE users SET phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [
        phone?.trim() || null,
        studentId,
      ]);
    }

    const holder = accountHolder ?? titulaire;
    let normalizedIban = iban;

    if (iban !== undefined) {
      normalizedIban = iban ? String(iban).replace(/\s+/g, '').toUpperCase() : null;
      if (normalizedIban && !/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(normalizedIban)) {
        return res.status(400).json({ error: 'Format IBAN invalide' });
      }
    }

    if (holder !== undefined || iban !== undefined || bic !== undefined) {
      await query(
        `UPDATE student_profiles SET
           account_holder = COALESCE(?, account_holder),
           iban = COALESCE(?, iban),
           bic = COALESCE(?, bic),
           updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [
          holder !== undefined ? holder?.trim() || null : null,
          iban !== undefined ? normalizedIban : null,
          bic !== undefined ? (bic?.trim().toUpperCase() || null) : null,
          studentId,
        ]
      );
    }

    // Si IBAN explicitement vidé
    if (iban === '' || iban === null) {
      await query(
        `UPDATE student_profiles SET iban = NULL, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
        [studentId]
      );
    }

    await logActivity(schoolId, studentId, 'student_profile_updated', 'Profil étudiant mis à jour');

    return res.json({ message: 'Profil mis à jour' });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/etudiant/profil/password
 */
export async function updatePassword(req, res, next) {
  try {
    const studentId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'Tous les champs mot de passe sont obligatoires' });
    }

    const pwdError = validatePassword(newPassword, confirmPassword);
    if (pwdError) return res.status(400).json({ error: pwdError });

    const rows = await query(`SELECT password_hash FROM users WHERE id = ? LIMIT 1`, [studentId]);
    if (!rows[0]) return res.status(404).json({ error: 'Utilisateur introuvable' });

    const ok = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!ok) return res.status(401).json({ error: 'Mot de passe actuel incorrect' });

    const hash = await bcrypt.hash(newPassword, 10);
    await query(
      `UPDATE users SET password_hash = ?, must_change_password = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [hash, studentId]
    );

    return res.json({ message: 'Mot de passe mis à jour' });
  } catch (error) {
    next(error);
  }
}
