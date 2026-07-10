import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Building2, Users, ArrowRight } from 'lucide-react';

const RegisterChoice = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-layout">
      {/* Header */}
      <header className="app-header">
        <Link to="/" className="logo-container">
          <GraduationCap size={28} />
          <span>EduManage</span>
        </Link>
        <div className="header-actions">
          <a href="#" className="header-link">Aide</a>
          <Link to="/login" className="btn-outline">Connexion</Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="auth-content">
        <div className="choice-layout">
          <div className="text-center" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 className="auth-title">Bienvenue sur<br />EduManage</h1>
            <p className="auth-subtitle" style={{ fontSize: '1.125rem' }}>
              Choisissez le type d'espace qui correspond à vos besoins pour commencer votre inscription sur notre plateforme de gestion académique.
            </p>
          </div>

          <div className="choice-grid">
            <div className="choice-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/register/school')}>
              <div className="choice-icon-bg" style={{ backgroundColor: '#eef2ff' }}>
                <Building2 size={24} />
              </div>
              <Building2 size={120} className="choice-watermark" style={{ right: '-10px', top: '20px' }} />
              
              <h3>Je suis une école</h3>
              <p>
                Accédez aux outils d'administration complète : gestion des classes, suivi des professeurs, facturation et pilotage pédagogique pour votre établissement.
              </p>
              <div className="choice-card-link">
                Créer un espace établissement <ArrowRight size={18} />
              </div>
            </div>

            <div className="choice-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/register/student')}>
              <div className="choice-icon-bg student" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
                <Users size={24} />
              </div>
              <Users size={120} className="choice-watermark" style={{ right: '-10px', top: '20px', color: '#b45309' }} />
              
              <h3>Je suis un étudiant</h3>
              <p>
                Rejoignez vos cours, accédez à vos ressources pédagogiques, suivez votre emploi du temps et communiquez avec vos enseignants en temps réel.
              </p>
              <div className="choice-card-link">
                Créer un compte étudiant <ArrowRight size={18} />
              </div>
            </div>
          </div>

          <div className="promo-banner">
            <div className="promo-content">
              <h2>Une plateforme, deux univers.</h2>
              <p>
                Notre architecture sécurisée garantit une étanchéité parfaite entre les données administratives et l'espace d'apprentissage personnel des étudiants.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="flex items-center gap-2">
          <span>©</span>
          <span>2024 EduManage - Système de Gestion Académique Intégré</span>
        </div>
        <div className="footer-links">
          <a href="#" className="footer-link">Confidentialité</a>
          <a href="#" className="footer-link">Conditions d'utilisation</a>
          <a href="#" className="footer-link">Contact</a>
        </div>
        <div className="footer-version">v1.0.4-build.release</div>
      </footer>
    </div>
  );
};

export default RegisterChoice;
