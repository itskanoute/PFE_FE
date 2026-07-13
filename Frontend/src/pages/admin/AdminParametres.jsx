import { useState } from 'react';
import {
  Save, Pencil, Trash2, Plus, Info
} from 'lucide-react';

const AdminParametres = () => {
  const [formData, setFormData] = useState({
    nomEcole: 'ESCP Business School',
    acronyme: 'ESCP',
    domaineEmail: '@escp.eu',
    adresse: '79 Avenue de la République',
    ville: 'Paris',
    telephone: '+33 1 49 23 20 00',
    tauxHoraire: '12.00',
  });

  const [filieres, setFilieres] = useState([
    'Master in Management (MiM)',
    'MBA in International Management',
    'Executive MBA (EMBA)',
  ]);
  const [newFiliere, setNewFiliere] = useState('');

  const handleAddFiliere = () => {
    if (newFiliere.trim()) {
      setFilieres([...filieres, newFiliere.trim()]);
      setNewFiliere('');
    }
  };

  const handleRemoveFiliere = (index) => {
    setFilieres(filieres.filter((_, i) => i !== index));
  };

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
          <button className="btn-action primary" style={{ padding: '0.875rem 1.5rem', fontSize: '0.9rem' }}>
            <Save size={18} /> Enregistrer les modifications
          </button>
        </div>
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
                <input className="form-input" value={formData.acronyme} onChange={(e) => setFormData({ ...formData, acronyme: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Domaine Email autorisé</label>
                <input className="form-input" value={formData.domaineEmail} onChange={(e) => setFormData({ ...formData, domaineEmail: e.target.value })} />
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
                  src="https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
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
              {filieres.map((f, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem 1rem', border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 500
                }}>
                  {f}
                  <button onClick={() => handleRemoveFiliere(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>
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
