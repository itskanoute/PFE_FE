import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAdminStudent } from '../../services/api';
import { 
  ArrowLeft, Mail, Phone, MapPin, Calendar, 
  CreditCard, ShieldCheck, Download, CheckCircle2, 
  XCircle, Clock, FileText, Briefcase
} from 'lucide-react';

const AdminEtudiantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [etudiant, setEtudiant] = useState(null);
  const [historiqueHeures, setHistoriqueHeures] = useState([]);

  useEffect(() => {
    getAdminStudent(id)
      .then((data) => {
        setEtudiant({ ...data.student, color: '#7c3aed' });
        setHistoriqueHeures(data.hourHistory);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="content-card" style={{ padding: '2rem' }}>Chargement de l'étudiant...</div>;
  }

  if (error) {
    return (
      <div className="content-card" style={{ padding: '2rem', color: '#b91c1c' }}>
        {error}
      </div>
    );
  }

  const totalAnnuel = historiqueHeures.reduce((sum, h) => sum + h.valide, 0);

  return (
    <>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate('/admin/etudiants')} 
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', 
            color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, 
            marginBottom: '1rem', padding: 0 
          }}
        >
          <ArrowLeft size={16} /> Retour à la liste des étudiants
        </button>
        <div className="page-title-row" style={{ alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', background: etudiant.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '1.5rem', flexShrink: 0,
              boxShadow: 'var(--shadow-sm)'
            }}>
              {etudiant.initials}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
                <h1 className="page-title" style={{ marginBottom: 0 }}>{etudiant.prenom} {etudiant.nom}</h1>
                <span className={`badge ${etudiant.statut === 'assistant' ? 'info' : 'neutral'}`} style={{ fontSize: '0.75rem' }}>
                  {etudiant.statut === 'assistant' ? '👨‍🏫 Assistant Actif' : 'Inscrit'}
                </span>
              </div>
              <p className="page-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {etudiant.identifiant} • {etudiant.filiere}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-action outline">
              <Mail size={16} /> Contacter
            </button>
            <button className="btn-action primary">
              <Download size={16} /> Exporter le dossier
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
        {/* Colonne Principale */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Informations personnelles */}
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} /> Informations Personnelles
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Email</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} style={{ color: '#9ca3af' }} /> {etudiant.email}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Téléphone</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} style={{ color: '#9ca3af' }} /> {etudiant.telephone || '—'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Date de naissance</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} style={{ color: '#9ca3af' }} /> —
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Adresse postale</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} style={{ color: '#9ca3af' }} /> —
                </div>
              </div>
            </div>
          </div>

          {/* Historique des heures (seulement si assistant) */}
          {etudiant.statut === 'assistant' && (
            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} /> Historique des heures validées
                </h2>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Total annuel : <span style={{ color: 'var(--primary-dark)' }}>{totalAnnuel} heures</span>
                </div>
              </div>
              
              <div className="data-table-container">
                <table className="data-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Période</th>
                      <th>Heures déclarées</th>
                      <th>Heures validées</th>
                      <th>Statut Paiement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historiqueHeures.map((h, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{h.mois}</td>
                        <td>{h.total}h</td>
                        <td>{h.valide}h</td>
                        <td>
                          <span className={`badge ${h.statut === 'Payé' ? 'success' : 'neutral'}`}>{h.statut}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Colonne Latérale */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Statut Administratif */}
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={16} /> Dossier Administratif
            </h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '8px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <Calendar size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-dark)' }}>Inscrit le</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{etudiant.dateInscription}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '8px', background: etudiant.ibanOk ? '#dcfce7' : '#fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', color: etudiant.ibanOk ? '#16a34a' : '#dc2626' }}>
                <CreditCard size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-dark)' }}>Statut IBAN</div>
                <div style={{ fontSize: '0.75rem', color: etudiant.ibanOk ? '#16a34a' : '#dc2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {etudiant.ibanOk ? <><CheckCircle2 size={12} /> Validé et vérifié</> : <><XCircle size={12} /> Document manquant</>}
                </div>
                {etudiant.ibanOk && etudiant.iban && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-color)', marginTop: '0.5rem', fontFamily: 'monospace', background: '#f9fafb', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', display: 'inline-block' }}>
                    {etudiant.iban.replace(/(.{4})/g, '$1 ').trim()}
                  </div>
                )}
              </div>
            </div>

            {!etudiant.ibanOk && (
              <button className="btn-action outline" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center', color: '#dc2626', borderColor: '#fca5a5' }}>
                <Mail size={14} /> Relancer pour l'IBAN
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default AdminEtudiantDetail;
