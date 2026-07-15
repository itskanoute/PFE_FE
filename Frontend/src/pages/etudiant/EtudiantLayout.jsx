import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Calendar, 
  Clock, 
  User, 
  Bell, 
  HelpCircle,
  Search,
  Menu,
  X,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import './etudiant.css';

const EtudiantLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Votre candidature pour 'Base de données' a été acceptée !", time: "Il y a 2h", read: false, type: "success" },
    { id: 2, text: "N'oubliez pas de renseigner votre IBAN dans votre profil.", time: "Hier", read: false, type: "warning" },
    { id: 3, text: "Nouvelle offre : Développement Web Front-End", time: "Il y a 2 jours", read: true, type: "info" }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const navItems = [
    { path: '/etudiant/dashboard', icon: <Home size={20} />, label: 'Accueil' },
    { path: '/etudiant/candidatures', icon: <FileText size={20} />, label: 'Candidatures' },
    { path: '/etudiant/seances', icon: <Calendar size={20} />, label: 'Séances' },
    { path: '/etudiant/heures', icon: <Clock size={20} />, label: 'Heures' },
    { path: '/etudiant/profil', icon: <User size={20} />, label: 'Profil' },
  ];

  return (
    <div className="etudiant-layout">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40 }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`etudiant-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="etudiant-logo-container">
          <div className="etudiant-logo-text">
            <div style={{ backgroundColor: '#1e1b4b', color: 'white', padding: '0.2rem', borderRadius: '6px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
            </div>
            EduManage
          </div>
          <div className="etudiant-logo-subtext">Espace Étudiant</div>
        </div>

        <nav className="etudiant-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `etudiant-nav-item ${isActive ? 'active' : ''}`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="etudiant-user-profile" onClick={() => navigate('/etudiant/profil')}>
          <div className="etudiant-avatar">
            <img src="https://ui-avatars.com/api/?name=Lucas+Bernard&background=1e1b4b&color=fff" alt="Avatar" style={{ borderRadius: '50%', width: '100%', height: '100%' }} />
          </div>
          <div className="etudiant-user-info">
            <span className="etudiant-user-name">Lucas Bernard</span>
            <span className="etudiant-user-role">L3 Informatique</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="etudiant-main">
        {/* Header */}
        <header className="etudiant-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className="etudiant-mobile-menu-btn" 
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="etudiant-search-container">
              <Search size={18} color="#94a3b8" />
              <input 
                type="text" 
                className="etudiant-search-input" 
                placeholder="Rechercher une offre, une séance..."
              />
            </div>
          </div>

          <div className="etudiant-header-actions">
            <div style={{ position: 'relative' }}>
              <button className="etudiant-icon-button" onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}>
                <Bell size={20} />
                {unreadCount > 0 && <span className="etudiant-notification-badge">{unreadCount}</span>}
              </button>
              
              {isNotificationsOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', width: '350px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', zIndex: 50, overflow: 'hidden' }}>
                  <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                        Tout marquer comme lu
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                        Aucune notification
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', backgroundColor: notif.read ? 'white' : '#eff6ff', display: 'flex', gap: '1rem', transition: 'background-color 0.2s' }}>
                          <div style={{ marginTop: '0.25rem' }}>
                            {notif.type === 'success' && <CheckCircle2 size={18} color="#16a34a" />}
                            {notif.type === 'warning' && <AlertTriangle size={18} color="#d97706" />}
                            {notif.type === 'info' && <Info size={18} color="#3b82f6" />}
                          </div>
                          <div>
                            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', color: '#1e293b', fontWeight: notif.read ? 500 : 700 }}>{notif.text}</p>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{notif.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div style={{ padding: '0.75rem', textAlign: 'center', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                    <button style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }} onClick={() => setIsNotificationsOpen(false)}>
                      Fermer
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button className="etudiant-icon-button">
              <HelpCircle size={20} />
            </button>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', cursor: 'pointer' }} onClick={() => navigate('/etudiant/profil')}>
              <img src="https://ui-avatars.com/api/?name=Lucas+Bernard&background=1e1b4b&color=fff" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="etudiant-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default EtudiantLayout;
