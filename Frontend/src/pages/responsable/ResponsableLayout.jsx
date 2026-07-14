import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Briefcase,
  FileText, 
  Calendar, 
  Clock, 
  User, 
  Search, 
  Bell, 
  HelpCircle,
  AlertCircle,
  Menu,
  X
} from 'lucide-react';
import './responsable.css';

const ResponsableLayout = () => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Notifications mockées pour la cloche
  const notifications = [
    {
      id: 1,
      type: 'annulation',
      title: 'Léa Martin a annulé sa séance',
      desc: 'BDD - Mar 15/10 - 08h-10h',
      time: 'Il y a 30 min',
      unread: true
    },
    {
      id: 2,
      type: 'annulation',
      title: 'Paul Durand a annulé sa séance',
      desc: 'Java - Jeu 17/10 - 10h-12h',
      time: 'Il y a 2h',
      unread: true
    },
    {
      id: 3,
      type: 'candidature',
      title: 'Marie Lopez a candidaté',
      desc: 'Offre: Réseaux',
      time: 'Il y a 5h',
      unread: true
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="resp-layout">
      {/* Mobile Header (Visible only on mobile) */}
      <div className="resp-mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="resp-logo-title" style={{ margin: 0 }}>EduManage</div>
        </div>
        <button 
          className="resp-mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Overlay */}
      <div 
        className={`resp-mobile-overlay ${isMobileMenuOpen ? 'mobile-open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside className={`resp-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 1.5rem 2.5rem 1.5rem' }}>
          <div className="resp-logo" style={{ padding: 0, margin: 0 }}>
            <div className="resp-logo-title">EduManage</div>
            <div className="resp-logo-subtitle">Espace Responsable</div>
          </div>
          {isMobileMenuOpen && (
            <button 
              style={{ background: 'none', border: 'none', color: 'var(--resp-text-light)', cursor: 'pointer' }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={24} />
            </button>
          )}
        </div>

        <nav className="resp-nav">
          <NavLink to="/responsable/dashboard" className={({isActive}) => isActive ? "resp-nav-item active" : "resp-nav-item"} onClick={() => setIsMobileMenuOpen(false)}>
            <Home className="resp-nav-icon" />
            <span>Accueil</span>
          </NavLink>
          
          <NavLink to="/responsable/offres" className={({isActive}) => isActive ? "resp-nav-item active" : "resp-nav-item"} onClick={() => setIsMobileMenuOpen(false)}>
            <Briefcase className="resp-nav-icon" />
            <span>Offres</span>
          </NavLink>
          
          <NavLink to="/responsable/candidatures" className={({isActive}) => isActive ? "resp-nav-item active" : "resp-nav-item"} onClick={() => setIsMobileMenuOpen(false)}>
            <FileText className="resp-nav-icon" />
            <span>Candidatures</span>
            <span className="resp-nav-badge">7</span>
          </NavLink>
          
          <NavLink to="/responsable/seances" className={({isActive}) => isActive ? "resp-nav-item active" : "resp-nav-item"} onClick={() => setIsMobileMenuOpen(false)}>
            <Calendar className="resp-nav-icon" />
            <span>Séances</span>
          </NavLink>
          
          <NavLink to="/responsable/heures" className={({isActive}) => isActive ? "resp-nav-item active" : "resp-nav-item"} onClick={() => setIsMobileMenuOpen(false)}>
            <Clock className="resp-nav-icon" />
            <span>Heures</span>
            <span className="resp-nav-badge">24h</span>
          </NavLink>
          
          <NavLink to="/responsable/profil" className={({isActive}) => isActive ? "resp-nav-item active" : "resp-nav-item"} onClick={() => setIsMobileMenuOpen(false)}>
            <User className="resp-nav-icon" />
            <span>Profil</span>
          </NavLink>
        </nav>

        <div className="resp-sidebar-footer">
          Espace Étudiant
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="resp-main">
        {/* Header */}
        <header className="resp-header">
          <div className="resp-search">
            <Search className="resp-search-icon" size={18} />
            <input type="text" placeholder="Rechercher un étudiant, une séance..." />
          </div>

          <div className="resp-header-actions">
            <div style={{ position: 'relative' }}>
              <button 
                className="resp-header-icon-btn"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="resp-notification-badge">{unreadCount}</span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  marginTop: '0.5rem',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  border: '1px solid var(--resp-border)',
                  width: '320px',
                  zIndex: 50,
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '1rem', borderBottom: '1px solid var(--resp-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--resp-text)', fontWeight: 600 }}>Notifications</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--resp-text-light)', cursor: 'pointer' }}>Tout lire</span>
                  </div>
                  <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    {notifications.map(notif => (
                      <div 
                        key={notif.id}
                        style={{ 
                          padding: '1rem', 
                          borderBottom: '1px solid var(--resp-border)', 
                          cursor: 'pointer', 
                          display: 'flex', 
                          gap: '12px',
                          backgroundColor: notif.unread ? '#fefce8' : 'white'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notif.unread ? '#fefce8' : 'white'}
                      >
                        <div style={{ color: notif.type === 'annulation' ? 'var(--resp-danger)' : 'var(--resp-success)', marginTop: '2px' }}>
                          <AlertCircle size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--resp-text)', marginBottom: '4px' }}>{notif.title}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--resp-text-light)', marginBottom: '6px' }}>{notif.desc}</div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{notif.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div 
                    style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--resp-primary)', cursor: 'pointer', fontWeight: 500, backgroundColor: '#f8fafc' }}
                    onClick={() => navigate('/responsable/seances')}
                  >
                    Voir toutes les notifications
                  </div>
                </div>
              )}
            </div>

            <button className="resp-header-icon-btn">
              <HelpCircle size={20} />
            </button>
            
            <div 
              className="resp-user-profile"
              onClick={() => navigate('/responsable/profil')}
            >
              <div className="resp-user-info">
                <div className="resp-user-name">M. Ettori</div>
                <div className="resp-user-role">Responsable Pédagogique</div>
              </div>
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
                alt="Profile"
                className="resp-avatar"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="resp-page">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ResponsableLayout;
