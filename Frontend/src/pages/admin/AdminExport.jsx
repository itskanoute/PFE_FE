import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, Download, ChevronDown
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import {
  downloadAdminExport,
  getAdminExportHistory,
  getAdminExportPreview,
  getAdminSchoolSettings,
} from '../../services/api';

function buildMonthOptions(count = 12) {
  const options = [];
  const now = new Date();
  for (let i = 0; i < count; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    options.push({
      month,
      year,
      value: `${year}-${month}`,
      label: d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
    });
  }
  return options;
}

const AdminExport = () => {
  const { searchTerm = '' } = useOutletContext() ?? {};
  const monthOptions = useMemo(() => buildMonthOptions(12), []);
  const [periodValue, setPeriodValue] = useState(monthOptions[0]?.value || '');
  const [tauxHoraire, setTauxHoraire] = useState('12.00');
  const [preview, setPreview] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null); // 'csv' | 'excel' | null
  const [error, setError] = useState('');

  const selected = monthOptions.find((o) => o.value === periodValue) || monthOptions[0];

  const filteredHistorique = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return historique;
    return historique.filter((h) =>
      (h.shortLabel || '').toLowerCase().includes(q) ||
      (h.label || '').toLowerCase().includes(q) ||
      (h.format || '').toLowerCase().includes(q)
    );
  }, [historique, searchTerm]);

  const filteredPreview = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const rows = preview?.assistants || [];
    if (!q) return rows;
    return rows.filter((a) =>
      (a.nom || '').toLowerCase().includes(q) ||
      (a.prenom || '').toLowerCase().includes(q) ||
      (a.idEtud || a.studentNumber || '').toLowerCase().includes(q)
    );
  }, [preview, searchTerm]);

  useEffect(() => {
    getAdminSchoolSettings()
      .then((data) => {
        if (data.school?.tauxHoraire != null) {
          setTauxHoraire(Number(data.school.tauxHoraire).toFixed(2));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selected) return undefined;

    const timer = setTimeout(() => {
      setLoading(true);
      setError('');

      Promise.all([
        getAdminExportPreview({
          month: selected.month,
          year: selected.year,
          rate: tauxHoraire,
        }),
        getAdminExportHistory(),
      ])
        .then(([previewData, historyData]) => {
          setPreview(previewData);
          setHistorique(historyData.history || []);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [selected, tauxHoraire]);

  const handleDownload = async (format, overridePeriod) => {
    const target = overridePeriod || selected;
    if (!target) return;

    const downloadFormat = format === 'excel' ? 'excel' : 'csv';

    setDownloading(downloadFormat);
    setError('');
    try {
      await downloadAdminExport({
        month: target.month,
        year: target.year,
        format: downloadFormat,
        rate: tauxHoraire,
      });
      const historyData = await getAdminExportHistory();
      setHistorique(historyData.history || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading(null);
    }
  };

  const alertes = preview?.alerts || { sansIban: [], enAttente: [] };
  const previewData = filteredPreview;
  const totalMontant = preview?.totals?.montant || 0;

  return (
    <>
      <div className="page-header">
        <div className="page-title-row">
          <div>
            <h1 className="page-title">Export mensuel pour Paie</h1>
            <p className="page-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              📅 Période de calcul des rémunérations
            </p>
          </div>
          <div style={{ position: 'relative' }}>
            <select
              className="form-input"
              style={{ paddingRight: '2rem', appearance: 'none', minWidth: '180px', fontWeight: 600, textTransform: 'capitalize' }}
              value={periodValue}
              onChange={(e) => setPeriodValue(e.target.value)}
            >
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value} style={{ textTransform: 'capitalize' }}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6b7280' }} />
          </div>
        </div>
      </div>

      {error && (
        <div style={{ color: '#dc2626', marginBottom: '1rem', fontWeight: 600 }}>{error}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="content-card" style={{ borderLeft: '4px solid #dc2626' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <AlertTriangle size={18} color="#dc2626" />
              <span style={{ fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.5px' }}>Alertes critiques</span>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#dc2626', marginBottom: '0.5rem' }}>
                {alertes.sansIban.length} Assistants sans IBAN
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {alertes.sansIban.length === 0 ? (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Aucun</span>
                ) : (
                  alertes.sansIban.map((nom) => (
                    <span key={nom} className="badge neutral">{nom}</span>
                  ))
                )}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#d97706', marginBottom: '0.5rem' }}>
                {alertes.enAttente.reduce((s, a) => s + a.heures, 0)}h en attente de validation
              </div>
              {alertes.enAttente.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Aucune heure en attente</div>
              ) : (
                alertes.enAttente.map((a) => (
                  <div key={a.nom} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.25rem 0' }}>
                    <span>{a.nom}</span>
                    <strong>{a.heures}h</strong>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="content-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Paramètres d'export</h3>

            <div className="form-group">
              <label className="form-label">Taux horaire (€/h)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  className="form-input"
                  style={{ maxWidth: '120px', fontWeight: 700, fontSize: '1.1rem' }}
                  value={tauxHoraire}
                  onChange={(e) => setTauxHoraire(e.target.value)}
                />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>€/h</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Télécharger le fichier</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn-action outline"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}
                  onClick={() => handleDownload('csv')}
                  disabled={Boolean(downloading) || loading}
                >
                  <Download size={18} />
                  {downloading === 'csv' ? 'Téléchargement CSV…' : 'Télécharger CSV (.csv)'}
                </button>
                <button
                  type="button"
                  className="btn-action primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}
                  onClick={() => handleDownload('excel')}
                  disabled={Boolean(downloading) || loading}
                >
                  <Download size={18} />
                  {downloading === 'excel' ? 'Téléchargement Excel…' : 'Télécharger Excel (.xls)'}
                </button>
              </div>
            </div>
          </div>

          <div className="content-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Historique des exports</h3>
            {filteredHistorique.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {searchTerm.trim() ? 'Aucun export trouvé.' : 'Aucun export pour le moment.'}
              </div>
            ) : (
              filteredHistorique.map((h) => (
                <div key={h.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)',
                  marginBottom: '0.5rem'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {h.shortLabel}
                      <span style={{ marginLeft: '0.5rem', fontWeight: 500, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        ({h.format === 'xlsx' || h.format === 'xls' || h.format === 'excel' ? 'Excel' : 'CSV'})
                      </span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {h.dateLabel} · {h.assistantCount} assistants · {Number(h.totalAmount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      type="button"
                      className="header-icon-btn"
                      title="Re-télécharger en CSV"
                      onClick={() => handleDownload('csv', { month: h.month, year: h.year })}
                      disabled={Boolean(downloading)}
                    >
                      CSV
                    </button>
                    <button
                      type="button"
                      className="header-icon-btn"
                      title="Re-télécharger en Excel"
                      onClick={() => handleDownload('excel', { month: h.month, year: h.year })}
                      disabled={Boolean(downloading)}
                    >
                      XLS
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="content-card">
          <div className="content-card-header">
            <div>
              <div className="content-card-title">Prévisualisation des données</div>
              <div className="content-card-subtitle">Données basées sur les validations actuelles</div>
            </div>
            <span className="badge success" style={{ fontSize: '0.7rem' }}>
              ● Calculé ({tauxHoraire}€/h)
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Chargement…</div>
          ) : (
            <>
              <div className="data-table-container" style={{ border: 'none' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Prénom</th>
                      <th>ID Étudiant</th>
                      <th>IBAN</th>
                      <th>Heures</th>
                      <th>Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                          Aucune heure validée pour ce mois.
                        </td>
                      </tr>
                    ) : (
                      previewData.map((d) => (
                        <tr key={`${d.idEtud}-${d.nom}`}>
                          <td style={{ fontWeight: 600 }}>{d.nom}</td>
                          <td>{d.prenom}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{d.idEtud}</td>
                          <td>
                            {d.ibanMissing ? (
                              <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                ⚠️ Manquant
                              </span>
                            ) : (
                              <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{d.iban}</span>
                            )}
                          </td>
                          <td style={{ fontWeight: 600 }}>{d.heures}h</td>
                          <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{Number(d.montant).toFixed(1)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1rem', borderTop: '2px solid var(--primary-dark)', marginTop: '1rem'
              }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {previewData.length} assistants identifiés pour ce mois
                </span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total à payer</span>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
                    {Number(totalMontant).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminExport;
