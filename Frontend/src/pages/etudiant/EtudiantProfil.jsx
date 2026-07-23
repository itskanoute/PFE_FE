import React, { useState, useEffect } from 'react';
import { Camera, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { getEtudiantProfil, updateEtudiantProfil, updateEtudiantPassword } from '../../services/api';

const EtudiantProfil = () => {
  const { refreshLayout } = useOutletContext() || {};

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    school: '',
    role: '',
    verified: false,
  });

  const [phone, setPhone] = useState('');
  const [filiere, setFiliere] = useState('');
  const [annee, setAnnee] = useState('');
  const [ibanMissing, setIbanMissing] = useState(false);

  const [banque, setBanque] = useState({
    titulaire: '',
    iban: '',
    bic: ''
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [initialState, setInitialState] = useState({ phone: '', filiere: '', annee: '', banque: { titulaire: '', iban: '', bic: '' } });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const applyProfile = (profile) => {
    const nextPhone = profile.phone || '';
    const nextFiliere = profile.filiere || '';
    const nextAnnee = profile.annee || '';
    const nextBanque = {
      titulaire: profile.banque?.titulaire || '',
      iban: profile.banque?.iban || '',
      bic: profile.banque?.bic || '',
    };

    setProfileData({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      email: profile.email || '',
      studentId: profile.studentId || '',
      school: profile.school || '',
      role: profile.role || '',
      verified: Boolean(profile.verified),
    });
    setPhone(nextPhone);
    setFiliere(nextFiliere);
    setAnnee(nextAnnee);
    setBanque(nextBanque);
    setIbanMissing(Boolean(profile.ibanMissing));
    setInitialState({ phone: nextPhone, filiere: nextFiliere, annee: nextAnnee, banque: nextBanque });
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    getEtudiantProfil()
      .then((data) => {
        if (data.profile) applyProfile(data.profile);
      })
      .catch((err) => setError(err.message || 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (passwords.new || passwords.confirm || passwords.current) {
      if (!passwords.current || !passwords.new || !passwords.confirm) {
        alert('Veuillez remplir tous les champs mot de passe.');
        return;
      }
      if (passwords.new !== passwords.confirm) {
        alert("Les nouveaux mots de passe ne correspondent pas !");
        return;
      }
    }

    setSaving(true);
    setError('');
    try {
      await updateEtudiantProfil({
        phone,
        titulaire: banque.titulaire,
        iban: banque.iban,
        bic: banque.bic,
      });

      if (passwords.current && passwords.new && passwords.confirm) {
        await updateEtudiantPassword({
          currentPassword: passwords.current,
          newPassword: passwords.new,
          confirmPassword: passwords.confirm,
        });
      }

      const refreshed = await getEtudiantProfil();
      if (refreshed.profile) applyProfile(refreshed.profile);
      setPasswords({ current: '', new: '', confirm: '' });
      refreshLayout?.();
      alert("Profil mis à jour avec succès !");
    } catch (err) {
      alert(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
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

  const avatarName = `${profileData.firstName} ${profileData.lastName}`.trim() || 'Etudiant';
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarName)}&background=1e1b4b&color=fff&size=100`;

  if (loading) {
    return <div style={{ color: '#64748b', padding: '2rem' }}>Chargement du profil…</div>;
  }

  return (
    <div style={{ paddingBottom: '3rem' }}>

      {error && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {ibanMissing && (
        <div className="etudiant-alert" style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={18} />
            <span><span style={{ fontWeight: 700 }}>Profil incomplet</span> — Veuillez renseigner votre IBAN</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '16px', overflow: 'hidden', border: '2px solid #e2e8f0' }}>
            <img src={avatarUrl} alt={avatarName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                {annee && !['Licence 1 (L1)', 'Licence 2 (L2)', 'Licence 3 (L3)', 'Master 1 (M1)', 'Master 2 (M2)'].includes(annee) && (
                  <option value={annee}>{annee}</option>
                )}
              </select>
            </div>
          </div>
        </div>

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
                {banque.iban && (
                  <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#16a34a' }}>
                    <CheckCircle2 size={16} />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase' }}>BIC</label>
              <input type="text" value={banque.bic} onChange={e => setBanque({...banque, bic: e.target.value})} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', color: '#0f172a', letterSpacing: '1px' }} />
            </div>
          </div>
        </div>

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

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <button onClick={handleCancel} style={{ backgroundColor: 'white', color: '#475569', border: '1px solid #cbd5e1', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
            Annuler
          </button>
          <button onClick={handleSave} disabled={saving} style={{ backgroundColor: '#1e1b4b', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>
        </div>

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
