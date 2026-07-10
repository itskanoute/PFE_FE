import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, HelpCircle, ChevronDown } from 'lucide-react';

const RegisterStudent = () => {
  const [formData, setFormData] = useState({
    schoolId: '',
    studentId: '',
    year: '',
    firstName: '',
    lastName: '',
    major: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Register student:', formData);
  };

  return (
    <div className="auth-layout">
      {/* Header */}
      <header className="app-header">
        <Link to="/" className="logo-container">
          <GraduationCap size={28} />
          <span>EduManage</span>
        </Link>
        <div className="header-actions">
          <Link to="/login" className="header-link" style={{ fontSize: '14px' }}>Connexion</Link>
          <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Profile" className="profile-pic" />
        </div>
      </header>

      {/* Main Content */}
      <main className="auth-content">
        <div className="register-student-card">
          <h1 className="auth-title" style={{ textAlign: 'left', marginBottom: '1rem', fontSize: '2.25rem', lineHeight: '1.2' }}>
            Inscription<br />Étudiant
          </h1>
          <p className="auth-subtitle" style={{ textAlign: 'left', color: '#4b5563', fontSize: '1rem', marginBottom: '2rem' }}>
            Veuillez remplir les informations ci-dessous pour créer votre compte.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label className="form-label" htmlFor="schoolId">École</label>
              <div className="input-wrapper">
                <select 
                  id="schoolId" 
                  className="form-input" 
                  onChange={handleChange} 
                  required 
                  defaultValue=""
                  style={{ appearance: 'none', paddingRight: '36px' }}
                >
                  <option value="" disabled>Sélectionnez votre établissement</option>
                  <option value="1">ESCP Business School</option>
                  <option value="2">Sorbonne Université</option>
                </select>
                <div className="input-icon-right" style={{ pointerEvents: 'none' }}>
                  <ChevronDown size={18} color="#0f0535" />
                </div>
              </div>
            </div>
            
            <div className="helper-text" style={{ marginBottom: '1.5rem', color: '#0f0535', fontWeight: 500 }}>
              <HelpCircle size={14} color="#0f0535" />
              <span>Votre école n'est pas listée ?</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="studentId">Numéro étudiant</label>
              <input id="studentId" type="text" className="form-input" placeholder="Ex: 2023-A45" onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="year">Année d'étude</label>
              <div className="input-wrapper">
                <select 
                  id="year" 
                  className="form-input" 
                  onChange={handleChange} 
                  required 
                  defaultValue=""
                  style={{ appearance: 'none', paddingRight: '36px' }}
                >
                  <option value="" disabled>Niveau</option>
                  <option value="L1">Licence 1</option>
                  <option value="L2">Licence 2</option>
                  <option value="L3">Licence 3</option>
                  <option value="M1">Master 1</option>
                  <option value="M2">Master 2</option>
                </select>
                <div className="input-icon-right" style={{ pointerEvents: 'none' }}>
                  <ChevronDown size={18} color="#0f0535" />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="firstName">Prénom</label>
              <input id="firstName" type="text" className="form-input" placeholder="Jean" onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="lastName">Nom</label>
              <input id="lastName" type="text" className="form-input" placeholder="Dupont" onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="major">Filière / Spécialisation</label>
              <input id="major" type="text" className="form-input" placeholder="Ex: Management des Systèmes d'I..." onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email école</label>
              <input id="email" type="email" className="form-input" placeholder="prenom.nom@ecole.edu" onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Mot de passe</label>
              <input id="password" type="password" className="form-input" onChange={handleChange} required minLength="8" />
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label" htmlFor="confirmPassword">Confirmation</label>
              <input id="confirmPassword" type="password" className="form-input" onChange={handleChange} required minLength="8" />
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '16px', fontSize: '16px' }}>
              Finaliser l'inscription <ArrowRight size={20} />
            </button>
            
            <p className="terms-text" style={{ marginTop: '1.5rem', padding: '0 1rem' }}>
              En vous inscrivant, vous acceptez nos <a href="#">Conditions d'Utilisation</a> et notre <a href="#">Politique de Confidentialité</a>.
            </p>

          </form>
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

export default RegisterStudent;
