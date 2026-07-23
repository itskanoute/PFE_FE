import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, CheckCircle2, CloudUpload, ArrowRight } from 'lucide-react';
import { getDashboardPath, registerSchool, saveAuth } from '../../services/api';

const RegisterSchool = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    schoolName: '',
    acronym: '',
    emailDomain: '',
    address: '',
    city: '',
    phone: '',
    contactName: '',
    contactEmail: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const alertRef = useRef(null);
  const fileInputRef = useRef(null);

  const expectedDomain = (() => {
    let value = formData.emailDomain.trim().replace(/^@+/, '').toLowerCase();
    if (value.includes('@')) value = value.split('@').pop();
    return value;
  })();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setError('Format non autorisé. Utilisez PNG, JPG ou SVG.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Le logo ne doit pas dépasser 5 Mo.');
      return;
    }

    setError('');
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await registerSchool(formData, logoFile);
      saveAuth(data);
      setSuccess(data.message);
      setTimeout(() => navigate(data.redirectTo || getDashboardPath(data.user.role)), 1500);
    } catch (err) {
      setError(err.message);
      alertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <header className="app-header">
        <Link to="/" className="logo-container">
          <GraduationCap size={28} />
          <span>EduManage</span>
        </Link>
      </header>

      <main className="auth-content" style={{ padding: '4rem 1rem' }}>
        <div className="register-school-container">
          <div className="register-info-panel">
            <h1 className="auth-title" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              Inscrivez votre<br />établissement
            </h1>
            <p className="auth-subtitle" style={{ textAlign: 'left', color: '#4b5563', fontSize: '1rem' }}>
              Rejoignez le réseau EduManage et centralisez la gestion de vos étudiants, professeurs et infrastructures académiques sur une plateforme unique et sécurisée.
            </p>

            <ul className="check-list">
              <li className="check-item">
                <CheckCircle2 size={20} className="check-icon" />
                Tableaux de bord personnalisés
              </li>
              <li className="check-item">
                <CheckCircle2 size={20} className="check-icon" />
                Gestion sécurisée des données
              </li>
              <li className="check-item">
                <CheckCircle2 size={20} className="check-icon" />
                Support premium 24/7
              </li>
            </ul>
          </div>

          <div className="register-form-panel">
            <div className="auth-card" style={{ maxWidth: '100%' }} ref={alertRef}>
              {error && (
                <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '6px', marginBottom: '1rem', fontSize: '14px' }}>
                  {error}
                </div>
              )}

              {success && (
                <div style={{ background: '#ecfdf5', color: '#047857', padding: '12px', borderRadius: '6px', marginBottom: '1rem', fontSize: '14px' }}>
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <h2 className="section-title">Identité de l'école</h2>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="schoolName">Nom de l'école</label>
                  <input id="schoolName" type="text" className="form-input" placeholder="ex: ESCP Business School" value={formData.schoolName} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="acronym">Sigle</label>
                  <input id="acronym" type="text" className="form-input" placeholder="ex: ESCP" value={formData.acronym} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="emailDomain">Domaine email institutionnel</label>
                  <div className="input-wrapper">
                    <div className="input-icon-left" style={{ color: '#0f0535', fontWeight: 600 }}>@</div>
                    <input id="emailDomain" type="text" className="form-input has-icon-left" placeholder="escp.eu" value={formData.emailDomain} onChange={handleChange} required />
                  </div>
                  <div className="helper-text" style={{ marginTop: '0.5rem', color: '#4b5563' }}>
                    Ex. <strong>escp.eu</strong> pour l’école. Les emails @{expectedDomain || 'escp.eu'} <strong>et</strong> @gmail.com sont acceptés (pratique pour tester).
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Logo de l'établissement</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                    onChange={handleLogoSelect}
                    style={{ display: 'none' }}
                  />
                  <div
                    className="upload-box"
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                  >
                    {logoPreview ? (
                      <>
                        <img src={logoPreview} alt="Aperçu du logo" style={{ maxHeight: '80px', maxWidth: '100%', objectFit: 'contain' }} />
                        <span>{logoFile?.name}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleRemoveLogo(); }}
                          style={{ fontSize: '0.75rem', color: '#b91c1c', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Supprimer
                        </button>
                      </>
                    ) : (
                      <>
                        <CloudUpload size={28} color="#6b7280" />
                        <p>Cliquez pour téléverser ou glissez-déposez</p>
                        <span>PNG, JPG ou SVG (Max. 5MB)</span>
                      </>
                    )}
                  </div>
                </div>

                <h2 className="section-title">Localisation & Contact</h2>

                <div className="form-group">
                  <label className="form-label" htmlFor="address">Adresse</label>
                  <input id="address" type="text" className="form-input" placeholder="Rue, numéro, quartier" value={formData.address} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="city">Ville</label>
                  <input id="city" type="text" className="form-input" placeholder="Paris" value={formData.city} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Téléphone</label>
                  <input id="phone" type="text" className="form-input" placeholder="+33 1 49 23 20 00" value={formData.phone} onChange={handleChange} required />
                </div>

                <h2 className="section-title">Compte Administrateur Principal</h2>

                <div className="form-group">
                  <label className="form-label" htmlFor="contactName">Nom complet du contact admin</label>
                  <input id="contactName" type="text" className="form-input" placeholder="Jean Dupont" value={formData.contactName} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="contactEmail">Email administrateur</label>
                  <input id="contactEmail" type="email" className="form-input" placeholder="kanoutecoumba00@gmail.com" value={formData.contactEmail} onChange={handleChange} required />
                  {expectedDomain && (
                    <div className="helper-text" style={{ marginTop: '0.5rem', color: '#047857' }}>
                      Accepté : @{expectedDomain} ou @gmail.com
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="password">Mot de passe</label>
                  <input id="password" type="password" className="form-input" value={formData.password} onChange={handleChange} required minLength="8" />
                </div>

                <div className="form-group mb-6">
                  <label className="form-label" htmlFor="confirmPassword">Confirmation</label>
                  <input id="confirmPassword" type="password" className="form-input" value={formData.confirmPassword} onChange={handleChange} required minLength="8" />
                </div>

                <button type="submit" className="btn-primary" style={{ padding: '16px', fontSize: '16px' }} disabled={loading}>
                  {loading ? 'Création en cours...' : 'Créer le compte école'} <ArrowRight size={20} />
                </button>
                
                <p className="terms-text">
                  En cliquant sur ce bouton, vous acceptez nos <a href="#">conditions générales d'utilisation</a> et notre <a href="#">politique de confidentialité</a>.
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <Link to="/" className="logo-container" style={{ marginBottom: '1rem' }}>
          <GraduationCap size={24} />
          <span style={{ fontSize: '1.125rem' }}>EduManage</span>
        </Link>
        <div className="footer-links" style={{ gap: '2rem' }}>
          <a href="#" className="footer-link">Confidentialité</a>
          <a href="#" className="footer-link">Conditions</a>
          <a href="#" className="footer-link">Contact</a>
        </div>
        <div className="footer-version" style={{ marginTop: '1rem' }}>
          © 2024 EduManage. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};

export default RegisterSchool;
