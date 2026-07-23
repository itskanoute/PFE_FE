/**
 * Accès réservé aux étudiants.
 */
export function requireEtudiant(req, res, next) {
  if (req.user?.role !== 'etudiant') {
    return res.status(403).json({ error: 'Accès réservé aux étudiants' });
  }

  if (!req.user.schoolId) {
    return res.status(403).json({ error: 'Compte étudiant sans école associée' });
  }

  next();
}
