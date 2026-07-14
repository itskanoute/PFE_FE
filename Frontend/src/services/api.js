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
    admin: '/admin/dashboard',
    etudiant: '/dashboard/student',
    responsable: '/responsable/dashboard',
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

export function changePassword(data) {
  return apiFetch('/api/auth/change-password', {
    method: 'PUT',
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

// ─── Admin ───────────────────────────────────────────────────

export function getAdminDashboard() {
  return apiFetch('/api/admin/dashboard');
}

export function getAdminActivity(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set('search', params.search);
  if (params.type) searchParams.set('type', params.type);
  const qs = searchParams.toString();
  return apiFetch(`/api/admin/activity${qs ? `?${qs}` : ''}`);
}

export function getAdminResponsables() {
  return apiFetch('/api/admin/responsables');
}

export function createAdminResponsable(data) {
  return apiFetch('/api/admin/responsables', { method: 'POST', body: JSON.stringify(data) });
}

export function updateAdminResponsable(id, data) {
  return apiFetch(`/api/admin/responsables/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function toggleAdminResponsableStatus(id) {
  return apiFetch(`/api/admin/responsables/${id}/status`, { method: 'PATCH' });
}

export function deleteAdminResponsable(id) {
  return apiFetch(`/api/admin/responsables/${id}`, { method: 'DELETE' });
}

export function getAdminStudents(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.filiere) searchParams.set('filiere', params.filiere);
  if (params.ibanMissing) searchParams.set('ibanMissing', 'true');
  if (params.assistantOnly) searchParams.set('assistantOnly', 'true');
  const qs = searchParams.toString();
  return apiFetch(`/api/admin/students${qs ? `?${qs}` : ''}`);
}

export function getAdminStudent(id) {
  return apiFetch(`/api/admin/students/${id}`);
}

export function getAdminHours(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.month) searchParams.set('month', params.month);
  if (params.year) searchParams.set('year', params.year);
  const qs = searchParams.toString();
  return apiFetch(`/api/admin/hours${qs ? `?${qs}` : ''}`);
}

export function getAdminSchoolSettings() {
  return apiFetch('/api/admin/school');
}

export function updateAdminSchoolSettings(data) {
  return apiFetch('/api/admin/school', { method: 'PUT', body: JSON.stringify(data) });
}

export function addAdminFiliere(name) {
  return apiFetch('/api/admin/school/filieres', { method: 'POST', body: JSON.stringify({ name }) });
}

export function deleteAdminFiliere(id) {
  return apiFetch(`/api/admin/school/filieres/${id}`, { method: 'DELETE' });
}

export function getAdminProfile() {
  return apiFetch('/api/admin/profile');
}

export function updateAdminProfile(data) {
  return apiFetch('/api/admin/profile', { method: 'PUT', body: JSON.stringify(data) });
}

export function updateAdminPassword(data) {
  return apiFetch('/api/admin/profile/password', { method: 'PUT', body: JSON.stringify(data) });
}

// ─── Responsable ─────────────────────────────────────────────

export function getResponsableDashboard() {
  return apiFetch('/api/responsable/dashboard');
}

export function getResponsableSummary() {
  return apiFetch('/api/responsable/summary');
}

export function getResponsableOffers() {
  return apiFetch('/api/responsable/offers');
}

export function createResponsableOffer(data) {
  return apiFetch('/api/responsable/offers', { method: 'POST', body: JSON.stringify(data) });
}

export function updateResponsableOffer(id, data) {
  return apiFetch(`/api/responsable/offers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function toggleResponsableOfferStatus(id) {
  return apiFetch(`/api/responsable/offers/${id}/status`, { method: 'PATCH' });
}

export function getResponsableApplications(params = {}) {
  const qs = params.status ? `?status=${params.status}` : '';
  return apiFetch(`/api/responsable/applications${qs}`);
}

export function reviewResponsableApplication(id, action) {
  return apiFetch(`/api/responsable/applications/${id}`, { method: 'PATCH', body: JSON.stringify({ action }) });
}

export function getResponsableSessions() {
  return apiFetch('/api/responsable/sessions');
}

export function createResponsableSession(data) {
  return apiFetch('/api/responsable/sessions', { method: 'POST', body: JSON.stringify(data) });
}

export function assignResponsableSession(id, studentId) {
  return apiFetch(`/api/responsable/sessions/${id}/assign`, { method: 'PATCH', body: JSON.stringify({ studentId }) });
}

export function getResponsableHours() {
  return apiFetch('/api/responsable/hours');
}

export function reviewResponsableHour(id, action) {
  return apiFetch(`/api/responsable/hours/${id}`, { method: 'PATCH', body: JSON.stringify({ action }) });
}

export function getResponsableProfile() {
  return apiFetch('/api/responsable/profile');
}

export function updateResponsableProfile(data) {
  return apiFetch('/api/responsable/profile', { method: 'PUT', body: JSON.stringify(data) });
}

export function updateResponsablePassword(data) {
  return apiFetch('/api/responsable/profile/password', { method: 'PUT', body: JSON.stringify(data) });
}
