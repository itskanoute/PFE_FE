import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, HelpCircle, ChevronDown } from 'lucide-react';
import { getDashboardPath, getSchools, registerStudent, saveAuth } from '../../services/api';

const RegisterStudent = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(true);

  useEffect(() => {
    getSchools()
      .then(setSchools)
      .catch((err) => setError(err.message))
      .finally(() => setLoadingSchools(false));
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });

    if (id === 'schoolId') {
      const school = schools.find((s) => String(s.id) === value);
      setSelectedSchool(school || null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await registerStudent(formData);
      saveAuth(data);
      setSuccess(data.message);
      setTimeout(() => navigate(data.redirectTo || getDashboardPath(data.user.role)), 1500);
    } catch (err) {
      setError(err.message);
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
        <div className="header-actions">
          <Link to="/login" className="header-link" style={{ fontSize: '14px' }}>Connexion</Link>
          <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Profile" className="profile-pic" />
        </div>
      </header>

      <main className="auth-content">
        <div className="register-student-card">
          <h1 className="auth-title" style={{ textAlign: 'left', marginBottom: '1rem', fontSize: '2.25rem', lineHeight: '1.2' }}>
            Inscription<br />Étudiant
          </h1>
          <p className="auth-subtitle" style={{ textAlign: 'left', color: '#4b5563', fontSize: '1rem', marginBottom: '2rem' }}>
            Veuillez remplir les informations ci-dessous pour créer votre compte.
          </p>

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
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label className="form-label" htmlFor="schoolId">École</label>
              <div className="input-wrapper">
                <select 
                  id="schoolId" 
                  className="form-input" 
                  onChange={handleChange} 
                  value={formData.schoolId}
                  required 
                  disabled={loadingSchools}
                  style={{ appearance: 'none', paddingRight: '36px' }}
                >
                  <option value="" disabled>
                    {loadingSchools ? 'Chargement des écoles...' : 'Sélectionnez votre établissement'}
                  </option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
                <div className="input-icon-right" style={{ pointerEvents: 'none' }}>
                  <ChevronDown size={18} color="#0f0535" />
                </div>
              </div>
            </div>

            {selectedSchool && (
              <div className="helper-text" style={{ marginBottom: '1rem', color: '#047857', fontWeight: 500 }}>
                Email requis : @{selectedSchool.email_domain} ou @gmail.com
              </div>
            )}
            
            <div className="helper-text" style={{ marginBottom: '1.5rem', color: '#0f0535', fontWeight: 500 }}>
              <HelpCircle size={14} color="#0f0535" />
              <span>Votre école n'est pas listée ? Contactez l'administration de votre école.</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="studentId">Numéro étudiant</label>
              <input id="studentId" type="text" className="form-input" placeholder="Ex: 2023-A45" value={formData.studentId} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="year">Année d'étude</label>
              <div className="input-wrapper">
                <select 
                  id="year" 
                  className="form-input" 
                  onChange={handleChange} 
                  value={formData.year}
                  required 
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
              <input id="firstName" type="text" className="form-input" placeholder="Jean" value={formData.firstName} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="lastName">Nom</label>
              <input id="lastName" type="text" className="form-input" placeholder="Dupont" value={formData.lastName} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="major">Filière / Spécialisation</label>
              <input id="major" type="text" className="form-input" placeholder="Ex: Management des Systèmes d'I..." value={formData.major} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email école</label>
              <input id="email" type="email" className="form-input" placeholder="prenom.nom@ecole.edu" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Mot de passe</label>
              <input id="password" type="password" className="form-input" value={formData.password} onChange={handleChange} required minLength="8" />
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label" htmlFor="confirmPassword">Confirmation</label>
              <input id="confirmPassword" type="password" className="form-input" value={formData.confirmPassword} onChange={handleChange} required minLength="8" />
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '16px', fontSize: '16px' }} disabled={loading || loadingSchools}>
              {loading ? 'Inscription...' : 'Finaliser l\'inscription'} <ArrowRight size={20} />
            </button>
            
            <p className="terms-text" style={{ marginTop: '1.5rem', padding: '0 1rem' }}>
              En vous inscrivant, vous acceptez nos <a href="#">Conditions d'Utilisation</a> et notre <a href="#">Politique de Confidentialité</a>.
            </p>
          </form>
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

export default RegisterStudent;
