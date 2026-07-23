import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  X,
  LogOut
} from 'lucide-react';
import { getResponsableSummary, clearAuth } from '../../services/api';
import './responsable.css';

const ResponsableLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [badges, setBadges] = useState({ candidatures: 0, heuresLabel: null });
  const [notifications, setNotifications] = useState([]);
  const [profile, setProfile] = useState({ name: '...', role: 'Responsable Pédagogique' });

  const loadSummary = useCallback(() => {
    getResponsableSummary()
      .then((data) => {
        setBadges(data.badges || { candidatures: 0, heuresLabel: null });
        setNotifications(data.notifications || []);
        if (data.profile) setProfile(data.profile);
      })
      .catch(() => {
        setBadges({ candidatures: 0, heuresLabel: null });
        setNotifications([]);
      });
  }, []);

  useEffect(() => {
    loadSummary();
    setSearchTerm('');
  }, [loadSummary, location.pathname]);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const avatarName = profile.fullName || profile.name || 'R';
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarName)}&background=0f172a&color=fff&size=100`;

  return (
    <div className="resp-layout">
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

      <div
        className={`resp-mobile-overlay ${isMobileMenuOpen ? 'mobile-open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

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
          <NavLink to="/responsable/dashboard" className={({ isActive }) => isActive ? 'resp-nav-item active' : 'resp-nav-item'} onClick={() => setIsMobileMenuOpen(false)}>
            <Home className="resp-nav-icon" />
            <span>Accueil</span>
          </NavLink>

          <NavLink to="/responsable/offres" className={({ isActive }) => isActive ? 'resp-nav-item active' : 'resp-nav-item'} onClick={() => setIsMobileMenuOpen(false)}>
            <Briefcase className="resp-nav-icon" />
            <span>Offres</span>
          </NavLink>

          <NavLink to="/responsable/candidatures" className={({ isActive }) => isActive ? 'resp-nav-item active' : 'resp-nav-item'} onClick={() => setIsMobileMenuOpen(false)}>
            <FileText className="resp-nav-icon" />
            <span>Candidatures</span>
            {badges.candidatures > 0 && (
              <span className="resp-nav-badge">{badges.candidatures}</span>
            )}
          </NavLink>

          <NavLink to="/responsable/seances" className={({ isActive }) => isActive ? 'resp-nav-item active' : 'resp-nav-item'} onClick={() => setIsMobileMenuOpen(false)}>
            <Calendar className="resp-nav-icon" />
            <span>Séances</span>
          </NavLink>

          <NavLink to="/responsable/heures" className={({ isActive }) => isActive ? 'resp-nav-item active' : 'resp-nav-item'} onClick={() => setIsMobileMenuOpen(false)}>
            <Clock className="resp-nav-icon" />
            <span>Heures</span>
            {badges.heuresLabel && (
              <span className="resp-nav-badge">{badges.heuresLabel}</span>
            )}
          </NavLink>

          <NavLink to="/responsable/profil" className={({ isActive }) => isActive ? 'resp-nav-item active' : 'resp-nav-item'} onClick={() => setIsMobileMenuOpen(false)}>
            <User className="resp-nav-icon" />
            <span>Profil</span>
          </NavLink>

          <button
            type="button"
            className="resp-nav-item"
            onClick={() => {
              clearAuth();
              setIsMobileMenuOpen(false);
              navigate('/login');
            }}
            style={{
              width: '100%',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              color: 'var(--resp-danger, #ef4444)',
              marginTop: '0.5rem',
            }}
          >
            <LogOut className="resp-nav-icon" />
            <span>Déconnexion</span>
          </button>
        </nav>

        <div className="resp-sidebar-footer">
          Espace Responsable
        </div>
      </aside>

      <div className="resp-main">
        <header className="resp-header">
          <div className="resp-search">
            <Search className="resp-search-icon" size={18} />
            <input
              type="text"
              placeholder="Rechercher un étudiant, une séance..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
                    <span
                      style={{ fontSize: '0.8rem', color: 'var(--resp-text-light)', cursor: 'pointer' }}
                      onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))}
                    >
                      Tout lire
                    </span>
                  </div>
                  <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--resp-text-light)', fontSize: '0.85rem' }}>
                        Aucune notification
                      </div>
                    ) : notifications.map((notif) => (
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
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = notif.unread ? '#fefce8' : 'white'; }}
                        onClick={() => {
                          if (notif.type === 'candidature') navigate('/responsable/candidatures');
                          else navigate('/responsable/seances');
                          setShowNotifications(false);
                        }}
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
                    onClick={() => { navigate('/responsable/seances'); setShowNotifications(false); }}
                  >
                    Voir toutes les notifications
                  </div>
                </div>
              )}
            </div>

            <a
              href="mailto:support@edumanage.fr?subject=Aide%20EduManage%20-%20Responsable"
              className="resp-header-icon-btn"
              title="Contacter le support"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <HelpCircle size={20} />
            </a>

            <div
              className="resp-user-profile"
              onClick={() => navigate('/responsable/profil')}
            >
              <div className="resp-user-info">
                <div className="resp-user-name">{profile.name}</div>
                <div className="resp-user-role">{profile.role}</div>
              </div>
              <img
                src={avatarUrl}
                alt={profile.name}
                className="resp-avatar"
              />
            </div>
          </div>
        </header>

        <main className="resp-page">
          <Outlet context={{ refreshSummary: loadSummary, searchTerm, setSearchTerm }} />
        </main>
      </div>
    </div>
  );
};

export default ResponsableLayout;
