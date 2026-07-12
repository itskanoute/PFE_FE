import { verifyToken } from '../utils/jwt.js';

/**
 * Middleware d'authentification JWT.
 *
 * Le client doit envoyer le token dans le header HTTP :
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 *
 * Si le token est valide → req.user contient le payload décodé
 * Si le token est absent ou invalide → réponse 401
 */
export function authenticateToken(req, res, next) {
  // Header attendu : "Bearer <token>"
  const authHeader = req.headers.authorization;

  // authHeader = "Bearer eyJhbG..."  →  on retire "Bearer "
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      error: 'Token manquant. Envoyez : Authorization: Bearer <token>',
    });
  }

  try {
    // Décode et vérifie la signature + expiration du token
    const payload = verifyToken(token);

    // Rend les infos utilisateur disponibles dans les routes suivantes
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      schoolId: payload.schoolId,
    };

    next();
  } catch (error) {
    // Token expiré, signature invalide ou JWT_SECRET incorrect
    return res.status(401).json({
      error: 'Token invalide ou expiré',
    });
  }
}
