import { useNavigate } from 'react-router-dom';
import AnimatedCounter from '../../components/AnimatedCounter';
import {
  Users, UserCog, GraduationCap, Clock,
  Tag, CalendarDays, CheckCircle2, Hourglass,
  AlertTriangle, Info, FileCheck,
  UserPlus, ClipboardCheck, Megaphone, RefreshCw
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  // Données simulées
  const stats = {
    responsables: 4,
    etudiants: 23,
    assistants: 12,
    heuresMois: 156,
    offresActives: 7,
    seancesMois: 42,
    heuresValidees: 120,
    heuresAttente: 28,
  };

  const alerts = [
    {
      type: 'danger',
      icon: <AlertTriangle size={18} />,
      title: '3 étudiants sans IBAN',
      text: 'Traitement des paiements retardé pour le module Finance.',
    },
    {
      type: 'warning',
      icon: <Info size={18} />,
      title: 'M. Bernard sans offres',
      text: 'Action requise : Assigner des rôles de superviseur.',
    },
    {
      type: 'info',
      icon: <FileCheck size={18} />,
      title: '28h en attente de validation',
      text: 'Révision nécessaire pour les séances de Novembre.',
    },
  ];

  const chartData = [
    { month: 'Sept', validated: 80, pending: 20, refused: 12 },
    { month: 'Oct', validated: 120, pending: 28, refused: 0 },
    { month: 'Nov', validated: 60, pending: 40, refused: 8 },
  ];

  const maxChart = 160;

  const activities = [
    {
      type: 'user',
      icon: <UserPlus size={16} />,
      text: <><strong>Léa Martin</strong> s'est inscrite en tant qu'étudiante.</>,
      time: 'Il y a 2 heures',
    },
    {
      type: 'check',
      icon: <ClipboardCheck size={16} />,
      text: <><strong>M. Ettori</strong> a validé <strong>8h</strong> de séances.</>,
      time: 'Il y a 5 heures',
    },
    {
      type: 'offer',
      icon: <Megaphone size={16} />,
      text: <><strong>Mme Durand</strong> a créé une nouvelle offre <span className="activity-tag">Java</span>.</>,
      time: 'Hier à 14:20',
    },
    {
      type: 'system',
      icon: <RefreshCw size={16} />,
      text: <>Mise à jour système : <strong>Export paie</strong> généré.</>,
      time: 'Hier à 09:00',
    },
  ];

  return (
    <>
      {/* Alertes */}
      <div className="alerts-row">
        {alerts.map((alert, i) => (
          <div key={i} className={`alert-banner ${alert.type}`}>
            {alert.icon}
            <div>
              <div className="alert-title">{alert.title}</div>
              <div>{alert.text}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats principales */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <UserCog size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Responsables actifs</div>
            <div className="stat-value"><AnimatedCounter value={stats.responsables} /></div>
          </div>
          <span className="stat-trend up">+2%</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <Users size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Étudiants inscrits</div>
            <div className="stat-value"><AnimatedCounter value={stats.etudiants} /></div>
          </div>
          <span className="stat-trend up">+12%</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <GraduationCap size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Assistants actifs</div>
            <div className="stat-value"><AnimatedCounter value={stats.assistants} /></div>
          </div>
          <span className="stat-trend stable">Stable</span>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon dark">
            <Clock size={22} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Heures ce mois</div>
            <div className="stat-value"><AnimatedCounter value={stats.heuresMois} suffix="h" /></div>
          </div>
        </div>
      </div>

      {/* Stats secondaires */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Offres actives</div>
            <div className="stat-value"><AnimatedCounter value={stats.offres} /></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Séances / mois</div>
            <div className="stat-value"><AnimatedCounter value={stats.seances} /></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label" style={{ color: '#16a34a' }}>Validées</div>
            <div className="stat-value" style={{ color: '#16a34a' }}><AnimatedCounter value={stats.heuresValidees} suffix="h" /></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label" style={{ color: '#f59e0b' }}>En attente</div>
            <div className="stat-value" style={{ color: '#f59e0b' }}><AnimatedCounter value={stats.heuresAttente} suffix="h" /></div>
          </div>
        </div>
      </div>

      {/* Graphique + Activité récente */}
      <div className="content-grid">
        {/* Graphique */}
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
            {chartData.map((d, i) => (
              <div key={i} className="chart-bar-group">
                <div className="chart-bars">
                  <div
                    className="chart-bar validated"
                    style={{ height: `${(d.validated / maxChart) * 180}px` }}
                  />
                  <div
                    className="chart-bar pending"
                    style={{ height: `${(d.pending / maxChart) * 180}px` }}
                  />
                  {d.refused > 0 && (
                    <div
                      className="chart-bar refused"
                      style={{ height: `${(d.refused / maxChart) * 180}px` }}
                    />
                  )}
                </div>
                <div className="chart-label">{d.month}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Activité récente */}
        <div className="content-card">
          <div className="content-card-header">
            <div className="content-card-title">Activité récente</div>
          </div>

          <div className="activity-list">
            {activities.map((act, i) => (
              <div key={i} className="activity-item">
                <div className={`activity-icon ${act.type}`}>
                  {act.icon}
                </div>
                <div>
                  <div className="activity-text">{act.text}</div>
                  <div className="activity-time">{act.time}</div>
                </div>
              </div>
            ))}
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
