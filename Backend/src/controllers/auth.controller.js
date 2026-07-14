import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query, withTransaction } from '../config/db.js';
import { signToken } from '../utils/jwt.js';
import {
  splitFullName,
  normalizeEmailDomain,
  emailMatchesDomain,
  validatePassword,
  validateStudyYear,
  buildAuthResponse,
  formatUserResponse,
  getRedirectPath,
} from '../utils/auth.helpers.js';

/**
 * POST /api/auth/login
 *
 * Authentifie un utilisateur (admin, responsable ou étudiant)
 * et renvoie un token JWT + les infos du profil.
 *
 * Body attendu (JSON) :
 * {
 *   "email": "admin@escp.eu",
 *   "password": "Password123!"
 * }
 *
 * Réponse succès (200) :
 * {
 *   "token": "eyJhbG...",
 *   "user": { id, email, role, firstName, lastName, schoolId, mustChangePassword },
 *   "redirectTo": "/responsable/dashboard"
 * }
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // ── 1. Validation des champs obligatoires ──────────────────────
    // On vérifie côté serveur même si le frontend valide déjà :
    // le backend ne doit jamais faire confiance au client seul.
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email et mot de passe sont obligatoires',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // ── 2. Recherche de l'utilisateur en base ──────────────────────
    // On récupère le hash du mot de passe (jamais le mot de passe en clair).
    const users = await query(
      `SELECT
         id,
         school_id,
         email,
         password_hash,
         role,
         first_name,
         last_name,
         is_active,
         must_change_password
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [normalizedEmail]
    );

    const user = users[0];

    // ── 3. Message d'erreur générique si compte introuvable ──────────
    // On utilise le même message que pour un mauvais mot de passe
    // pour ne pas révéler si un email existe ou non (sécurité).
    if (!user) {
      return res.status(401).json({
        error: 'Email ou mot de passe incorrect',
      });
    }

    // ── 4. Vérifier que le compte est actif ──────────────────────────
    // Un admin peut désactiver un responsable ou un étudiant.
    if (!user.is_active) {
      return res.status(403).json({
        error: 'Ce compte est désactivé. Contactez l\'administration de votre école.',
      });
    }

    // ── 5. Comparer le mot de passe saisi avec le hash bcrypt ────────
    // bcrypt.compare() hash le mot de passe saisi et le compare au hash stocké.
    const passwordMatch = await bcrypt.compare(trimmedPassword, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        error: 'Email ou mot de passe incorrect',
      });
    }

    // ── 6. Mettre à jour la date de dernière connexion ───────────────
    await query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // ── 7. Générer le token JWT ──────────────────────────────────────
    // Le frontend utilisera ce token pour accéder aux routes protégées.
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      schoolId: user.school_id,
    });

    // ── 8. Réponse envoyée au frontend ───────────────────────────────
    // On ne renvoie JAMAIS password_hash au client.
    return res.json(buildAuthResponse({ token, user }));
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 *
 * Route protégée : nécessite un token JWT valide.
 * Permet de vérifier que le token fonctionne et de récupérer le profil connecté.
 *
 * Header requis :
 *   Authorization: Bearer <token>
 */
