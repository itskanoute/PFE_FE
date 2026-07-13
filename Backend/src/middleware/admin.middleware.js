/**
 * Accès réservé aux administrateurs d'école.
 */
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }

  if (!req.user.schoolId) {
    return res.status(403).json({ error: 'Compte administrateur sans école associée' });
  }

  next();
}
