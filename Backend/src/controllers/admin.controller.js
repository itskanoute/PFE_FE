import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, withTransaction } from '../config/db.js';
import { emailMatchesDomain, allowedEmailDomainsLabel, validatePassword, validateStudyYear } from '../utils/auth.helpers.js';
import {
  formatRelativeTime,
  mapActivityType,
  generateTempPassword,
  getInitials,
  getMonthLabel,
  logActivity,
  getSchoolOrFail,
} from '../utils/admin.helpers.js';
import {
  buildCsvFile,
  buildExcelFile,
  buildExportPayload,
  exportMonthDate,
} from '../utils/export.helpers.js';
import {
  sendEmail,
  buildResponsableCredentialsEmail,
  buildStudentCredentialsEmail,
  isSmtpConfigured,
} from '../utils/email.service.js';

const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

/**
 * GET /api/admin/dashboard
 * Statistiques, alertes, graphique et activité récente pour l'école de l'admin.
 */
export async function getDashboard(req, res, next) {
  try {
    const schoolId = req.user.schoolId;

    const schoolRows = await query(
      `SELECT id, name, acronym FROM schools WHERE id = ? LIMIT 1`,
      [schoolId]
    );

    const school = schoolRows[0];

    if (!school) {
      return res.status(404).json({ error: 'École introuvable' });
    }

    const [
      responsablesRows,
      etudiantsRows,
      assistantsRows,
      offresRows,
      seancesRows,
      heuresMoisRows,
      heuresValideesRows,
      heuresAttenteRows,
      chartRows,
      ibanRows,
      responsablesSansOffreRows,
      activityRows,
    ] = await Promise.all([
      query(
        `SELECT COUNT(*) AS total FROM users
         WHERE school_id = ? AND role = 'responsable' AND is_active = 1`,
        [schoolId]
      ),
      query(
        `SELECT COUNT(*) AS total FROM users
         WHERE school_id = ? AND role = 'etudiant' AND is_active = 1`,
        [schoolId]
      ),
      query(
        `SELECT COUNT(DISTINCT a.student_id) AS total
         FROM applications a
         JOIN offers o ON o.id = a.offer_id
         WHERE o.school_id = ? AND a.status = 'accepted'`,
        [schoolId]
      ),
      query(
        `SELECT COUNT(*) AS total FROM offers
         WHERE school_id = ? AND status = 'active'`,
        [schoolId]
      ),
      query(
        `SELECT COUNT(*) AS total
         FROM sessions s
         JOIN offers o ON o.id = s.offer_id
         WHERE o.school_id = ?
           AND YEAR(s.session_date) = YEAR(CURDATE())
           AND MONTH(s.session_date) = MONTH(CURDATE())`,
        [schoolId]
      ),
      query(
        `SELECT COALESCE(SUM(hr.duration_hours), 0) AS total
         FROM hour_records hr
         JOIN sessions s ON s.id = hr.session_id
         JOIN offers o ON o.id = s.offer_id
         WHERE o.school_id = ?
           AND YEAR(hr.created_at) = YEAR(CURDATE())
           AND MONTH(hr.created_at) = MONTH(CURDATE())`,
        [schoolId]
      ),
      query(
        `SELECT COALESCE(SUM(hr.duration_hours), 0) AS total
         FROM hour_records hr
         JOIN sessions s ON s.id = hr.session_id
         JOIN offers o ON o.id = s.offer_id
         WHERE o.school_id = ?
           AND hr.status = 'validated'
           AND YEAR(COALESCE(hr.validated_at, hr.created_at)) = YEAR(CURDATE())
           AND MONTH(COALESCE(hr.validated_at, hr.created_at)) = MONTH(CURDATE())`,
        [schoolId]
      ),
      query(
        `SELECT COALESCE(SUM(hr.duration_hours), 0) AS total
         FROM hour_records hr
         JOIN sessions s ON s.id = hr.session_id
         JOIN offers o ON o.id = s.offer_id
         WHERE o.school_id = ?
           AND hr.status = 'pending'
           AND YEAR(hr.created_at) = YEAR(CURDATE())
           AND MONTH(hr.created_at) = MONTH(CURDATE())`,
        [schoolId]
      ),
      query(
        `SELECT
           YEAR(hr.created_at) AS year_num,
           MONTH(hr.created_at) AS month_num,
           hr.status,
           COALESCE(SUM(hr.duration_hours), 0) AS total
         FROM hour_records hr
         JOIN sessions s ON s.id = hr.session_id
         JOIN offers o ON o.id = s.offer_id
         WHERE o.school_id = ?
           AND hr.created_at >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 2 MONTH)
         GROUP BY year_num, month_num, hr.status
         ORDER BY year_num, month_num`,
        [schoolId]
      ),
      query(
        `SELECT COUNT(*) AS total
         FROM student_profiles sp
         WHERE sp.school_id = ? AND (sp.iban IS NULL OR sp.iban = '')`,
        [schoolId]
      ),
      query(
        `SELECT u.first_name, u.last_name
         FROM users u
         LEFT JOIN offers o ON o.responsable_id = u.id AND o.status = 'active'
         WHERE u.school_id = ? AND u.role = 'responsable' AND u.is_active = 1
         GROUP BY u.id, u.first_name, u.last_name
         HAVING COUNT(o.id) = 0
         LIMIT 3`,
        [schoolId]
      ),
      query(
        `SELECT id, action, description, created_at
         FROM activity_logs
         WHERE school_id = ?
         ORDER BY created_at DESC
         LIMIT 8`,
        [schoolId]
      ),
    ]);

    const stats = {
      responsables: Number(responsablesRows[0]?.total || 0),
      etudiants: Number(etudiantsRows[0]?.total || 0),
      assistants: Number(assistantsRows[0]?.total || 0),
      heuresMois: Number(heuresMoisRows[0]?.total || 0),
      offresActives: Number(offresRows[0]?.total || 0),
      seancesMois: Number(seancesRows[0]?.total || 0),
      heuresValidees: Number(heuresValideesRows[0]?.total || 0),
      heuresAttente: Number(heuresAttenteRows[0]?.total || 0),
    };

    const chartMap = new Map();

    for (const row of chartRows) {
      const key = `${row.year_num}-${row.month_num}`;
      if (!chartMap.has(key)) {
        chartMap.set(key, {
          month: MONTH_LABELS[row.month_num - 1],
          monthNum: row.month_num,
          year: row.year_num,
          validated: 0,
          pending: 0,
          refused: 0,
        });
      }

      const entry = chartMap.get(key);
      if (row.status === 'validated') entry.validated = Number(row.total);
      else if (row.status === 'pending') entry.pending = Number(row.total);
      else if (row.status === 'rejected') entry.refused = Number(row.total);
    }

    const chartData = Array.from(chartMap.values()).slice(-3);

    const alerts = [];
    const sansIban = Number(ibanRows[0]?.total || 0);

    if (sansIban > 0) {
      alerts.push({
        type: 'danger',
        title: `${sansIban} étudiant${sansIban > 1 ? 's' : ''} sans IBAN`,
        text: 'Traitement des paiements retardé pour le module Finance.',
      });
    }

    for (const resp of responsablesSansOffreRows) {
      alerts.push({
        type: 'warning',
        title: `${resp.first_name} ${resp.last_name} sans offres`,
        text: 'Action requise : assigner des rôles de superviseur.',
      });
    }

    if (stats.heuresAttente > 0) {
      alerts.push({
        type: 'info',
        title: `${stats.heuresAttente}h en attente de validation`,
        text: 'Révision nécessaire pour les séances en cours.',
      });
    }

    const activities = activityRows.map((row) => ({
      id: row.id,
      type: mapActivityType(row.action),
      description: row.description,
      time: formatRelativeTime(row.created_at),
      createdAt: row.created_at,
    }));

    return res.json({
      school: {
        id: school.id,
        name: school.name,
        acronym: school.acronym,
      },
      stats,
      alerts,
      chartData,
      activities,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/responsables
 */
export async function getResponsables(req, res, next) {
  try {
    const schoolId = req.user.schoolId;

    const [statsRows, responsablesRows] = await Promise.all([
      query(
        `SELECT
           (SELECT COUNT(*) FROM users WHERE school_id = ? AND role = 'responsable' AND is_active = 1) AS total,
           (SELECT COALESCE(SUM(hr.duration_hours), 0)
            FROM hour_records hr
            JOIN sessions s ON s.id = hr.session_id
            JOIN offers o ON o.id = s.offer_id
            WHERE o.school_id = ? AND hr.status = 'pending') AS heuresAValider,
           (SELECT COUNT(DISTINCT department) FROM responsable_profiles WHERE school_id = ?) AS departements`,
        [schoolId, schoolId, schoolId]
      ),
      query(
        `SELECT
           u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active, u.last_login_at,
           rp.department,
           (SELECT COUNT(*) FROM offers o WHERE o.responsable_id = u.id AND o.status = 'active') AS offres,
           (SELECT COUNT(DISTINCT a.student_id)
            FROM applications a
            JOIN offers o ON o.id = a.offer_id
            WHERE o.responsable_id = u.id AND a.status = 'accepted') AS assistants,
           (SELECT COALESCE(SUM(hr.duration_hours), 0)
            FROM hour_records hr
            WHERE hr.responsable_id = u.id AND hr.status = 'validated') AS heures
         FROM users u
         JOIN responsable_profiles rp ON rp.user_id = u.id
         WHERE u.school_id = ? AND u.role = 'responsable'
         ORDER BY u.last_name, u.first_name`,
        [schoolId]
      ),
    ]);

    return res.json({
      stats: {
        total: Number(statsRows[0]?.total || 0),
        heuresAValider: Number(statsRows[0]?.heuresAValider || 0),
        departements: Number(statsRows[0]?.departements || 0),
      },
      responsables: responsablesRows.map((r) => ({
        id: r.id,
        initials: getInitials(r.first_name, r.last_name),
        nom: `${r.first_name} ${r.last_name}`,
        firstName: r.first_name,
        lastName: r.last_name,
        email: r.email,
        phone: r.phone,
        departement: r.department,
        statut: r.is_active ? 'active' : 'inactive',
        offres: Number(r.offres),
        assistants: Number(r.assistants),
        heures: Number(r.heures),
        dernierAcces: formatRelativeTime(r.last_login_at),
      })),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/responsables
 */
export async function createResponsable(req, res, next) {
  try {
    const schoolId = req.user.schoolId;
    const { firstName, lastName, email, department, phone, sendEmail: wantEmail = true } = req.body;

    if (!firstName || !lastName || !email || !department) {
      return res.status(400).json({ error: 'Prénom, nom, email et département sont obligatoires' });
    }

    const school = await getSchoolOrFail(schoolId);
    if (!school) return res.status(404).json({ error: 'École introuvable' });

    const normalizedEmail = email.trim().toLowerCase();

    if (!emailMatchesDomain(normalizedEmail, school.email_domain)) {
      return res.status(400).json({
        error: `L'email doit se terminer par ${allowedEmailDomainsLabel(school.email_domain)}`,
      });
    }

    const [existing] = await query('SELECT id FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
    if (existing) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }

    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const userId = await withTransaction(async (connection) => {
      const [result] = await connection.execute(
        `INSERT INTO users
           (school_id, email, password_hash, role, first_name, last_name, phone, must_change_password)
         VALUES (?, ?, ?, 'responsable', ?, ?, ?, 1)`,
        [schoolId, normalizedEmail, passwordHash, firstName.trim(), lastName.trim(), phone?.trim() || null]
      );

      const newUserId = result.insertId;

      await connection.execute(
        `INSERT INTO responsable_profiles (user_id, school_id, department) VALUES (?, ?, ?)`,
        [newUserId, schoolId, department.trim()]
      );

      return newUserId;
    });

    await logActivity(
      schoolId,
      req.user.id,
      'responsable_created',
      `${firstName.trim()} ${lastName.trim()} a été ajouté en tant que responsable`
    );

    let emailSent = false;
    let emailWarning = null;

    if (wantEmail !== false) {
      const mail = buildResponsableCredentialsEmail({
        firstName: firstName.trim(),
        email: normalizedEmail,
        temporaryPassword: tempPassword,
      });

      try {
        const result = await sendEmail({
          to: normalizedEmail,
          subject: mail.subject,
          text: mail.text,
        });
        emailSent = result.sent;
        if (!result.sent) {
          emailWarning = isSmtpConfigured()
            ? 'Échec d\'envoi email'
            : 'SMTP non configuré : identifiants à transmettre manuellement (voir mot de passe temporaire)';
        }
      } catch (mailError) {
        console.error('Erreur envoi email responsable:', mailError);
        emailWarning = `Email non envoyé : ${mailError.message}`;
      }
    }

    return res.status(201).json({
      message: emailSent
        ? 'Responsable créé et identifiants envoyés par email'
        : 'Responsable créé avec succès',
      responsable: {
        id: userId,
        email: normalizedEmail,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        department: department.trim(),
      },
      temporaryPassword: tempPassword,
      emailSent,
      emailWarning,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/responsables/:id/resend-credentials
 * Régénère un mot de passe temporaire et (re)envoie les accès.
 */
export async function resendResponsableCredentials(req, res, next) {
  try {
    const schoolId = req.user.schoolId;
    const { id } = req.params;

    const rows = await query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.is_active
       FROM users u
       WHERE u.id = ? AND u.school_id = ? AND u.role = 'responsable'
       LIMIT 1`,
      [id, schoolId]
    );

    if (!rows[0]) return res.status(404).json({ error: 'Responsable introuvable' });
    if (!rows[0].is_active) {
      return res.status(400).json({ error: 'Ce responsable est désactivé. Réactivez-le avant de renvoyer les accès.' });
    }

    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    await query(
      `UPDATE users
       SET password_hash = ?, must_change_password = 1, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [passwordHash, id]
    );

    const mail = buildResponsableCredentialsEmail({
      firstName: rows[0].first_name,
      email: rows[0].email,
      temporaryPassword: tempPassword,
    });

    let emailSent = false;
    let emailWarning = null;

    try {
      const result = await sendEmail({
        to: rows[0].email,
        subject: mail.subject,
        text: mail.text,
      });
      emailSent = result.sent;
      if (!result.sent) {
        emailWarning = isSmtpConfigured()
          ? 'Échec d\'envoi email'
          : 'SMTP non configuré : copiez le mot de passe temporaire ci-dessous';
      }
    } catch (mailError) {
      console.error('Erreur renvoi email responsable:', mailError);
      emailWarning = `Email non envoyé : ${mailError.message}`;
    }

    await logActivity(
      schoolId,
      req.user.id,
      'responsable_credentials_resent',
      `Identifiants renvoyés à ${rows[0].first_name} ${rows[0].last_name}`
    );

    return res.json({
      message: emailSent
        ? 'Identifiants renvoyés par email'
        : 'Mot de passe régénéré (email non envoyé)',
      email: rows[0].email,
      temporaryPassword: tempPassword,
      emailSent,
      emailWarning,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/responsables/:id
 */
export async function updateResponsable(req, res, next) {
  try {
    const schoolId = req.user.schoolId;
    const { id } = req.params;
    const { firstName, lastName, email, department, phone } = req.body;

    const rows = await query(
      `SELECT u.id, u.email FROM users u
       WHERE u.id = ? AND u.school_id = ? AND u.role = 'responsable' LIMIT 1`,
      [id, schoolId]
    );

    if (!rows[0]) return res.status(404).json({ error: 'Responsable introuvable' });

    const school = await getSchoolOrFail(schoolId);
    const normalizedEmail = email?.trim().toLowerCase();

    if (normalizedEmail && !emailMatchesDomain(normalizedEmail, school.email_domain)) {
      return res.status(400).json({
        error: `L'email doit se terminer par ${allowedEmailDomainsLabel(school.email_domain)}`,
      });
    }

    if (normalizedEmail && normalizedEmail !== rows[0].email) {
      const [dup] = await query('SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1', [normalizedEmail, id]);
      if (dup) return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }

    await query(
      `UPDATE users SET
         first_name = COALESCE(?, first_name),
         last_name = COALESCE(?, last_name),
         email = COALESCE(?, email),
         phone = COALESCE(?, phone),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [firstName?.trim(), lastName?.trim(), normalizedEmail, phone?.trim(), id]
    );

    if (department) {
      await query(
        `UPDATE responsable_profiles SET department = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
        [department.trim(), id]
      );
    }

    return res.json({ message: 'Responsable mis à jour' });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/responsables/:id/status
 */
export async function toggleResponsableStatus(req, res, next) {
  try {
    const schoolId = req.user.schoolId;
    const { id } = req.params;

    const rows = await query(
      `SELECT id, is_active, first_name, last_name FROM users
       WHERE id = ? AND school_id = ? AND role = 'responsable' LIMIT 1`,
      [id, schoolId]
    );

    const user = rows[0];
    if (!user) return res.status(404).json({ error: 'Responsable introuvable' });

    const newStatus = user.is_active ? 0 : 1;

    await query('UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newStatus, id]);

    return res.json({
      message: newStatus ? 'Responsable activé' : 'Responsable désactivé',
      isActive: Boolean(newStatus),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/admin/responsables/:id
 * Supprime définitivement un responsable et ses données liées (offres, séances, etc.).
 */
export async function deleteResponsable(req, res, next) {
  try {
    const schoolId = req.user.schoolId;
    const { id } = req.params;

    const rows = await query(
      `SELECT id, first_name, last_name FROM users
       WHERE id = ? AND school_id = ? AND role = 'responsable' LIMIT 1`,
      [id, schoolId]
    );

    const user = rows[0];
    if (!user) return res.status(404).json({ error: 'Responsable introuvable' });

    await query('DELETE FROM users WHERE id = ?', [id]);

    await logActivity(
      schoolId,
      req.user.id,
      'responsable_deleted',
      `${user.first_name} ${user.last_name} a été supprimé`
    );

    return res.json({ message: 'Responsable supprimé' });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/students
 */
export async function getStudents(req, res, next) {
  try {
    const schoolId = req.user.schoolId;
    const { filiere = '', ibanMissing = '', assistantOnly = '' } = req.query;

    let sql = `
      SELECT
        u.id, u.email, u.first_name, u.last_name, u.created_at,
        sp.student_number, sp.major, sp.study_year, sp.iban,
        EXISTS (
          SELECT 1 FROM applications a
          JOIN offers o ON o.id = a.offer_id
          WHERE a.student_id = u.id AND a.status = 'accepted' AND o.school_id = u.school_id
        ) AS is_assistant
      FROM users u
      JOIN student_profiles sp ON sp.user_id = u.id
      WHERE u.school_id = ? AND u.role = 'etudiant' AND u.is_active = 1
    `;
    const params = [schoolId];

    if (filiere) {
      sql += ` AND sp.major = ?`;
      params.push(filiere);
    }

    if (ibanMissing === 'true') {
      sql += ` AND (sp.iban IS NULL OR sp.iban = '')`;
    }

    if (assistantOnly === 'true') {
      sql += ` AND EXISTS (
        SELECT 1 FROM applications a
        JOIN offers o ON o.id = a.offer_id
        WHERE a.student_id = u.id AND a.status = 'accepted' AND o.school_id = u.school_id
      )`;
    }

    sql += ` ORDER BY u.last_name, u.first_name`;

    const [studentsRows, statsRows, filieresRows] = await Promise.all([
      query(sql, params),
      query(
        `SELECT
           (SELECT COUNT(*) FROM users WHERE school_id = ? AND role = 'etudiant' AND is_active = 1) AS totalInscrits,
           (SELECT COUNT(DISTINCT a.student_id)
            FROM applications a JOIN offers o ON o.id = a.offer_id
            WHERE o.school_id = ? AND a.status = 'accepted') AS assistantsActifs,
           (SELECT COUNT(*) FROM student_profiles sp
            WHERE sp.school_id = ? AND sp.iban IS NOT NULL AND sp.iban != '') AS ibanValides,
           (SELECT COUNT(*) FROM student_profiles sp
            WHERE sp.school_id = ? AND (sp.iban IS NULL OR sp.iban = '')) AS ibanManquants`,
        [schoolId, schoolId, schoolId, schoolId]
      ),
      query(
        `SELECT name FROM filieres WHERE school_id = ? ORDER BY name`,
        [schoolId]
      ),
    ]);

    const colors = ['#7c3aed', '#d97706', '#2563eb', '#16a34a', '#dc2626', '#0891b2'];
    const filiereNames = [
      ...new Set([
        ...filieresRows.map((f) => f.name),
        ...studentsRows.map((s) => s.major).filter(Boolean),
      ]),
    ].sort((a, b) => a.localeCompare(b, 'fr'));

    return res.json({
      stats: {
        totalInscrits: Number(statsRows[0]?.totalInscrits || 0),
        assistantsActifs: Number(statsRows[0]?.assistantsActifs || 0),
        ibanValides: Number(statsRows[0]?.ibanValides || 0),
        ibanManquants: Number(statsRows[0]?.ibanManquants || 0),
      },
      filieres: filiereNames,
      students: studentsRows.map((s, index) => ({
        id: s.id,
        initials: getInitials(s.first_name, s.last_name),
        color: colors[index % colors.length],
        nom: `${s.first_name} ${s.last_name}`,
        firstName: s.first_name,
        lastName: s.last_name,
        email: s.email,
        identifiant: s.student_number,
        filiere: s.major,
        studyYear: s.study_year,
        ibanOk: Boolean(s.iban),
        statut: s.is_assistant ? 'assistant' : 'inscrit',
        dateInscription: new Date(s.created_at).toLocaleDateString('fr-FR'),
      })),
    });
  } catch (error) {
    next(error);
  }
}

function inferStudyYear(major) {
  const match = String(major || '').toUpperCase().match(/\b(L[123]|M[12])\b/);
  return match?.[1] || 'L3';
}

/**
 * POST /api/admin/students
 * Inscription d'un étudiant par l'admin (mot de passe temporaire).
 */
export async function createStudent(req, res, next) {
  try {
    const schoolId = req.user.schoolId;
    const {
      firstName,
      lastName,
      email,
      studentNumber,
      major,
      year,
      sendEmail: wantEmail = true,
    } = req.body;

    if (!firstName || !lastName || !email || !studentNumber || !major) {
      return res.status(400).json({
        error: 'Prénom, nom, email, numéro étudiant et filière sont obligatoires',
      });
    }

    const school = await getSchoolOrFail(schoolId);
    if (!school) return res.status(404).json({ error: 'École introuvable' });

    const normalizedEmail = email.trim().toLowerCase();
    const studentId = String(studentNumber).trim().replace(/^#/, '');
    const majorName = major.trim();
    const studyYear = validateStudyYear(year) ? year : inferStudyYear(majorName);

    if (!emailMatchesDomain(normalizedEmail, school.email_domain)) {
      return res.status(400).json({
        error: `L'email doit se terminer par ${allowedEmailDomainsLabel(school.email_domain)}`,
      });
    }

    const duplicates = await query(
      `SELECT email FROM users WHERE email = ?
       UNION
       SELECT student_number AS email FROM student_profiles
       WHERE school_id = ? AND student_number = ?`,
      [normalizedEmail, schoolId, studentId]
    );

    if (duplicates.length > 0) {
      return res.status(409).json({
        error: 'Un compte existe déjà avec cet email ou ce numéro étudiant',
      });
    }

    const filiereRows = await query(
      `SELECT id FROM filieres WHERE school_id = ? AND name = ? LIMIT 1`,
      [schoolId, majorName]
    );
    let filiereId = filiereRows[0]?.id || null;

    if (!filiereId) {
      const inserted = await query(
        `INSERT INTO filieres (school_id, name) VALUES (?, ?)`,
        [schoolId, majorName]
      );
      filiereId = inserted.insertId;
    }

    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const userId = await withTransaction(async (connection) => {
      const [userResult] = await connection.execute(
        `INSERT INTO users
           (school_id, email, password_hash, role, first_name, last_name, must_change_password)
         VALUES (?, ?, ?, 'etudiant', ?, ?, 1)`,
        [schoolId, normalizedEmail, passwordHash, firstName.trim(), lastName.trim()]
      );

      const newUserId = userResult.insertId;

      await connection.execute(
        `INSERT INTO student_profiles
           (user_id, school_id, student_number, filiere_id, major, study_year)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [newUserId, schoolId, studentId, filiereId, majorName, studyYear]
      );

      return newUserId;
    });

    await logActivity(
      schoolId,
      req.user.id,
      'student_registered',
      `${firstName.trim()} ${lastName.trim()} a été inscrit(e) par l'admin`
    );

    let emailSent = false;
    let emailWarning = null;

    if (wantEmail !== false) {
      const mail = buildStudentCredentialsEmail({
        firstName: firstName.trim(),
        email: normalizedEmail,
        temporaryPassword: tempPassword,
      });

      try {
        const result = await sendEmail({
          to: normalizedEmail,
          subject: mail.subject,
          text: mail.text,
        });
        emailSent = result.sent;
        if (!result.sent) {
          emailWarning = isSmtpConfigured()
            ? 'Échec d\'envoi email'
            : 'SMTP non configuré : transmettez le mot de passe temporaire manuellement';
        }
      } catch (mailError) {
        console.error('Erreur envoi email étudiant:', mailError);
        emailWarning = `Email non envoyé : ${mailError.message}`;
      }
    }

    return res.status(201).json({
      message: emailSent
        ? 'Étudiant inscrit et identifiants envoyés par email'
        : 'Étudiant inscrit avec succès',
      student: {
        id: userId,
        email: normalizedEmail,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        studentNumber: studentId,
        major: majorName,
        studyYear,
      },
      temporaryPassword: tempPassword,
      emailSent,
      emailWarning,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/students/:id
 */
export async function getStudentById(req, res, next) {
  try {
    const schoolId = req.user.schoolId;
    const { id } = req.params;

    const rows = await query(
      `SELECT
         u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at,
         sp.student_number, sp.major, sp.study_year, sp.iban, sp.bic, sp.account_holder,
         EXISTS (
           SELECT 1 FROM applications a
           JOIN offers o ON o.id = a.offer_id
           WHERE a.student_id = u.id AND a.status = 'accepted' AND o.school_id = u.school_id
         ) AS is_assistant
       FROM users u
       JOIN student_profiles sp ON sp.user_id = u.id
       WHERE u.id = ? AND u.school_id = ? AND u.role = 'etudiant'
       LIMIT 1`,
      [id, schoolId]
    );

    const student = rows[0];
    if (!student) return res.status(404).json({ error: 'Étudiant introuvable' });

    const hourHistory = await query(
      `SELECT
         YEAR(COALESCE(hr.validated_at, hr.created_at)) AS year_num,
         MONTH(COALESCE(hr.validated_at, hr.created_at)) AS month_num,
         SUM(hr.duration_hours) AS total,
         SUM(CASE WHEN hr.status = 'validated' THEN hr.duration_hours ELSE 0 END) AS validated
       FROM hour_records hr
       WHERE hr.student_id = ?
       GROUP BY year_num, month_num
       ORDER BY year_num DESC, month_num DESC
       LIMIT 6`,
      [id]
    );

    return res.json({
      student: {
        id: student.id,
        initials: getInitials(student.first_name, student.last_name),
        nom: student.last_name,
        prenom: student.first_name,
        email: student.email,
        telephone: student.phone,
        identifiant: student.student_number,
        filiere: student.major,
        studyYear: student.study_year,
        statut: student.is_assistant ? 'assistant' : 'inscrit',
        ibanOk: Boolean(student.iban),
        iban: student.iban,
        bic: student.bic,
        accountHolder: student.account_holder,
        dateInscription: new Date(student.created_at).toLocaleDateString('fr-FR', {
          day: 'numeric', month: 'long', year: 'numeric',
        }),
      },
      hourHistory: hourHistory.map((h) => ({
        mois: getMonthLabel(h.month_num, h.year_num),
        total: Number(h.total),
        valide: Number(h.validated),
        statut: Number(h.validated) >= Number(h.total) ? 'Payé' : 'En cours',
      })),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/hours
 */
export async function getHours(req, res, next) {
  try {
    const schoolId = req.user.schoolId;
    const month = Number(req.query.month) || new Date().getMonth() + 1;
    const year = Number(req.query.year) || new Date().getFullYear();

    const [statsRows, byResponsableRows, byAssistantRows] = await Promise.all([
      query(
        `SELECT
           COALESCE(SUM(hr.duration_hours), 0) AS total,
           COALESCE(SUM(CASE WHEN hr.status = 'validated' THEN hr.duration_hours ELSE 0 END), 0) AS validees,
           COALESCE(SUM(CASE WHEN hr.status = 'pending' THEN hr.duration_hours ELSE 0 END), 0) AS attente,
           COALESCE(SUM(CASE WHEN hr.status = 'rejected' THEN hr.duration_hours ELSE 0 END), 0) AS refusees
         FROM hour_records hr
         JOIN sessions s ON s.id = hr.session_id
         JOIN offers o ON o.id = s.offer_id
         WHERE o.school_id = ?
           AND YEAR(hr.created_at) = ? AND MONTH(hr.created_at) = ?`,
        [schoolId, year, month]
      ),
      query(
        `SELECT
           u.id, u.first_name, u.last_name, u.email,
           COUNT(DISTINCT CASE WHEN a.status = 'accepted' THEN a.student_id END) AS assistants,
           COALESCE(SUM(CASE WHEN hr.status = 'validated' THEN hr.duration_hours ELSE 0 END), 0) AS heuresOK,
           COALESCE(SUM(CASE WHEN hr.status = 'pending' THEN hr.duration_hours ELSE 0 END), 0) AS attente,
           COALESCE(SUM(CASE WHEN hr.status = 'rejected' THEN hr.duration_hours ELSE 0 END), 0) AS refusees
         FROM users u
         LEFT JOIN offers o ON o.responsable_id = u.id AND o.school_id = u.school_id
         LEFT JOIN applications a ON a.offer_id = o.id
         LEFT JOIN hour_records hr ON hr.responsable_id = u.id
           AND YEAR(hr.created_at) = ? AND MONTH(hr.created_at) = ?
         WHERE u.school_id = ? AND u.role = 'responsable' AND u.is_active = 1
         GROUP BY u.id, u.first_name, u.last_name, u.email
         ORDER BY u.last_name`,
        [year, month, schoolId]
      ),
      query(
        `SELECT
           u.id, u.first_name, u.last_name,
           CONCAT(resp.first_name, ' ', resp.last_name) AS responsable,
           COALESCE(SUM(CASE WHEN hr.status = 'validated' THEN hr.duration_hours ELSE 0 END), 0) AS heuresOK,
           COALESCE(SUM(CASE WHEN hr.status = 'pending' THEN hr.duration_hours ELSE 0 END), 0) AS attente,
           MAX(CASE WHEN sp.iban IS NOT NULL AND sp.iban != '' THEN 1 ELSE 0 END) AS iban_ok
         FROM hour_records hr
         JOIN users u ON u.id = hr.student_id
         JOIN users resp ON resp.id = hr.responsable_id
         JOIN student_profiles sp ON sp.user_id = u.id
         JOIN sessions s ON s.id = hr.session_id
         JOIN offers o ON o.id = s.offer_id
         WHERE o.school_id = ?
           AND YEAR(hr.created_at) = ? AND MONTH(hr.created_at) = ?
         GROUP BY u.id, u.first_name, u.last_name, resp.first_name, resp.last_name
         ORDER BY u.last_name`,
        [schoolId, year, month]
      ),
    ]);

    const stats = {
      total: Number(statsRows[0]?.total || 0),
      validees: Number(statsRows[0]?.validees || 0),
      attente: Number(statsRows[0]?.attente || 0),
      refusees: Number(statsRows[0]?.refusees || 0),
    };

    const colors = ['#2563eb', '#d97706', '#16a34a', '#7c3aed'];

    return res.json({
      period: getMonthLabel(month, year),
      month,
      year,
      stats,
      tauxValidation: stats.total > 0 ? Math.round((stats.validees / stats.total) * 100) : 0,
      byResponsable: byResponsableRows.map((r, i) => ({
        id: r.id,
        initials: getInitials(r.first_name, r.last_name),
        color: colors[i % colors.length],
        nom: `${r.first_name} ${r.last_name}`,
        email: r.email,
        assistants: Number(r.assistants),
        heuresOK: Number(r.heuresOK),
        attente: Number(r.attente),
        refusees: Number(r.refusees),
      })),
      byAssistant: byAssistantRows.map((a) => ({
        id: a.id,
        nom: `${a.first_name} ${a.last_name}`,
        responsable: a.responsable,
        heuresOK: Number(a.heuresOK),
        attente: Number(a.attente),
        ibanOk: Boolean(a.iban_ok),
      })),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/school
 */
export async function getSchoolSettings(req, res, next) {
  try {
    const school = await getSchoolOrFail(req.user.schoolId);
    if (!school) return res.status(404).json({ error: 'École introuvable' });

    const filieres = await query(
      `SELECT id, name FROM filieres WHERE school_id = ? ORDER BY name`,
      [school.id]
    );

    return res.json({
      school: {
        id: school.id,
        nomEcole: school.name,
        acronyme: school.acronym,
        domaineEmail: `@${school.email_domain}`,
        adresse: school.address,
        ville: school.city,
        telephone: school.phone,
        tauxHoraire: String(Number(school.hourly_rate).toFixed(2)),
        logoUrl: school.logo_url,
      },
      filieres: filieres.map((f) => ({ id: f.id, name: f.name })),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/school
 */
export async function updateSchoolSettings(req, res, next) {
  try {
    const schoolId = req.user.schoolId;
    const { nomEcole, adresse, ville, telephone, tauxHoraire } = req.body;

    if (!nomEcole?.trim() || !adresse?.trim() || !ville?.trim() || !telephone?.trim()) {
      return res.status(400).json({ error: 'Nom, adresse, ville et téléphone sont obligatoires' });
    }

    const rate = Number(tauxHoraire);
    if (Number.isNaN(rate) || rate <= 0) {
      return res.status(400).json({ error: 'Taux horaire invalide' });
    }

    await query(
      `UPDATE schools SET
         name = ?, address = ?, city = ?, phone = ?, hourly_rate = ?,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [nomEcole.trim(), adresse.trim(), ville.trim(), telephone.trim(), rate, schoolId]
    );

    await logActivity(schoolId, req.user.id, 'school_updated', 'Paramètres de l\'école mis à jour');

    return res.json({ message: 'Paramètres enregistrés' });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/school/logo
 * Remplace le logo de l'école (PNG, JPG, SVG).
 */
export async function updateSchoolLogo(req, res, next) {
  try {
    const schoolId = req.user.schoolId;

    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier logo fourni' });
    }

    const school = await getSchoolOrFail(schoolId);
    if (!school) {
      return res.status(404).json({ error: 'École introuvable' });
    }

    const logoUrl = `/uploads/logos/${req.file.filename}`;

    // Supprime l'ancien fichier local s'il existe
    if (school.logo_url && school.logo_url.startsWith('/uploads/logos/')) {
      const oldPath = path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        '../../',
        school.logo_url.replace(/^\//, '')
      );
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch {
          /* ignore */
        }
      }
    }

    await query(
      `UPDATE schools SET logo_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [logoUrl, schoolId]
    );

    await logActivity(schoolId, req.user.id, 'school_logo_updated', 'Logo de l\'école mis à jour');

    return res.json({ message: 'Logo mis à jour', logoUrl });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/school/filieres
 */
export async function addFiliere(req, res, next) {
  try {
    const schoolId = req.user.schoolId;
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: 'Nom de filière obligatoire' });
    }

    const [existing] = await query(
      `SELECT id FROM filieres WHERE school_id = ? AND name = ? LIMIT 1`,
      [schoolId, name.trim()]
    );

    if (existing) {
      return res.status(409).json({ error: 'Cette filière existe déjà' });
    }

    const result = await query(
      `INSERT INTO filieres (school_id, name) VALUES (?, ?)`,
      [schoolId, name.trim()]
    );

    return res.status(201).json({
      message: 'Filière ajoutée',
      filiere: { id: result.insertId, name: name.trim() },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/admin/school/filieres/:id
 */
export async function deleteFiliere(req, res, next) {
  try {
    const schoolId = req.user.schoolId;
    const { id } = req.params;

    const result = await query(
      `DELETE FROM filieres WHERE id = ? AND school_id = ?`,
      [id, schoolId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Filière introuvable' });
    }

    return res.json({ message: 'Filière supprimée' });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/profile
 */
export async function getProfile(req, res, next) {
  try {
    const rows = await query(
      `SELECT id, email, first_name, last_name, phone, role FROM users WHERE id = ? LIMIT 1`,
      [req.user.id]
    );

    const user = rows[0];
    if (!user) return res.status(404).json({ error: 'Profil introuvable' });

    const school = await getSchoolOrFail(req.user.schoolId);

    return res.json({
      profile: {
        id: user.id,
        prenom: user.first_name,
        nom: user.last_name,
        email: user.email,
        telephone: user.phone,
        role: 'Gestionnaire Principal',
        schoolName: school?.name,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/profile
 */
export async function updateProfile(req, res, next) {
  try {
    const { prenom, nom, telephone } = req.body;

    await query(
      `UPDATE users SET
         first_name = COALESCE(?, first_name),
         last_name = COALESCE(?, last_name),
         phone = COALESCE(?, phone),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [prenom?.trim(), nom?.trim(), telephone?.trim(), req.user.id]
    );

    return res.json({ message: 'Profil mis à jour' });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/profile/password
 */
export async function updateProfilePassword(req, res, next) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'Tous les champs mot de passe sont obligatoires' });
    }

    const passwordError = validatePassword(newPassword, confirmPassword);
    if (passwordError) return res.status(400).json({ error: passwordError });

    const rows = await query(
      `SELECT password_hash FROM users WHERE id = ? LIMIT 1`,
      [req.user.id]
    );

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

/**
 * GET /api/admin/activity
 * Journal d'activité complet avec recherche et filtre.
 */
export async function getActivity(req, res, next) {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) {
      return res.status(403).json({ error: 'Compte admin sans école associée' });
    }

    const { search = '', type = 'all', limit = '50' } = req.query;
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);

    let sql = `
      SELECT id, action, description, created_at
      FROM activity_logs
      WHERE school_id = ?
    `;
    const params = [schoolId];

    if (String(search).trim()) {
      sql += ` AND description LIKE ?`;
      params.push(`%${String(search).trim()}%`);
    }

    if (type && type !== 'all') {
      const typeMap = {
        user: ['student_registered', 'responsable_created', 'user_created', 'created_user'],
        success: ['hours_validated', 'application_accepted', 'hours_declared'],
        check: ['hours_validated', 'application_accepted'],
        warning: ['offer_created'],
        offer: ['offer_created'],
        alert: ['alert', 'iban_missing', 'session_cancelled_by_student'],
        system: ['export_generated', 'system', 'student_profile_updated'],
        document: ['document_uploaded', 'application_submitted'],
      };

      const actions = typeMap[type];
      if (actions?.length) {
        sql += ` AND action IN (${actions.map(() => '?').join(', ')})`;
        params.push(...actions);
      }
    }

    // LIMIT en littéral : certains MySQL/mysql2 refusent LIMIT ?
    sql += ` ORDER BY created_at DESC LIMIT ${safeLimit}`;

    const rows = await query(sql, params);

    return res.json({
      activities: rows.map((row) => ({
        id: row.id,
        type: mapActivityType(row.action),
        action: row.action,
        description: row.description,
        time: formatRelativeTime(row.created_at),
        date: new Date(row.created_at).toLocaleDateString('fr-FR'),
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    next(error);
  }
}

function adminNotifLink(type) {
  if (type.includes('iban')) return '/admin/etudiants';
  if (type.includes('hour') || type.includes('heures')) return '/admin/heures';
  if (type.includes('responsable')) return '/admin/responsables';
  if (type.includes('student') || type.includes('export')) return type.includes('export') ? '/admin/export' : '/admin/etudiants';
  if (type.includes('offer')) return '/admin/responsables';
  return '/admin/dashboard';
}

async function ensureAdminNotification(adminId, { type, title, message, relatedType = null, relatedId = null }) {
  const existing = await query(
    `SELECT id FROM notifications
     WHERE user_id = ? AND type = ? AND title = ? AND is_read = 0
     LIMIT 1`,
    [adminId, type, title]
  );
  if (existing[0]) return;

  await query(
    `INSERT INTO notifications
       (user_id, type, title, message, related_entity_type, related_entity_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [adminId, type, title, message, relatedType, relatedId]
  );
}

async function syncAdminNotifications(adminId, schoolId) {
  const [ibanRows, pendingRespRows, activityRows] = await Promise.all([
    query(
      `SELECT COUNT(*) AS total
       FROM student_profiles sp
       JOIN users u ON u.id = sp.user_id
       WHERE sp.school_id = ? AND u.role = 'etudiant' AND u.is_active = 1
         AND (sp.iban IS NULL OR sp.iban = '')`,
      [schoolId]
    ),
    query(
      `SELECT
         u.id, u.first_name, u.last_name,
         COALESCE(SUM(hr.duration_hours), 0) AS heures
       FROM hour_records hr
       JOIN users u ON u.id = hr.responsable_id
       JOIN sessions s ON s.id = hr.session_id
       JOIN offers o ON o.id = s.offer_id
       WHERE o.school_id = ? AND hr.status = 'pending'
       GROUP BY u.id, u.first_name, u.last_name
       HAVING heures > 0
       ORDER BY heures DESC
       LIMIT 5`,
      [schoolId]
    ),
    query(
      `SELECT id, action, description, created_at
       FROM activity_logs
       WHERE school_id = ?
       ORDER BY created_at DESC
       LIMIT 10`,
      [schoolId]
    ),
  ]);

  const sansIban = Number(ibanRows[0]?.total || 0);
  if (sansIban > 0) {
    await ensureAdminNotification(adminId, {
      type: 'iban_missing',
      title: 'IBAN manquant',
      message: `${sansIban} étudiant${sansIban > 1 ? 's' : ''} n'${sansIban > 1 ? 'ont' : 'a'} pas renseigné d'IBAN`,
      relatedType: 'school',
      relatedId: schoolId,
    });
  }

  for (const resp of pendingRespRows) {
    const heures = Number(resp.heures);
    await ensureAdminNotification(adminId, {
      type: 'hours_pending',
      title: 'Heures en attente',
      message: `${resp.first_name} ${resp.last_name} : ${heures}h à valider`,
      relatedType: 'responsable',
      relatedId: resp.id,
    });
  }

  for (const row of activityRows) {
    let title = 'Activité';
    if (row.action.includes('student')) title = 'Nouvel étudiant';
    else if (row.action.includes('responsable')) title = 'Responsable';
    else if (row.action.includes('hour') || row.action.includes('hours')) title = 'Heures';
    else if (row.action.includes('export')) title = 'Export paie';
    else if (row.action.includes('offer')) title = 'Offre';
    else if (row.action.includes('iban')) title = 'IBAN';

    const existing = await query(
      `SELECT id FROM notifications
       WHERE user_id = ? AND type = ? AND related_entity_type = 'activity' AND related_entity_id = ?
       LIMIT 1`,
      [adminId, row.action, row.id]
    );
    if (existing[0]) continue;

    await query(
      `INSERT INTO notifications
         (user_id, type, title, message, related_entity_type, related_entity_id, created_at)
       VALUES (?, ?, ?, ?, 'activity', ?, ?)`,
      [adminId, row.action, title, row.description, row.id, row.created_at]
    );
  }
}

/**
 * GET /api/admin/notifications
 * Notifications de l'école de l'admin connecté (pas de données d'une autre école).
 */
export async function getNotifications(req, res, next) {
  try {
    const adminId = req.user.id;
    const schoolId = req.user.schoolId;
    if (!schoolId) {
      return res.status(403).json({ error: 'Compte admin sans école associée' });
    }

    await syncAdminNotifications(adminId, schoolId);

    const rows = await query(
      `SELECT id, type, title, message, is_read, created_at, related_entity_type, related_entity_id
       FROM notifications
       WHERE user_id = ?
       ORDER BY is_read ASC, created_at DESC
       LIMIT 20`,
      [adminId]
    );

    return res.json({
      notifications: rows.map((n) => ({
        id: n.id,
        title: n.title,
        desc: n.message,
        time: formatRelativeTime(n.created_at),
        read: Boolean(n.is_read),
        link: adminNotifLink(n.type),
        type: n.type,
      })),
      unreadCount: rows.filter((n) => !n.is_read).length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/notifications/read-all
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

function parseExportPeriod(queryParams) {
  const now = new Date();
  const month = Number(queryParams.month) || now.getMonth() + 1;
  const year = Number(queryParams.year) || now.getFullYear();

  if (month < 1 || month > 12 || year < 2000 || year > 2100) {
    return { error: 'Période invalide' };
  }

  return { month, year };
}

/**
 * GET /api/admin/export/preview?month=&year=&rate=
 * Aperçu paie + alertes pour le mois sélectionné.
 */
export async function getExportPreview(req, res, next) {
  try {
    const schoolId = req.user.schoolId;
    const period = parseExportPeriod(req.query);
    if (period.error) return res.status(400).json({ error: period.error });

    const school = await getSchoolOrFail(schoolId);
    if (!school) return res.status(404).json({ error: 'École introuvable' });

    const rate = req.query.rate != null && req.query.rate !== ''
      ? Number(req.query.rate)
      : Number(school.hourly_rate || 12);

    const payload = await buildExportPayload(schoolId, period.year, period.month, rate);

    return res.json({
      period: payload.period,
      month: payload.month,
      year: payload.year,
      hourlyRate: payload.hourlyRate,
      alerts: payload.alerts,
      assistants: payload.assistants.map((a) => ({
        nom: a.nom,
        prenom: a.prenom,
        idEtud: a.idEtud,
        iban: a.ibanMasked,
        ibanMissing: !a.iban,
        heures: a.heures,
        montant: a.montant,
      })),
      totals: payload.totals,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/export/download?month=&year=&format=csv|excel&rate=
 * Télécharge le fichier de paie (CSV ou Excel).
 */
export async function downloadExport(req, res, next) {
  try {
    const schoolId = req.user.schoolId;
    const period = parseExportPeriod(req.query);
    if (period.error) return res.status(400).json({ error: period.error });

    const formatRaw = String(req.query.format || 'csv').toLowerCase();
    const format = formatRaw === 'excel' || formatRaw === 'xlsx' || formatRaw === 'xls'
      ? 'xlsx'
      : 'csv';

    const school = await getSchoolOrFail(schoolId);
    if (!school) return res.status(404).json({ error: 'École introuvable' });

    const rate = req.query.rate != null && req.query.rate !== ''
      ? Number(req.query.rate)
      : Number(school.hourly_rate || 12);

    const payload = await buildExportPayload(schoolId, period.year, period.month, rate);
    const monthKey = exportMonthDate(period.year, period.month);
    const slug = `${period.year}-${String(period.month).padStart(2, '0')}`;

    let body;
    let contentType;
    let filename;

    if (format === 'xlsx') {
      body = buildExcelFile(payload);
      contentType = 'application/vnd.ms-excel; charset=utf-8';
      filename = `export-paie-${slug}.xls`;
    } else {
      body = buildCsvFile(payload);
      contentType = 'text/csv; charset=utf-8';
      filename = `export-paie-${slug}.csv`;
    }

    // En BDD : ENUM('csv','xlsx') — le fichier téléchargé reste .csv ou .xls
    const storedFormat = format === 'xlsx' ? 'xlsx' : 'csv';

    await query(
      `INSERT INTO monthly_exports
         (school_id, export_month, format, total_hours, total_amount, assistant_count, exported_by, file_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         format = VALUES(format),
         total_hours = VALUES(total_hours),
         total_amount = VALUES(total_amount),
         assistant_count = VALUES(assistant_count),
         exported_by = VALUES(exported_by),
         file_path = VALUES(file_path),
         exported_at = CURRENT_TIMESTAMP`,
      [
        schoolId,
        monthKey,
        storedFormat,
        payload.totals.heures,
        payload.totals.montant,
        payload.totals.assistants,
        req.user.id,
        filename,
      ]
    );

    await logActivity(
      schoolId,
      req.user.id,
      'export_generated',
      `Export paie ${payload.period} (${storedFormat === 'xlsx' ? 'EXCEL' : 'CSV'}) — ${payload.totals.assistants} assistants, ${payload.totals.montant.toFixed(2)} €`
    );

    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
    );
    // Empêche le navigateur de "deviner" un autre type
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.send(body);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/export/history
 * Historique des exports déjà générés.
 */
export async function getExportHistory(req, res, next) {
  try {
    const schoolId = req.user.schoolId;

    const rows = await query(
      `SELECT id, export_month, format, total_hours, total_amount, assistant_count, exported_at
       FROM monthly_exports
       WHERE school_id = ?
       ORDER BY export_month DESC
       LIMIT 24`,
      [schoolId]
    );

    return res.json({
      history: rows.map((row) => {
        const d = new Date(row.export_month);
        const month = d.getUTCMonth() + 1;
        const year = d.getUTCFullYear();
        return {
          id: row.id,
          month,
          year,
          label: getMonthLabel(month, year),
          shortLabel: `${MONTH_LABELS[month - 1]} ${year}`,
          format: row.format,
          totalHours: Number(row.total_hours),
          totalAmount: Number(row.total_amount),
          assistantCount: Number(row.assistant_count),
          exportedAt: row.exported_at,
          dateLabel: `Exporté le ${new Date(row.exported_at).toLocaleDateString('fr-FR')}`,
        };
      }),
    });
  } catch (error) {
    next(error);
  }
}
