import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, CheckCircle2, CloudUpload, ArrowRight } from 'lucide-react';

const RegisterSchool = () => {
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Register school:', formData);
  };

  return (
    <div className="auth-layout">
      {/* Header */}
      <header className="app-header">
        <Link to="/" className="logo-container">
          <GraduationCap size={28} />
          <span>EduManage</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="auth-content" style={{ padding: '4rem 1rem' }}>
        <div className="register-school-container">
          {/* Left Panel */}
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

          {/* Right Panel - Form */}
          <div className="register-form-panel">
            <div className="auth-card" style={{ maxWidth: '100%' }}>
              <form onSubmit={handleSubmit}>
                
                {/* Section 1 */}
                <h2 className="section-title">Identité de l'école</h2>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="schoolName">Nom de l'école</label>
                  <input id="schoolName" type="text" className="form-input" placeholder="ex: ESCP Business School" onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="acronym">Sigle</label>
                  <input id="acronym" type="text" className="form-input" placeholder="ex: ESCP" onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="emailDomain">Domaine email institutionnel</label>
                  <div className="input-wrapper">
                    <div className="input-icon-left" style={{ color: '#0f0535', fontWeight: 600 }}>@</div>
                    <input id="emailDomain" type="text" className="form-input has-icon-left" placeholder="escp.eu" onChange={handleChange} required />
                  </div>
                  <div className="helper-text" style={{ marginTop: '0.5rem', color: '#4b5563' }}>
                    Ceci permettra de valider automatiquement les inscriptions de vos étudiants.
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Logo de l'établissement</label>
                  <div className="upload-box">
                    <CloudUpload size={28} color="#6b7280" />
                    <p>Cliquez pour téléverser ou glissez-déposez</p>
                    <span>PNG, JPG ou SVG (Max. 5MB)</span>
                  </div>
                </div>

                {/* Section 2 */}
                <h2 className="section-title">Localisation & Contact</h2>

                <div className="form-group">
                  <label className="form-label" htmlFor="address">Adresse</label>
                  <input id="address" type="text" className="form-input" placeholder="Rue, numéro, quartier" onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="city">Ville</label>
                  <input id="city" type="text" className="form-input" placeholder="Paris" onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Téléphone</label>
                  <input id="phone" type="text" className="form-input" placeholder="+33 1 49 23 20 00" onChange={handleChange} required />
                </div>

                {/* Section 3 */}
                <h2 className="section-title">Compte Administrateur Principal</h2>

                <div className="form-group">
                  <label className="form-label" htmlFor="contactName">Nom complet du contact admin</label>
                  <input id="contactName" type="text" className="form-input" placeholder="Jean Dupont" onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="contactEmail">Email administrateur</label>
                  <input id="contactEmail" type="email" className="form-input" placeholder="admin@escp.eu" onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="password">Mot de passe</label>
                  <input id="password" type="password" className="form-input" onChange={handleChange} required minLength="8" />
                </div>

                <div className="form-group mb-6">
                  <label className="form-label" htmlFor="confirmPassword">Confirmation</label>
                  <input id="confirmPassword" type="password" className="form-input" onChange={handleChange} required minLength="8" />
                </div>

                <button type="submit" className="btn-primary" style={{ padding: '16px', fontSize: '16px' }}>
                  Créer le compte école <ArrowRight size={20} />
                </button>
                
                <p className="terms-text">
                  En cliquant sur ce bouton, vous acceptez nos <a href="#">conditions générales d'utilisation</a> et notre <a href="#">politique de confidentialité</a>.
                </p>

              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
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
