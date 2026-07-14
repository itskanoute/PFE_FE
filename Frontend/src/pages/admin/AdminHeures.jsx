import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedCounter from '../../components/AnimatedCounter';
import { getAdminHours } from '../../services/api';
import {
  Clock, CheckCircle2, Hourglass, XCircle,
  Calendar, Filter, Mail, Eye, ExternalLink, Search, X
} from 'lucide-react';

const AdminHeures = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ total: 0, validees: 0, attente: 0, refusees: 0 });
  const [tauxValidation, setTauxValidation] = useState(0);
  const [parResponsable, setParResponsable] = useState([]);
  const [parAssistant, setParAssistant] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedResponsable, setSelectedResponsable] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const loadData = useCallback(async () => {
    try {
      setError('');
      const data = await getAdminHours();
      setStats(data.stats);
      setTauxValidation(data.tauxValidation);
      setParResponsable(data.byResponsable);
      setParAssistant(data.byAssistant);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredResponsables = parResponsable.filter(r => {
    if (filterStatus === 'attente') return r.attente > 0;
    if (filterStatus === 'ok') return r.attente === 0;
    return true;
  });

  if (loading) {
    return <div className="content-card" style={{ padding: '2rem' }}>Chargement des heures...</div>;
  }

  if (error) {
    return (
      <div className="content-card" style={{ padding: '2rem', color: '#b91c1c' }}>
        {error}
      </div>
    );
  }

  return (
    <>
      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Total</div>
            <div className="stat-value"><AnimatedCounter value={stats.total} suffix="h" /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label" style={{ color: '#16a34a' }}>Validées</div>
            <div className="stat-value" style={{ color: '#16a34a' }}><AnimatedCounter value={stats.validees} suffix="h" /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label" style={{ color: '#d97706' }}>En attente</div>
            <div className="stat-value" style={{ color: '#d97706' }}><AnimatedCounter value={stats.attente} suffix="h" /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label" style={{ color: '#dc2626' }}>Refusées</div>
            <div className="stat-value" style={{ color: '#dc2626' }}><AnimatedCounter value={stats.refusees} suffix="h" /></div>
          </div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-content">
            <div className="stat-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Taux de validation</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>{stats.validees}h sur {stats.total}h</div>
              <div className="stat-value" style={{ color: 'white' }}><AnimatedCounter value={tauxValidation} suffix="%" /></div>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 3, marginTop: '0.5rem' }}>
              <div style={{ height: '100%', width: `${tauxValidation}%`, background: 'white', borderRadius: 3 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Par responsable */}
      <div className="content-card" style={{ marginBottom: '2rem' }}>
        <div className="content-card-header">
          <h2 className="content-card-title">Par responsable</h2>
          <div style={{ position: 'relative' }}>
            <select 
              className="btn-action outline" 
              style={{ fontSize: '0.75rem', paddingRight: '2rem', appearance: 'none', cursor: 'pointer', background: 'white' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Filtrer par statut (Tous)</option>
              <option value="attente">En attente de validation</option>
              <option value="ok">À jour</option>
            </select>
            <Filter size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }} />
          </div>
        </div>

        <div className="data-table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom du Responsable</th>
                <th>Assistants</th>
                <th>Heures OK</th>
                <th>Heures en attente</th>
                <th>Refusées</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResponsables.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, background: r.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700, fontSize: '0.65rem', flexShrink: 0
                      }}>
                        {r.initials}
                      </div>
                      <span style={{ fontWeight: 600 }}>{r.nom}</span>
                      <span className="badge neutral">{r.assistants} assistants</span>
                    </div>
                  </td>
                  <td>{r.assistants}</td>
                  <td style={{ color: '#16a34a', fontWeight: 700 }}>{r.heuresOK}h</td>
                  <td style={{ color: r.attente > 0 ? '#d97706' : 'var(--text-primary)', fontWeight: r.attente > 0 ? 700 : 400 }}>
                    {r.attente}h
                  </td>
                  <td style={{ color: r.refusees > 0 ? '#dc2626' : 'var(--text-primary)', fontWeight: r.refusees > 0 ? 700 : 400 }}>
                    {r.refusees}h
                  </td>
                  <td>
                    {r.attente > 0 ? (
                      <a href={`mailto:${r.email}?subject=Relance:%20Heures%20en%20attente%20de%20validation&body=Bonjour%20${r.nom},%0A%0AIl%20y%20a%20actuellement%20${r.attente}h%20de%20séances%20en%20attente%20de%20votre%20validation.%0A%0AMerci%20de%20bien%20vouloir%20les%20traiter.%0A%0ACordialement,`} style={{ textDecoration: 'none' }}>
                        <button className="btn-action primary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>
                          <Mail size={14} /> Relancer
                        </button>
                      </a>
                    ) : (
                      <button className="header-icon-btn" onClick={() => { setSelectedResponsable(r); setShowViewModal(true); }}>
                        <Eye size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Par assistant */}
      <div className="content-card">
        <div className="content-card-header">
          <h2 className="content-card-title">Par assistant</h2>
          <div className="admin-search" style={{ minWidth: '200px' }}>
            <Search size={14} color="#9ca3af" />
            <input type="text" placeholder="Rechercher un assistant..." />
          </div>
        </div>

        <div className="data-table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Assistant</th>
                <th>Responsable</th>
                <th>Heures OK</th>
                <th>En attente</th>
                <th>Statut IBAN</th>
                <th>Fiche</th>
              </tr>
            </thead>
            <tbody>
              {parAssistant.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>{a.nom}</td>
                  <td>{a.responsable}</td>
                  <td style={{ color: '#16a34a', fontWeight: 700 }}>{a.heuresOK}h</td>
                  <td style={{ color: a.attente > 0 ? '#d97706' : 'var(--text-primary)', fontWeight: a.attente > 0 ? 700 : 400 }}>
                    {a.attente}h
                  </td>
                  <td>
                    {a.ibanOk ? (
                      <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={14} /> IBAN OK
                      </span>
                    ) : (
                      <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <XCircle size={14} /> IBAN Missing
                      </span>
                    )}
                  </td>
                  <td>
                    <button className="header-icon-btn" onClick={() => navigate(`/admin/etudiants/${a.id}`)}>
                      <ExternalLink size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Vue Détails Responsable */}
      {showViewModal && selectedResponsable && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '500px',
            boxShadow: 'var(--shadow-xl)', overflow: 'hidden'
          }}>
            <div style={{
              padding: '1.5rem', borderBottom: '1px solid var(--border-color)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary-dark)' }}>
                Détail - {selectedResponsable.nom}
              </h2>
              <button onClick={() => setShowViewModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Heures Validées</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a' }}>{selectedResponsable.heuresOK}h</div>
                </div>
                <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Assistants Gérés</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-dark)' }}>{selectedResponsable.assistants}</div>
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-color)', lineHeight: 1.5 }}>
                Ce responsable est à jour. Il n'y a actuellement aucune séance en attente de validation de sa part.
              </p>
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', background: '#f9fafb', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-action primary" onClick={() => setShowViewModal(false)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminHeures;
