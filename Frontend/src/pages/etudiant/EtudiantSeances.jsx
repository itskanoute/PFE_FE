import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Info, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EtudiantSeances = () => {
  const navigate = useNavigate();
  const [seances, setSeances] = useState([
    { id: 1, dateStr: '08', matiere: 'Base de Données', sigle: 'BDD', horaire: '08h00 - 10h00', salle: 'Salle B2', statut: 'prévu', jour: 'mardi' },
    { id: 2, dateStr: '09', matiere: 'Base de Données', sigle: 'BDD', horaire: '14h00 - 16h00', salle: 'Salle A1', statut: 'prévu', jour: 'mercredi' }
  ]);

  const [seancesListe, setSeancesListe] = useState([
    { id: 1, dateL: 'Mar 08 Octobre', horaire: '08h00 - 10h00', matiere: 'BDD (Base de Données)', salle: 'Salle B2', statut: 'prévu' },
    { id: 2, dateL: 'Mer 09 Octobre', horaire: '14h00 - 16h00', matiere: 'BDD (Base de Données)', salle: 'Salle A1', statut: 'prévu' },
    { id: 3, dateL: 'Mar 15 Septembre', horaire: '09h00 - 11h00', matiere: 'Mathématiques', salle: 'Salle C4', statut: 'passé' },
  ]);

  const weeks = [
    { label: "23 au 29 Septembre 2026", days: ['LUNDI 23', 'MARDI 24', 'MERCREDI 25', 'JEUDI 26', 'VENDREDI 27'] },
    { label: "30 Septembre au 6 Octobre 2026", days: ['LUNDI 30', 'MARDI 01', 'MERCREDI 02', 'JEUDI 03', 'VENDREDI 04'] },
    { label: "7 au 13 Octobre 2026", days: ['LUNDI 07', 'MARDI 08', 'MERCREDI 09', 'JEUDI 10', 'VENDREDI 11'] },
    { label: "14 au 20 Octobre 2026", days: ['LUNDI 14', 'MARDI 15', 'MERCREDI 16', 'JEUDI 17', 'VENDREDI 18'] }
  ];
  const [currentWeekIndex, setCurrentWeekIndex] = useState(2);

  // States for cancellation modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [seanceToCancel, setSeanceToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const handlePrevWeek = () => {
    if (currentWeekIndex > 0) setCurrentWeekIndex(currentWeekIndex - 1);
  };

  const handleNextWeek = () => {
    if (currentWeekIndex < weeks.length - 1) setCurrentWeekIndex(currentWeekIndex + 1);
  };

  const handleOpenCancelModal = (id) => {
    setSeanceToCancel(id);
    setCancelReason('');
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (!cancelReason.trim()) {
      alert("Veuillez renseigner un motif d'annulation.");
      return;
    }
    setSeances(prev => prev.filter(s => s.id !== seanceToCancel));
    setSeancesListe(prev => prev.map(s => s.id === seanceToCancel ? { ...s, statut: 'annulé' } : s));
    setIsCancelModalOpen(false);
    setSeanceToCancel(null);
  };

  const handleCloseCancelModal = () => {
    setIsCancelModalOpen(false);
    setSeanceToCancel(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 className="etudiant-page-title">Mes séances programmées</h1>
          <p className="etudiant-page-subtitle">Gérez votre emploi du temps et vos réservations de tutorat.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem 1rem', gap: '1.5rem' }}>
          <button onClick={handlePrevWeek} disabled={currentWeekIndex === 0} style={{ background: 'none', border: 'none', cursor: currentWeekIndex === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', opacity: currentWeekIndex === 0 ? 0.3 : 1 }}>
            <ChevronLeft size={20} color="#64748b" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#0f172a' }}>
            <CalendarIcon size={18} />
            {weeks[currentWeekIndex].label}
          </div>
          <button onClick={handleNextWeek} disabled={currentWeekIndex === weeks.length - 1} style={{ background: 'none', border: 'none', cursor: currentWeekIndex === weeks.length - 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', opacity: currentWeekIndex === weeks.length - 1 ? 0.3 : 1 }}>
            <ChevronRight size={20} color="#64748b" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '4rem' }}>
        {weeks[currentWeekIndex].days.map((jour, index) => {
          // Check if there is a session for this day in the current week
          // For mocking, we assume seances state has the sessions for the default week.
          // In a real app, we would filter seances by the actual dates.
          const isMardi = currentWeekIndex === 2 && index === 1;
          const isMercredi = currentWeekIndex === 2 && index === 2;
          
          const seanceMardi = seances.find(s => s.id === 1);
          const seanceMercredi = seances.find(s => s.id === 2);

          return (
            <div key={jour} style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.5px' }}>
                {jour}
              </div>
              <div style={{ padding: '0.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                
                {isMardi && seanceMardi && (
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span style={{ backgroundColor: '#1e1b4b', color: 'white', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>BDD</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a' }}></div>
                        Prévu
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>Base de Données</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>08h00 - 10h00</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      Salle B2
                    </div>
                  </div>
                )}

                {isMercredi && seanceMercredi && (
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span style={{ backgroundColor: '#1e1b4b', color: 'white', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>BDD</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a' }}></div>
                        Prévu
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>Base de Données</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>14h00 - 16h00</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      Salle A1
                    </div>
                  </div>
                )}

                {(!isMardi && !isMercredi) || (isMardi && !seanceMardi) || (isMercredi && !seanceMercredi) ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontStyle: 'italic', fontSize: '0.9rem' }}>
                    Aucune séance
                  </div>
                ) : null}

              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Récapitulatif des séances</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a', color: '#92400e', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Info size={16} />
            <span><span style={{ fontWeight: 700 }}>Règle de gestion :</span> L'annulation est possible jusqu'à J-1 de la séance.</span>
          </div>
          <button 
            onClick={() => navigate('/etudiant/seances/toutes')}
            style={{ padding: '0.5rem 1rem', backgroundColor: 'white', border: '1px solid #cbd5e1', color: '#1e1b4b', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            Voir tout l'historique
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Date</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Horaire</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Matière</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Salle</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Statut</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {seancesListe.map((s, idx) => (
              <tr key={s.id} style={{ borderBottom: idx !== seancesListe.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>{s.dateL}</td>
                <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: '#475569' }}>{s.horaire}</td>
                <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: '#475569' }}>{s.matiere}</td>
                <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: '#475569' }}>{s.salle}</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  {s.statut === 'prévu' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#dcfce3', color: '#16a34a', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a' }}></div>
                      Prévu
                    </span>
                  )}
                  {s.statut === 'passé' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#e2e8f0', color: '#475569', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#64748b' }}></div>
                      Passé (effectué)
                    </span>
                  )}
                  {s.statut === 'annulé' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#dc2626' }}></div>
                      Annulé
                    </span>
                  )}
                </td>
                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                  {s.statut === 'prévu' ? (
                    <button onClick={() => handleOpenCancelModal(s.id)} style={{ backgroundColor: 'white', border: '1px solid #fca5a5', color: '#ef4444', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <X size={14} />
                      ANNULER
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>Aucune action<br/>possible</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cancellation Modal */}
      {isCancelModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Motif d'annulation</h3>
              <button onClick={handleCloseCancelModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a', color: '#92400e', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Info size={16} />
                <span><span style={{ fontWeight: 700 }}>Attention :</span> L'annulation doit se faire à J-1.</span>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Veuillez indiquer le motif de cette annulation :</label>
                <textarea 
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ex: Maladie, problème de transport, autre contrainte..."
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '100px', fontFamily: 'inherit', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>
            </div>
            <div style={{ padding: '1rem 1.5rem', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                onClick={handleCloseCancelModal}
                style={{ padding: '0.5rem 1rem', backgroundColor: 'white', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '6px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Retour
              </button>
              <button 
                onClick={handleConfirmCancel}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', border: 'none', color: 'white', borderRadius: '6px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Confirmer l'annulation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EtudiantSeances;
