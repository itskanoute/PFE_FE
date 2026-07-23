import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Clock, Trash2, Calendar, Check, X, Database, AlertTriangle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { getEtudiantCandidatures, withdrawEtudiantCandidature } from '../../services/api';

const EtudiantCandidatures = () => {
  const { searchTerm = '' } = useOutletContext() || {};
  const [filter, setFilter] = useState('toutes');
  const [candidatures, setCandidatures] = useState([]);
  const [stats, setStats] = useState({ total: 0, acceptees: 0, en_attente: 0, refusees: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCandidatures = () => {
    setLoading(true);
    setError('');
    getEtudiantCandidatures()
      .then((data) => {
        const list = data.candidatures || [];
        setCandidatures(list);
        if (data.stats) {
          setStats(data.stats);
        } else {
          setStats({
            total: list.length,
            acceptees: list.filter((c) => c.status === 'acceptee').length,
            en_attente: list.filter((c) => c.status === 'en_attente').length,
            refusees: list.filter((c) => c.status === 'refusee').length,
          });
        }
      })
      .catch((err) => setError(err.message || 'Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCandidatures();
  }, []);

  const filteredCandidatures = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return candidatures.filter((c) => {
      if (filter !== 'toutes' && c.status !== filter) return false;
      if (!q) return true;
      return (
        (c.matiere || c.titre || '').toLowerCase().includes(q) ||
        (c.responsable || '').toLowerCase().includes(q) ||
        (c.status || '').toLowerCase().includes(q)
      );
    });
  }, [candidatures, filter, searchTerm]);

  const handleRetirer = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir retirer cette candidature ? Cette action est définitive.")) {
      return;
    }
    try {
      await withdrawEtudiantCandidature(id);
      loadCandidatures();
    } catch (err) {
      alert(err.message || 'Impossible de retirer la candidature');
    }
  };

  const handleRendezVous = () => {
    const accepted = candidatures.find((c) => c.status === 'acceptee' && c.responsableEmail);
    const contact = accepted || candidatures.find((c) => c.responsableEmail);

    if (contact?.responsableEmail) {
      const subject = encodeURIComponent(
        accepted
          ? `Prise de contact — candidature acceptée (${contact.titre})`
          : `Question sur ma candidature — ${contact.titre}`
      );
      const body = encodeURIComponent(
        `Bonjour ${contact.responsable || ''},\n\nJe souhaite prendre contact concernant l'offre « ${contact.titre} ».\n\nCordialement`
      );
      window.location.href = `mailto:${contact.responsableEmail}?subject=${subject}&body=${body}`;
      return;
    }

    window.location.href = 'mailto:support@edumanage.fr?subject=Demande%20de%20rendez-vous%20%E2%80%94%20candidatures';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'acceptee': return { bg: '#dcfce3', text: '#16a34a', icon: <Check size={16} />, border: '#16a34a' };
      case 'en_attente': return { bg: '#fef3c7', text: '#d97706', icon: <Clock size={16} />, border: '#d97706' };
      case 'refusee': return { bg: '#fee2e2', text: '#dc2626', icon: <X size={16} />, border: '#dc2626' };
      default: return { bg: '#f1f5f9', text: '#64748b', icon: <FileText size={16} />, border: '#64748b' };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'acceptee': return 'ACCEPTÉE';
      case 'en_attente': return 'EN ATTENTE';
      case 'refusee': return 'REFUSÉE';
      case 'retiree': return 'RETIRÉE';
      default: return status;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        <FileText size={16} />
        <span>Parcours Académique</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem', marginBottom: '2.5rem' }}>
        <div>
          <h1 className="etudiant-page-title">Mes candidatures</h1>
          <p className="etudiant-page-subtitle" style={{ maxWidth: '600px' }}>
            Suivez l'état d'avancement de vos demandes d'inscription et gérez vos options de parcours pour l'année universitaire.
          </p>
        </div>

        <div style={{ display: 'flex', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{stats.total}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total</div>
          </div>
          <div style={{ padding: '1rem 1.5rem', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>{stats.acceptees}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Acceptées</div>
          </div>
          <div style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706' }}>{stats.en_attente}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>En attente</div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

        <div style={{ flex: '1 1 min(100%, 600px)' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Filtrer par :</span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setFilter('toutes')}
                style={{ padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600, border: '1px solid #e2e8f0', cursor: 'pointer', backgroundColor: filter === 'toutes' ? '#1e1b4b' : 'white', color: filter === 'toutes' ? 'white' : '#475569', transition: 'all 0.2s' }}
              >
                Toutes
              </button>
              <button
                onClick={() => setFilter('acceptee')}
                style={{ padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600, border: '1px solid #e2e8f0', cursor: 'pointer', backgroundColor: filter === 'acceptee' ? '#1e1b4b' : 'white', color: filter === 'acceptee' ? 'white' : '#475569', transition: 'all 0.2s' }}
              >
                Acceptées
              </button>
              <button
                onClick={() => setFilter('en_attente')}
                style={{ padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600, border: '1px solid #e2e8f0', cursor: 'pointer', backgroundColor: filter === 'en_attente' ? '#1e1b4b' : 'white', color: filter === 'en_attente' ? 'white' : '#475569', transition: 'all 0.2s' }}
              >
                En attente
              </button>
              <button
                onClick={() => setFilter('refusee')}
                style={{ padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600, border: '1px solid #e2e8f0', cursor: 'pointer', backgroundColor: filter === 'refusee' ? '#1e1b4b' : 'white', color: filter === 'refusee' ? 'white' : '#475569', transition: 'all 0.2s' }}
              >
                Refusées
              </button>
            </div>
          </div>

          {loading ? (
            <p style={{ color: '#64748b' }}>Chargement des candidatures…</p>
          ) : filteredCandidatures.length === 0 ? (
            <p style={{ color: '#64748b' }}>Aucune candidature pour ce filtre.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {filteredCandidatures.map((c) => {
                const statusColor = getStatusColor(c.status);

                return (
                  <div key={c.id} style={{ display: 'flex', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'relative', flexWrap: 'wrap' }}>

                    <div style={{ width: '6px', backgroundColor: statusColor.border, position: 'absolute', top: 0, bottom: 0, left: 0 }}></div>

                    <div style={{ padding: '1.5rem 1.5rem 1.5rem 2rem', flex: '1 1 300px', display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

                      <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                        <Database size={24} color="#1e1b4b" />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ backgroundColor: '#e2e8f0', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>{c.module}</span>
                          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>• {c.date}</span>
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>{c.titre}</h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>{c.description}</p>
                      </div>

                      <div style={{ padding: '0.5rem 1rem', borderRadius: '8px', backgroundColor: statusColor.bg, color: statusColor.text, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem' }}>
                        {statusColor.icon}
                        {getStatusLabel(c.status)}
                      </div>
                    </div>

                    <div style={{ flex: '1 1 250px', borderLeft: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                      {c.status === 'acceptee' && (
                        <div style={{ backgroundColor: '#f0fdf4', border: '1px dashed #86efac', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', color: '#166534', fontStyle: 'italic' }}>
                          {c.feedback}
                          <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', fontStyle: 'normal' }}>— {c.feedbackAuthor}</div>
                        </div>
                      )}

                      {c.status === 'en_attente' && (
                        <button onClick={() => handleRetirer(c.id)} style={{ backgroundColor: 'white', border: '1px solid #fca5a5', color: '#ef4444', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s', width: '100%', justifyContent: 'center' }}>
                          <Trash2 size={16} />
                          Retirer candidature
                        </button>
                      )}

                      {c.status === 'refusee' && (
                        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', color: '#991b1b', width: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#dc2626', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                            <AlertTriangle size={14} />
                            {c.feedbackAuthor}
                          </div>
                          {c.feedback}
                        </div>
                      )}

                    </div>

                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div style={{ backgroundColor: '#1e1b4b', borderRadius: '12px', padding: '1.5rem', color: 'white' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Besoin d'aide pour vos candidatures ?</h3>
            <p style={{ fontSize: '0.9rem', color: '#c7d2fe', margin: '0 0 1.5rem 0', lineHeight: '1.5' }}>
              Si vous avez des questions sur les motifs de refus ou si vous souhaitez modifier votre ordre de priorité, contactez le bureau des inscriptions.
            </p>
            <button onClick={handleRendezVous} style={{ backgroundColor: '#fbbf24', color: '#92400e', border: 'none', padding: '0.75rem 1rem', borderRadius: '6px', fontWeight: 700, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <Calendar size={18} />
              Prendre rendez-vous
            </button>
          </div>

          <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Clock size={20} color="#1e1b4b" />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1.5rem 0' }}>Dates clés</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', color: '#475569' }}>Clôture des vœux</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>30 Juin</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', color: '#475569' }}>Résultats finaux</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>15 Juillet</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: '#475569' }}>Inscriptions administratives</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>01 Sept</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default EtudiantCandidatures;
