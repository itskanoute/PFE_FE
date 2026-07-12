import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut } from 'lucide-react';
import { clearAuth, getMe, getStoredUser } from '../services/api';

const roleLabels = {
  admin: 'Administrateur',
  etudiant: 'Étudiant',
  responsable: 'Responsable pédagogique',
};

const roleMessages = {
  admin: 'Bienvenue dans l\'espace admin. Le tableau de bord complet sera développé par l\'équipe frontend.',
  etudiant: 'Bienvenue dans l\'espace étudiant. Vous pourrez bientôt voir les offres d\'assistanat.',
  responsable: 'Bienvenue dans l\'espace responsable. Vous pourrez bientôt gérer vos offres et séances.',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    getMe()
      .then((data) => {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      })
      .catch(() => {
        clearAuth();
        navigate('/login');
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="auth-layout">
        <main className="auth-content">
          <p>Chargement...</p>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="auth-layout">
      <header className="app-header">
        <Link to="/" className="logo-container">
          <GraduationCap size={28} />
          <span>EduManage</span>
        </Link>
        <button type="button" className="btn-primary" onClick={handleLogout} style={{ padding: '10px 16px', fontSize: '14px' }}>
          <LogOut size={16} /> Déconnexion
        </button>
      </header>

      <main className="auth-content">
        <div className="auth-card" style={{ padding: '2.5rem', maxWidth: '560px' }}>
          <h1 className="auth-title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            Connexion réussie
          </h1>

          <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
            {roleMessages[user.role]}
          </p>

          <div style={{ background: '#f9fafb', padding: '1.25rem', borderRadius: '8px', lineHeight: 1.8 }}>
            <p><strong>Nom :</strong> {user.firstName} {user.lastName}</p>
            <p><strong>Email :</strong> {user.email}</p>
            <p><strong>Rôle :</strong> {roleLabels[user.role]}</p>
            {user.schoolId && <p><strong>École ID :</strong> {user.schoolId}</p>}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
