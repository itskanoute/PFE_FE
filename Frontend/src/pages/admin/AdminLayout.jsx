import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, Outlet, useNavigate } from 'react-router-dom';
import {
  GraduationCap, LayoutDashboard, Users, UserCog,
  Clock, FileDown, Settings, UserCircle,
  PlusCircle, HelpCircle, LogOut, Search,
  Bell, Menu, X
} from 'lucide-react';
import { clearAuth } from '../../services/api';
import './admin.css';

const sidebarLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/responsables', icon: UserCog, label: 'Responsables' },
  { to: '/admin/etudiants', icon: Users, label: 'Students' },
  { to: '/admin/heures', icon: Clock, label: 'Hours Tracking' },
  { to: '/admin/export', icon: FileDown, label: 'Monthly Export' },
  { to: '/admin/parametres', icon: Settings, label: 'School Settings' },
  { to: '/admin/profil', icon: UserCircle, label: 'Profile' },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, title: 'Nouvelles heures déclarées', desc: 'Léa Martin a déclaré 12h', time: 'Il y a 5 min', link: '/admin/heures' },
    { id: 2, title: 'Nouveau contrat IBAN', desc: 'Thomas Dubois a déposé son IBAN', time: 'Il y a 2h', link: '/admin/etudiants' },
    { id: 3, title: 'Rappel responsable', desc: 'Mme Durand a 24h en attente', time: 'Hier', link: '/admin/responsables' },
  ];

  const handleNotificationClick = (link) => {
    navigate(link);
    setShowNotifications(false);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('responsables')) return 'Responsables pédagogiques';
    if (path.includes('etudiants')) return 'Étudiants';
    if (path.includes('heures')) return 'Suivi des heures';
    if (path.includes('export')) return 'Export mensuel';
    if (path.includes('parametres')) return 'Paramètres école';
    if (path.includes('profil')) return 'Mon profil';
    return '';
  };

  const getSearchPlaceholder = () => {
    const path = location.pathname;
    if (path.includes('responsables')) return 'Rechercher un responsable...';
    if (path.includes('etudiants')) return 'Rechercher un étudiant...';
    if (path.includes('export')) return 'Search exports...';
    if (path.includes('parametres')) return 'Rechercher un paramètre...';
    return 'Search data...';
  };

  return (
    <div className="admin-layout">
      {/* Overlay mobile */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <NavLink to="/admin/dashboard" className="sidebar-logo" onClick={() => setSidebarOpen(false)}>
          <GraduationCap size={28} />
          <div>
            <div>EduManage</div>
            <div className="sidebar-logo-sub">Admin Portal</div>
          </div>
        </NavLink>

        <nav className="sidebar-nav">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}

          <div className="sidebar-spacer" />

          <div className="sidebar-bottom">
            <button className="sidebar-cta" onClick={() => setShowReportModal(true)}>
              <PlusCircle size={18} />
              New Report
            </button>
            <a href="mailto:support@edumanage.fr" className="sidebar-link" style={{ textDecoration: 'none' }}>
              <HelpCircle size={18} />
              Support
            </a>
            <button className="sidebar-link logout" onClick={() => { clearAuth(); navigate('/login'); }} style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            {getPageTitle() && (
              <span className="admin-header-title">{getPageTitle()}</span>
            )}
          </div>

          <div className="admin-search">
            <Search size={16} color="#9ca3af" />
            <input
              type="text"
              placeholder={getSearchPlaceholder()}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="admin-header-right" style={{ position: 'relative' }} ref={notifRef}>
            <button className="header-icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={18} />
              <span className="notif-badge" />
            </button>
            
            {showNotifications && (
              <div style={{
                position: 'absolute', top: '100%', right: '0', marginTop: '0.5rem',
                background: 'white', borderRadius: 'var(--radius-md)', width: '300px',
                boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)',
                zIndex: 150, overflow: 'hidden'
              }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600, color: 'var(--primary-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Notifications
                  <span style={{ background: 'var(--primary-color)', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px' }}>3</span>
                </div>
                <div>
                  {notifications.map(notif => (
                    <div 
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif.link)}
                      style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary-dark)' }}>{notif.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-color)' }}>{notif.desc}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{notif.time}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 500 }} onClick={() => setShowNotifications(false)}>
                  Marquer tout comme lu
                </div>
              </div>
            )}

            <a
              href="mailto:support@edumanage.fr?subject=Aide%20EduManage%20-%20Admin"
              className="header-icon-btn"
              title="Contacter le support"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <HelpCircle size={18} />
            </a>
            <div 
              className="admin-user-info" 
              onClick={() => navigate('/admin/profil')}
              style={{ cursor: 'pointer' }}
              title="Mon Profil"
            >
              <div className="admin-user-details">
                <div className="admin-user-name">Admin ESCP</div>
                <div className="admin-user-role">Gestionnaire</div>
              </div>
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
                alt="Admin"
                className="admin-avatar"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-page">
          <Outlet context={{ searchTerm }} />
        </main>
      </div>

      {/* New Report Modal */}
      {showReportModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: 'var(--radius-lg)', padding: '2rem',
            width: '100%', maxWidth: '400px', boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-dark)' }}>Nouveau Rapport</h2>
              <button onClick={() => setShowReportModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <X size={20} />
              </button>
            </div>
            
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Générez un rapport rapide sans quitter votre page actuelle.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button className="btn-action outline" onClick={() => { alert('Rapport mensuel généré avec succès !'); setShowReportModal(false); }} style={{ justifyContent: 'center' }}>
                <FileDown size={18} /> Rapport Mensuel (PDF)
              </button>
              <button className="btn-action outline" onClick={() => { alert('Export Global généré avec succès !'); setShowReportModal(false); }} style={{ justifyContent: 'center' }}>
                <FileDown size={18} /> Export Global (Excel)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
