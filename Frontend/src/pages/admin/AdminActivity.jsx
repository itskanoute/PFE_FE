import { useState } from 'react';
import { 
  Activity, UserPlus, CheckCircle2, Megaphone, RefreshCw, 
  Clock, ShieldAlert, FileText, ChevronLeft, ChevronRight,
  Filter, Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminActivity = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Expanded mock data
  const activities = [
    { id: 1, type: 'user', icon: <UserPlus size={16} />, text: <span><strong>Léa Martin</strong> s'est inscrite en tant qu'étudiante.</span>, time: 'Il y a 2 heures', date: '13/07/2026' },
    { id: 2, type: 'success', icon: <CheckCircle2 size={16} />, text: <span><strong>M. Ettori</strong> a validé 8h de séances pour Thomas Dubois.</span>, time: 'Il y a 5 heures', date: '13/07/2026' },
    { id: 3, type: 'warning', icon: <Megaphone size={16} />, text: <span><strong>Mme Durand</strong> a créé une nouvelle offre <span className="badge">Java</span>.</span>, time: 'Hier à 14:20', date: '12/07/2026' },
    { id: 4, type: 'system', icon: <RefreshCw size={16} />, text: <span><strong>Système :</strong> Export paie de Juin généré avec succès.</span>, time: 'Hier à 09:00', date: '12/07/2026' },
    { id: 5, type: 'alert', icon: <ShieldAlert size={16} />, text: <span><strong>Alerte :</strong> 3 étudiants n'ont pas encore renseigné leur IBAN.</span>, time: 'Il y a 2 jours', date: '11/07/2026' },
    { id: 6, type: 'document', icon: <FileText size={16} />, text: <span><strong>Emma Lemaire</strong> a téléversé son contrat de prestation.</span>, time: 'Il y a 2 jours', date: '11/07/2026' },
    { id: 7, type: 'user', icon: <UserPlus size={16} />, text: <span><strong>Marc Bernard</strong> a été ajouté en tant que Responsable.</span>, time: 'Il y a 3 jours', date: '10/07/2026' },
    { id: 8, type: 'success', icon: <CheckCircle2 size={16} />, text: <span><strong>Sophie Durand</strong> a validé 12h de séances.</span>, time: 'Il y a 3 jours', date: '10/07/2026' },
  ];

  const filteredActivities = activities.filter(act => {
    const matchesSearch = act.text.props.children.join('').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || act.type === filterType;
    return matchesSearch && matchesFilter;
  });

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
          {filteredActivities.length > 0 ? (
            filteredActivities.map((act, i) => (
              <div key={act.id} style={{ 
                display: 'flex', alignItems: 'flex-start', gap: '1.25rem', padding: '1.25rem 0', 
                borderBottom: i < filteredActivities.length - 1 ? '1px solid var(--border-color)' : 'none'
              }}>
                <div className={`activity-icon ${act.type}`} style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>
                  {act.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.95rem', color: 'var(--primary-dark)', marginBottom: '0.25rem', lineHeight: 1.4 }}>
                    {act.text}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {act.time}</span>
                    <span>•</span>
                    <span>{act.date}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Activity size={48} style={{ opacity: 0.2, margin: '0 auto 1rem auto' }} />
              <p style={{ fontWeight: 500, fontSize: '1rem', color: 'var(--primary-dark)' }}>Aucune activité trouvée</p>
              <p style={{ fontSize: '0.875rem' }}>Essayez de modifier vos filtres de recherche.</p>
            </div>
          )}
        </div>

        {filteredActivities.length > 0 && (
          <div className="pagination" style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', background: '#fafafa', borderBottomLeftRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-lg)' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Affichage de {filteredActivities.length} événements</span>
            <div className="pagination-controls">
              <button className="page-btn"><ChevronLeft size={16} /></button>
              <button className="page-btn active">1</button>
              <button className="page-btn"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminActivity;
