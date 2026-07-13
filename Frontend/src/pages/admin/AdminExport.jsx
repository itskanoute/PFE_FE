import { useState } from 'react';
import {
  AlertTriangle, Download, RefreshCw, ChevronDown
} from 'lucide-react';

const AdminExport = () => {
  const [mois, setMois] = useState('Octobre 2026');
  const [format, setFormat] = useState('csv');
  const [tauxHoraire, setTauxHoraire] = useState('12.00');

  const alertes = {
    sansIban: ['Marie Lopez', 'Karim Hadj'],
    enAttente: [
      { nom: 'Mme Durand', heures: 24 },
      { nom: 'M. Bernard', heures: 4 },
    ],
  };

  const previewData = [
    { nom: 'LOPEZ', prenom: 'Marie', idEtud: '#ETU-9021', iban: null, heures: 12, montant: 144.0 },
    { nom: 'HADJ', prenom: 'Karim', idEtud: '#ETU-5542', iban: null, heures: 18.5, montant: 222.0 },
    { nom: 'DUBOIS', prenom: 'Alexandre', idEtud: '#ETU-3321', iban: 'FR76 **** 4492', heures: 32, montant: 384.0 },
    { nom: 'MARTIN', prenom: 'Sophie', idEtud: '#ETU-1190', iban: 'FR76 **** 0021', heures: 15, montant: 180.0 },
    { nom: 'PETIT', prenom: 'Lucas', idEtud: '#ETU-8821', iban: 'FR76 **** 8821', heures: 24, montant: 288.0 },
    { nom: 'GARCIA', prenom: 'Elena', idEtud: '#ETU-4402', iban: 'FR76 **** 3110', heures: 40, montant: 480.0 },
    { nom: 'LEFEBVRE', prenom: 'Thomas', idEtud: '#ETU-6671', iban: 'FR76 **** 9928', heures: 8, montant: 96.0 },
  ];

  const totalHeures = previewData.reduce((s, d) => s + d.heures, 0);
  const totalMontant = previewData.reduce((s, d) => s + d.montant, 0);

  const historique = [
    { mois: 'Sept 2026', date: 'Exporté le 01/10/26' },
    { mois: 'Aug 2026', date: 'Exporté le 02/09/26' },
  ];

  return (
    <>
      {/* Header */}
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
              style={{ paddingRight: '2rem', appearance: 'none', minWidth: '180px', fontWeight: 600 }}
              value={mois}
              onChange={(e) => setMois(e.target.value)}
            >
              <option>Octobre 2026</option>
              <option>Septembre 2026</option>
              <option>Août 2026</option>
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6b7280' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Colonne gauche */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Alertes critiques */}
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
                {alertes.sansIban.map((nom, i) => (
                  <span key={i} className="badge neutral">{nom}</span>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#d97706', marginBottom: '0.5rem' }}>
                {alertes.enAttente.reduce((s, a) => s + a.heures, 0)}h en attente de validation
              </div>
              {alertes.enAttente.map((a, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.25rem 0' }}>
                  <span>{a.nom}</span>
                  <strong>{a.heures}h</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Paramètres d'export */}
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
              <label className="form-label">Format du fichier</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className={`btn-action ${format === 'csv' ? 'primary' : 'outline'}`}
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setFormat('csv')}
                >
                  CSV
                </button>
                <button
                  className={`btn-action ${format === 'excel' ? 'primary' : 'outline'}`}
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setFormat('excel')}
                >
                  Excel
                </button>
              </div>
            </div>

            <button className="btn-action primary" style={{ width: '100%', padding: '0.875rem', justifyContent: 'center', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              <Download size={18} /> 📄 Télécharger le fichier
            </button>
          </div>

          {/* Historique */}
          <div className="content-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Historique des exports</h3>
            {historique.map((h, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)',
                marginBottom: '0.5rem'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{h.mois}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{h.date}</div>
                </div>
                <button className="header-icon-btn"><RefreshCw size={16} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne droite — Prévisualisation */}
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
                {previewData.map((d, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{d.nom}</td>
                    <td>{d.prenom}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{d.idEtud}</td>
                    <td>
                      {d.iban ? (
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{d.iban}</span>
                      ) : (
                        <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ⚠️ Manquant
                        </span>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>{d.heures}h</td>
                    <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{d.montant.toFixed(1)}</td>
                  </tr>
                ))}
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
                {totalMontant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminExport;
