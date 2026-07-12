import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { forgotPassword } from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);
    setLoading(true);

    try {
      const data = await forgotPassword({ email: email.trim() });
      setSuccess(data);
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
            <h1 className="auth-title" style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--primary-dark)' }}>
              Mot de passe oublié
            </h1>
            <p className="auth-subtitle" style={{ fontSize: '1rem', color: '#4b5563', marginBottom: '2rem' }}>
              Saisissez votre email institutionnel. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
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
                <span>{success.message}</span>
              </div>

              {success.resetLink && (
                <div style={{ background: '#eff6ff', color: '#1d4ed8', padding: '16px', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '13px' }}>
                  <strong>Mode développement :</strong> cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe.
                  <br /><br />
                  <Link
                    to={`${new URL(success.resetLink).pathname}${new URL(success.resetLink).search}`}
                    style={{ wordBreak: 'break-all', fontWeight: 600 }}
                  >
                    Réinitialiser mon mot de passe
                  </Link>
                </div>
              )}

              <Link to="/login" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', fontSize: '16px', borderRadius: '4px', textDecoration: 'none' }}>
                <ArrowLeft size={20} /> Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '2rem' }}>
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

              <button type="submit" className="btn-primary" style={{ padding: '16px', fontSize: '16px', borderRadius: '4px', marginBottom: '1rem' }} disabled={loading}>
                {loading ? 'Envoi...' : 'Envoyer le lien'} <ArrowRight size={20} />
              </button>

              <div className="text-center">
                <Link to="/login" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary-dark)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <ArrowLeft size={16} /> Retour à la connexion
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
