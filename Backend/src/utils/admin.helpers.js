import crypto from 'crypto';
import { query } from '../config/db.js';

const MONTH_LABELS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export function generateTempPassword() {
  const part = crypto.randomBytes(4).toString('hex');
  return `${part.charAt(0).toUpperCase()}${part.slice(1)}9!`;
}

export function getInitials(firstName, lastName) {
  return `${(firstName?.[0] || '').toUpperCase()}${(lastName?.[0] || '').toUpperCase()}`;
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return 'Jamais';

  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return 'À l\'instant';
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 30) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  if (diffDays < 60) return 'Il y a 1 mois';

  return date.toLocaleDateString('fr-FR');
}

export function mapActivityType(action) {
  if (action.includes('registered') || action.includes('created')) return 'user';
  if (action.includes('validated') || action.includes('accepted')) return 'check';
  if (action.includes('offer')) return 'offer';
  if (action.includes('alert') || action.includes('iban')) return 'alert';
  if (action.includes('export')) return 'system';
  return 'system';
}

export function getMonthLabel(month, year) {
  return `${MONTH_LABELS[month - 1]} ${year}`;
}

export async function logActivity(schoolId, actorId, action, description) {
  await query(
    `INSERT INTO activity_logs (school_id, actor_id, action, description)
     VALUES (?, ?, ?, ?)`,
    [schoolId, actorId, action, description]
  );
}

export async function getSchoolOrFail(schoolId) {
  const rows = await query(
    `SELECT id, name, acronym, email_domain, address, city, phone, logo_url, hourly_rate
     FROM schools WHERE id = ? LIMIT 1`,
    [schoolId]
  );

  return rows[0] || null;
}
