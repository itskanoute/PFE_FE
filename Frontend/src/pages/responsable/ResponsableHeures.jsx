import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Download,
  Send,
  BarChart2,
  CheckCircle,
  MoreHorizontal,
  XCircle,
  Hourglass,
  CheckSquare,
  History,
  AlertTriangle,
  Mail,
  Check,
  X,
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { getResponsableHours, reviewResponsableHour } from '../../services/api';
import './responsable.css';

const ResponsableHeures = () => {
  const { searchTerm = '' } = useOutletContext() || {};
  const [heuresAttente, setHeuresAttente] = useState([]);
  const [heuresTraitees, setHeuresTraitees] = useState([]);
  const [stats, setStats] = useState({ totalMensuel: '00h 00', valides: '00h 00', attente: '00h 00', refusees: '00h 00' });
  const [adminEmail, setAdminEmail] = useState(null);
  const [adminName, setAdminName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedHeures, setSelectedHeures] = useState([]);

  const q = searchTerm.trim().toLowerCase();
  const filteredAttente = useMemo(() => {
    if (!q) return heuresAttente;
    return heuresAttente.filter((h) =>
      (h.name || '').toLowerCase().includes(q) ||
      (h.comment || '').toLowerCase().includes(q)
    );
  }, [heuresAttente, q]);

  const filteredTraitees = useMemo(() => {
    if (!q) return heuresTraitees;
    return heuresTraitees.filter((h) =>
      (h.name || '').toLowerCase().includes(q) ||
      (h.subject || '').toLowerCase().includes(q)
    );
  }, [heuresTraitees, q]);

  const loadHours = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getResponsableHours();
      setHeuresAttente(data.heuresAttente || []);
      setHeuresTraitees(data.heuresTraitees || []);
      setStats(data.stats || { totalMensuel: '00h 00', valides: '00h 00', attente: '00h 00', refusees: '00h 00' });
      setAdminEmail(data.adminEmail || null);
      setAdminName(data.adminName || null);
      setSelectedHeures([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHours();
  }, [loadHours]);

  const handleAction = async (id, action) => {
    setActionLoading(id);
    try {
      await reviewResponsableHour(id, action === 'valider' ? 'validate' : 'reject');
      loadHours();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleSelectAll = () => {
    if (selectedHeures.length === filteredAttente.length) {
      setSelectedHeures([]);
    } else {
      setSelectedHeures(filteredAttente.map((h) => h.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedHeures.includes(id)) {
      setSelectedHeures(selectedHeures.filter((h) => h !== id));
    } else {
      setSelectedHeures([...selectedHeures, id]);
    }
  };

  const handleBulkAction = async (action) => {
    const apiAction = action === 'valider' ? 'validate' : 'reject';
    setActionLoading('bulk');
    try {
      await Promise.all(selectedHeures.map((id) => reviewResponsableHour(id, apiAction)));
      loadHours();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="resp-dashboard" style={{ padding: '2rem' }}>
        Chargement des heures...
      </div>
    );
  }

  if (error) {
    return (
      <div className="resp-dashboard" style={{ padding: '2rem', color: 'var(--resp-danger)' }}>
        {error}
      </div>
    );
  }

  return (
    <div className="resp-dashboard" style={{ paddingBottom: '3rem' }}>

      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            Validation des Heures
          </h1>
          <p style={{ color: '#475569', fontSize: '1rem', maxWidth: '800px', margin: 0 }}>
            Gestion et approbation des relevés d'heures pour les assistants d'enseignement.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => window.print()} style={{ backgroundColor: 'white', color: '#0f172a', border: '1px solid #cbd5e1', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Download size={18} />
            Exporter PDF
          </button>
          <button onClick={() => window.location.href = "mailto:?subject=Relevés d'heures mensuels&body=Bonjour à tous, vos heures du mois sont validées. Merci !"} style={{ backgroundColor: '#1e1b4b', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <Send size={18} />
            Notifier tout
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>

        <div style={{ flex: 1, minWidth: '200px', backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #1e1b4b', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Mensuel</span>
            <BarChart2 size={18} color="#0f172a" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e1b4b', lineHeight: 1 }}>
            {stats.totalMensuel}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '200px', backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Validées</span>
            <CheckCircle size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {stats.valides}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '200px', backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>En attente</span>
            <MoreHorizontal size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {stats.attente}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '200px', backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #ef4444', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Refusées</span>
            <XCircle size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {stats.refusees}
          </div>
        </div>

      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>

        <div style={{ flex: '2', minWidth: '600px' }}>

          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '2rem' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Hourglass size={20} color="#b45309" />
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Heures en attente</h2>
              </div>
              {selectedHeures.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleBulkAction('valider')} disabled={actionLoading === 'bulk'} style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: actionLoading === 'bulk' ? 0.6 : 1 }}>
                    <Check size={14} /> Valider ({selectedHeures.length})
                  </button>
                  <button onClick={() => handleBulkAction('refuser')} disabled={actionLoading === 'bulk'} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: actionLoading === 'bulk' ? 0.6 : 1 }}>
                    <X size={14} /> Refuser ({selectedHeures.length})
                  </button>
                </div>
              )}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem 1.5rem', width: '40px' }}><input type="checkbox" onChange={toggleSelectAll} checked={filteredAttente.length > 0 && selectedHeures.length === filteredAttente.length} style={{ cursor: 'pointer' }} /></th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Assistant</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Date</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Heures</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Commentaire</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttente.map((heure) => (
                  <tr key={heure.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1.25rem 1.5rem' }}><input type="checkbox" onChange={() => toggleSelect(heure.id)} checked={selectedHeures.includes(heure.id)} style={{ cursor: 'pointer' }} /></td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: heure.color, color: heure.textColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                          {heure.init}
                        </div>
                        <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>{heure.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem', color: '#475569', fontSize: '0.9rem' }}>{heure.date}</td>
                    <td style={{ padding: '1.25rem 1rem', fontWeight: 700, color: '#0f172a' }}>{heure.heures}</td>
                    <td style={{ padding: '1.25rem 1rem', color: '#64748b', fontStyle: 'italic', fontSize: '0.9rem' }}>{heure.comment}</td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleAction(heure.id, 'valider')} disabled={actionLoading === heure.id} style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', opacity: actionLoading === heure.id ? 0.6 : 1 }} title="Valider">
                          <Check size={16} />
                        </button>
                        <button onClick={() => handleAction(heure.id, 'refuser')} disabled={actionLoading === heure.id} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', opacity: actionLoading === heure.id ? 0.6 : 1 }} title="Refuser">
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAttente.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Toutes les heures en attente ont été traitées.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <History size={20} color="#10b981" />
              <CheckSquare size={20} color="#10b981" />
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Heures déjà traitées</h2>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredTraitees.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '1rem' }}>
                  {q ? 'Aucun résultat pour la recherche.' : 'Aucune heure traitée pour le moment.'}
                </div>
              ) : (
                filteredTraitees.map((item) => (
                  <div key={item.id} style={{ backgroundColor: 'white', border: `1px solid ${item.type === 'success' ? '#e2e8f0' : '#fee2e2'}`, borderRadius: '8px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ backgroundColor: item.type === 'success' ? '#ecfdf5' : '#fef2f2', color: item.type === 'success' ? '#10b981' : '#ef4444', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.type === 'success' ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>{item.name} - {item.subject}</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{item.date}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', marginBottom: '0.3rem' }}>{item.hours}</div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 800, backgroundColor: item.type === 'success' ? '#dcfce7' : '#fee2e2', color: item.type === 'success' ? '#059669' : '#dc2626', padding: '0.2rem 0.5rem', borderRadius: '4px', letterSpacing: '0.05em' }}>
                        {item.status}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div style={{ backgroundColor: '#450a0a', borderRadius: '12px', padding: '1.5rem', color: '#fca5a5', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: '-20px', top: '10px', opacity: 0.05, transform: 'scale(2)' }}>
              <XCircle size={100} color="white" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '50%' }}></div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#fef2f2' }}>Séances annulées</h3>
            </div>

            <p style={{ fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
              Les assistants suivants ont des séances annulées ce mois-ci. Aucune heure ne doit être validée pour ces créneaux.
            </p>

            <button
              onClick={() => {
                if (!adminEmail) {
                  alert("Aucun email d'administration trouvé pour votre école.");
                  return;
                }
                const subject = encodeURIComponent('Problème avec les heures annulées');
                const body = encodeURIComponent(
                  `Bonjour${adminName ? ` ${adminName}` : ''},\n\nJe souhaite vous signaler un problème concernant des séances annulées / heures à ne pas valider.\n\nCordialement`
                );
                window.location.href = `mailto:${adminEmail}?subject=${subject}&body=${body}`;
              }}
              style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'background 0.2s', position: 'relative', zIndex: 1 }}
            >
              <Mail size={18} />
              Contacter l'administration
            </button>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Récapitulatif mensuel</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Validées</span>
                  <span style={{ fontWeight: 600, color: '#475569' }}>{stats.valides}</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${stats.totalMensuel !== '00h 00' ? Math.min(100, (parseFloat(stats.valides) / parseFloat(stats.totalMensuel)) * 100 || 0) : 0}%`, backgroundColor: '#10b981', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>En attente</span>
                  <span style={{ fontWeight: 600, color: '#475569' }}>{stats.attente}</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '40%', backgroundColor: '#f59e0b', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Refusées</span>
                  <span style={{ fontWeight: 600, color: '#475569' }}>{stats.refusees}</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '20%', backgroundColor: '#ef4444', borderRadius: '4px' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderRadius: '12px', overflow: 'hidden', position: 'relative', height: '160px', backgroundImage: 'url("https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
              <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>Support académique : 100% opérationnel</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default ResponsableHeures;
