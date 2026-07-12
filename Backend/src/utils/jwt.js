import jwt from 'jsonwebtoken';

/**
 * Durée de validité du token JWT.
 * Le frontend stockera ce token (localStorage ou cookie) et l'enverra
 * dans le header Authorization: Bearer <token> pour les routes protégées.
 */
const TOKEN_EXPIRES_IN = '7d';

/**
 * Génère un token JWT contenant les infos essentielles de l'utilisateur.
 *
 * @param {object} payload - Données à encoder dans le token
 * @param {number} payload.id - ID utilisateur en base
 * @param {string} payload.email
 * @param {string} payload.role - admin | responsable | etudiant
 * @param {number|null} payload.schoolId - ID de l'école (null si compte système)
 * @returns {string} Token JWT signé
 */
export function signToken({ id, email, role, schoolId }) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET manquant dans le fichier .env');
  }

  return jwt.sign(
    {
      sub: id,           // "subject" = identifiant standard JWT
      email,
      role,
      schoolId,
    },
    secret,
    { expiresIn: TOKEN_EXPIRES_IN }
  );
}

/**
 * Vérifie et décode un token JWT (utile pour les routes protégées plus tard).
 *
 * @param {string} token
 * @returns {object} Payload décodé
 */
export function verifyToken(token) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET manquant dans le fichier .env');
  }

  return jwt.verify(token, secret);
}
