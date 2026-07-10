import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Lock, Eye, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Login attempt with:', email);
  };

  return (
    <div className="auth-layout">
      {/* Header */}
      <header className="app-header" style={{ borderBottom: 'none', padding: '2rem 3rem' }}>
        <Link to="/" className="logo-container">
          <GraduationCap size={28} />
          <span>EduManage</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="auth-content">
        <div className="auth-card" style={{ padding: '3rem', maxWidth: '460px' }}>
          <div className="text-center">
            <h1 className="auth-title" style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--primary-dark)' }}>
              Accès<br />Académique
            </h1>
            <p className="auth-subtitle" style={{ fontSize: '1.125rem', color: '#4b5563', marginBottom: '3rem' }}>
              Connectez-vous à votre espace de<br />gestion
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Adresse Email</label>
              <div className="input-wrapper">
                <div className="input-icon-left">
                  <Mail size={18} />
                </div>
                <input 
                  id="email"
                  type="email" 
                  className="form-input has-icon-left" 
                  placeholder="nom@institution.edu" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <div className="flex justify-between items-center mb-2">
                <label className="form-label" style={{ marginBottom: 0 }} htmlFor="password">Mot de passe</label>
                <a href="#" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-dark)' }}>
                  Mot de passe oublié ?
                </a>
              </div>
              <div className="input-wrapper">
                <div className="input-icon-left">
                  <Lock size={18} />
                </div>
                <input 
                  id="password"
                  type="password" 
                  className="form-input has-icon-left has-icon-right" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="input-icon-right">
                  <Eye size={18} color="#0f0535" />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '16px', fontSize: '16px', borderRadius: '4px' }}>
              Se connecter <ArrowRight size={20} />
            </button>
          </form>

          <div className="divider"></div>

          <div className="text-center" style={{ color: '#4b5563' }}>
            Nouveau sur la plateforme ?{' '}
            <Link to="/register" style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>
              Créer un<br/>compte
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer" style={{ borderTop: 'none', paddingBottom: '3rem' }}>
        <div className="footer-links" style={{ gap: '3rem', color: '#4b5563', fontWeight: 500 }}>
          <a href="#" className="footer-link">Aide</a>
          <a href="#" className="footer-link">Confidentialité</a>
          <a href="#" className="footer-link">Conditions</a>
        </div>
      </footer>
    </div>
  );
};

export default Login;
