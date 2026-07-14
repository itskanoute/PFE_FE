/**
 * Utilitaires partagés pour l'authentification
 */

const VALID_STUDY_YEARS = ['L1', 'L2', 'L3', 'M1', 'M2'];

/** Sépare "Jean Dupont" → { firstName: "Jean", lastName: "Dupont" } */
export function splitFullName(fullName) {
  const parts = fullName.trim().split(/\s+/);

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: parts[0] };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

/** Normalise le domaine email : "@escp.eu" ou "escp.eu" → "escp.eu" */
export function normalizeEmailDomain(domain) {
  return domain.trim().replace(/^@+/, '').toLowerCase();
}

/** Vérifie que l'email appartient au domaine de l'école */
export function emailMatchesDomain(email, domain) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedDomain = normalizeEmailDomain(domain);
  return normalizedEmail.endsWith(`@${normalizedDomain}`);
}

export function validatePassword(password, confirmPassword) {
  if (!password || password.length < 8) {
    return 'Le mot de passe doit contenir au moins 8 caractères';
  }

  if (password !== confirmPassword) {
    return 'Les mots de passe ne correspondent pas';
  }

  return null;
}

export function validateStudyYear(year) {
  return VALID_STUDY_YEARS.includes(year);
}

/** Chemin de redirection frontend selon le rôle après connexion / inscription */
export function getRedirectPath(role, { mustChangePassword = false } = {}) {
  if (mustChangePassword) {
    return '/change-password';
  }

  const paths = {
    admin: '/admin/dashboard',
    responsable: '/responsable/dashboard',
    etudiant: '/dashboard/student',
  };

  return paths[role] || '/login';
}

/** Format standard de réponse utilisateur (sans mot de passe) */
export function formatUserResponse(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.first_name,
    lastName: user.last_name,
    schoolId: user.school_id,
    mustChangePassword: Boolean(user.must_change_password),
  };
}

/** Réponse auth complète : token + user + redirectTo */
export function buildAuthResponse({ token, user }) {
  const formattedUser = user.first_name
    ? formatUserResponse(user)
    : user;

  return {
    token,
    user: formattedUser,
    redirectTo: getRedirectPath(formattedUser.role, {
      mustChangePassword: formattedUser.mustChangePassword,
    }),
  };
}
