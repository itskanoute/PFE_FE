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

/** Télécharge un fichier protégé (CV, export paie…) avec le token JWT. */
export async function downloadWithAuth(path, options = {}) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Impossible de télécharger le fichier');
  }

  const filename = options.filename
    || filenameFromDownloadResponse(response, path);

  // Force le bon type MIME selon l'extension → Windows n'ouvre pas un .csv comme un .xls
  const lower = filename.toLowerCase();
  let mime = response.headers.get('Content-Type') || 'application/octet-stream';
  if (lower.endsWith('.csv')) mime = 'text/csv;charset=utf-8';
  else if (lower.endsWith('.xls')) mime = 'application/vnd.ms-excel';
  else if (lower.endsWith('.xlsx')) mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  else if (lower.endsWith('.pdf')) mime = 'application/pdf';

  const buffer = await response.arrayBuffer();
  const blob = new Blob([buffer], { type: mime });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function filenameFromDownloadResponse(response, requestPath = '') {
  const disposition = response.headers.get('Content-Disposition') || '';
  const utfMatch = disposition.match(/filename\*=(?:UTF-8'')?([^;]+)/i);
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1].trim().replace(/^["']|["']$/g, ''));
    } catch {
      return utfMatch[1].trim().replace(/^["']|["']$/g, '');
    }
  }

  const plainMatch = disposition.match(/filename="([^"]+)"/i)
    || disposition.match(/filename=([^;\s]+)/i);
  if (plainMatch?.[1]) {
    return plainMatch[1].replace(/^["']|["']$/g, '');
  }

  const type = (response.headers.get('Content-Type') || '').toLowerCase();
  if (type.includes('csv')) return 'export-paie.csv';
  if (type.includes('excel') || type.includes('spreadsheetml')) return 'export-paie.xls';
  if (type.includes('pdf')) return 'document.pdf';

  if (requestPath.includes('/export/')) return 'export-paie.csv';
  if (requestPath.includes('/cv')) return 'cv.pdf';
  return 'download';
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

export function getAdminNotifications() {
  return apiFetch('/api/admin/notifications');
}

export function markAdminNotificationsRead() {
  return apiFetch('/api/admin/notifications/read-all', { method: 'PATCH' });
}

export function getAdminResponsables() {
  return apiFetch('/api/admin/responsables');
}

export function createAdminResponsable(data) {
  return apiFetch('/api/admin/responsables', { method: 'POST', body: JSON.stringify(data) });
}

export function resendAdminResponsableCredentials(id) {
  return apiFetch(`/api/admin/responsables/${id}/resend-credentials`, { method: 'POST' });
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

export function createAdminStudent(data) {
  return apiFetch('/api/admin/students', { method: 'POST', body: JSON.stringify(data) });
}

export function getAdminHours(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.month) searchParams.set('month', params.month);
  if (params.year) searchParams.set('year', params.year);
  const qs = searchParams.toString();
  return apiFetch(`/api/admin/hours${qs ? `?${qs}` : ''}`);
}

export function getAdminExportPreview(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.month) searchParams.set('month', params.month);
  if (params.year) searchParams.set('year', params.year);
  if (params.rate != null && params.rate !== '') searchParams.set('rate', params.rate);
  const qs = searchParams.toString();
  return apiFetch(`/api/admin/export/preview${qs ? `?${qs}` : ''}`);
}

export function getAdminExportHistory() {
  return apiFetch('/api/admin/export/history');
}

export function downloadAdminExport(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.month) searchParams.set('month', params.month);
  if (params.year) searchParams.set('year', params.year);
  const format = params.format === 'excel' || params.format === 'xlsx' || params.format === 'xls'
    ? 'excel'
    : 'csv';
  searchParams.set('format', format);
  if (params.rate != null && params.rate !== '') searchParams.set('rate', params.rate);
  const qs = searchParams.toString();
  const slug = `${params.year || 'export'}-${String(params.month || '').padStart(2, '0')}`;
  const filename = format === 'excel'
    ? `export-paie-${slug}.xls`
    : `export-paie-${slug}.csv`;
  return downloadWithAuth(`/api/admin/export/download?${qs}`, { filename });
}

export function getAdminSchoolSettings() {
  return apiFetch('/api/admin/school');
}

export function updateAdminSchoolSettings(data) {
  return apiFetch('/api/admin/school', { method: 'PUT', body: JSON.stringify(data) });
}

export function uploadAdminSchoolLogo(logoFile) {
  const formData = new FormData();
  formData.append('logo', logoFile);
  return apiFetch('/api/admin/school/logo', { method: 'POST', body: formData });
}

/** Résout une URL d'asset backend (/uploads/...) pour l'afficher côté frontend. */
export function resolveAssetUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  const base = API_URL || '';
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
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

export function downloadResponsableApplicationCv(id) {
  return downloadWithAuth(`/api/responsable/applications/${id}/cv`);
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

// ─── Étudiant ────────────────────────────────────────────────

export function getEtudiantDashboard() {
  return apiFetch('/api/etudiant/dashboard');
}

export function getEtudiantNotifications() {
  return apiFetch('/api/etudiant/notifications');
}

export function markEtudiantNotificationsRead() {
  return apiFetch('/api/etudiant/notifications/read-all', { method: 'PATCH' });
}

export function getEtudiantOffres() {
  return apiFetch('/api/etudiant/offres');
}

export function getEtudiantCandidatures(params = {}) {
  const qs = params.status ? `?status=${encodeURIComponent(params.status)}` : '';
  return apiFetch(`/api/etudiant/candidatures${qs}`);
}

export function createEtudiantCandidature(data, cvFile = null) {
  if (cvFile) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== false) {
        formData.append(key, typeof value === 'boolean' ? String(value) : value);
      }
    });
    formData.append('cv', cvFile);
    return apiFetch('/api/etudiant/candidatures', { method: 'POST', body: formData });
  }

  return apiFetch('/api/etudiant/candidatures', { method: 'POST', body: JSON.stringify(data) });
}

export function downloadEtudiantCandidatureCv(id) {
  return downloadWithAuth(`/api/etudiant/candidatures/${id}/cv`);
}

export function withdrawEtudiantCandidature(id) {
  return apiFetch(`/api/etudiant/candidatures/${id}/withdraw`, { method: 'PATCH' });
}

export function getEtudiantSeances() {
  return apiFetch('/api/etudiant/seances');
}

export function cancelEtudiantSeance(id, motif) {
  return apiFetch(`/api/etudiant/seances/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ motif }),
  });
}

export function getEtudiantHeures(params = {}) {
  const qs = params.month ? `?month=${encodeURIComponent(params.month)}` : '';
  return apiFetch(`/api/etudiant/heures${qs}`);
}

export function getEtudiantHeuresDeclarables() {
  return apiFetch('/api/etudiant/heures/declarables');
}

export function declareEtudiantHeures(data) {
  return apiFetch('/api/etudiant/heures', { method: 'POST', body: JSON.stringify(data) });
}

export function getEtudiantProfil() {
  return apiFetch('/api/etudiant/profil');
}

export function updateEtudiantProfil(data) {
  return apiFetch('/api/etudiant/profil', { method: 'PUT', body: JSON.stringify(data) });
}

export function updateEtudiantPassword(data) {
  return apiFetch('/api/etudiant/profil/password', { method: 'PUT', body: JSON.stringify(data) });
}
