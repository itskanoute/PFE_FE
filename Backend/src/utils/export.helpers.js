import { query } from '../config/db.js';
import { getMonthLabel } from './admin.helpers.js';

export function maskIban(iban) {
  if (!iban || String(iban).trim() === '') return null;
  const clean = String(iban).replace(/\s+/g, '');
  if (clean.length < 8) return '****';
  return `${clean.slice(0, 4)} **** ${clean.slice(-4)}`;
}

/**
 * Agrège les heures validées du mois + alertes (IBAN manquant, heures en attente).
 */
export async function buildExportPayload(schoolId, year, month, hourlyRate) {
  const rate = Number(hourlyRate);
  const safeRate = Number.isFinite(rate) && rate >= 0 ? rate : 0;

  const [rows, pendingRows] = await Promise.all([
    query(
      `SELECT
         u.id AS student_id,
         u.last_name,
         u.first_name,
         sp.student_number,
         sp.iban,
         COALESCE(SUM(hr.duration_hours), 0) AS heures
       FROM hour_records hr
       JOIN users u ON u.id = hr.student_id
       JOIN student_profiles sp ON sp.user_id = u.id
       JOIN sessions s ON s.id = hr.session_id
       JOIN offers o ON o.id = s.offer_id
       WHERE o.school_id = ?
         AND hr.status = 'validated'
         AND YEAR(COALESCE(hr.validated_at, hr.created_at)) = ?
         AND MONTH(COALESCE(hr.validated_at, hr.created_at)) = ?
       GROUP BY u.id, u.last_name, u.first_name, sp.student_number, sp.iban
       HAVING heures > 0
       ORDER BY u.last_name, u.first_name`,
      [schoolId, year, month]
    ),
    query(
      `SELECT
         CONCAT(u.first_name, ' ', u.last_name) AS nom,
         COALESCE(SUM(hr.duration_hours), 0) AS heures
       FROM hour_records hr
       JOIN users u ON u.id = hr.responsable_id
       JOIN sessions s ON s.id = hr.session_id
       JOIN offers o ON o.id = s.offer_id
       WHERE o.school_id = ?
         AND hr.status = 'pending'
         AND YEAR(hr.created_at) = ?
         AND MONTH(hr.created_at) = ?
       GROUP BY u.id, u.first_name, u.last_name
       HAVING heures > 0
       ORDER BY heures DESC`,
      [schoolId, year, month]
    ),
  ]);

  const assistants = rows.map((r) => {
    const heures = Number(r.heures);
    return {
      studentId: r.student_id,
      nom: String(r.last_name || '').toUpperCase(),
      prenom: r.first_name,
      idEtud: r.student_number ? `#${r.student_number}` : '—',
      studentNumber: r.student_number || '',
      iban: r.iban || null,
      ibanMasked: maskIban(r.iban),
      heures,
      montant: Math.round(heures * safeRate * 100) / 100,
    };
  });

  const sansIban = assistants
    .filter((a) => !a.iban)
    .map((a) => `${a.prenom} ${a.nom}`);

  const totalHeures = assistants.reduce((s, a) => s + a.heures, 0);
  const totalMontant = assistants.reduce((s, a) => s + a.montant, 0);

  return {
    period: getMonthLabel(month, year),
    month,
    year,
    hourlyRate: safeRate,
    assistants,
    alerts: {
      sansIban,
      enAttente: pendingRows.map((p) => ({
        nom: p.nom,
        heures: Number(p.heures),
      })),
    },
    totals: {
      assistants: assistants.length,
      heures: totalHeures,
      montant: Math.round(totalMontant * 100) / 100,
    },
  };
}

function escapeCsv(value) {
  const str = value == null ? '' : String(value);
  if (/[",;\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** CSV séparé par point-virgule (compatible Excel FR). */
export function buildCsvFile(payload) {
  const header = ['Nom', 'Prénom', 'ID Étudiant', 'IBAN', 'Heures', 'Montant (€)'];
  const lines = [header.join(';')];

  for (const row of payload.assistants) {
    lines.push(
      [
        escapeCsv(row.nom),
        escapeCsv(row.prenom),
        escapeCsv(row.studentNumber || row.idEtud),
        escapeCsv(row.iban || ''),
        escapeCsv(String(row.heures).replace('.', ',')),
        escapeCsv(row.montant.toFixed(2).replace('.', ',')),
      ].join(';')
    );
  }

  lines.push('');
  lines.push(
    ['TOTAL', '', '', '', escapeCsv(String(payload.totals.heures).replace('.', ',')), escapeCsv(payload.totals.montant.toFixed(2).replace('.', ','))].join(';')
  );

  // BOM UTF-8 pour Excel
  return `\uFEFF${lines.join('\r\n')}`;
}

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Fichier Excel XML SpreadsheetML (.xls) — ouvert nativement par Excel. */
export function buildExcelFile(payload) {
  const rowsXml = payload.assistants
    .map(
      (row) => `
    <Row>
      <Cell><Data ss:Type="String">${escapeXml(row.nom)}</Data></Cell>
      <Cell><Data ss:Type="String">${escapeXml(row.prenom)}</Data></Cell>
      <Cell><Data ss:Type="String">${escapeXml(row.studentNumber || row.idEtud)}</Data></Cell>
      <Cell><Data ss:Type="String">${escapeXml(row.iban || '')}</Data></Cell>
      <Cell><Data ss:Type="Number">${row.heures}</Data></Cell>
      <Cell><Data ss:Type="Number">${row.montant.toFixed(2)}</Data></Cell>
    </Row>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Paie ${escapeXml(payload.period)}">
    <Table>
      <Row>
        <Cell><Data ss:Type="String">Nom</Data></Cell>
        <Cell><Data ss:Type="String">Prénom</Data></Cell>
        <Cell><Data ss:Type="String">ID Étudiant</Data></Cell>
        <Cell><Data ss:Type="String">IBAN</Data></Cell>
        <Cell><Data ss:Type="String">Heures</Data></Cell>
        <Cell><Data ss:Type="String">Montant (€)</Data></Cell>
      </Row>${rowsXml}
      <Row>
        <Cell><Data ss:Type="String">TOTAL</Data></Cell>
        <Cell><Data ss:Type="String"></Data></Cell>
        <Cell><Data ss:Type="String"></Data></Cell>
        <Cell><Data ss:Type="String"></Data></Cell>
        <Cell><Data ss:Type="Number">${payload.totals.heures}</Data></Cell>
        <Cell><Data ss:Type="Number">${payload.totals.montant.toFixed(2)}</Data></Cell>
      </Row>
    </Table>
  </Worksheet>
</Workbook>`;
}

export function exportMonthDate(year, month) {
  return `${year}-${String(month).padStart(2, '0')}-01`;
}
