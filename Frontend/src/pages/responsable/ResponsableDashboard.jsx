import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Megaphone, ClipboardList, Users, BadgeCheck, AlertTriangle, CheckCircle, XCircle, PlusCircle } from 'lucide-react';
import {
  getResponsableDashboard,
  getResponsableSessions,
  assignResponsableSession,
  getResponsableApplications,
  reviewResponsableApplication,
} from '../../services/api';
import './responsable.css';

const parseSessionDateParts = (dateStr) => {
  const match = dateStr?.match(/(\d{2})\/(\d{2})/);
  if (!match) return { month: '—', day: '—' };
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  return { month: months[parseInt(match[2], 10) - 1] || match[2], day: match[1] };
};

const getInitials = (name) =>
  name?.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() || '?';

const ResponsableDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [dashboard, setDashboard] = React.useState(null);
  const [recentApplications, setRecentApplications] = React.useState([]);

  const [stats, setStats] = React.useState({ offres: 0, candidatures: 0, assistants: 0, heures: 0 });
  const [circleProgress, setCircleProgress] = React.useState(0);
  const [circleNumber, setCircleNumber] = React.useState(0);

  const [isReaffectModalOpen, setIsReaffectModalOpen] = React.useState(false);
  const [selectedAlert, setSelectedAlert] = React.useState(null);
  const [availableAssistants, setAvailableAssistants] = React.useState([]);
  const [selectedStudentId, setSelectedStudentId] = React.useState('');
  const [assignLoading, setAssignLoading] = React.useState(false);
  const [assignError, setAssignError] = React.useState('');

  const loadDashboard = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [data, appsData] = await Promise.all([
        getResponsableDashboard(),
        getResponsableApplications({ status: 'en_attente' }).catch(() => ({ applications: [] })),
      ]);
      setDashboard(data);
      setRecentApplications((appsData.applications || []).slice(0, 3));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  React.useEffect(() => {
    if (!dashboard) return;

    const targetStats = dashboard.stats;
    const targetProgress = dashboard.progressPercent || 0;
    const duration = 1000;
    const steps = 30;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setStats({
        offres: Math.round((targetStats.offres / steps) * step),
        candidatures: Math.round((targetStats.candidatures / steps) * step),
        assistants: Math.round((targetStats.assistants / steps) * step),
        heures: Math.round((targetStats.heures / steps) * step),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);

    const durationCircle = 1500;
    let startCircle = null;
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animateCircle = (timestamp) => {
      if (!startCircle) startCircle = timestamp;
      const progress = timestamp - startCircle;
      const t = Math.min(progress / durationCircle, 1);
      const currentVal = Math.round(easeOutCubic(t) * targetProgress);
      setCircleProgress(currentVal);
      setCircleNumber(currentVal);
      if (t < 1) requestAnimationFrame(animateCircle);
    };

    const circleFrame = requestAnimationFrame(animateCircle);

    return () => {
      clearInterval(timer);
      cancelAnimationFrame(circleFrame);
    };
  }, [dashboard]);

  const handleOpenReaffect = async (alert) => {
    setSelectedAlert(alert);
    setSelectedStudentId('');
    setAssignError('');
    setIsReaffectModalOpen(true);
    try {
      const data = await getResponsableSessions();
      setAvailableAssistants(data.availableAssistants || []);
    } catch {
      setAvailableAssistants([]);
    }
  };

  const handleConfirmAssign = async () => {
    if (!selectedAlert?.sessionId || !selectedStudentId) return;
    setAssignLoading(true);
    setAssignError('');
    try {
      await assignResponsableSession(selectedAlert.sessionId, Number(selectedStudentId));
      setIsReaffectModalOpen(false);
      loadDashboard();
    } catch (err) {
      setAssignError(err.message);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleReviewApplication = async (id, action) => {
    try {
      await reviewResponsableApplication(id, action);
      loadDashboard();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="resp-dashboard" style={{ padding: '2rem' }}>
        Chargement du tableau de bord...
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

  const alerts = dashboard?.alerts || [];
  const upcomingSessions = dashboard?.upcomingSessions || [];

  return (
    <div className="resp-dashboard">
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--resp-primary)', marginBottom: '1.5rem' }}>
        Tableau de bord
      </h1>

      <div className="resp-stats-grid">
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--resp-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: '#f5f3ff', padding: '0.75rem', borderRadius: '8px', color: 'var(--resp-primary)' }}>
              <Megaphone size={20} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--resp-text-light)', fontWeight: 500 }}>Offres actives</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--resp-text)', lineHeight: 1 }}>{stats.offres}</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--resp-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: '#fef3c7', padding: '0.75rem', borderRadius: '8px', color: '#b45309' }}>
              <ClipboardList size={20} />
            </div>
            {stats.candidatures > 0 && (
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--resp-danger)' }}>Urgent</div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--resp-text-light)', fontWeight: 500 }}>Candidatures en attente</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--resp-text)', lineHeight: 1 }}>{stats.candidatures}</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--resp-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: '#f5f3ff', padding: '0.75rem', borderRadius: '8px', color: 'var(--resp-primary)' }}>
              <Users size={20} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--resp-text-light)', fontWeight: 500 }}>Assistants actifs</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--resp-text)', lineHeight: 1 }}>{stats.assistants}</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--resp-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '8px', color: '#991b1b' }}>
              <BadgeCheck size={20} />
            </div>
            {stats.heures > 0 && (
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#a16207' }}>Validation</div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--resp-text-light)', fontWeight: 500 }}>Heures à valider</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--resp-text)', lineHeight: 1 }}>{stats.heures}h</div>
          </div>
        </div>
      </div>

      {alerts.length > 0 && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--resp-danger)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <AlertTriangle size={20} />
            ALERTES
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {alerts.map((alert, i) => (
              <div key={i} className="resp-alert-actions" style={{ backgroundColor: 'white', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                    {getInitials(alert.title)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--resp-text)' }}>{alert.title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--resp-text-light)' }}>{alert.text}</div>
                  </div>
                </div>
                {alert.type === 'session_cancelled' && (
                  <button
                    onClick={() => handleOpenReaffect(alert)}
                    style={{ backgroundColor: 'var(--resp-danger)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 500, cursor: 'pointer' }}>
                    Réaffecter
                  </button>
                )}
                {alert.type === 'applications_pending' && (
                  <Link to="/responsable/candidatures" style={{ backgroundColor: 'var(--resp-primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 500, textDecoration: 'none' }}>
                    Voir
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="resp-main-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--resp-text)', margin: 0 }}>Séances à venir</h2>
              <Link to="/responsable/seances" style={{ color: 'var(--resp-primary-light)', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>
                Tout voir
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {upcomingSessions.length === 0 ? (
                <div style={{ padding: '1.5rem', color: 'var(--resp-text-light)', textAlign: 'center' }}>Aucune séance à venir</div>
              ) : (
                upcomingSessions.map((seance) => {
                  const { month, day } = parseSessionDateParts(seance.date);
                  const hasAssistant = !!seance.assistant;
                  return (
                    <div key={seance.id} style={{ backgroundColor: '#f8fafc', borderLeft: `4px solid ${hasAssistant ? '#10b981' : '#ef4444'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ backgroundColor: '#f1f5f9', padding: '0.5rem', borderRadius: '4px', textAlign: 'center', minWidth: '60px' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--resp-text-light)', textTransform: 'uppercase', fontWeight: 700 }}>{month}</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--resp-text)', lineHeight: 1, marginTop: '2px' }}>{day}</div>
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>{seance.matiere}</div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--resp-text-light)' }}>
                            {hasAssistant ? seance.assistant : '-- À affecter --'}
                            {seance.time ? ` • ${seance.time}` : ''}
                          </div>
                        </div>
                      </div>
                      <div>
                        <span style={{ backgroundColor: hasAssistant ? '#d1fae5' : '#fee2e2', color: hasAssistant ? '#059669' : '#dc2626', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                          {hasAssistant ? 'Validé' : 'Urgent'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--resp-border)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--resp-primary)', margin: '0 0 1.5rem 0' }}>Heures ce mois</h2>

            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', height: '160px', alignItems: 'center' }}>
              <svg viewBox="0 0 36 36" style={{ width: '150px', height: '150px' }}>
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--resp-accent)"
                  strokeWidth="3"
                  strokeDasharray={`${circleProgress}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--resp-primary)', lineHeight: 1 }}>{circleNumber}%</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--resp-text-light)' }}>Complété</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--resp-text)' }}>{stats.heures}h</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--resp-text-light)' }}>En attente</div>
              </div>
              <div style={{ borderLeft: '1px solid var(--resp-border)' }}></div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--resp-text)' }}>{dashboard.progressPercent}%</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--resp-text-light)' }}>Validées</div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--resp-border)' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--resp-border)' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--resp-primary)', margin: 0 }}>Dernières candidatures</h2>
            </div>
            <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentApplications.length === 0 ? (
                <div style={{ color: 'var(--resp-text-light)', fontSize: '0.9rem', textAlign: 'center', padding: '0.5rem' }}>
                  Aucune candidature en attente
                </div>
              ) : (
                recentApplications.map((candidat) => (
                  <div key={candidat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--resp-primary-light)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                        {getInitials(candidat.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--resp-text)' }}>{candidat.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--resp-text-light)' }}>{candidat.matiere}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleReviewApplication(candidat.id, 'accept')} style={{ background: 'none', border: 'none', color: 'var(--resp-success)', cursor: 'pointer', padding: 0 }}><CheckCircle size={20} /></button>
                      <button onClick={() => handleReviewApplication(candidat.id, 'reject')} style={{ background: 'none', border: 'none', color: 'var(--resp-danger)', cursor: 'pointer', padding: 0 }}><XCircle size={20} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--resp-primary)', borderRadius: '12px', padding: '1.5rem', color: 'white', position: 'relative', overflow: 'hidden', marginTop: 'auto' }}>
            <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', color: 'rgba(255,255,255,0.08)' }}>
              <PlusCircle size={140} strokeWidth={1.5} />
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 1rem 0', position: 'relative', zIndex: 1 }}>Créer une offre</h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 1.5rem 0', position: 'relative', zIndex: 1, paddingRight: '1rem' }}>
              Publiez de nouveaux besoins en tutorat pour vos prochains modules.
            </p>
            <button
              onClick={() => navigate('/responsable/offres')}
              style={{ backgroundColor: '#a16207', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', position: 'relative', zIndex: 1, width: '100%', transition: 'background-color 0.2s' }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = '#854d0e'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = '#a16207'; }}
            >
              Nouveau poste
            </button>
          </div>
        </div>
      </div>

      {isReaffectModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', color: 'var(--resp-primary)', fontWeight: 700 }}>
              Réaffecter la séance
            </h3>

            {selectedAlert && (
              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--resp-border)' }}>
                <div style={{ fontWeight: 600, color: 'var(--resp-text)', marginBottom: '0.25rem' }}>{selectedAlert.title}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--resp-text-light)' }}>{selectedAlert.text}</div>
              </div>
            )}

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--resp-text)', marginBottom: '0.5rem' }}>
                Choisir un nouvel assistant :
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--resp-border)', fontSize: '0.95rem', color: 'var(--resp-text)', outline: 'none' }}
              >
                <option value="">Sélectionner un assistant disponible...</option>
                {availableAssistants.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.matiere})</option>
                ))}
              </select>
              {assignError && <div style={{ color: 'var(--resp-danger)', fontSize: '0.85rem', marginTop: '0.5rem' }}>{assignError}</div>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                onClick={() => setIsReaffectModalOpen(false)}
                style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid var(--resp-border)', backgroundColor: 'white', color: 'var(--resp-text)', fontWeight: 600, cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmAssign}
                disabled={!selectedStudentId || assignLoading}
                style={{ padding: '0.6rem 1.5rem', borderRadius: '6px', border: 'none', backgroundColor: 'var(--resp-primary)', color: 'white', fontWeight: 600, cursor: 'pointer', opacity: !selectedStudentId || assignLoading ? 0.6 : 1 }}
              >
                {assignLoading ? 'Affectation...' : "Confirmer l'affectation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsableDashboard;
