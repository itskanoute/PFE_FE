import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import { changePassword, getDashboardPath, getStoredUser, clearAuth } from '../../services/api';

const ChangePassword = () => {
  const navigate = useNavigate();
  const user = getStoredUser();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [redirectTo, setRedirectTo] = useState('/login');

  useEffect(() => {
    if (!localStorage.getItem('token') || !user) {
      navigate('/login', { replace: true });
    }
  }, [navigate, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await changePassword({ password, confirmPassword });
      const updatedUser = { ...user, mustChangePassword: false };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setRedirectTo(data.redirectTo || getDashboardPath(user?.role));
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

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
            <h1 className="auth-title" style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--primary-dark)' }}>
              Changer votre mot de passe
            </h1>
            <p className="auth-subtitle" style={{ fontSize: '1rem', color: '#4b5563', marginBottom: '2rem' }}>
              Bonjour {user.firstName}, choisissez un nouveau mot de passe sécurisé (8 caractères minimum).
            </p>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '14px' }}>
              {error}
            </div>
          )}

          {success ? (
            <div>
              <div style={{ background: '#ecfdf5', color: '#047857', padding: '16px', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '14px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <CheckCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Mot de passe modifié avec succès.</span>
              </div>
              <button
                type="button"
                className="btn-primary"
                style={{ width: '100%', padding: '16px', fontSize: '16px', borderRadius: '4px' }}
                onClick={() => navigate(redirectTo, { replace: true })}
              >
                Accéder à mon espace <ArrowRight size={20} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="password">Nouveau mot de passe</label>
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
                    minLength={8}
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

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label" htmlFor="confirmPassword">Confirmer le mot de passe</label>
                <div className="input-wrapper">
                  <div className="input-icon-left">
                    <Lock size={18} />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-input has-icon-left has-icon-right"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="input-icon-right"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? 'Masquer la confirmation' : 'Afficher la confirmation'}
                    style={{ background: 'none', border: 'none', padding: 0 }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} color="#0f0535" /> : <Eye size={18} color="#0f0535" />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '16px', fontSize: '16px', borderRadius: '4px', marginBottom: '1rem', width: '100%' }} disabled={loading}>
                {loading ? 'Enregistrement...' : 'Enregistrer'} <ArrowRight size={20} />
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { clearAuth(); navigate('/login'); }}
                  style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary-dark)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Se déconnecter
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default ChangePassword;