export async function getMe(req, res, next) {
  try {
    // req.user est rempli par le middleware authenticateToken
    const users = await query(
      `SELECT
         id,
         school_id,
         email,
         role,
         first_name,
         last_name,
         is_active,
         must_change_password,
         last_login_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [req.user.id]
    );

    const user = users[0];

    if (!user || !user.is_active) {
      return res.status(401).json({
        error: 'Utilisateur introuvable ou compte désactivé',
      });
    }

    return res.json({
      message: 'Token valide — vous êtes bien authentifié',
      user: formatUserResponse(user),
      redirectTo: getRedirectPath(user.role, {
        mustChangePassword: Boolean(user.must_change_password),
      }),
      tokenPayload: req.user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/register/school
 *
 * Inscription d'une école + création du compte admin principal.
 * Body aligné sur le formulaire RegisterSchool.jsx du frontend.
 */
export async function registerSchool(req, res, next) {
  try {
    const {
      schoolName,
      acronym,
      emailDomain,
      address,
      city,
      phone,
      contactName,
      contactEmail,
      password,
      confirmPassword,
    } = req.body;

    if (!schoolName || !acronym || !emailDomain || !address || !city || !phone
      || !contactName || !contactEmail || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
    }

    const passwordError = validatePassword(password, confirmPassword);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    const domain = normalizeEmailDomain(emailDomain);
    const adminEmail = contactEmail.trim().toLowerCase();
    const normalizedAcronym = acronym.trim().toUpperCase();

    if (!emailMatchesDomain(adminEmail, domain)) {
      return res.status(400).json({
        error: `L'email administrateur doit se terminer par @${domain}`,
      });
    }

    const [existingAcronym] = await query(
      'SELECT id FROM schools WHERE UPPER(acronym) = ? LIMIT 1',
      [normalizedAcronym]
    );
    if (existingAcronym) {
      return res.status(409).json({ error: `Le sigle "${normalizedAcronym}" est déjà utilisé. Choisissez un autre sigle.` });
    }

    const [existingDomain] = await query(
      'SELECT id FROM schools WHERE email_domain = ? LIMIT 1',
      [domain]
    );
    if (existingDomain) {
      return res.status(409).json({ error: `Le domaine @${domain} est déjà enregistré.` });
    }

    const [existingEmail] = await query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [adminEmail]
    );
    if (existingEmail) {
      return res.status(409).json({ error: `L'email ${adminEmail} est déjà utilisé.` });
    }

    const { firstName, lastName } = splitFullName(contactName);
    const passwordHash = await bcrypt.hash(password, 10);
    const logoUrl = req.file ? `/uploads/logos/${req.file.filename}` : null;

    const result = await withTransaction(async (connection) => {
      const [schoolResult] = await connection.execute(
        `INSERT INTO schools (name, acronym, email_domain, address, city, phone, logo_url)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [schoolName.trim(), normalizedAcronym, domain, address.trim(), city.trim(), phone.trim(), logoUrl]
      );

      const schoolId = schoolResult.insertId;

      const [userResult] = await connection.execute(
        `INSERT INTO users
           (school_id, email, password_hash, role, first_name, last_name, phone)
         VALUES (?, ?, ?, 'admin', ?, ?, ?)`,
        [schoolId, adminEmail, passwordHash, firstName, lastName, phone.trim()]
      );

      return { schoolId, userId: userResult.insertId };
    });

    const token = signToken({
      id: result.userId,
      email: adminEmail,
      role: 'admin',
      schoolId: result.schoolId,
    });

    return res.status(201).json({
      message: 'École et compte administrateur créés avec succès',
      ...buildAuthResponse({
        token,
        user: {
          id: result.userId,
          email: adminEmail,
          role: 'admin',
          first_name: firstName,
          last_name: lastName,
          school_id: result.schoolId,
          must_change_password: 0,
        },
      }),
      school: {
        id: result.schoolId,
        name: schoolName.trim(),
        acronym: normalizedAcronym,
        emailDomain: domain,
        logoUrl,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/register/student
 *
 * Inscription étudiant — uniquement si l'école existe déjà.
 * Body aligné sur le formulaire RegisterStudent.jsx du frontend.
 */
export async function registerStudent(req, res, next) {
  try {
    const {
      schoolId,
      studentId,
      year,
      firstName,
      lastName,
      major,
      email,
      password,
      confirmPassword,
    } = req.body;

    if (!schoolId || !studentId || !year || !firstName || !lastName
      || !major || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
    }

    const passwordError = validatePassword(password, confirmPassword);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    if (!validateStudyYear(year)) {
      return res.status(400).json({ error: 'Année d\'études invalide' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const schools = await query(
      'SELECT id, name, email_domain, is_active FROM schools WHERE id = ? LIMIT 1',
      [schoolId]
    );

    const school = schools[0];

    if (!school) {
      return res.status(404).json({
        error: 'École introuvable. Votre établissement doit d\'abord s\'inscrire sur la plateforme.',
      });
    }

    if (!school.is_active) {
      return res.status(403).json({ error: 'Cette école n\'accepte plus de nouvelles inscriptions' });
    }

    if (!emailMatchesDomain(normalizedEmail, school.email_domain)) {
      return res.status(400).json({
        error: `Vous devez utiliser votre email @${school.email_domain}`,
      });
    }

    const duplicates = await query(
      `SELECT email FROM users WHERE email = ?
       UNION
       SELECT student_number AS email FROM student_profiles
       WHERE school_id = ? AND student_number = ?`,
      [normalizedEmail, schoolId, studentId.trim()]
    );

    if (duplicates.length > 0) {
      return res.status(409).json({
        error: 'Un compte existe déjà avec cet email ou ce numéro étudiant',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userId = await withTransaction(async (connection) => {
      const [userResult] = await connection.execute(
        `INSERT INTO users
           (school_id, email, password_hash, role, first_name, last_name)
         VALUES (?, ?, ?, 'etudiant', ?, ?)`,
        [schoolId, normalizedEmail, passwordHash, firstName.trim(), lastName.trim()]
      );

      const newUserId = userResult.insertId;

      await connection.execute(
        `INSERT INTO student_profiles
           (user_id, school_id, student_number, major, study_year)
         VALUES (?, ?, ?, ?, ?)`,
        [newUserId, schoolId, studentId.trim(), major.trim(), year]
      );

      return newUserId;
    });

    const token = signToken({
      id: userId,
      email: normalizedEmail,
      role: 'etudiant',
      schoolId: Number(schoolId),
    });

    return res.status(201).json({
      message: 'Compte étudiant créé avec succès',
      ...buildAuthResponse({
        token,
        user: {
          id: userId,
          email: normalizedEmail,
          role: 'etudiant',
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          school_id: Number(schoolId),
          must_change_password: 0,
        },
      }),
    });
  } catch (error) {
    next(error);
  }
}

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 heure

function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * POST /api/auth/forgot-password
 *
 * Demande de réinitialisation — envoie un lien par email en production.
 * En développement, le lien est renvoyé dans la réponse pour faciliter les tests.
 */
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({ error: 'L\'adresse email est obligatoire' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const genericMessage =
      'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.';

    const users = await query(
      `SELECT id, email, is_active FROM users WHERE email = ? LIMIT 1`,
      [normalizedEmail]
    );

    const user = users[0];

    if (!user || !user.is_active) {
      return res.json({ message: genericMessage });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES (?, ?, ?)`,
      [user.id, tokenHash, expiresAt]
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${rawToken}`;

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Lien de réinitialisation pour ${normalizedEmail} : ${resetLink}`);
    }

    const response = { message: genericMessage };

    if (process.env.NODE_ENV !== 'production') {
      response.resetLink = resetLink;
    }

    return res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/reset-password
 *
 * Réinitialise le mot de passe avec le token reçu par email.
 */
export async function resetPassword(req, res, next) {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token?.trim()) {
      return res.status(400).json({ error: 'Token de réinitialisation manquant ou invalide' });
    }

    const passwordError = validatePassword(password, confirmPassword);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    const tokenHash = hashResetToken(token.trim());

    const tokens = await query(
      `SELECT prt.id, prt.user_id, prt.expires_at, prt.used_at,
              u.is_active
       FROM password_reset_tokens prt
       JOIN users u ON u.id = prt.user_id
       WHERE prt.token_hash = ?
       LIMIT 1`,
      [tokenHash]
    );

    const resetToken = tokens[0];

    if (!resetToken || resetToken.used_at || new Date(resetToken.expires_at) < new Date()) {
      return res.status(400).json({
        error: 'Ce lien de réinitialisation est invalide ou a expiré. Demandez un nouveau lien.',
      });
    }

    if (!resetToken.is_active) {
      return res.status(403).json({
        error: 'Ce compte est désactivé. Contactez l\'administration de votre école.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await withTransaction(async (connection) => {
      await connection.execute(
        `UPDATE users
         SET password_hash = ?, must_change_password = 0, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [passwordHash, resetToken.user_id]
      );

      await connection.execute(
        `UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [resetToken.id]
      );

      await connection.execute(
        `UPDATE password_reset_tokens
         SET used_at = CURRENT_TIMESTAMP
         WHERE user_id = ? AND used_at IS NULL AND id != ?`,
        [resetToken.user_id, resetToken.id]
      );
    });

    return res.json({
      message: 'Mot de passe réinitialisé avec succès. Vous pouvez vous connecter.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/auth/change-password
 *
 * Changement de mot de passe pour un utilisateur connecté.
 * Utilisé à la première connexion (mustChangePassword) ou depuis le profil.
 *
 * Body :
 * { "password": "...", "confirmPassword": "...", "currentPassword": "..." (optionnel si mustChangePassword) }
 */
export async function changePassword(req, res, next) {
  try {
    const { password, confirmPassword, currentPassword } = req.body;

    const passwordError = validatePassword(password, confirmPassword);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    const users = await query(
      `SELECT id, role, password_hash, must_change_password, is_active
       FROM users WHERE id = ? LIMIT 1`,
      [req.user.id]
    );

    const user = users[0];

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Utilisateur introuvable ou compte désactivé' });
    }

    if (!user.must_change_password) {
      if (!currentPassword?.trim()) {
        return res.status(400).json({ error: 'Le mot de passe actuel est obligatoire' });
      }

      const currentMatch = await bcrypt.compare(currentPassword.trim(), user.password_hash);
      if (!currentMatch) {
        return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await query(
      `UPDATE users
       SET password_hash = ?, must_change_password = 0, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [passwordHash, user.id]
    );

    return res.json({
      message: 'Mot de passe modifié avec succès',
      redirectTo: getRedirectPath(user.role, { mustChangePassword: false }),
    });
  } catch (error) {
    next(error);
  }
}
