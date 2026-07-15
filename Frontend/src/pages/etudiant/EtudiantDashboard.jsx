import React, { useState, useMemo } from 'react';
import { Database, Code, Wifi, AlertTriangle, Clock, Calendar, X, UploadCloud, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EtudiantDashboard = () => {
  const navigate = useNavigate();
  const [offres] = useState([
    {
      id: 1,
      titre: 'Base de données',
      responsable: 'Prof. Jean-Pierre Amand',
      volume: '4h / semaine',
      periode: 'Septembre - Janvier',
      description: 'Accompagnement des étudiants de L2 pour les travaux dirigés de SQL et modélisation relationnelle. Correction...',
      tags: ['SQL', 'UML', 'POSTGRESQL'],
      niveau: 'L3 Informatique',
      statutCandidature: null, // null, 'postule'
      icon: <Database size={24} color="#1e1b4b" />
    },
    {
      id: 2,
      titre: 'Programmation Java',
      responsable: 'Mme. Catherine Dubois',
      volume: '6h / semaine',
      periode: 'Octobre - Février',
      description: "Animation de séances de TP en programmation orientée objet. Les thèmes abordés incluent l'héritage, l...",
      tags: ['JAVA', 'POO'],
      niveau: 'L2 Informatique',
      statutCandidature: 'postule',
      icon: <Code size={24} color="#b45309" />
    },
    {
      id: 3,
      titre: 'Réseaux informatiques',
      responsable: 'Mr. Marc Vallet',
      volume: '3h / semaine',
      periode: 'Septembre - Décembre',
      description: 'Support technique et pédagogique pour les cours de protocoles TCP/IP. Supervision des TP sur simulateurs...',
      tags: ['TCP/IP', 'CISCO', 'WIRESHARK'],
      niveau: 'M1 Informatique',
      statutCandidature: null,
      icon: <Wifi size={24} color="#1e1b4b" />
    }
  ]);

  // Filtres state
  const [matiereFilter, setMatiereFilter] = useState('all');
  const [niveauFilter, setNiveauFilter] = useState('all');
  const [periodeFilter, setPeriodeFilter] = useState('all');

  // Extraction des options uniques
  const matieresUniques = useMemo(() => {
    return [...new Set(offres.map(o => o.titre))];
  }, [offres]);
  
  const niveauxUniques = useMemo(() => {
    return [...new Set(offres.map(o => o.niveau))];
  }, [offres]);
  
  const periodesUniques = useMemo(() => {
    return [...new Set(offres.map(o => o.periode))];
  }, [offres]);

  // Filtrage
  const filteredOffres = useMemo(() => {
    return offres.filter(offre => {
      const matchMatiere = matiereFilter === 'all' || offre.titre === matiereFilter;
      const matchNiveau = niveauFilter === 'all' || offre.niveau === niveauFilter;
      const matchPeriode = periodeFilter === 'all' || offre.periode === periodeFilter;
      return matchMatiere && matchNiveau && matchPeriode;
    });
  }, [offres, matiereFilter, niveauFilter, periodeFilter]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOffre, setSelectedOffre] = useState(null);
  const [formData, setFormData] = useState({
    phone: '',
    grade: '',
    motivation: '',
    cvAttached: false
  });

  const handleOpenModal = (offre) => {
    setSelectedOffre(offre);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOffre(null);
    setFormData({ phone: '', grade: '', motivation: '', cvAttached: false });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Votre candidature a été envoyée avec succès pour : ' + selectedOffre.titre);
    handleCloseModal();
  };

  return (
    <div>
      {/* Alert IBAN */}
      <div className="etudiant-alert" style={{ backgroundColor: '#ffe4e6', border: '1px solid #fecdd3', color: '#be123c' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertTriangle size={20} />
          <span><span style={{ fontWeight: 700 }}>Votre IBAN n'est pas renseigné.</span> Complétez votre profil pour recevoir le paiement de vos heures.</span>
        </div>
        <button onClick={() => navigate('/etudiant/profil')} className="etudiant-alert-link" style={{ color: '#be123c', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', fontWeight: 'bold' }}>➔ Mon profil</button>
      </div>

      <div className="etudiant-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="etudiant-page-title">Offres d'assistanat disponibles</h1>
          <p className="etudiant-page-subtitle">Retrouvez les missions pédagogiques proposées pour votre cursus.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Matières</label>
            <select value={matiereFilter} onChange={(e) => setMatiereFilter(e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white', minWidth: '150px' }}>
              <option value="all">Toutes les matières</option>
              {matieresUniques.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Niveaux</label>
            <select value={niveauFilter} onChange={(e) => setNiveauFilter(e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white', minWidth: '150px' }}>
              <option value="all">Tous niveaux</option>
              {niveauxUniques.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Période</label>
            <select value={periodeFilter} onChange={(e) => setPeriodeFilter(e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white', minWidth: '150px' }}>
              <option value="all">Toutes périodes</option>
              {periodesUniques.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {filteredOffres.map((offre) => (
          <div key={offre.id} className="etudiant-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: offre.id === 2 ? '#fef3c7' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                {offre.icon}
              </div>
              <span style={{ backgroundColor: '#fde68a', color: '#92400e', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                {offre.niveau}
              </span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e1b4b', margin: '0 0 0.5rem 0' }}>{offre.titre}</h3>
            <p style={{ color: '#475569', fontSize: '0.9rem', margin: '0 0 1rem 0' }}>Resp : {offre.responsable}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                <Clock size={16} />
                <span>{offre.volume}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                <Calendar size={16} />
                <span>{offre.periode}</span>
              </div>
            </div>

            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.5', flex: 1, marginBottom: '1rem' }}>
              {offre.description}
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {offre.tags.map(tag => (
                <span key={tag} style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                  {tag}
                </span>
              ))}
            </div>

            {offre.statutCandidature === 'postule' ? (
              <>
                <div style={{ backgroundColor: '#312e81', color: 'white', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={16} color="#fde047" />
                  <span style={{ fontWeight: 600 }}>Vous avez déjà candidaté à cette offre</span>
                </div>
                <button className="etudiant-btn-disabled" disabled>Déjà postulé</button>
              </>
            ) : (
              <button className="etudiant-btn-primary" onClick={() => handleOpenModal(offre)}>
                Candidater
              </button>
            )}

          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button className="etudiant-btn-outline" style={{ width: 'auto' }} onClick={() => navigate('/etudiant/offres')}>
          Afficher plus d'offres
        </button>
      </div>

      {/* Candidature Modal */}
      {isModalOpen && selectedOffre && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>Postuler à l'offre</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>{selectedOffre.titre} • {selectedOffre.niveau}</p>
              </div>
              <button onClick={handleCloseModal} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Vos informations (Pré-remplies)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ color: '#0f172a', fontSize: '0.9rem', fontWeight: 600 }}>Nom : Léa Martin</div>
                  <div style={{ color: '#0f172a', fontSize: '0.9rem', fontWeight: 600 }}>Email : lea.martin@escp.eu</div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Numéro de téléphone</label>
                <input 
                  type="tel" 
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', marginBottom: '1.5rem' }} 
                  placeholder="06 XX XX XX XX"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Moyenne obtenue dans cette matière (ex: 15.5)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  min="0" 
                  max="20"
                  required
                  value={formData.grade}
                  onChange={(e) => setFormData({...formData, grade: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} 
                  placeholder="Votre note sur 20"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Lettre de motivation</label>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>Expliquez brièvement pourquoi vous souhaitez être assistant(e) pour ce cours et quelles sont vos qualifications.</p>
                <textarea 
                  required
                  rows={5}
                  value={formData.motivation}
                  onChange={(e) => setFormData({...formData, motivation: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontFamily: 'inherit', resize: 'vertical' }} 
                  placeholder="Je souhaite postuler à cette offre car..."
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Curriculum Vitae (Optionnel)</label>
                <div 
                  onClick={() => setFormData({...formData, cvAttached: !formData.cvAttached})}
                  style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '2rem', textAlign: 'center', cursor: 'pointer', backgroundColor: formData.cvAttached ? '#f0fdf4' : '#f8fafc', transition: 'all 0.2s', borderColor: formData.cvAttached ? '#86efac' : '#cbd5e1' }}
                >
                  {formData.cvAttached ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: '#16a34a' }}>
                      <FileText size={32} />
                      <span style={{ fontWeight: 600 }}>CV_Lea_Martin.pdf attaché avec succès</span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', textDecoration: 'underline' }}>Cliquez pour annuler</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                      <UploadCloud size={32} color="#94a3b8" />
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>Cliquez pour uploader votre CV</span>
                      <span style={{ fontSize: '0.8rem' }}>Format PDF, max 5MB</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={handleCloseModal} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, backgroundColor: 'white', color: '#475569', border: '1px solid #cbd5e1', cursor: 'pointer' }}>
                  Annuler
                </button>
                <button type="submit" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, backgroundColor: '#1e1b4b', color: 'white', border: 'none', cursor: 'pointer' }}>
                  Envoyer ma candidature
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default EtudiantDashboard;
