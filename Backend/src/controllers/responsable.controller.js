import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { validatePassword } from '../utils/auth.helpers.js';
import {
  getInitials,
  formatRelativeTime,
  getMonthLabel,
  logActivity,
} from '../utils/admin.helpers.js';

const OFFER_COLORS = ['#7c3aed', '#2563eb', '#16a34a', '#d97706'];
const ASSISTANT_COLORS = [
  { bg: '#e0e7ff', text: '#3730a3' },
  { bg: '#fef3c7', text: '#92400e' },
  { bg: '#ffedd5', text: '#9a3412' },
  { bg: '#ddd6fe', text: '#5b21b6' },
];

function mapOfferStatus(status) {
  return status === 'active' ? 'active' : 'pourvue';
}

function mapApplicationStatus(status) {
  const map = { pending: 'en_attente', accepted: 'accepte', rejected: 'refuse', withdrawn: 'refuse' };
  return map[status] || status;
}

function formatSessionDate(dateStr) {
  const d = new Date(dateStr);
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  return `${days[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}/${months[d.getMonth()]}`;
}

function formatTimeRange(start, end) {
  if (!start || !end) return null;
  return `${String(start).slice(0, 5)} - ${String(end).slice(0, 5)}`;
}

async function getResponsableOrFail(responsableId, schoolId) {
  const rows = await query(
    `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, rp.department
     FROM users u
     JOIN responsable_profiles rp ON rp.user_id = u.id
     WHERE u.id = ? AND u.school_id = ? AND u.role = 'responsable' AND u.is_active = 1
     LIMIT 1`,
    [responsableId, schoolId]
  );
  return rows[0] || null;
}

/**
 * GET /api/responsable/dashboard
 */
