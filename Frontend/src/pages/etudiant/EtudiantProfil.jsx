import React, { useState } from 'react';
import { Camera, Lock, CheckCircle2, AlertTriangle, Check } from 'lucide-react';

const EtudiantProfil = () => {
  const [profileData] = useState({
    firstName: 'Léa',
    lastName: 'Martin',
    email: 'lea.martin@escp.eu',
    studentId: '20230456',
    school: 'ESCP Business School',
    role: 'Master in Management (MiM)',
    verified: true,
  });

  const [phone, setPhone] = useState('06 12 34 56 78');
  const [filiere, setFiliere] = useState('Informatique');
  const [annee, setAnnee] = useState('Licence 3 (L3)');

  const [banque, setBanque] = useState({
    titulaire: 'Léa Martin',
    iban: 'FR76 1234 5678 9012 3456 7890 123',
    bic: 'BNPAFRPP'
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // State for restoring on Cancel
  const [initialState, setInitialState] = useState({ phone, filiere, annee, banque });

  const handleSave = () => {
    if (passwords.new && passwords.new !== passwords.confirm) {
      alert("Les nouveaux mots de passe ne correspondent pas !");
      return;
    }
    alert("Profil mis à jour avec succès !");
    setInitialState({ phone, filiere, annee, banque });
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleCancel = () => {
    setPhone(initialState.phone);
    setFiliere(initialState.filiere);
    setAnnee(initialState.annee);
    setBanque(initialState.banque);
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement votre espace ? Cette action est irréversible.")) {
      alert("Demande de suppression envoyée à l'administration.");
    }
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      
      {/* Missing IBAN Alert (example, though here it's filled, let's keep the UI from mockup) */}
      <div className="etudiant-alert" style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertTriangle size={18} />
          <span><span style={{ fontWeight: 700 }}>Profil incomplet</span> — Veuillez renseigner votre IBAN</span>
        </div>
      </div>

      {/* Header Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '16px', overflow: 'hidden', border: '2px solid #e2e8f0' }}>
            <img src="https://ui-avatars.com/api/?name=Lea+Martin&background=1e1b4b&color=fff&size=100" alt="Léa Martin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <button style={{ position: 'absolute', bottom: '-10px', right: '-10px', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1e1b4b', color: 'white', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Camera size={16} />
          </button>
        </div>
        
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>{profileData.firstName} {profileData.lastName}</h1>
          <p style={{ fontSize: '0.9rem', color: '#475569', margin: '0 0 0.5rem 0' }}>{profileData.role} • {profileData.school}</p>
        </div>

        {profileData.verified && (
          <div style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} />
            Étudiant vérifié
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Read-only Personal Info */}
        <div className="etudiant-card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Informations Personnelles <Lock size={16} color="#94a3b8" />
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Nom</label>
              <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {profileData.lastName} <Lock size={14} color="#cbd5e1" />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Prénom</label>
              <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {profileData.firstName} <Lock size={14} color="#cbd5e1" />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase' }}>N° Étudiant</label>
              <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {profileData.studentId} <Lock size={14} color="#cbd5e1" />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Email</label>
              <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {profileData.email} <Lock size={14} color="#cbd5e1" />
              </div>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase' }}>École</label>
              <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {profileData.school} <Lock size={14} color="#cbd5e1" />
              </div>
            </div>
          </div>
        </div>

        {/* Editable Info */}
        <div className="etudiant-card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1.5rem 0' }}>Informations Modifiables</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Téléphone</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Filière</label>
              <input type="text" value={filiere} onChange={e => setFiliere(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a' }} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Année d'études</label>
              <select value={annee} onChange={e => setAnnee(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a', backgroundColor: 'white' }}>
                <option value="Licence 1 (L1)">Licence 1 (L1)</option>
                <option value="Licence 2 (L2)">Licence 2 (L2)</option>
                <option value="Licence 3 (L3)">Licence 3 (L3)</option>
                <option value="Master 1 (M1)">Master 1 (M1)</option>
                <option value="Master 2 (M2)">Master 2 (M2)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bank Info */}
        <div className="etudiant-card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1.5rem 0' }}>Informations Bancaires</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Titulaire du compte</label>
              <input type="text" value={banque.titulaire} onChange={e => setBanque({...banque, titulaire: e.target.value})} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase' }}>IBAN</label>
              <div style={{ position: 'relative' }}>
                <input type="text" value={banque.iban} onChange={e => setBanque({...banque, iban: e.target.value})} style={{ width: '100%', padding: '0.75rem 1rem', paddingRight: '2.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a', letterSpacing: '1px' }} />
                <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#16a34a' }}>
                  <CheckCircle2 size={16} />
                </div>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase' }}>BIC</label>
              <input type="text" value={banque.bic} onChange={e => setBanque({...banque, bic: e.target.value})} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a', letterSpacing: '1px' }} />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="etudiant-card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1.5rem 0' }}>Sécurité</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Mot de passe actuel</label>
              <input type="password" placeholder="********" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Nouveau mot de passe</label>
              <input type="password" placeholder="********" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Confirmer le mot de passe</label>
              <input type="password" placeholder="********" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a' }} />
            </div>
          </div>
        </div>

        {/* Save Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <button onClick={handleCancel} style={{ backgroundColor: 'white', color: '#475569', border: '1px solid #cbd5e1', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
            Annuler
          </button>
          <button onClick={handleSave} style={{ backgroundColor: '#1e1b4b', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
            Enregistrer les modifications
          </button>
        </div>

        {/* Danger Zone */}
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#dc2626', margin: '0 0 0.25rem 0' }}>Supprimer le compte</h3>
            <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0 }}>Cette action est irréversible. Toutes vos données seront effacées.</p>
          </div>
          <button onClick={handleDeleteAccount} style={{ backgroundColor: 'transparent', border: '1px solid #fca5a5', color: '#ef4444', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
            Supprimer mon espace
          </button>
        </div>

      </div>
    </div>
  );
};

export default EtudiantProfil;
