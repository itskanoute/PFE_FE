import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Bell, 
  Lock, 
  Save, 
  Camera,
  CheckCircle2
} from 'lucide-react';
import './responsable.css';

const ResponsableProfil = () => {
  const [profileData, setProfileData] = useState({
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@ecole.fr',
    phone: '+33 6 12 34 56 78',
    role: 'Administrateur Pédagogique'
  });

  const [notifications, setNotifications] = useState({
    emailNouvelleCandidature: true,
    emailHeuresAValider: true,
    emailUrgenceSeance: true,
    smsUrgence: false
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleToggle = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }
    alert("Mot de passe mis à jour avec succès !");
    setIsPasswordModalOpen(false);
    setPasswords({ old: '', new: '', confirm: '' });
  };

  return (
    <div className="resp-dashboard" style={{ paddingBottom: '3rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          Mon Profil & Paramètres
        </h1>
        <p style={{ color: '#475569', fontSize: '1rem', maxWidth: '800px', margin: 0 }}>
          Gérez vos informations personnelles et vos préférences de notification.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* Left Column - Profile Info */}
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Avatar Card */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <div style={{ width: '100px', height: '100px', backgroundColor: '#e0e7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3730a3', fontSize: '2.5rem', fontWeight: 800 }}>
                JD
              </div>
              <input type="file" id="avatar-upload" style={{ display: 'none' }} accept="image/*" onChange={(e) => { if(e.target.files.length > 0) alert("Photo de profil mise à jour !"); }} />
              <button onClick={() => document.getElementById('avatar-upload').click()} style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#0f172a', color: 'white', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid white' }}>
                <Camera size={16} />
              </button>
            </div>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{profileData.firstName} {profileData.lastName}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem', backgroundColor: '#f1f5f9', padding: '0.4rem 1rem', borderRadius: '20px' }}>
              <Shield size={14} color="#3b82f6" />
              {profileData.role}
            </div>
          </div>

          {/* Security Card */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
              <Lock size={20} color="#0f172a" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Sécurité</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button onClick={() => setIsPasswordModalOpen(true)} style={{ backgroundColor: 'transparent', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.8rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' }}>
                Changer le mot de passe
              </button>
              <button onClick={() => alert('Vous avez été déconnecté de tous les autres appareils avec succès.')} style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.8rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' }}>
                Déconnexion de tous les appareils
              </button>
            </div>
          </div>
          
        </div>

        {/* Right Column - Forms */}
        <div style={{ flex: '2 1 600px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <form onSubmit={handleSave}>
            {/* Personal Info */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#f8fafc' }}>
                <User size={20} color="#0f172a" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Informations Personnelles</h3>
              </div>
              
              <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Prénom</label>
                  <input 
                    type="text" 
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#0f172a' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Nom</label>
                  <input 
                    type="text" 
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#0f172a' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Adresse Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)' }} />
                    <input 
                      type="email" 
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#0f172a' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Téléphone</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)' }} />
                    <input 
                      type="tel" 
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#0f172a' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#f8fafc' }}>
                <Bell size={20} color="#0f172a" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Préférences de Notification</h3>
              </div>
              
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                {/* Toggle 1 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.2rem' }}>Nouvelles candidatures</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>M'alerter par email lorsqu'un étudiant postule.</div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <div style={{ position: 'relative' }}>
                      <input type="checkbox" checked={notifications.emailNouvelleCandidature} onChange={() => handleToggle('emailNouvelleCandidature')} style={{ srOnly: true, opacity: 0, width: 0, height: 0 }} />
                      <div style={{ display: 'block', backgroundColor: notifications.emailNouvelleCandidature ? '#10b981' : '#cbd5e1', width: '3rem', height: '1.5rem', borderRadius: '9999px', transition: 'background-color 0.2s' }}></div>
                      <div style={{ position: 'absolute', left: notifications.emailNouvelleCandidature ? '1.6rem' : '0.2rem', top: '0.2rem', backgroundColor: 'white', width: '1.1rem', height: '1.1rem', borderRadius: '50%', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }}></div>
                    </div>
                  </label>
                </div>

                {/* Toggle 2 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.2rem' }}>Heures à valider</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Résumé hebdomadaire des relevés d'heures en attente.</div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <div style={{ position: 'relative' }}>
                      <input type="checkbox" checked={notifications.emailHeuresAValider} onChange={() => handleToggle('emailHeuresAValider')} style={{ srOnly: true, opacity: 0, width: 0, height: 0 }} />
                      <div style={{ display: 'block', backgroundColor: notifications.emailHeuresAValider ? '#10b981' : '#cbd5e1', width: '3rem', height: '1.5rem', borderRadius: '9999px', transition: 'background-color 0.2s' }}></div>
                      <div style={{ position: 'absolute', left: notifications.emailHeuresAValider ? '1.6rem' : '0.2rem', top: '0.2rem', backgroundColor: 'white', width: '1.1rem', height: '1.1rem', borderRadius: '50%', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }}></div>
                    </div>
                  </label>
                </div>

                {/* Toggle 3 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.2rem' }}>Désistement de dernière minute</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Recevoir un SMS en cas d'urgence sur une séance.</div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <div style={{ position: 'relative' }}>
                      <input type="checkbox" checked={notifications.smsUrgence} onChange={() => handleToggle('smsUrgence')} style={{ srOnly: true, opacity: 0, width: 0, height: 0 }} />
                      <div style={{ display: 'block', backgroundColor: notifications.smsUrgence ? '#10b981' : '#cbd5e1', width: '3rem', height: '1.5rem', borderRadius: '9999px', transition: 'background-color 0.2s' }}></div>
                      <div style={{ position: 'absolute', left: notifications.smsUrgence ? '1.6rem' : '0.2rem', top: '0.2rem', backgroundColor: 'white', width: '1.1rem', height: '1.1rem', borderRadius: '50%', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }}></div>
                    </div>
                  </label>
                </div>

              </div>
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.5rem' }}>
              {isSaved && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 600, animation: 'fadeIn 0.3s ease-in-out' }}>
                  <CheckCircle2 size={18} />
                  Modifications enregistrées !
                </div>
              )}
              <button type="submit" style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '8px', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <Save size={20} />
                Enregistrer les modifications
              </button>
            </div>
            
          </form>

        </div>
      </div>

      {/* Modal Changement Mot de Passe */}
      {isPasswordModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Changer le mot de passe</h3>
              <button onClick={() => setIsPasswordModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.5rem' }}>
                <Shield size={20} />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Mot de passe actuel</label>
                <input 
                  type="password" 
                  value={passwords.old}
                  onChange={(e) => setPasswords({...passwords, old: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Nouveau mot de passe</label>
                <input 
                  type="password" 
                  value={passwords.new}
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Confirmer le nouveau mot de passe</label>
                <input 
                  type="password" 
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsPasswordModalOpen(false)} style={{ backgroundColor: 'transparent', color: '#475569', border: '1px solid #cbd5e1', padding: '0.6rem 1.5rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                  Annuler
                </button>
                <button type="submit" style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                  Mettre à jour
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default ResponsableProfil;
