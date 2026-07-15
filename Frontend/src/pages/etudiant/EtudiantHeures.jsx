import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, Hourglass, Plus, Eye, Download, ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';

const EtudiantHeures = () => {
  const months = ["Septembre 2026", "Octobre 2026", "Novembre 2026"];
  const [currentMonthIndex, setCurrentMonthIndex] = useState(1);

  const [heuresData, setHeuresData] = useState({
    0: [
      { id: 6, date: '10 Sep 2026', matiere: 'Mathématiques', horaire: '08:00 - 10:00', duree: '2h 00m', statut: 'validee' }
    ],
    1: [
      { id: 1, date: '12 Oct 2026', matiere: 'Marketing Digital Avancé', horaire: '09:00 - 11:00', duree: '2h 00m', statut: 'validee' },
      { id: 2, date: '15 Oct 2026', matiere: 'Économie de Marché', horaire: '14:00 - 17:00', duree: '3h 00m', statut: 'validee' },
      { id: 3, date: '18 Oct 2026', matiere: "Management d'Équipe", horaire: '10:00 - 12:00', duree: '2h 00m', statut: 'en_attente' },
      { id: 4, date: '20 Oct 2026', matiere: 'Communication Interne', motif: 'Absent', horaire: '08:30 - 10:30', duree: '2h 00m', statut: 'refusee' },
      { id: 5, date: '24 Oct 2026', matiere: 'Analyse Financière', horaire: '13:30 - 16:30', duree: '3h 00m', statut: 'validee' },
      { id: 7, date: '26 Oct 2026', matiere: 'Comptabilité', horaire: '08:00 - 10:00', duree: '2h 00m', statut: 'en_attente' },
      { id: 8, date: '28 Oct 2026', matiere: 'Droit du Travail', horaire: '10:00 - 12:00', duree: '2h 00m', statut: 'validee' },
    ],
    2: []
  });

  const heures = heuresData[currentMonthIndex];

  // Stats calculation
  const calcHours = (arr) => arr.reduce((acc, h) => acc + parseInt(h.duree.charAt(0)), 0);
  const totalHeures = calcHours(heures);
  const validees = calcHours(heures.filter(h => h.statut === 'validee'));
  const enAttente = calcHours(heures.filter(h => h.statut === 'en_attente'));
  const refusees = calcHours(heures.filter(h => h.statut === 'refusee'));

  // Modals state
  const [isDeclareModalOpen, setIsDeclareModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedHeure, setSelectedHeure] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(heures.length / itemsPerPage);
  
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  const displayedHeures = heures.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePrevMonth = () => { if (currentMonthIndex > 0) { setCurrentMonthIndex(currentMonthIndex - 1); setCurrentPage(1); } };
  const handleNextMonth = () => { if (currentMonthIndex < months.length - 1) { setCurrentMonthIndex(currentMonthIndex + 1); setCurrentPage(1); } };

  const handleDeclareSubmit = (e) => {
    e.preventDefault();
    alert("Vos heures ont été déclarées avec succès et sont en attente de validation.");
    setIsDeclareModalOpen(false);
  };

  const getStatusBadge = (statut) => {
    switch (statut) {
      case 'validee':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#dcfce3', color: '#16a34a', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}><CheckCircle size={14} /> Validée</span>;
      case 'en_attente':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#fef3c7', color: '#d97706', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}><Hourglass size={14} /> En attente</span>;
      case 'refusee':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}><XCircle size={14} /> Refusée</span>;
      default:
        return null;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 className="etudiant-page-title">Mes Heures</h1>
          <p className="etudiant-page-subtitle">Consultez et suivez l'état de vos heures déclarées.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem 1rem', gap: '1.5rem', position: 'relative' }}>
          <button onClick={handlePrevMonth} disabled={currentMonthIndex === 0} style={{ background: 'none', border: 'none', cursor: currentMonthIndex === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', opacity: currentMonthIndex === 0 ? 0.3 : 1 }}>
            <ChevronLeft size={20} color="#64748b" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#0f172a', minWidth: '110px', justifyContent: 'center' }}>
            {months[currentMonthIndex]}
          </div>
          <button onClick={handleNextMonth} disabled={currentMonthIndex === months.length - 1} style={{ background: 'none', border: 'none', cursor: currentMonthIndex === months.length - 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', opacity: currentMonthIndex === months.length - 1 ? 0.3 : 1 }}>
            <ChevronRight size={20} color="#64748b" />
          </button>
          <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }}></div>
          <button 
            onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <Calendar size={20} color={isMonthPickerOpen ? "#3730a3" : "#0f172a"} />
          </button>

          {isMonthPickerOpen && (
            <div style={{ position: 'absolute', top: '100%', right: '0', marginTop: '0.5rem', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden', minWidth: '180px' }}>
              {months.map((m, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentMonthIndex(idx);
                    setCurrentPage(1);
                    setIsMonthPickerOpen(false);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.75rem 1rem',
                    background: currentMonthIndex === idx ? '#f1f5f9' : 'white',
                    border: 'none',
                    borderBottom: idx !== months.length - 1 ? '1px solid #f1f5f9' : 'none',
                    cursor: 'pointer',
                    color: currentMonthIndex === idx ? '#1e1b4b' : '#475569',
                    fontWeight: currentMonthIndex === idx ? 700 : 500,
                  }}
                  onMouseOver={(e) => { if (currentMonthIndex !== idx) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                  onMouseOut={(e) => { if (currentMonthIndex !== idx) e.currentTarget.style.backgroundColor = 'white'; }}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={24} color="#3730a3" />
            </div>
            <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>Total du mois</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e1b4b', lineHeight: 1 }}>{totalHeures}</span>
            <span style={{ fontSize: '1rem', color: '#64748b' }}>heures</span>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#dcfce3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={24} color="#16a34a" />
            </div>
            <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>Validées</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#16a34a', lineHeight: 1 }}>{validees}</span>
            <span style={{ fontSize: '1rem', color: '#64748b' }}>heures</span>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Hourglass size={24} color="#d97706" />
            </div>
            <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>En attente</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#d97706', lineHeight: 1 }}>{enAttente}</span>
            <span style={{ fontSize: '1rem', color: '#64748b' }}>heures</span>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <XCircle size={24} color="#dc2626" />
            </div>
            <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>Refusées</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#dc2626', lineHeight: 1 }}>{refusees}</span>
            <span style={{ fontSize: '1rem', color: '#64748b' }}>heures</span>
          </div>
        </div>

      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Main Table */}
        <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Détails des séances</h2>
            <button 
              onClick={() => setIsDeclareModalOpen(true)}
              style={{ backgroundColor: '#1e1b4b', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
            >
              <Plus size={16} />
              Déclarer des heures
            </button>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Date</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Matière</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Horaire</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Durée</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Statut</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textAlign: 'center' }}>Détail</th>
              </tr>
            </thead>
            <tbody>
              {displayedHeures.map((h, idx) => (
                <tr key={h.id} style={{ borderBottom: idx !== displayedHeures.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>{h.date}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontSize: '0.9rem', color: '#0f172a' }}>{h.matiere}</div>
                    {h.statut === 'refusee' && h.motif && (
                      <div style={{ fontSize: '0.75rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                        <XCircle size={12} /> Motif : {h.motif}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: '#475569' }}>{h.horaire}</td>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: '#475569' }}>{h.duree}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    {getStatusBadge(h.statut)}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                    <button 
                      onClick={() => { setSelectedHeure(h); setIsDetailModalOpen(true); }}
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                    >
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Affichage de {heures.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
              {Math.min(currentPage * itemsPerPage, heures.length)} sur {heures.length} séances
            </span>
            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: '0.25rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px', background: 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                  <ChevronLeft size={16} />
                </button>
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    style={{ 
                      padding: '0.25rem 0.75rem', 
                      border: currentPage === i + 1 ? 'none' : '1px solid #e2e8f0', 
                      borderRadius: '4px', 
                      background: currentPage === i + 1 ? '#1e1b4b' : 'white', 
                      color: currentPage === i + 1 ? 'white' : '#0f172a', 
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{ padding: '0.25rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px', background: 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Columns */}
        <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ backgroundColor: '#1e1b4b', borderRadius: '12px', padding: '1.5rem', color: 'white' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Besoin d'aide ?</h3>
            <p style={{ fontSize: '0.9rem', color: '#c7d2fe', margin: '0 0 1.5rem 0', lineHeight: '1.5' }}>
              Si vous constatez une erreur dans vos heures ou si vous souhaitez contester un refus, contactez votre coordinateur pédagogique.
            </p>
            <div 
              onClick={() => alert("Le support EduManage a été notifié. Un coordinateur vous contactera sous peu.")}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', fontWeight: 700, cursor: 'pointer' }}
            >
              Contacter le support <ChevronRight size={16} />
            </div>
          </div>

          <div 
            onClick={() => { alert("Génération du relevé PDF en cours..."); setTimeout(() => alert("Le PDF a été téléchargé avec succès !"), 1500); }}
            style={{ backgroundColor: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '2rem 1.5rem', textAlign: 'center', cursor: 'pointer' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <Download size={20} color="#1e1b4b" />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>Exporter le relevé</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Téléchargez un PDF récapitulatif pour vos dossiers personnels.</p>
          </div>

        </div>

      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedHeure && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Détail de la déclaration</h3>
              <button onClick={() => setIsDetailModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Matière:</strong> {selectedHeure.matiere}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Date:</strong> {selectedHeure.date}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Horaire:</strong> {selectedHeure.horaire} ({selectedHeure.duree})
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Statut:</strong> {getStatusBadge(selectedHeure.statut)}
              </div>
              {selectedHeure.motif && (
                <div style={{ backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '8px', color: '#991b1b', fontSize: '0.9rem' }}>
                  <strong>Motif de refus :</strong> {selectedHeure.motif}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Declare Modal */}
      {isDeclareModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Déclarer des heures</h3>
              <button onClick={() => setIsDeclareModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleDeclareSubmit} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Matière enseignée</label>
                <select required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <option value="">Sélectionnez une matière...</option>
                  <option value="maths">Mathématiques</option>
                  <option value="dev">Développement Web</option>
                  <option value="bdd">Base de Données</option>
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Date de la séance</label>
                <input type="date" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Heure début</label>
                  <input type="time" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Heure fin</label>
                  <input type="time" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setIsDeclareModalOpen(false)} style={{ padding: '0.5rem 1rem', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>Annuler</button>
                <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#1e1b4b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Soumettre</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EtudiantHeures;
