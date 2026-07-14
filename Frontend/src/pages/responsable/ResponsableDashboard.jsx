import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, FileText, Users, Clock, AlertTriangle, ChevronRight, CheckCircle, XCircle, PlusCircle, Megaphone, ClipboardList, BadgeCheck } from 'lucide-react';
import './responsable.css';

const ResponsableDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = React.useState({ offres: 0, candidatures: 0, assistants: 0, heures: 0 });
  const [circleProgress, setCircleProgress] = React.useState(0);
  const [circleNumber, setCircleNumber] = React.useState(0);
  
  const [isReaffectModalOpen, setIsReaffectModalOpen] = React.useState(false);
  const [selectedSeance, setSelectedSeance] = React.useState(null);

  const handleOpenReaffect = (seance) => {
    setSelectedSeance(seance);
    setIsReaffectModalOpen(true);
  };

  React.useEffect(() => {
    // Animate numbers
    const duration = 1000;
    const steps = 30;
    const interval = duration / steps;
    let step = 0;

    const targetStats = { offres: 3, candidatures: 7, assistants: 5, heures: 24 };

    const timer = setInterval(() => {
      step++;
      setStats({
        offres: Math.round((targetStats.offres / steps) * step),
        candidatures: Math.round((targetStats.candidatures / steps) * step),
        assistants: Math.round((targetStats.assistants / steps) * step),
        heures: Math.round((targetStats.heures / steps) * step)
      });

      if (step >= steps) clearInterval(timer);
    }, interval);

    // Animate circle perfectly synced (Number + SVG Ring)
    const durationCircle = 1500;
    let startCircle = null;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animateCircle = (timestamp) => {
      if (!startCircle) startCircle = timestamp;
      const progress = timestamp - startCircle;
      const t = Math.min(progress / durationCircle, 1);
      
      const currentVal = Math.round(easeOutCubic(t) * 75);
      
      // Update both state variables at the same time for perfect sync
      setCircleProgress(currentVal);
      setCircleNumber(currentVal);

      if (t < 1) {
        circleFrame = requestAnimationFrame(animateCircle);
      }
    };
    
    let circleFrame = requestAnimationFrame(animateCircle);

    return () => {
      clearInterval(timer);
      cancelAnimationFrame(circleFrame);
    };
  }, []);

  return (
    <div className="resp-dashboard">
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--resp-primary)', marginBottom: '1.5rem' }}>
        Tableau de bord
      </h1>

      {/* Top Metrics */}
      <div className="resp-stats-grid">
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--resp-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: '#f5f3ff', padding: '0.75rem', borderRadius: '8px', color: 'var(--resp-primary)' }}>
              <Megaphone size={20} />
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--resp-success)' }}>+12%</div>
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
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--resp-danger)' }}>Urgent</div>
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
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--resp-text-light)' }}>Stable</div>
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
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#a16207' }}>Validation</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--resp-text-light)', fontWeight: 500 }}>Heures à valider</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--resp-text)', lineHeight: 1 }}>{stats.heures}h</div>
          </div>
        </div>
      </div>

      {/* Alertes Section */}
      <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--resp-danger)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <AlertTriangle size={20} />
          ALERTES
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="resp-alert-actions" style={{ backgroundColor: 'white', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                LM
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--resp-text)' }}>Léa Martin a annulé sa séance</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--resp-text-light)' }}>Bases de données • Mar 15/10 • 08h00 - 10h00</div>
              </div>
            </div>
            <button 
              onClick={() => handleOpenReaffect({ title: "Bases de données", date: "Mar 15/10", time: "08h00 - 10h00", canceler: "Léa Martin" })}
              style={{ backgroundColor: 'var(--resp-danger)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 500, cursor: 'pointer' }}>
              Réaffecter
            </button>
          </div>

          <div className="resp-alert-actions" style={{ backgroundColor: 'white', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                PD
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--resp-text)' }}>Paul Durand a annulé sa séance</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--resp-text-light)' }}>Développement Java • Jeu 17/10 • 10h00 - 12h00</div>
              </div>
            </div>
            <button 
              onClick={() => handleOpenReaffect({ title: "Développement Java", date: "Jeu 17/10", time: "10h00 - 12h00", canceler: "Paul Durand" })}
              style={{ backgroundColor: 'var(--resp-danger)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 500, cursor: 'pointer' }}>
              Réaffecter
            </button>
          </div>
        </div>
      </div>

      <div className="resp-main-grid">
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Séances à venir */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--resp-text)', margin: 0 }}>Séances à venir</h2>
              <Link to="/responsable/seances" style={{ color: 'var(--resp-primary-light)', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>
                Tout voir
              </Link>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Card 1 */}
              <div style={{ backgroundColor: '#f8fafc', borderLeft: '4px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ backgroundColor: '#f1f5f9', padding: '0.5rem', borderRadius: '4px', textAlign: 'center', minWidth: '60px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--resp-text-light)', textTransform: 'uppercase', fontWeight: 700 }}>Oct</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--resp-text)', lineHeight: 1, marginTop: '2px' }}>14</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>Algorithmique</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--resp-text-light)' }}>Marc Lefebvre</div>
                  </div>
                </div>
                <div>
                  <span style={{ backgroundColor: '#d1fae5', color: '#059669', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>Validé</span>
                </div>
              </div>

              {/* Card 2 */}
              <div style={{ backgroundColor: '#f8fafc', borderLeft: '4px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ backgroundColor: '#f1f5f9', padding: '0.5rem', borderRadius: '4px', textAlign: 'center', minWidth: '60px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--resp-text-light)', textTransform: 'uppercase', fontWeight: 700 }}>Oct</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--resp-text)', lineHeight: 1, marginTop: '2px' }}>15</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>Marketing Digital</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--resp-text-light)' }}>-- À affecter --</div>
                  </div>
                </div>
                <div>
                  <span style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>Urgent</span>
                </div>
              </div>

              {/* Card 3 */}
              <div style={{ backgroundColor: '#f8fafc', borderLeft: '4px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ backgroundColor: '#f1f5f9', padding: '0.5rem', borderRadius: '4px', textAlign: 'center', minWidth: '60px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--resp-text-light)', textTransform: 'uppercase', fontWeight: 700 }}>Oct</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--resp-text)', lineHeight: 1, marginTop: '2px' }}>15</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>Comptabilité</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--resp-text-light)' }}>Sophie Roy</div>
                  </div>
                </div>
                <div>
                  <span style={{ backgroundColor: '#d1fae5', color: '#059669', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>Validé</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Heures Chart */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--resp-border)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--resp-primary)', margin: '0 0 1.5rem 0' }}>Heures Octobre 2026</h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', height: '160px', alignItems: 'center' }}>
              {/* Fake Progress Circle using SVG */}
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
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--resp-text)' }}>36h</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--resp-text-light)' }}>Validées</div>
              </div>
              <div style={{ borderLeft: '1px solid var(--resp-border)' }}></div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--resp-text)' }}>48h</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--resp-text-light)' }}>Objectif Mensuel</div>
              </div>
            </div>
          </div>

          {/* Dernières candidatures */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--resp-border)' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--resp-border)' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--resp-primary)', margin: 0 }}>Dernières candidatures</h2>
            </div>
            <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img src="https://i.pravatar.cc/150?img=1" alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--resp-text)' }}>Léa Martin</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--resp-text-light)' }}>Bases de données</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={{ background: 'none', border: 'none', color: 'var(--resp-success)', cursor: 'pointer', padding: 0 }}><CheckCircle size={20} /></button>
                  <button style={{ background: 'none', border: 'none', color: 'var(--resp-danger)', cursor: 'pointer', padding: 0 }}><XCircle size={20} /></button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img src="https://i.pravatar.cc/150?img=11" alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--resp-text)' }}>Paul Durand</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--resp-text-light)' }}>Dev Web</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={{ background: 'none', border: 'none', color: 'var(--resp-success)', cursor: 'pointer', padding: 0 }}><CheckCircle size={20} /></button>
                  <button style={{ background: 'none', border: 'none', color: 'var(--resp-danger)', cursor: 'pointer', padding: 0 }}><XCircle size={20} /></button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img src="https://i.pravatar.cc/150?img=5" alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--resp-text)' }}>Marie Lopez</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--resp-text-light)' }}>Réseaux</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={{ background: 'none', border: 'none', color: 'var(--resp-success)', cursor: 'pointer', padding: 0 }}><CheckCircle size={20} /></button>
                  <button style={{ background: 'none', border: 'none', color: 'var(--resp-danger)', cursor: 'pointer', padding: 0 }}><XCircle size={20} /></button>
                </div>
              </div>

            </div>
          </div>

          {/* Créer une offre Block */}
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
              onMouseEnter={(e) => e.target.style.backgroundColor = '#854d0e'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#a16207'}
            >
              Nouveau poste
            </button>
          </div>

        </div>

      </div>

      {/* Reaffecter Modal */}
      {isReaffectModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', color: 'var(--resp-primary)', fontWeight: 700 }}>
              Réaffecter la séance
            </h3>
            
            {selectedSeance && (
              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--resp-border)' }}>
                <div style={{ fontWeight: 600, color: 'var(--resp-text)', marginBottom: '0.25rem' }}>{selectedSeance.title}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--resp-text-light)' }}>
                  {selectedSeance.date} • {selectedSeance.time} <br/>
                  <span style={{ color: 'var(--resp-danger)', marginTop: '0.25rem', display: 'inline-block' }}>Annulée par: {selectedSeance.canceler}</span>
                </div>
              </div>
            )}

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--resp-text)', marginBottom: '0.5rem' }}>
                Choisir un nouvel assistant :
              </label>
              <select style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--resp-border)', fontSize: '0.95rem', color: 'var(--resp-text)', outline: 'none' }}>
                <option value="">Sélectionner un assistant disponible...</option>
                <option value="1">Thomas Bernard (Disponible)</option>
                <option value="2">Sophie Leroy (Disponible)</option>
                <option value="3" disabled>Lucas Moreau (Occupé)</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                onClick={() => setIsReaffectModalOpen(false)}
                style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid var(--resp-border)', backgroundColor: 'white', color: 'var(--resp-text)', fontWeight: 600, cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button 
                onClick={() => setIsReaffectModalOpen(false)}
                style={{ padding: '0.6rem 1.5rem', borderRadius: '6px', border: 'none', backgroundColor: 'var(--resp-primary)', color: 'white', fontWeight: 600, cursor: 'pointer' }}
              >
                Confirmer l'affectation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ResponsableDashboard;
