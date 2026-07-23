import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BookOpen, Star, Check, X, FileText, Download, RefreshCw, Mail, Phone } from 'lucide-react';
import { getResponsableApplications, reviewResponsableApplication, downloadResponsableApplicationCv } from '../../services/api';
import './responsable.css';

const ResponsableCandidatures = () => {
  const { searchTerm = '' } = useOutletContext() || {};
  const [filter, setFilter] = useState('en_attente');
  const [candidaturesList, setCandidaturesList] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);
  const [selectedCandidat, setSelectedCandidat] = useState(null);
  const [cvPreviewUrl, setCvPreviewUrl] = useState(null);
  const [cvLoading, setCvLoading] = useState(false);
  const [cvError, setCvError] = useState('');

  const displayedCandidatures = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return candidaturesList;
    return candidaturesList.filter((c) =>
      (c.nom || c.name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.matiere || c.offerTitle || '').toLowerCase().includes(q) ||
      (c.filiere || '').toLowerCase().includes(q)
    );
  }, [candidaturesList, searchTerm]);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [filtered, pending] = await Promise.all([
        getResponsableApplications({ status: filter }),
        filter !== 'en_attente'
          ? getResponsableApplications({ status: 'en_attente' })
          : Promise.resolve(null),
      ]);
      setCandidaturesList(filtered.applications || []);
      if (filter === 'en_attente') {
        setPendingCount((filtered.applications || []).length);
      } else if (pending) {
        setPendingCount((pending.applications || []).length);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleReview = async (id, action) => {
    setActionLoading(id);
    try {
      const result = await reviewResponsableApplication(id, action);
      if (result.emailSent) {
        alert(action === 'accept'
          ? 'Candidature acceptée. Un email a été envoyé à l\'étudiant.'
          : 'Candidature refusée. Un email a été envoyé à l\'étudiant.');
      } else if (result.emailWarning) {
        alert(`${action === 'accept' ? 'Candidature acceptée' : 'Candidature refusée'}. ${result.emailWarning}`);
      }
      loadApplications();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRepecher = async (id) => {
    setActionLoading(id);
    try {
      const result = await reviewResponsableApplication(id, 'accept');
      if (result.emailSent) {
        alert('Candidature acceptée. Un email a été envoyé à l\'étudiant.');
      } else if (result.emailWarning) {
        alert(`Candidature acceptée. ${result.emailWarning}`);
      }
      loadApplications();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleVoirCV = async (candidature) => {
    setSelectedCandidat(candidature);
    setIsCVModalOpen(true);
    setCvPreviewUrl(null);
    setCvError('');

    if (!candidature.hasCv) return;

    setCvLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/responsable/applications/${candidature.id}/cv`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'CV introuvable');
      }
      const blob = await response.blob();
      const header = new Uint8Array(await blob.slice(0, 5).arrayBuffer());
      const magic = String.fromCharCode(...header);
      if (magic !== '%PDF-') {
        throw new Error('Le fichier joint n\'est pas un PDF valide. Demandez à l\'étudiant de rejoindre un vrai CV PDF.');
      }
      const pdfBlob = blob.type === 'application/pdf'
        ? blob
        : new Blob([blob], { type: 'application/pdf' });
      setCvPreviewUrl(URL.createObjectURL(pdfBlob));
    } catch (err) {
      setCvError(err.message);
    } finally {
      setCvLoading(false);
    }
  };

  const handleDownloadCV = async () => {
    if (!selectedCandidat?.hasCv) {
      alert('Aucun CV joint à cette candidature');
      return;
    }
    try {
      await downloadResponsableApplicationCv(selectedCandidat.id);
    } catch (err) {
      alert(err.message);
    }
  };

  const closeCvModal = () => {
    if (cvPreviewUrl) URL.revokeObjectURL(cvPreviewUrl);
    setCvPreviewUrl(null);
    setCvError('');
    setIsCVModalOpen(false);
    setSelectedCandidat(null);
  };

  if (loading) {
    return (
      <div className="resp-dashboard" style={{ padding: '2rem' }}>
        Chargement des candidatures...
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
    <div className="resp-dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--resp-primary)', margin: 0 }}>
          Candidatures Assistants
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setFilter('en_attente')}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '20px',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: filter === 'en_attente' ? 'var(--resp-accent)' : 'white',
              color: filter === 'en_attente' ? '#fff' : 'var(--resp-text-light)',
              boxShadow: filter === 'en_attente' ? '0 4px 6px -1px rgba(245, 158, 11, 0.2)' : 'none',
              border: filter === 'en_attente' ? 'none' : '1px solid var(--resp-border)',
            }}
          >
            En attente ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('accepte')}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '20px',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: filter === 'accepte' ? 'var(--resp-success)' : 'white',
              color: filter === 'accepte' ? '#fff' : 'var(--resp-text-light)',
              border: filter === 'accepte' ? 'none' : '1px solid var(--resp-border)',
            }}
          >
            Acceptées
          </button>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '20px',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: filter === 'all' ? 'var(--resp-primary)' : 'white',
              color: filter === 'all' ? '#fff' : 'var(--resp-text-light)',
              border: filter === 'all' ? 'none' : '1px solid var(--resp-border)',
            }}
          >
            Toutes
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {candidaturesList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--resp-border)' }}>
            <FileText size={48} color="var(--resp-text-light)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3 style={{ color: 'var(--resp-text)', marginBottom: '0.5rem' }}>Aucune candidature</h3>
            <p style={{ color: 'var(--resp-text-light)' }}>Il n'y a pas de candidatures correspondant à ce filtre pour le moment.</p>
          </div>
        ) : displayedCandidatures.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--resp-border)' }}>
            <p style={{ color: 'var(--resp-text-light)', margin: 0 }}>Aucun résultat pour « {searchTerm} ».</p>
          </div>
        ) : (
          displayedCandidatures.map((candidature) => (
            <div key={candidature.id} style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--resp-border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} className="resp-card-hover">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--resp-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--resp-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.25rem', fontWeight: 700 }}>
                    {candidature.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--resp-text)', margin: '0 0 0.25rem 0' }}>{candidature.name}</h2>
                    <span style={{ fontSize: '0.85rem', color: 'var(--resp-text-light)' }}>Candidature reçue {candidature.date.toLowerCase()}</span>
                  </div>
                </div>

                {candidature.status === 'en_attente' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleReview(candidature.id, 'reject')}
                      disabled={actionLoading === candidature.id}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fef2f2', color: 'var(--resp-danger)', border: '1px solid #fecaca', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', opacity: actionLoading === candidature.id ? 0.6 : 1 }}
                    >
                      <X size={18} />
                      Refuser
                    </button>
                    <button
                      onClick={() => handleReview(candidature.id, 'accept')}
                      disabled={actionLoading === candidature.id}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--resp-success)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', opacity: actionLoading === candidature.id ? 0.6 : 1 }}
                    >
                      <Check size={18} />
                      Accepter
                    </button>
                  </div>
                )}
                {candidature.status === 'accepte' && (
                  <span style={{ backgroundColor: '#dcfce7', color: 'var(--resp-success)', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Check size={18} /> Candidature acceptée
                  </span>
                )}
                {candidature.status === 'refuse' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ backgroundColor: '#fef2f2', color: 'var(--resp-danger)', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <X size={18} /> Candidature refusée
                    </span>
                    <button
                      onClick={() => handleRepecher(candidature.id)}
                      disabled={actionLoading === candidature.id}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', color: 'var(--resp-text)', border: '1px solid var(--resp-border)', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', opacity: actionLoading === candidature.id ? 0.6 : 1 }}
                    >
                      <RefreshCw size={16} /> Repêcher
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', padding: '1.5rem', gap: '2rem', flexWrap: 'wrap', backgroundColor: '#f8fafc' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--resp-text-light)', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Motivation</h4>
                  <p style={{ color: 'var(--resp-text)', lineHeight: 1.6, margin: 0, fontStyle: 'italic', backgroundColor: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid var(--resp-border)' }}>
                    "{candidature.motivation}"
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '200px' }}>
                  <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--resp-text-light)', fontWeight: 700, marginBottom: '0', letterSpacing: '0.05em' }}>Profil</h4>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--resp-border)' }}>
                    <div style={{ backgroundColor: '#e0e7ff', padding: '0.4rem', borderRadius: '6px', color: 'var(--resp-primary)' }}>
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--resp-text-light)' }}>Matière souhaitée</div>
                      <div style={{ fontWeight: 600, color: 'var(--resp-text)' }}>{candidature.matiere}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--resp-border)' }}>
                    <div style={{ backgroundColor: '#fef3c7', padding: '0.4rem', borderRadius: '6px', color: '#b45309' }}>
                      <Star size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--resp-text-light)' }}>Moyenne obtenue</div>
                      <div style={{ fontWeight: 700, color: 'var(--resp-text)' }}>{candidature.grade}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleVoirCV(candidature)}
                    disabled={!candidature.hasCv}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      backgroundColor: 'white',
                      color: candidature.hasCv ? 'var(--resp-primary)' : '#94a3b8',
                      border: `1px solid ${candidature.hasCv ? 'var(--resp-primary)' : '#e2e8f0'}`,
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: candidature.hasCv ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s',
                      marginTop: 'auto',
                      opacity: candidature.hasCv ? 1 : 0.7,
                    }}
                  >
                    <FileText size={16} />
                    {candidature.hasCv ? 'Voir / Télécharger le CV' : 'Aucun CV joint'}
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '200px' }}>
                  <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--resp-text-light)', fontWeight: 700, marginBottom: '0', letterSpacing: '0.05em' }}>Contact</h4>

                  <a href={`mailto:${candidature.email}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--resp-border)', textDecoration: 'none' }}>
                    <div style={{ backgroundColor: '#e0f2fe', padding: '0.4rem', borderRadius: '6px', color: '#0284c7' }}>
                      <Mail size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--resp-text-light)' }}>Email</div>
                      <div style={{ fontWeight: 600, color: 'var(--resp-text)' }}>{candidature.email}</div>
                    </div>
                  </a>

                  {candidature.telephone && (
                    <a href={`tel:${candidature.telephone.replace(/\s/g, '')}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--resp-border)', textDecoration: 'none' }}>
                      <div style={{ backgroundColor: '#dcfce7', padding: '0.4rem', borderRadius: '6px', color: '#16a34a' }}>
                        <Phone size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--resp-text-light)' }}>Téléphone</div>
                        <div style={{ fontWeight: 600, color: 'var(--resp-text)' }}>{candidature.telephone}</div>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isCVModalOpen && selectedCandidat && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '90%', maxWidth: '800px', height: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>

            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--resp-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--resp-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
                  {selectedCandidat.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--resp-text)' }}>CV - {selectedCandidat.name}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--resp-text-light)' }}>Candidat en {selectedCandidat.matiere}</span>
                </div>
              </div>
              <button
                onClick={closeCvModal}
                style={{ background: 'none', border: 'none', color: 'var(--resp-text-light)', cursor: 'pointer', padding: '0.5rem' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ flex: 1, padding: '1rem', backgroundColor: '#e2e8f0', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'stretch' }}>
              {!selectedCandidat.hasCv ? (
                <div style={{ margin: 'auto', color: '#64748b', textAlign: 'center' }}>Aucun CV n'a été joint à cette candidature.</div>
              ) : cvLoading ? (
                <div style={{ margin: 'auto', color: '#64748b' }}>Chargement du CV…</div>
              ) : cvError ? (
                <div style={{ margin: 'auto', color: '#b91c1c', textAlign: 'center', maxWidth: '420px', padding: '1rem' }}>
                  {cvError}
                </div>
              ) : cvPreviewUrl ? (
                <iframe title="CV PDF" src={`${cvPreviewUrl}#toolbar=1`} style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px', background: 'white' }} />
              ) : (
                <div style={{ margin: 'auto', color: '#64748b' }}>Impossible d'afficher le CV.</div>
              )}
            </div>

            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--resp-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white' }}>
              <button
                onClick={handleDownloadCV}
                disabled={!selectedCandidat.hasCv}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: selectedCandidat.hasCv ? 'var(--resp-primary)' : '#94a3b8', background: 'none', border: 'none', fontWeight: 600, cursor: selectedCandidat.hasCv ? 'pointer' : 'not-allowed' }}
              >
                <Download size={18} /> Télécharger le PDF
              </button>

              {selectedCandidat.status === 'en_attente' && (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => { handleReview(selectedCandidat.id, 'reject'); closeCvModal(); }} style={{ padding: '0.5rem 1.5rem', borderRadius: '6px', border: '1px solid #fecaca', backgroundColor: '#fef2f2', color: 'var(--resp-danger)', fontWeight: 600, cursor: 'pointer' }}>
                    Refuser
                  </button>
                  <button onClick={() => { handleReview(selectedCandidat.id, 'accept'); closeCvModal(); }} style={{ padding: '0.5rem 1.5rem', borderRadius: '6px', border: 'none', backgroundColor: 'var(--resp-success)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                    Accepter
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsableCandidatures;
