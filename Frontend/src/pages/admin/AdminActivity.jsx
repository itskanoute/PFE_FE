import { useEffect, useState } from 'react';
import {
  Activity, UserPlus, CheckCircle2, Megaphone, RefreshCw,
  Clock, ShieldAlert, FileText, Filter, Search
} from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getAdminActivity } from '../../services/api';

const typeIcons = {
  user: UserPlus,
  check: CheckCircle2,
  success: CheckCircle2,
  offer: Megaphone,
  warning: Megaphone,
  system: RefreshCw,
  alert: ShieldAlert,
  document: FileText,
};

const AdminActivity = () => {
  const navigate = useNavigate();
  const { searchTerm: headerSearch = '', setSearchTerm: setHeaderSearch } = useOutletContext() ?? {};
  const [localSearch, setLocalSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const searchTerm = headerSearch || localSearch;
  const setSearchTerm = (value) => {
    setLocalSearch(value);
    setHeaderSearch?.(value);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      getAdminActivity({ search: searchTerm, type: filterType })
        .then((data) => setActivities(data.activities))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, filterType]);

  return (
    <>
      <div className="page-header">
        <div className="page-breadcrumb">
          <span onClick={() => navigate('/admin/dashboard')} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}>Dashboard</span> &gt; <span>Journal d'Activité</span>
        </div>
        <div className="page-title-row">
          <div>
            <h1 className="page-title">Toute l'activité</h1>
            <p className="page-subtitle">Consultez l'historique complet des actions sur le portail EduManage.</p>
          </div>
        </div>
      </div>

      <div className="content-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', padding: '1.5rem', borderBottom: '1px solid var(--border-color)', background: '#fafafa', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: '300px' }}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Rechercher une action, un nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '0.9rem' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.5rem 1rem' }}>
            <Filter size={16} color="#6b7280" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-dark)', cursor: 'pointer' }}
            >
              <option value="all">Tous les événements</option>
              <option value="user">Utilisateurs</option>
              <option value="success">Validations</option>
              <option value="document">Documents</option>
              <option value="warning">Offres</option>
              <option value="alert">Alertes</option>
              <option value="system">Système</option>
            </select>
          </div>
        </div>

        <div style={{ padding: '0 1.5rem' }}>
          {loading && <p style={{ padding: '2rem', color: '#6b7280' }}>Chargement...</p>}
          {error && <p style={{ padding: '2rem', color: '#b91c1c' }}>{error}</p>}

          {!loading && !error && activities.length > 0 && activities.map((act, i) => {
            const Icon = typeIcons[act.type] || Activity;
            return (
              <div key={act.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: '1.25rem', padding: '1.25rem 0',
                borderBottom: i < activities.length - 1 ? '1px solid var(--border-color)' : 'none'
              }}>
                <div className={`activity-icon ${act.type}`} style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>
                  <Icon size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.95rem', color: 'var(--primary-dark)', marginBottom: '0.25rem', lineHeight: 1.4 }}>
                    {act.description}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {act.time}</span>
                    <span>•</span>
                    <span>{act.date}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {!loading && !error && activities.length === 0 && (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Activity size={48} style={{ opacity: 0.2, margin: '0 auto 1rem auto' }} />
              <p style={{ fontWeight: 500, fontSize: '1rem', color: 'var(--primary-dark)' }}>Aucune activité trouvée</p>
              <p style={{ fontSize: '0.875rem' }}>Essayez de modifier vos filtres de recherche.</p>
            </div>
          )}
        </div>

        {!loading && activities.length > 0 && (
          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', background: '#fafafa', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Affichage de {activities.length} événement{activities.length > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminActivity;
