import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Briefcase, Star, Clock, Edit2, Trash2, PlusCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import {
  getResponsableOffers,
  createResponsableOffer,
  updateResponsableOffer,
  toggleResponsableOfferStatus,
} from '../../services/api';
import './responsable.css';

const ResponsableOffres = () => {
  const { searchTerm = '' } = useOutletContext() || {};
  const [offresList, setOffresList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formData, setFormData] = useState({ matiere: '', description: '', places: 1, grade_requise: '' });

  const filteredOffres = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return offresList;
    return offresList.filter((o) =>
      (o.matiere || o.titre || '').toLowerCase().includes(q) ||
      (o.description || '').toLowerCase().includes(q) ||
      (o.niveau || o.level || '').toLowerCase().includes(q)
    );
  }, [offresList, searchTerm]);

  const loadOffers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getResponsableOffers();
      setOffresList(data.offers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

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

  const handleToggleStatus = async (id) => {
    try {
      await toggleResponsableOfferStatus(id);
      loadOffers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modalMode === 'create') {
        await createResponsableOffer(formData);
      } else {
        await updateResponsableOffer(formData.id, formData);
      }
      setIsModalOpen(false);
      loadOffers();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="resp-dashboard" style={{ padding: '2rem' }}>
        Chargement des offres...
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
          Gestion des Offres d'Assistant
        </h1>
        <button onClick={handleCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
          <PlusCircle size={20} />
          Créer une offre
        </button>
      </div>

      {offresList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--resp-border)' }}>
          <Briefcase size={48} color="var(--resp-text-light)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3 style={{ color: 'var(--resp-text)', marginBottom: '0.5rem' }}>Aucune offre</h3>
          <p style={{ color: 'var(--resp-text-light)' }}>Créez votre première offre d'assistant.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {filteredOffres.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--resp-text-light)' }}>
              {searchTerm.trim() ? 'Aucune offre ne correspond à la recherche.' : 'Aucune offre pour le moment.'}
            </div>
          ) : filteredOffres.map((offre) => (
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
                  <button onClick={() => handleToggleStatus(offre.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fef2f2', color: 'var(--resp-danger)', border: '1px solid #fecaca', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                    <Trash2 size={16} />
                    Fermer
                  </button>
                ) : (
                  <button onClick={() => handleToggleStatus(offre.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#ecfdf5', color: '#10b981', border: '1px solid #a7f3d0', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                    <RefreshCw size={16} />
                    Réactiver
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}>
              {modalMode === 'create' ? 'Créer une offre' : "Modifier l'offre"}
            </h3>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--resp-text)', marginBottom: '0.5rem' }}>Matière</label>
                <input
                  type="text"
                  value={formData.matiere}
                  onChange={(e) => setFormData({ ...formData, matiere: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--resp-border)', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--resp-text)', marginBottom: '0.5rem' }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, places: parseInt(e.target.value, 10) })}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--resp-border)', fontSize: '0.95rem' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--resp-text)', marginBottom: '0.5rem' }}>Note requise</label>
                  <input
                    type="text"
                    value={formData.grade_requise}
                    onChange={(e) => setFormData({ ...formData, grade_requise: e.target.value })}
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
                  disabled={saving}
                  style={{ padding: '0.6rem 1.5rem', borderRadius: '6px', border: 'none', backgroundColor: '#0f172a', color: 'white', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
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
