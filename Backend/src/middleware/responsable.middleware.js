/**
 * Accès réservé aux responsables pédagogiques.
 */
export function requireResponsable(req, res, next) {
  if (req.user?.role !== 'responsable') {
    return res.status(403).json({ error: 'Accès réservé aux responsables pédagogiques' });
  }

  if (!req.user.schoolId) {
    return res.status(403).json({ error: 'Compte responsable sans école associée' });
  }

  next();
}
