import { useState, useEffect } from 'react';
import {
  getAdminProfile,
  updateAdminProfile,
  updateAdminPassword,
} from '../../services/api';
import {
  User, Mail, Shield, Bell, Save,
  Camera, Key, Smartphone
} from 'lucide-react';

const AdminProfil = () => {
  const [activeTab, setActiveTab] = useState('infos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    role: '',
    telephone: '',
  });

  const [passwordData, setPasswordData] = useState({
    actuel: '',
    nouveau: '',
    confirmation: ''
  });

  const [notifications, setNotifications] = useState({
    nouvelEtudiant: true,
    nouveauResponsable: true,
    heuresAttente: true,
    exportPret: false,
    alertesIban: true
  });

  useEffect(() => {
    getAdminProfile()
      .then((data) => setFormData(data.profile))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setSubmitError('');
      setSubmitSuccess('');
      await updateAdminProfile({
        prenom: formData.prenom,
        nom: formData.nom,
        telephone: formData.telephone,
      });
      setSubmitSuccess('Profil mis à jour');
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    try {
      setSaving(true);
      setSubmitError('');
      setSubmitSuccess('');
      await updateAdminPassword({
        currentPassword: passwordData.actuel,
        newPassword: passwordData.nouveau,
        confirmPassword: passwordData.confirmation,
      });
      setSubmitSuccess('Mot de passe mis à jour');
      setPasswordData({ actuel: '', nouveau: '', confirmation: '' });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="content-card" style={{ padding: '2rem' }}>Chargement du profil...</div>;
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
      <div className="page-header">
        <h1 className="page-title">Mon profil administrateur</h1>
        <p className="page-subtitle">
          Gérez vos informations personnelles, votre sécurité et vos préférences de notification.
        </p>
        {(submitError || submitSuccess) && (
          <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: submitError ? '#b91c1c' : '#16a34a' }}>
            {submitError || submitSuccess}
          </p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Menu latéral gauche pour le profil */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={() => { setActiveTab('infos'); setSubmitError(''); setSubmitSuccess(''); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem',
              background: activeTab === 'infos' ? 'white' : 'transparent',
              border: activeTab === 'infos' ? '1px solid var(--border-color)' : '1px solid transparent',
              borderRadius: 'var(--radius-md)',
              color: activeTab === 'infos' ? 'var(--primary-dark)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'infos' ? 600 : 500,
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
            }}
          >
            <User size={18} /> Informations personnelles
          </button>
          <button
            onClick={() => { setActiveTab('securite'); setSubmitError(''); setSubmitSuccess(''); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem',
              background: activeTab === 'securite' ? 'white' : 'transparent',
              border: activeTab === 'securite' ? '1px solid var(--border-color)' : '1px solid transparent',
              borderRadius: 'var(--radius-md)',
              color: activeTab === 'securite' ? 'var(--primary-dark)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'securite' ? 600 : 500,
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
            }}
          >
            <Shield size={18} /> Sécurité & Mot de passe
          </button>
          <button
            onClick={() => { setActiveTab('notifications'); setSubmitError(''); setSubmitSuccess(''); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem',
              background: activeTab === 'notifications' ? 'white' : 'transparent',
              border: activeTab === 'notifications' ? '1px solid var(--border-color)' : '1px solid transparent',
              borderRadius: 'var(--radius-md)',
              color: activeTab === 'notifications' ? 'var(--primary-dark)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'notifications' ? 600 : 500,
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
            }}
          >
            <Bell size={18} /> Préférences de notifications
          </button>
        </div>

        {/* Contenu principal de l'onglet */}
        <div className="content-card">
          {activeTab === 'infos' && (
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Informations personnelles</h2>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&q=80"
                    alt="Photo de profil"
                    style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border-color)' }}
                  />
                  <button style={{
                    position: 'absolute', bottom: '0', right: '0',
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'var(--primary-dark)', color: 'white', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                  }}>
                    <Camera size={16} />
                  </button>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--primary-dark)' }}>{formData.prenom} {formData.nom}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Administrateur - {formData.role}</p>
                  <button className="btn-action outline" style={{ marginTop: '0.5rem', fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>
                    Changer la photo
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Prénom</label>
                  <input className="form-input" value={formData.prenom} onChange={(e) => setFormData({...formData, prenom: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Nom</label>
                  <input className="form-input" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Email professionnel (Connexion)</label>
                <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', color: '#9ca3af' }} />
                  <input className="form-input" style={{ paddingLeft: '2.5rem', backgroundColor: '#f9fafb' }} value={formData.email} disabled />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <Smartphone size={16} style={{ position: 'absolute', left: '12px', color: '#9ca3af' }} />
                    <input className="form-input" style={{ paddingLeft: '2.5rem' }} value={formData.telephone || ''} onChange={(e) => setFormData({...formData, telephone: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Rôle / Fonction</label>
                  <input className="form-input" value={formData.role} disabled style={{ backgroundColor: '#f9fafb' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                <button className="btn-action primary" onClick={handleSaveProfile} disabled={saving}>
                  <Save size={16} /> {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'securite' && (
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Sécurité & Mot de passe</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>
                Pour garantir la sécurité de votre compte administrateur, utilisez un mot de passe fort comprenant des chiffres, des lettres et des caractères spéciaux.
              </p>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Mot de passe actuel</label>
                <div style={{ position: 'relative' }}>
                  <Key size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }} />
                  <input type="password" className="form-input" style={{ paddingLeft: '2.5rem' }} value={passwordData.actuel} onChange={(e) => setPasswordData({...passwordData, actuel: e.target.value})} placeholder="••••••••" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="form-group">
                  <label className="form-label">Nouveau mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <Shield size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }} />
                    <input type="password" className="form-input" style={{ paddingLeft: '2.5rem' }} value={passwordData.nouveau} onChange={(e) => setPasswordData({...passwordData, nouveau: e.target.value})} placeholder="••••••••" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Confirmer le nouveau mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <Shield size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }} />
                    <input type="password" className="form-input" style={{ paddingLeft: '2.5rem' }} value={passwordData.confirmation} onChange={(e) => setPasswordData({...passwordData, confirmation: e.target.value})} placeholder="••••••••" />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                <button
                  className="btn-action primary"
                  disabled={saving || !passwordData.actuel || !passwordData.nouveau || passwordData.nouveau !== passwordData.confirmation}
                  onClick={handleSavePassword}
                >
                  <Save size={16} /> {saving ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Préférences de notifications</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>
                Choisissez les alertes que vous souhaitez recevoir par email. Les notifications in-app sont toujours activées.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Nouvel étudiant inscrit</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>M'avertir lorsqu'un étudiant crée son compte.</div>
                  </div>
                  <input type="checkbox" style={{ transform: 'scale(1.2)' }} checked={notifications.nouvelEtudiant} onChange={(e) => setNotifications({...notifications, nouvelEtudiant: e.target.checked})} />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Nouveau responsable pédagogique</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>M'avertir lorsqu'un autre administrateur ajoute un responsable.</div>
                  </div>
                  <input type="checkbox" style={{ transform: 'scale(1.2)' }} checked={notifications.nouveauResponsable} onChange={(e) => setNotifications({...notifications, nouveauResponsable: e.target.checked})} />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Heures en attente de validation longue</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>M'avertir si des heures sont en attente depuis plus de 7 jours.</div>
                  </div>
                  <input type="checkbox" style={{ transform: 'scale(1.2)' }} checked={notifications.heuresAttente} onChange={(e) => setNotifications({...notifications, heuresAttente: e.target.checked})} />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Alertes IBAN manquant</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rapport hebdomadaire des assistants sans IBAN renseigné.</div>
                  </div>
                  <input type="checkbox" style={{ transform: 'scale(1.2)' }} checked={notifications.alertesIban} onChange={(e) => setNotifications({...notifications, alertesIban: e.target.checked})} />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Export de paie prêt</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Notification le 1er du mois pour l'export.</div>
                  </div>
                  <input type="checkbox" style={{ transform: 'scale(1.2)' }} checked={notifications.exportPret} onChange={(e) => setNotifications({...notifications, exportPret: e.target.checked})} />
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                <button className="btn-action primary">
                  <Save size={16} /> Enregistrer les préférences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminProfil;
