import { useState, useEffect, useCallback } from 'react';
import {
  getAdminSchoolSettings,
  updateAdminSchoolSettings,
  addAdminFiliere,
  deleteAdminFiliere,
} from '../../services/api';
import {
  Save, Pencil, Trash2, Plus, Info
} from 'lucide-react';

const AdminParametres = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nomEcole: '',
    acronyme: '',
    domaineEmail: '',
    adresse: '',
    ville: '',
    telephone: '',
    tauxHoraire: '',
    logoUrl: '',
  });

  const [filieres, setFilieres] = useState([]);
  const [newFiliere, setNewFiliere] = useState('');

  const loadData = useCallback(async () => {
    try {
      setError('');
      const data = await getAdminSchoolSettings();
      setFormData(data.school);
      setFilieres(data.filieres);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError('');
      setSaveSuccess('');
      await updateAdminSchoolSettings({
        nomEcole: formData.nomEcole,
        adresse: formData.adresse,
        ville: formData.ville,
        telephone: formData.telephone,
        tauxHoraire: formData.tauxHoraire,
      });
      setSaveSuccess('Paramètres enregistrés');
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddFiliere = async () => {
    const name = newFiliere.trim();
    if (!name) return;

    try {
      setSaveError('');
      const data = await addAdminFiliere(name);
      setFilieres([...filieres, data.filiere]);
      setNewFiliere('');
    } catch (err) {
      setSaveError(err.message);
    }
  };

  const handleRemoveFiliere = async (id) => {
    try {
      setSaveError('');
      await deleteAdminFiliere(id);
      setFilieres(filieres.filter((f) => f.id !== id));
    } catch (err) {
      setSaveError(err.message);
    }
  };

  if (loading) {
    return <div className="content-card" style={{ padding: '2rem' }}>Chargement des paramètres...</div>;
  }

  if (error) {
    return (
      <div className="content-card" style={{ padding: '2rem', color: '#b91c1c' }}>
        {error}
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-row">
          <div>
            <h1 className="page-title" style={{ color: '#7c3aed' }}>Paramètres école</h1>
            <p className="page-subtitle">
              Configurez les informations administratives, les taux horaires et les
              filières de formation de l'établissement {formData.nomEcole}.
            </p>
          </div>
          <button
            className="btn-action primary"
            style={{ padding: '0.875rem 1.5rem', fontSize: '0.9rem' }}
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={18} /> {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
        {(saveError || saveSuccess) && (
          <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: saveError ? '#b91c1c' : '#16a34a' }}>
            {saveError || saveSuccess}
          </p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Colonne gauche — Formulaires */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Informations Générales */}
          <div className="content-card">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={20} color="#6b7280" /> Informations Générales
            </h2>

            <div className="form-group">
              <label className="form-label">Nom de l'école</label>
              <input className="form-input" value={formData.nomEcole} onChange={(e) => setFormData({ ...formData, nomEcole: e.target.value })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Acronyme</label>
                <input className="form-input" value={formData.acronyme} disabled style={{ backgroundColor: '#f9fafb' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Domaine Email autorisé</label>
                <input className="form-input" value={formData.domaineEmail} disabled style={{ backgroundColor: '#f9fafb' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Adresse complète</label>
              <input className="form-input" value={formData.adresse} onChange={(e) => setFormData({ ...formData, adresse: e.target.value })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Ville</label>
                <input className="form-input" value={formData.ville} onChange={(e) => setFormData({ ...formData, ville: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Téléphone</label>
                <input className="form-input" value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Facturation & Taux */}
          <div className="content-card">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              💰 Facturation & Taux
            </h2>

            <div className="form-group">
              <label className="form-label">Taux horaire par défaut</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  className="form-input"
                  style={{ maxWidth: '150px', fontWeight: 700, fontSize: '1.25rem' }}
                  value={formData.tauxHoraire}
                  onChange={(e) => setFormData({ ...formData, tauxHoraire: e.target.value })}
                />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>€ / h</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                Ce taux sera appliqué à tous les nouveaux suivis d'heures.
              </p>
            </div>
          </div>
        </div>

        {/* Colonne droite */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Logo */}
          <div className="content-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>
              Logo de l'établissement
            </div>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
              <div style={{
                width: 140, height: 140, borderRadius: 'var(--radius-md)', border: '2px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
                background: '#f8fafc', overflow: 'hidden'
              }}>
                <img
                  src={formData.logoUrl || 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'}
                  alt="Logo école"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <button style={{
                position: 'absolute', bottom: -5, right: -5, width: 32, height: 32,
                borderRadius: '50%', background: 'var(--primary-dark)', color: 'white',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Pencil size={14} />
              </button>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>JPG, PNG ou SVG. Max 2MB.</p>
          </div>

          {/* Filières */}
          <div className="content-card">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎓 Filières / Cours
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {filieres.map((f) => (
                <div key={f.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem 1rem', border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 500
                }}>
                  {f.name}
                  <button onClick={() => handleRemoveFiliere(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                className="form-input"
                placeholder="Nouvelle filière en attente..."
                value={newFiliere}
                onChange={(e) => setNewFiliere(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddFiliere()}
                style={{ flex: 1, fontSize: '0.8rem' }}
              />
              <button className="btn-action primary" onClick={handleAddFiliere} style={{ padding: '0.5rem 0.75rem' }}>
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '2rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        Dernière modification le 24 Mai 2024 par l'administrateur principal.
      </div>
    </>
  );
};

export default AdminParametres;
