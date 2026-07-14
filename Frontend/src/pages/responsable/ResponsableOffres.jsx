import React, { useState } from 'react';
import { Briefcase, Users, Star, Clock, MoreVertical, Edit2, Trash2, PlusCircle, CheckCircle, RefreshCw } from 'lucide-react';
import './responsable.css';

const ResponsableOffres = () => {
  const initialOffres = [
    {
      id: 1,
      matiere: "Algorithmique",
      description: "Accompagnement des étudiants de 1ère année dans l'apprentissage des bases de l'algorithmique et de la programmation.",
      places: 3,
      candidatures: 5,
      grade_requise: "15/20 minimum",
      status: "active",
      date_creation: "01/10/2026"
    },
    {
      id: 2,
      matiere: "Bases de données",
      description: "Soutien pour les TPs de conception de bases de données relationnelles et requêtes SQL complexes.",
      places: 2,
      candidatures: 7,
      grade_requise: "14/20 minimum",
      status: "active",
      date_creation: "05/10/2026"
    },
    {
      id: 3,
      matiere: "Développement Web",
      description: "Aide à la réalisation des projets web (HTML, CSS, JS, React).",
      places: 4,
      candidatures: 4,
      grade_requise: "16/20 minimum",
      status: "pourvue",
      date_creation: "15/09/2026"
    }
  ];

  const [offresList, setOffresList] = useState(initialOffres);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [formData, setFormData] = useState({ matiere: '', description: '', places: 1, grade_requise: '' });

  const handleCreate = () => {
    setModalMode('create');
    setFormData({ matiere: '', description: '', places: 1, grade_requise: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (offre) => {
    setModalMode('edit');
    setFormData({ ...offre });
    setIsModalOpen(true);
  };

  const handleFermer = (id) => {
    setOffresList(offresList.map(o => o.id === id ? { ...o, status: 'pourvue' } : o));
  };

  const handleReactiver = (id) => {
    setOffresList(offresList.map(o => o.id === id ? { ...o, status: 'active' } : o));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (modalMode === 'create') {
      const newOffre = {
        ...formData,
        id: Date.now(),
        candidatures: 0,
        status: 'active',
        date_creation: new Date().toLocaleDateString('fr-FR')
      };
      setOffresList([newOffre, ...offresList]);
    } else {
      setOffresList(offresList.map(o => o.id === formData.id ? { ...o, ...formData } : o));
    }
    setIsModalOpen(false);
  };

  return (
    <div className="resp-dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--resp-primary)', margin: 0 }}>
          Gestion des Offres d'Assistant
        </h1>
        <button onClick={handleCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
          <PlusCircle size={20} />
          Créer une offre
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {offresList.map((offre) => (
          <div key={offre.id} style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--resp-border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} className="resp-card-hover">
            
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--resp-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ backgroundColor: offre.status === 'active' ? '#e0e7ff' : '#f1f5f9', padding: '0.75rem', borderRadius: '10px', color: offre.status === 'active' ? 'var(--resp-primary-light)' : 'var(--resp-text-light)' }}>
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--resp-text)', margin: '0 0 0.25rem 0' }}>{offre.matiere}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--resp-text-light)' }}>
                      <Clock size={14} /> Créée le {offre.date_creation}
                    </div>
                  </div>
                </div>
                <div>
                  {offre.status === 'active' ? (
                    <span style={{ backgroundColor: '#dcfce7', color: 'var(--resp-success)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Active
                    </span>
                  ) : (
                    <span style={{ backgroundColor: '#f1f5f9', color: 'var(--resp-text-light)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle size={14} /> Pourvue
                    </span>
                  )}
                </div>
              </div>
              <p style={{ margin: 0, color: 'var(--resp-text)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                {offre.description}
              </p>
            </div>

            <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1, backgroundColor: 'white', border: '1px solid var(--resp-border)', padding: '0.75rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--resp-primary)', lineHeight: 1, marginBottom: '0.25rem' }}>{offre.places}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--resp-text-light)', textTransform: 'uppercase', fontWeight: 600 }}>Places</div>
                </div>
                <div style={{ flex: 1, backgroundColor: 'white', border: '1px solid var(--resp-border)', padding: '0.75rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b', lineHeight: 1, marginBottom: '0.25rem' }}>{offre.candidatures}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--resp-text-light)', textTransform: 'uppercase', fontWeight: 600 }}>Candidats</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', border: '1px solid var(--resp-border)', padding: '0.75rem', borderRadius: '8px' }}>
                <Star size={16} color="#f59e0b" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--resp-text)' }}>Requis :</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--resp-text-light)' }}>{offre.grade_requise}</span>
              </div>
            </div>

            <div style={{ padding: '1rem', borderTop: '1px solid var(--resp-border)', backgroundColor: 'white', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button onClick={() => handleEdit(offre)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', color: 'var(--resp-text)', border: '1px solid var(--resp-border)', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                <Edit2 size={16} />
                Modifier
              </button>
              {offre.status === 'active' ? (
                <button onClick={() => handleFermer(offre.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fef2f2', color: 'var(--resp-danger)', border: '1px solid #fecaca', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                  <Trash2 size={16} />
                  Fermer
                </button>
              ) : (
                <button onClick={() => handleReactiver(offre.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#ecfdf5', color: '#10b981', border: '1px solid #a7f3d0', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                  <RefreshCw size={16} />
                  Réactiver
                </button>
              )}
            </div>
            
          </div>
        ))}
      </div>

      {/* Modal d'édition / création */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}>
              {modalMode === 'create' ? 'Créer une offre' : 'Modifier l\'offre'}
            </h3>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--resp-text)', marginBottom: '0.5rem' }}>Matière</label>
                <input 
                  type="text" 
                  value={formData.matiere}
                  onChange={(e) => setFormData({...formData, matiere: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--resp-border)', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--resp-text)', marginBottom: '0.5rem' }}>Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  rows={3}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--resp-border)', fontSize: '0.95rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--resp-text)', marginBottom: '0.5rem' }}>Lieux / Places</label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.places}
                    onChange={(e) => setFormData({...formData, places: parseInt(e.target.value)})}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--resp-border)', fontSize: '0.95rem' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--resp-text)', marginBottom: '0.5rem' }}>Note requise</label>
                  <input 
                    type="text" 
                    value={formData.grade_requise}
                    onChange={(e) => setFormData({...formData, grade_requise: e.target.value})}
                    required
                    placeholder="ex: 15/20 minimum"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--resp-border)', fontSize: '0.95rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid var(--resp-border)', backgroundColor: 'white', color: 'var(--resp-text)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  style={{ padding: '0.6rem 1.5rem', borderRadius: '6px', border: 'none', backgroundColor: '#0f172a', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ResponsableOffres;
