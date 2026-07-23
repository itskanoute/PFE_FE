import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Info, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getEtudiantSeances, cancelEtudiantSeance } from '../../services/api';

const MONTH_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];
const DAY_LABELS = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI'];

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function getMonday(d) {
  const date = startOfDay(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function formatWeekLabel(monday) {
  const friday = addDays(monday, 4);
  const sameMonth = monday.getMonth() === friday.getMonth();
  if (sameMonth) {
    return `${monday.getDate()} au ${friday.getDate()} ${MONTH_FR[monday.getMonth()]} ${monday.getFullYear()}`;
  }
  return `${monday.getDate()} ${MONTH_FR[monday.getMonth()]} au ${friday.getDate()} ${MONTH_FR[friday.getMonth()]} ${friday.getFullYear()}`;
}

function buildWeeks(seances) {
  const mondayKeys = new Set();
  const dates = seances.map((s) => parseDate(s.date)).filter(Boolean);

  if (dates.length === 0) {
    mondayKeys.add(getMonday(new Date()).getTime());
  } else {
    dates.forEach((d) => mondayKeys.add(getMonday(d).getTime()));
    mondayKeys.add(getMonday(new Date()).getTime());
  }

  return [...mondayKeys]
    .sort((a, b) => a - b)
    .map((ts) => {
      const monday = new Date(ts);
      const days = DAY_LABELS.map((label, i) => {
        const dayDate = addDays(monday, i);
        return {
          label: `${label} ${String(dayDate.getDate()).padStart(2, '0')}`,
          date: dayDate,
        };
      });
      return { monday, label: formatWeekLabel(monday), days };
    });
}

const EtudiantSeances = () => {
  const navigate = useNavigate();
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [cancelling, setCancelling] = useState(false);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [seanceToCancel, setSeanceToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const loadSeances = () => {
    setLoading(true);
    setError('');
    getEtudiantSeances()
      .then((data) => setSeances(data.seances || []))
      .catch((err) => setError(err.message || 'Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSeances();
  }, []);

  const weeks = useMemo(() => buildWeeks(seances), [seances]);

  useEffect(() => {
    if (weeks.length === 0) return;
    const todayMonday = getMonday(new Date()).getTime();
    const idx = weeks.findIndex((w) => w.monday.getTime() === todayMonday);
    setCurrentWeekIndex(idx >= 0 ? idx : Math.max(0, weeks.length - 1));
  }, [weeks]);

  const currentWeek = weeks[currentWeekIndex] || weeks[0];

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

  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      alert("Veuillez renseigner un motif d'annulation.");
      return;
    }
    setCancelling(true);
    try {
      await cancelEtudiantSeance(seanceToCancel, cancelReason.trim());
      setIsCancelModalOpen(false);
      setSeanceToCancel(null);
      loadSeances();
    } catch (err) {
      alert(err.message || 'Impossible d\'annuler la séance');
    } finally {
      setCancelling(false);
    }
  };

  const handleCloseCancelModal = () => {
    setIsCancelModalOpen(false);
    setSeanceToCancel(null);
  };

  const seancesForDay = (dayDate) =>
    seances.filter((s) => {
      const d = parseDate(s.date);
      return d && sameDay(d, dayDate) && s.statut !== 'annulé';
    });

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
            {currentWeek?.label || '—'}
          </div>
          <button onClick={handleNextWeek} disabled={currentWeekIndex >= weeks.length - 1} style={{ background: 'none', border: 'none', cursor: currentWeekIndex >= weeks.length - 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', opacity: currentWeekIndex >= weeks.length - 1 ? 0.3 : 1 }}>
            <ChevronRight size={20} color="#64748b" />
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '4rem' }}>
        {(currentWeek?.days || []).map((jour) => {
          const daySeances = seancesForDay(jour.date);

          return (
            <div key={jour.label} style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.5px' }}>
                {jour.label}
              </div>
              <div style={{ padding: '0.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

                {daySeances.map((s) => (
                  <div key={s.id} style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span style={{ backgroundColor: '#1e1b4b', color: 'white', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>{s.sigle}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: s.statut === 'passé' ? '#64748b' : '#16a34a', fontWeight: 600 }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: s.statut === 'passé' ? '#64748b' : '#16a34a' }}></div>
                        {s.statut === 'passé' ? 'Passé' : 'Prévu'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>{s.matiere}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>{s.horaire}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      {s.salle}
                    </div>
                  </div>
                ))}

                {daySeances.length === 0 && (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontStyle: 'italic', fontSize: '0.9rem' }}>
                    {loading ? '…' : 'Aucune séance'}
                  </div>
                )}

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
            {seances.length === 0 && !loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Aucune séance</td>
              </tr>
            ) : (
              seances.map((s, idx) => (
                <tr key={s.id} style={{ borderBottom: idx !== seances.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>{s.dateL}</td>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: '#475569' }}>{s.horaire}</td>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: '#475569' }}>
                    {s.sigle ? `${s.sigle} (${s.matiere})` : s.matiere}
                  </td>
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
                    {s.statut === 'prévu' && s.canCancel !== false ? (
                      <button onClick={() => handleOpenCancelModal(s.id)} style={{ backgroundColor: 'white', border: '1px solid #fca5a5', color: '#ef4444', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <X size={14} />
                        ANNULER
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>Aucune action<br/>possible</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
                disabled={cancelling}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', border: 'none', color: 'white', borderRadius: '6px', fontWeight: 600, fontSize: '0.9rem', cursor: cancelling ? 'not-allowed' : 'pointer', opacity: cancelling ? 0.7 : 1 }}
              >
                {cancelling ? 'Annulation…' : 'Confirmer l\'annulation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EtudiantSeances;
