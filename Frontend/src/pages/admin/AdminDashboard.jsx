import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedCounter from '../../components/AnimatedCounter';
import { getAdminDashboard } from '../../services/api';
import {
  Users, UserCog, GraduationCap, Clock,
  AlertTriangle, Info, FileCheck,
  UserPlus, ClipboardCheck, Megaphone, RefreshCw
} from 'lucide-react';

const activityIcons = {
  user: UserPlus,
  check: ClipboardCheck,
  offer: Megaphone,
  system: RefreshCw,
  alert: AlertTriangle,
};

const alertIcons = {
  danger: AlertTriangle,
  warning: Info,
  info: FileCheck,
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    getAdminDashboard()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="content-card" style={{ padding: '2rem' }}>Chargement du tableau de bord...</div>;
  }

  if (error) {
    return (
      <div className="content-card" style={{ padding: '2rem', color: '#b91c1c' }}>
        {error}
      </div>
    );
  }

  const { stats, alerts, chartData, activities } = data;
  const maxChart = Math.max(
    ...chartData.flatMap((d) => [d.validated, d.pending, d.refused]),
    1
  );

  return (
    <>
      {alerts.length > 0 && (
        <div className="alerts-row">
          {alerts.map((alert, i) => {
            const Icon = alertIcons[alert.type] || Info;
            return (
              <div key={i} className={`alert-banner ${alert.type}`}>
                <Icon size={18} />
                <div>
                  <div className="alert-title">{alert.title}</div>
                  <div>{alert.text}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple"><UserCog size={22} /></div>
          <div className="stat-content">
            <div className="stat-label">Responsables actifs</div>
            <div className="stat-value"><AnimatedCounter value={stats.responsables} /></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue"><Users size={22} /></div>
          <div className="stat-content">
            <div className="stat-label">Étudiants inscrits</div>
            <div className="stat-value"><AnimatedCounter value={stats.etudiants} /></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green"><GraduationCap size={22} /></div>
          <div className="stat-content">
            <div className="stat-label">Assistants actifs</div>
            <div className="stat-value"><AnimatedCounter value={stats.assistants} /></div>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon dark"><Clock size={22} /></div>
          <div className="stat-content">
            <div className="stat-label">Heures ce mois</div>
            <div className="stat-value"><AnimatedCounter value={stats.heuresMois} suffix="h" /></div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Offres actives</div>
            <div className="stat-value"><AnimatedCounter value={stats.offresActives} /></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Séances / mois</div>
            <div className="stat-value"><AnimatedCounter value={stats.seancesMois} /></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label" style={{ color: '#16a34a' }}>Validées</div>
            <div className="stat-value" style={{ color: '#16a34a' }}>
              <AnimatedCounter value={stats.heuresValidees} suffix="h" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label" style={{ color: '#f59e0b' }}>En attente</div>
            <div className="stat-value" style={{ color: '#f59e0b' }}>
              <AnimatedCounter value={stats.heuresAttente} suffix="h" />
            </div>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="content-card">
          <div className="content-card-header">
            <div>
              <div className="content-card-title">Suivi de la charge</div>
              <div className="content-card-subtitle">Heures par mois avec statut de validation</div>
            </div>
            <div className="chart-legend">
              <div className="chart-legend-item">
                <div className="chart-legend-dot" style={{ background: 'var(--primary-dark)' }} />
                Validées
              </div>
              <div className="chart-legend-item">
                <div className="chart-legend-dot" style={{ background: '#d97706' }} />
                En attente
              </div>
              <div className="chart-legend-item">
                <div className="chart-legend-dot" style={{ background: '#ef4444' }} />
                Refusées
              </div>
            </div>
          </div>

          <div className="chart-container">
            {chartData.length > 0 ? chartData.map((d, i) => (
              <div key={i} className="chart-bar-group">
                <div className="chart-bars">
                  <div className="chart-bar validated" style={{ height: `${(d.validated / maxChart) * 180}px` }} />
                  <div className="chart-bar pending" style={{ height: `${(d.pending / maxChart) * 180}px` }} />
                  {d.refused > 0 && (
                    <div className="chart-bar refused" style={{ height: `${(d.refused / maxChart) * 180}px` }} />
                  )}
                </div>
                <div className="chart-label">{d.month}</div>
              </div>
            )) : (
              <p style={{ color: '#6b7280', padding: '2rem' }}>Aucune donnée d'heures pour le moment.</p>
            )}
          </div>
        </div>

        <div className="content-card">
          <div className="content-card-header">
            <div className="content-card-title">Activité récente</div>
          </div>

          <div className="activity-list">
            {activities.length > 0 ? activities.map((act) => {
              const Icon = activityIcons[act.type] || RefreshCw;
              return (
                <div key={act.id} className="activity-item">
                  <div className={`activity-icon ${act.type}`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="activity-text">{act.description}</div>
                    <div className="activity-time">{act.time}</div>
                  </div>
                </div>
              );
            }) : (
              <p style={{ color: '#6b7280', padding: '1rem 0' }}>Aucune activité récente.</p>
            )}
          </div>

          <button className="view-all-btn" onClick={() => navigate('/admin/activite')}>
            Voir toute l'activité
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
