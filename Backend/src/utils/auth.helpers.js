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

/**
 * Normalise le domaine email institutionnel.
 * Accepte : "escp.eu", "@escp.eu", ou une adresse complète "admin@gmail.com" → "gmail.com"
 */
export function normalizeEmailDomain(domain) {
  let value = String(domain || '').trim().toLowerCase().replace(/^@+/, '');

  // Si l'utilisateur a collé une adresse complète (ex: kanoutecoumba00@gmail.com)
  if (value.includes('@')) {
    value = value.split('@').pop();
  }

  return value;
}

/** Domaines toujours acceptés en plus du domaine école (tests / Gmail). */
const EXTRA_ALLOWED_DOMAINS = ['gmail.com'];

/**
 * Vérifie que l'email appartient au domaine de l'école
 * OU à un domaine de test autorisé (gmail.com).
 */
export function emailMatchesDomain(email, domain) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedDomain = normalizeEmailDomain(domain);
  if (!normalizedEmail.includes('@')) return false;

  const allowed = new Set(
    [normalizedDomain, ...EXTRA_ALLOWED_DOMAINS].filter(Boolean)
  );

  return [...allowed].some((d) => normalizedEmail.endsWith(`@${d}`));
}

/** Texte d'aide pour les messages d'erreur (domaine école + gmail). */
export function allowedEmailDomainsLabel(domain) {
  const primary = normalizeEmailDomain(domain);
  const extras = EXTRA_ALLOWED_DOMAINS.filter((d) => d !== primary);
  if (!primary) return extras.map((d) => `@${d}`).join(' ou ');
  if (extras.length === 0) return `@${primary}`;
  return `@${primary} ou ${extras.map((d) => `@${d}`).join(' ou ')}`;
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
