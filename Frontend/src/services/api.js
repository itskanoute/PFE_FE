const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Appel API centralisé — toutes les pages frontend passent par ici.
 * En dev : les requêtes passent par /api (proxy Vite → localhost:3000)
 */
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  const isFormData = options.body instanceof FormData;

  const headers = { ...options.headers };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error('Impossible de joindre le serveur. Vérifiez que le backend est démarré (npm run dev dans Backend).');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Une erreur est survenue');
  }

  return data;
}

export function saveAuth({ token, user }) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getStoredUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

export function getDashboardPath(role) {
  const paths = {
    admin: '/dashboard/admin',
    etudiant: '/dashboard/student',
    responsable: '/dashboard/responsable',
  };
  return paths[role] || '/login';
}

// ─── Auth ────────────────────────────────────────────────────

export function login(credentials) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function registerSchool(data, logoFile = null) {
  if (logoFile) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, value));
    formData.append('logo', logoFile);

    return apiFetch('/api/auth/register/school', {
      method: 'POST',
      body: formData,
    });
  }

  return apiFetch('/api/auth/register/school', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function registerStudent(data) {
  return apiFetch('/api/auth/register/student', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getMe() {
  return apiFetch('/api/auth/me');
}

export function forgotPassword(data) {
  return apiFetch('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function resetPassword(data) {
  return apiFetch('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Écoles ──────────────────────────────────────────────────

export function getSchools() {
  return apiFetch('/api/schools');
}

export function getFilieres(schoolId) {
  return apiFetch(`/api/schools/${schoolId}/filieres`);
}
