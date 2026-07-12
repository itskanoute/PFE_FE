import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { getDashboardPath, login, saveAuth } from '../../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login({ email: email.trim(), password: password.trim() });
      saveAuth(data);
      navigate(getDashboardPath(data.user.role));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <header className="app-header" style={{ borderBottom: 'none', padding: '2rem 3rem' }}>
        <Link to="/" className="logo-container">
          <GraduationCap size={28} />
          <span>EduManage</span>
        </Link>
      </header>

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

          {error && (
            <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '14px' }}>
              {error}
            </div>
          )}

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
                <Link to="/forgot-password" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-dark)' }}>
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="input-wrapper">
                <div className="input-icon-left">
                  <Lock size={18} />
                </div>
                <input 
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input has-icon-left has-icon-right" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  style={{ background: 'none', border: 'none', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={18} color="#0f0535" /> : <Eye size={18} color="#0f0535" />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '16px', fontSize: '16px', borderRadius: '4px' }} disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'} <ArrowRight size={20} />
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