export async function getDashboard(req, res, next) {
  try {
    const responsableId = req.user.id;
    const schoolId = req.user.schoolId;

    const [
      statsRows,
      upcomingRows,
      alertSessionRows,
      pendingAppRows,
    ] = await Promise.all([
      query(
        `SELECT
           (SELECT COUNT(*) FROM offers WHERE responsable_id = ? AND status = 'active') AS offres,
           (SELECT COUNT(*) FROM applications a
            JOIN offers o ON o.id = a.offer_id
            WHERE o.responsable_id = ? AND a.status = 'pending') AS candidatures,
           (SELECT COUNT(DISTINCT a.student_id) FROM applications a
            JOIN offers o ON o.id = a.offer_id
            WHERE o.responsable_id = ? AND a.status = 'accepted') AS assistants,
           (SELECT COALESCE(SUM(hr.duration_hours), 0) FROM hour_records hr
            WHERE hr.responsable_id = ? AND hr.status = 'pending') AS heures`,
        [responsableId, responsableId, responsableId, responsableId]
      ),
      query(
        `SELECT s.id, s.session_date, s.start_time, s.end_time, o.subject AS matiere,
                u.first_name, u.last_name
         FROM sessions s
         JOIN offers o ON o.id = s.offer_id
         LEFT JOIN session_assignments sa ON sa.session_id = s.id AND sa.status != 'cancelled_by_student'
         LEFT JOIN users u ON u.id = sa.student_id
         WHERE s.responsable_id = ? AND s.status = 'scheduled' AND s.session_date >= CURDATE()
         ORDER BY s.session_date, s.start_time
         LIMIT 5`,
        [responsableId]
      ),
      query(
        `SELECT s.id, s.session_date, s.start_time, s.end_time, o.subject AS matiere,
                u.first_name, u.last_name, sa.cancellation_reason AS motif
         FROM sessions s
         JOIN offers o ON o.id = s.offer_id
         JOIN session_assignments sa ON sa.session_id = s.id
         JOIN users u ON u.id = sa.student_id
         WHERE s.responsable_id = ? AND sa.status = 'cancelled_by_student'
         ORDER BY sa.cancelled_at DESC
         LIMIT 5`,
        [responsableId]
      ),
      query(
        `SELECT COUNT(*) AS total FROM applications a
         JOIN offers o ON o.id = a.offer_id
         WHERE o.responsable_id = ? AND a.status = 'pending'`,
        [responsableId]
      ),
    ]);

    const stats = statsRows[0];
    const pendingApps = Number(pendingAppRows[0]?.total || 0);

    const alerts = [];
    for (const s of alertSessionRows) {
      alerts.push({
        type: 'session_cancelled',
        title: `${s.first_name} ${s.last_name} a annulé sa séance`,
        text: `${s.matiere} • ${formatSessionDate(s.session_date)} • ${formatTimeRange(s.start_time, s.end_time)}`,
        sessionId: s.id,
      });
    }
    if (pendingApps > 0) {
      alerts.push({
        type: 'applications_pending',
        title: `${pendingApps} candidature${pendingApps > 1 ? 's' : ''} en attente`,
        text: 'Des étudiants attendent votre réponse.',
      });
    }

    const totalPending = Number(stats.heures || 0);
    const validatedTotal = await query(
      `SELECT COALESCE(SUM(duration_hours), 0) AS total FROM hour_records
       WHERE responsable_id = ? AND status = 'validated'
         AND YEAR(validated_at) = YEAR(CURDATE()) AND MONTH(validated_at) = MONTH(CURDATE())`,
      [responsableId]
    );
    const monthTotal = Number(validatedTotal[0]?.total || 0) + totalPending;
    const progressPercent = monthTotal > 0 ? Math.round((Number(validatedTotal[0]?.total || 0) / monthTotal) * 100) : 0;

    return res.json({
      stats: {
        offres: Number(stats.offres || 0),
        candidatures: Number(stats.candidatures || 0),
        assistants: Number(stats.assistants || 0),
        heures: Number(stats.heures || 0),
      },
      progressPercent,
      alerts,
      upcomingSessions: upcomingRows.map((s) => ({
        id: s.id,
        date: formatSessionDate(s.session_date),
        time: formatTimeRange(s.start_time, s.end_time),
        matiere: s.matiere,
        assistant: s.first_name ? `${s.first_name} ${s.last_name?.charAt(0) || ''}.`.trim() : null,
      })),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/responsable/summary
 * Badges sidebar, cloche notifications, profil header.
 */
export async function getSummary(req, res, next) {
  try {
    const responsableId = req.user.id;
    const schoolId = req.user.schoolId;

    const user = await getResponsableOrFail(responsableId, schoolId);
    if (!user) return res.status(404).json({ error: 'Profil introuvable' });

    const [statsRows, cancelledRows, pendingAppRows] = await Promise.all([
      query(
        `SELECT
           (SELECT COUNT(*) FROM applications a
            JOIN offers o ON o.id = a.offer_id
            WHERE o.responsable_id = ? AND a.status = 'pending') AS candidatures,
           (SELECT COALESCE(SUM(hr.duration_hours), 0) FROM hour_records hr
            WHERE hr.responsable_id = ? AND hr.status = 'pending') AS heures`,
        [responsableId, responsableId]
      ),
      query(
        `SELECT s.id, s.session_date, s.start_time, s.end_time, o.subject AS matiere,
                u.first_name, u.last_name, sa.cancelled_at
         FROM sessions s
         JOIN offers o ON o.id = s.offer_id
         JOIN session_assignments sa ON sa.session_id = s.id
         JOIN users u ON u.id = sa.student_id
         WHERE s.responsable_id = ? AND sa.status = 'cancelled_by_student'
         ORDER BY sa.cancelled_at DESC
         LIMIT 5`,
        [responsableId]
      ),
      query(
        `SELECT a.id, a.applied_at, o.subject AS matiere, u.first_name, u.last_name
         FROM applications a
         JOIN offers o ON o.id = a.offer_id
         JOIN users u ON u.id = a.student_id
         WHERE o.responsable_id = ? AND a.status = 'pending'
         ORDER BY a.applied_at DESC
         LIMIT 5`,
        [responsableId]
      ),
    ]);

    const candidatures = Number(statsRows[0]?.candidatures || 0);
    const heuresPending = Number(statsRows[0]?.heures || 0);

    const notifications = [];

    for (const s of cancelledRows) {
      notifications.push({
        id: `session-${s.id}`,
        type: 'annulation',
        title: `${s.first_name} ${s.last_name} a annulé sa séance`,
        desc: `${s.matiere} - ${formatSessionDate(s.session_date)} - ${formatTimeRange(s.start_time, s.end_time)}`,
        time: formatRelativeTime(s.cancelled_at),
        unread: true,
      });
    }

    for (const a of pendingAppRows) {
      notifications.push({
        id: `app-${a.id}`,
        type: 'candidature',
        title: `${a.first_name} ${a.last_name} a candidaté`,
        desc: `Offre: ${a.matiere}`,
        time: formatRelativeTime(a.applied_at),
        unread: true,
      });
    }

    return res.json({
      badges: {
        candidatures,
        heuresLabel: heuresPending > 0 ? `${Math.round(heuresPending)}h` : null,
      },
      notifications,
      profile: {
        name: `${user.first_name?.charAt(0) || ''}. ${user.last_name}`,
        fullName: `${user.first_name} ${user.last_name}`,
        role: 'Responsable Pédagogique',
        department: user.department,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/responsable/offers
 */
export async function getOffers(req, res, next) {
  try {
    const responsableId = req.user.id;

    const rows = await query(
      `SELECT o.id, o.subject, o.description, o.weekly_hours, o.min_grade, o.status, o.created_at,
              (SELECT COUNT(*) FROM applications a WHERE a.offer_id = o.id AND a.status = 'pending') AS candidatures_pending,
              (SELECT COUNT(*) FROM applications a WHERE a.offer_id = o.id AND a.status = 'accepted') AS places_prises
       FROM offers o
       WHERE o.responsable_id = ?
       ORDER BY o.created_at DESC`,
      [responsableId]
    );

    return res.json({
      offers: rows.map((o) => ({
        id: o.id,
        matiere: o.subject,
        description: o.description,
        places: Math.round(Number(o.weekly_hours)),
        candidatures: Number(o.candidatures_pending) + Number(o.places_prises),
        grade_requise: o.min_grade ? `${Number(o.min_grade)}/20 minimum` : 'Non spécifié',
        status: mapOfferStatus(o.status),
        date_creation: new Date(o.created_at).toLocaleDateString('fr-FR'),
      })),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/responsable/offers
 */
export async function createOffer(req, res, next) {
  try {
    const responsableId = req.user.id;
    const schoolId = req.user.schoolId;
    const { matiere, description, places, grade_requise, level } = req.body;

    if (!matiere?.trim() || !description?.trim()) {
      return res.status(400).json({ error: 'Matière et description sont obligatoires' });
    }

    const minGrade = grade_requise ? parseFloat(String(grade_requise).replace(/[^\d.]/g, '')) || null : null;

    const result = await query(
      `INSERT INTO offers
         (school_id, responsable_id, subject, level, weekly_hours, start_date, end_date,
          description, min_grade, status)
       VALUES (?, ?, ?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 6 MONTH), ?, ?, 'active')`,
      [
        schoolId,
        responsableId,
        matiere.trim(),
        level?.trim() || 'L3',
        Number(places) || 1,
        description.trim(),
        minGrade,
      ]
    );

    await logActivity(schoolId, responsableId, 'offer_created', `Offre "${matiere.trim()}" créée`);

    return res.status(201).json({ message: 'Offre créée', id: result.insertId });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/responsable/offers/:id
 */
export async function updateOffer(req, res, next) {
  try {
    const responsableId = req.user.id;
    const { id } = req.params;
    const { matiere, description, places, grade_requise, level } = req.body;

    const rows = await query(
      `SELECT id FROM offers WHERE id = ? AND responsable_id = ? LIMIT 1`,
      [id, responsableId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Offre introuvable' });

    const minGrade = grade_requise ? parseFloat(String(grade_requise).replace(/[^\d.]/g, '')) || null : null;

    await query(
      `UPDATE offers SET
         subject = COALESCE(?, subject),
         description = COALESCE(?, description),
         weekly_hours = COALESCE(?, weekly_hours),
         level = COALESCE(?, level),
         min_grade = COALESCE(?, min_grade),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [matiere?.trim(), description?.trim(), places ? Number(places) : null, level?.trim(), minGrade, id]
    );

    return res.json({ message: 'Offre mise à jour' });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/responsable/offers/:id/status
 */
export async function toggleOfferStatus(req, res, next) {
  try {
    const responsableId = req.user.id;
    const { id } = req.params;

    const rows = await query(
      `SELECT id, status FROM offers WHERE id = ? AND responsable_id = ? LIMIT 1`,
      [id, responsableId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Offre introuvable' });

    const newStatus = rows[0].status === 'active' ? 'closed' : 'active';
    await query(`UPDATE offers SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [newStatus, id]);

    return res.json({ message: 'Statut mis à jour', status: mapOfferStatus(newStatus) });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/responsable/applications
 */
export async function getApplications(req, res, next) {
  try {
    const responsableId = req.user.id;
    const { status = '' } = req.query;

    let sql = `
      SELECT a.id, a.motivation, a.grade_obtained, a.status, a.applied_at,
             o.subject AS matiere,
             u.first_name, u.last_name, u.email, u.phone
      FROM applications a
      JOIN offers o ON o.id = a.offer_id
      JOIN users u ON u.id = a.student_id
      WHERE o.responsable_id = ?
    `;
    const params = [responsableId];

    if (status && status !== 'all') {
      const dbStatus = status === 'en_attente' ? 'pending' : status === 'accepte' ? 'accepted' : status === 'refuse' ? 'rejected' : status;
      sql += ` AND a.status = ?`;
      params.push(dbStatus);
    }

    sql += ` ORDER BY a.applied_at DESC`;

    const rows = await query(sql, params);

    return res.json({
      applications: rows.map((a) => ({
        id: a.id,
        name: `${a.first_name} ${a.last_name}`,
        matiere: a.matiere,
        grade: a.grade_obtained ? `${Number(a.grade_obtained)}/20` : 'N/A',
        motivation: a.motivation,
        status: mapApplicationStatus(a.status),
        date: formatRelativeTime(a.applied_at),
        email: a.email,
        telephone: a.phone,
      })),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/responsable/applications/:id
 */
export async function reviewApplication(req, res, next) {
  try {
    const responsableId = req.user.id;
    const schoolId = req.user.schoolId;
    const { id } = req.params;
    const { action } = req.body;

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action invalide (accept ou reject)' });
    }

    const rows = await query(
      `SELECT a.id, a.student_id, o.subject, u.first_name, u.last_name
       FROM applications a
       JOIN offers o ON o.id = a.offer_id
       JOIN users u ON u.id = a.student_id
       WHERE a.id = ? AND o.responsable_id = ? LIMIT 1`,
      [id, responsableId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Candidature introuvable' });

    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    await query(
      `UPDATE applications SET status = ?, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ? WHERE id = ?`,
      [newStatus, responsableId, id]
    );

    await logActivity(
      schoolId,
      responsableId,
      action === 'accept' ? 'application_accepted' : 'application_rejected',
      `Candidature de ${rows[0].first_name} ${rows[0].last_name} (${rows[0].subject}) ${action === 'accept' ? 'acceptée' : 'refusée'}`
    );

    return res.json({
      message: action === 'accept' ? 'Candidature acceptée' : 'Candidature refusée',
      status: mapApplicationStatus(newStatus),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/responsable/sessions
 */
export async function getSessions(req, res, next) {
  try {
    const responsableId = req.user.id;

    const [currentRows, historyRows, assistantsRows] = await Promise.all([
      query(
        `SELECT s.id, s.session_date, s.start_time, s.end_time, s.status, o.subject AS matiere,
                u.first_name, u.last_name, sa.status AS assignment_status, sa.cancellation_reason AS motif
         FROM sessions s
         JOIN offers o ON o.id = s.offer_id
         LEFT JOIN session_assignments sa ON sa.session_id = s.id
         LEFT JOIN users u ON u.id = sa.student_id
         WHERE s.responsable_id = ?
           AND (s.status IN ('scheduled', 'cancelled') OR s.session_date >= DATE_SUB(CURDATE(), INTERVAL 14 DAY))
         ORDER BY s.session_date DESC`,
        [responsableId]
      ),
      query(
        `SELECT s.id, s.session_date, s.start_time, s.end_time, o.subject AS matiere,
                u.first_name, u.last_name
         FROM sessions s
         JOIN offers o ON o.id = s.offer_id
         LEFT JOIN session_assignments sa ON sa.session_id = s.id AND sa.status = 'completed'
         LEFT JOIN users u ON u.id = sa.student_id
         WHERE s.responsable_id = ? AND s.status = 'completed'
         ORDER BY s.session_date DESC
         LIMIT 50`,
        [responsableId]
      ),
      query(
        `SELECT DISTINCT u.id, u.first_name, u.last_name,
                GROUP_CONCAT(DISTINCT o.subject SEPARATOR ', ') AS matieres,
                MAX(a.grade_obtained) AS grade
         FROM applications a
         JOIN offers o ON o.id = a.offer_id
         JOIN users u ON u.id = a.student_id
         WHERE o.responsable_id = ? AND a.status = 'accepted'
         GROUP BY u.id, u.first_name, u.last_name
         ORDER BY u.last_name`,
        [responsableId]
      ),
    ]);

    const mapSessionStatus = (s) => {
      if (s.status === 'cancelled' || s.assignment_status === 'cancelled_by_student') return 'annulee';
      if (s.first_name && s.status === 'scheduled') return 'avec_assistant';
      if (s.status === 'scheduled') return 'sans_assistant';
      return 'avec_assistant';
    };

    const seances = currentRows
      .filter((s) => s.status !== 'completed')
      .map((s, i) => {
        const colorSet = ASSISTANT_COLORS[i % ASSISTANT_COLORS.length];
        return {
          id: s.id,
          date: formatSessionDate(s.session_date),
          time: formatTimeRange(s.start_time, s.end_time),
          matiere: s.matiere,
          assistant: s.first_name ? `${s.first_name} ${s.last_name?.charAt(0) || ''}.` : undefined,
          assistantInitials: s.first_name ? getInitials(s.first_name, s.last_name) : undefined,
          assistantColor: colorSet.bg,
          assistantColorText: colorSet.text,
          motif: s.motif,
          status: mapSessionStatus(s),
        };
      });

    const historyByMonth = {};
    for (const s of historyRows) {
      const d = new Date(s.session_date);
      const key = getMonthLabel(d.getMonth() + 1, d.getFullYear());
      if (!historyByMonth[key]) historyByMonth[key] = [];
      historyByMonth[key].push({
        id: s.id,
        date: formatSessionDate(s.session_date),
        matiere: s.matiere,
        assistant: s.first_name ? `${s.first_name} ${s.last_name}` : 'Non assigné',
        status: 'Terminée',
      });
    }

    return res.json({
      seances,
      historiqueParMois: Object.entries(historyByMonth).map(([mois, seancesList]) => ({ mois, seances: seancesList })),
      availableAssistants: assistantsRows.map((a) => ({
        id: a.id,
        name: `${a.first_name} ${a.last_name}`,
        matiere: a.matieres,
        grade: a.grade ? `${Number(a.grade)}/20` : 'N/A',
      })),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/responsable/sessions
 */
export async function createSession(req, res, next) {
  try {
    const responsableId = req.user.id;
    const { matiere, date, time, room } = req.body;

    if (!matiere || !date) {
      return res.status(400).json({ error: 'Matière et date sont obligatoires' });
    }

    const offers = await query(
      `SELECT id FROM offers WHERE responsable_id = ? AND subject = ? AND status = 'active' LIMIT 1`,
      [responsableId, matiere]
    );
    const offerId = offers[0]?.id;
    if (!offerId) return res.status(404).json({ error: 'Aucune offre active pour cette matière' });

    const [startTime, endTime] = time?.includes('-')
      ? time.split('-').map((t) => t.trim())
      : ['09:00', '11:00'];

    const result = await query(
      `INSERT INTO sessions (offer_id, responsable_id, session_date, start_time, end_time, room, status)
       VALUES (?, ?, ?, ?, ?, ?, 'scheduled')`,
      [offerId, responsableId, date, `${startTime}:00`.slice(0, 8), `${endTime}:00`.slice(0, 8), room?.trim() || 'Salle à définir']
    );

    return res.status(201).json({ message: 'Séance créée', id: result.insertId });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/responsable/sessions/:id/assign
 */
export async function assignSession(req, res, next) {
  try {
    const responsableId = req.user.id;
    const { id } = req.params;
    const { studentId } = req.body;

    const sessions = await query(
      `SELECT id FROM sessions WHERE id = ? AND responsable_id = ? LIMIT 1`,
      [id, responsableId]
    );
    if (!sessions[0]) return res.status(404).json({ error: 'Séance introuvable' });

    await query(
      `INSERT INTO session_assignments (session_id, student_id, status)
       VALUES (?, ?, 'assigned')
       ON DUPLICATE KEY UPDATE status = 'assigned', cancelled_at = NULL`,
      [id, studentId]
    );

    return res.json({ message: 'Assistant assigné' });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/responsable/hours
 */
export async function getHours(req, res, next) {
  try {
    const responsableId = req.user.id;

    const [pendingRows, treatedRows, statsRows] = await Promise.all([
      query(
        `SELECT hr.id, hr.duration_hours, hr.created_at, hr.status,
                u.first_name, u.last_name, o.subject
         FROM hour_records hr
         JOIN users u ON u.id = hr.student_id
         JOIN sessions s ON s.id = hr.session_id
         JOIN offers o ON o.id = s.offer_id
         WHERE hr.responsable_id = ? AND hr.status = 'pending'
         ORDER BY hr.created_at DESC`,
        [responsableId]
      ),
      query(
        `SELECT hr.id, hr.duration_hours, hr.status, hr.validated_at, hr.updated_at,
                u.first_name, u.last_name, o.subject
         FROM hour_records hr
         JOIN users u ON u.id = hr.student_id
         JOIN sessions s ON s.id = hr.session_id
         JOIN offers o ON o.id = s.offer_id
         WHERE hr.responsable_id = ? AND hr.status IN ('validated', 'rejected')
         ORDER BY COALESCE(hr.validated_at, hr.updated_at) DESC
         LIMIT 30`,
        [responsableId]
      ),
      query(
        `SELECT
           COALESCE(SUM(duration_hours), 0) AS total,
           COALESCE(SUM(CASE WHEN status = 'validated' THEN duration_hours ELSE 0 END), 0) AS valides,
           COALESCE(SUM(CASE WHEN status = 'pending' THEN duration_hours ELSE 0 END), 0) AS attente,
           COALESCE(SUM(CASE WHEN status = 'rejected' THEN duration_hours ELSE 0 END), 0) AS refusees
         FROM hour_records
         WHERE responsable_id = ?
           AND YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())`,
        [responsableId]
      ),
    ]);

    const formatHours = (h) => {
      const hours = Math.floor(h);
      const mins = Math.round((h - hours) * 60);
      return `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}`;
    };

    return res.json({
      stats: {
        totalMensuel: formatHours(Number(statsRows[0]?.total || 0)),
        valides: formatHours(Number(statsRows[0]?.valides || 0)),
        attente: formatHours(Number(statsRows[0]?.attente || 0)),
        refusees: formatHours(Number(statsRows[0]?.refusees || 0)),
      },
      heuresAttente: pendingRows.map((h, i) => {
        const c = ASSISTANT_COLORS[i % ASSISTANT_COLORS.length];
        return {
          id: h.id,
          init: getInitials(h.first_name, h.last_name),
          color: c.bg,
          textColor: c.text,
          name: `${h.first_name} ${h.last_name?.charAt(0) || ''}.`,
          date: new Date(h.created_at).toLocaleDateString('fr-FR'),
          heures: formatHours(Number(h.duration_hours)),
          comment: h.subject,
        };
      }),
      heuresTraitees: treatedRows.map((h) => ({
        id: h.id,
        name: `${h.first_name} ${h.last_name}`,
        subject: h.subject,
        hours: formatHours(Number(h.duration_hours)),
        status: h.status === 'validated' ? 'PAYÉ' : 'REJETÉ',
        date: h.status === 'validated'
          ? `Validé le ${new Date(h.validated_at).toLocaleDateString('fr-FR')}`
          : `Refusé le ${new Date(h.updated_at).toLocaleDateString('fr-FR')}`,
        type: h.status === 'validated' ? 'success' : 'error',
      })),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/responsable/hours/:id
 */
export async function reviewHour(req, res, next) {
  try {
    const responsableId = req.user.id;
    const schoolId = req.user.schoolId;
    const { id } = req.params;
    const { action } = req.body;

    if (!['validate', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action invalide (validate ou reject)' });
    }

    const rows = await query(
      `SELECT hr.id, u.first_name, u.last_name
       FROM hour_records hr
       JOIN users u ON u.id = hr.student_id
       WHERE hr.id = ? AND hr.responsable_id = ? LIMIT 1`,
      [id, responsableId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Enregistrement introuvable' });

    const newStatus = action === 'validate' ? 'validated' : 'rejected';
    await query(
      `UPDATE hour_records SET status = ?, validated_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [newStatus, id]
    );

    await logActivity(
      schoolId,
      responsableId,
      'hours_validated',
      `${rows[0].first_name} ${rows[0].last_name} — heures ${action === 'validate' ? 'validées' : 'refusées'}`
    );

    return res.json({ message: action === 'validate' ? 'Heures validées' : 'Heures refusées' });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/responsable/profile
 */
export async function getProfile(req, res, next) {
  try {
    const user = await getResponsableOrFail(req.user.id, req.user.schoolId);
    if (!user) return res.status(404).json({ error: 'Profil introuvable' });

    return res.json({
      profile: {
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        role: 'Responsable pédagogique',
        department: user.department,
        initials: getInitials(user.first_name, user.last_name),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/responsable/profile
 */
export async function updateProfile(req, res, next) {
  try {
    const { firstName, lastName, phone } = req.body;

    await query(
      `UPDATE users SET
         first_name = COALESCE(?, first_name),
         last_name = COALESCE(?, last_name),
         phone = COALESCE(?, phone),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [firstName?.trim(), lastName?.trim(), phone?.trim(), req.user.id]
    );

    return res.json({ message: 'Profil mis à jour' });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/responsable/profile/password
 */
export async function updateProfilePassword(req, res, next) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'Tous les champs mot de passe sont obligatoires' });
    }

    const passwordError = validatePassword(newPassword, confirmPassword);
    if (passwordError) return res.status(400).json({ error: passwordError });

    const rows = await query(`SELECT password_hash FROM users WHERE id = ? LIMIT 1`, [req.user.id]);
    const user = rows[0];
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Mot de passe actuel incorrect' });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await query(
      `UPDATE users SET password_hash = ?, must_change_password = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [passwordHash, req.user.id]
    );

    return res.json({ message: 'Mot de passe mis à jour' });
  } catch (error) {
    next(error);
  }
}
