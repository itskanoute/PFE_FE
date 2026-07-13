import { useState } from 'react';
import AnimatedCounter from '../../components/AnimatedCounter';
import {
  Users, Clock, Building2, Plus, Pencil, Link2,
  ShieldOff, ShieldCheck, Trash2, ChevronLeft, ChevronRight,
  X, Copy, Eye, EyeOff, Lock, ChevronDown, UserPlus, AlertTriangle
} from 'lucide-react';

const AdminResponsables = () => {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedResp, setSelectedResp] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [createdResp, setCreatedResp] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [generatedPassword] = useState('Xk9$mP2wLq');
  const [showPassword, setShowPassword] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', departement: '', telephone: ''
  });

  const stats = {
    total: 42,
    heuresAValider: 128,
    departements: 8,
  };

  const [responsables, setResponsables] = useState([
    {
      id: 1, initials: 'EE', nom: 'Eric Ettori', departement: 'Informatique',
      statut: 'active', offres: 3, assistants: 5, heures: 48, dernierAcces: "Aujourd'hui",
    },
    {
      id: 2, initials: 'SD', nom: 'Sophie Durand', departement: 'Informatique',
      statut: 'active', offres: 2, assistants: 3, heures: 24, dernierAcces: 'Hier',
    },
    {
      id: 3, initials: 'MB', nom: 'Marc Bernard', departement: 'Réseaux',
      statut: 'inactive', offres: 0, assistants: 0, heures: 0, dernierAcces: 'Il y a 1 mois',
    },
  ]);

  const handleCreate = (e) => {
    e.preventDefault();
    const newResp = {
      id: Date.now(),
      initials: (formData.prenom.charAt(0) + formData.nom.charAt(0)).toUpperCase(),
      nom: `${formData.prenom} ${formData.nom}`,
      departement: formData.departement,
      statut: 'active',
      offres: 0,
      assistants: 0,
      heures: 0,
      dernierAcces: 'Jamais'
    };
    setResponsables([newResp, ...responsables]);
    setCreatedResp({ ...formData, password: generatedPassword });
    setShowModal(false);
    setShowConfirm(true);
    setFormData({ nom: '', prenom: '', email: '', departement: '', telephone: '' });
  };

  return (
    <>
      {/* Breadcrumb + Title */}
      <div className="page-header">
        <div className="page-breadcrumb">
          <a href="#">EduManage</a> &gt; <span>Responsables</span>
        </div>
        <div className="page-title-row">
          <div>
            <h1 className="page-title">Gestion des Responsables</h1>
            <p className="page-subtitle">
              Visualisez et gérez les accès des responsables pédagogiques par département.
              Suivez leurs activités et validez les heures de tutorat.
            </p>
          </div>
          <button className="btn-action primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }} onClick={() => setShowModal(true)}>
            <Plus size={18} /> Ajouter un responsable
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon purple"><Users size={22} /></div>
          <div className="stat-content">
            <div className="stat-label">Total Responsables</div>
            <div className="stat-value"><AnimatedCounter value={stats.total} /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><Clock size={22} /></div>
          <div className="stat-content">
            <div className="stat-label">Heures à Valider</div>
            <div className="stat-value"><AnimatedCounter value={stats.heuresAValider} suffix="h" /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Building2 size={22} /></div>
          <div className="stat-content">
            <div className="stat-label">Départements</div>
            <div className="stat-value"><AnimatedCounter value={stats.departements} /></div>
          </div>
        </div>
      </div>

      {/* Cards responsables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {responsables.map((r) => (
          <div key={r.id} className="content-card" style={{ padding: 0, overflow: 'hidden', opacity: r.statut === 'inactive' ? 0.7 : 1 }}>
            <div style={{ padding: '1.5rem' }}>
              {/* Header card */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 10, background: r.statut === 'inactive' ? '#f3f4f6' : '#f0f0ff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.875rem', color: r.statut === 'inactive' ? '#9ca3af' : 'var(--primary-dark)'
                }}>
                  {r.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary-dark)',
                      textDecoration: r.statut === 'inactive' ? 'line-through' : 'none'
                    }}>
                      {r.nom}
                    </span>
                    <span className={`badge ${r.statut === 'active' ? 'success' : 'neutral'}`}>
                      {r.statut === 'active' ? 'ACTIF' : 'DÉSACTIVÉ'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: r.statut === 'active' ? '#16a34a' : '#9ca3af', display: 'inline-block' }} />
                    {r.departement}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Offres</div>
                  <div style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{r.offres} Offres</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assistants</div>
                  <div style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{r.assistants} assistants</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Heures Validées</div>
                  <div style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{r.heures}h</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dernier accès</div>
                  <div style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{r.dernierAcces}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.75rem 1.5rem', borderTop: '1px solid var(--border-color)', background: '#fafafa'
            }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  className="header-icon-btn" 
                  title="Modifier"
                  onClick={() => {
                    const parts = r.nom.split(' ');
                    const prenom = parts[0];
                    const nom = parts.slice(1).join(' ');
                    setFormData({ prenom, nom, email: 'contact@escp.eu', departement: r.departement, telephone: '' });
                    setSelectedResp(r);
                    setShowEditModal(true);
                  }}
                ><Pencil size={16} /></button>
                <a 
                  href={`mailto:contact@escp.eu?subject=Vos%20identifiants%20EduManage&body=Bonjour%20${r.nom},%0A%0AVoici%20vos%20identifiants%20de%20connexion%20pour%20le%20portail%20EduManage.%0A%0AEmail:%20contact@escp.eu%0AMot%20de%20passe:%20(Temporaire)%0A%0ACordialement,%0AL'équipe%20Admin`}
                  className="header-icon-btn" 
                  title="Renvoyer identifiants"
                  style={{ display: 'inline-flex', textDecoration: 'none', color: 'inherit' }}
                >
                  <Link2 size={16} />
                </a>
                <button className="header-icon-btn" title="Supprimer" onClick={() => { setSelectedResp(r); setShowDeleteModal(true); }}>
                  <Trash2 size={16} color="#dc2626" />
                </button>
              </div>
              {r.statut === 'active' ? (
                <button 
                  className="btn-action danger" 
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => { setSelectedResp(r); setShowStatusModal(true); }}
                >
                  <ShieldOff size={14} /> Désactiver
                </button>
              ) : (
                <button 
                  className="btn-action outline" 
                  style={{ fontSize: '0.75rem', color: '#16a34a', borderColor: '#bbf7d0' }}
                  onClick={() => { setSelectedResp(r); setShowStatusModal(true); }}
                >
                  <ShieldCheck size={14} /> Réactiver
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Affichage de 3 sur {stats.total} responsables pédagogiques
        </span>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button className="btn-action outline" style={{ padding: '0.4rem 0.6rem' }} onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}>
            <ChevronLeft size={16} />
          </button>
          {[1, 2, 3].map((p) => (
            <button
              key={p}
              className={`btn-action ${currentPage === p ? 'primary' : 'outline'}`}
              style={{ padding: '0.4rem 0.75rem', minWidth: '36px' }}
              onClick={() => setCurrentPage(p)}
            >
              {p}
            </button>
          ))}
          <button className="btn-action outline" style={{ padding: '0.4rem 0.6rem' }} onClick={() => setCurrentPage(Math.min(3, currentPage + 1))}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Modal Créer un responsable */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: 'var(--radius-lg)', padding: '2rem',
            width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>Ajouter un responsable pédagogique</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Créez un nouvel accès pour un membre de l'équipe académique.</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, color: 'var(--primary-dark)', fontSize: '0.8rem' }}>Nom</label>
                  <input className="form-input" placeholder="Ex: Dupont" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, color: 'var(--primary-dark)', fontSize: '0.8rem' }}>Prénom</label>
                  <input className="form-input" placeholder="Ex: Marie" value={formData.prenom} onChange={(e) => setFormData({ ...formData, prenom: e.target.value })} required />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--primary-dark)', fontSize: '0.8rem' }}>Email professionnel</label>
                <input className="form-input" type="email" placeholder="m.dupont@escp.eu" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  L'adresse doit obligatoirement se terminer par @escp.eu
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, color: 'var(--primary-dark)', fontSize: '0.8rem' }}>Département / Matière</label>
                  <div style={{ position: 'relative' }}>
                    <select 
                      className="form-input" 
                      style={{ appearance: 'none', color: formData.departement ? 'inherit' : '#9ca3af' }} 
                      value={formData.departement} 
                      onChange={(e) => setFormData({ ...formData, departement: e.target.value })} 
                      required
                    >
                      <option value="" disabled>Sélectionner un département</option>
                      <option value="Informatique">Informatique</option>
                      <option value="Management">Management</option>
                      <option value="Ressources Humaines">Ressources Humaines</option>
                      <option value="Finance">Finance</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                    <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, color: 'var(--primary-dark)', fontSize: '0.8rem' }}>N° Téléphone (Optionnel)</label>
                  <input className="form-input" placeholder="+33 6 12 34 56 78" value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} />
                </div>
              </div>

              {/* Générateur de mot de passe */}
              <div style={{ background: '#f8fafc', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lock size={14} /> Mot de passe temporaire
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className="form-input" 
                      value={generatedPassword} 
                      readOnly 
                      style={{ paddingRight: '2.5rem', fontWeight: 600, background: 'white' }} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <button type="button" onClick={() => navigator.clipboard.writeText(generatedPassword)} className="btn-action outline" style={{ background: 'white', color: 'var(--primary-dark)', borderColor: 'var(--border-color)', gap: '6px', fontWeight: 600 }}>
                    <Copy size={16} /> Copier
                  </button>
                </div>
              </div>

              {/* Options d'envoi */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'flex', gap: '1rem', padding: '1rem', border: `1px solid ${sendEmail ? '#8b5cf6' : 'var(--border-color)'}`, borderRadius: 'var(--radius-md)', background: sendEmail ? '#f5f3ff' : 'white', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '0.5rem' }}>
                  <div style={{ paddingTop: '2px' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${sendEmail ? '#8b5cf6' : '#d1d5db'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {sendEmail && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#8b5cf6' }} />}
                    </div>
                  </div>
                  <input type="radio" checked={sendEmail} onChange={() => setSendEmail(true)} style={{ display: 'none' }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '2px' }}>Envoyer par email automatiquement</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Le responsable recevra ses accès avec un lien pour se connecter.</div>
                  </div>
                </label>

                <label style={{ display: 'flex', gap: '1rem', padding: '1rem', border: `1px solid ${!sendEmail ? '#8b5cf6' : 'var(--border-color)'}`, borderRadius: 'var(--radius-md)', background: !sendEmail ? '#f5f3ff' : 'white', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ paddingTop: '2px' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${!sendEmail ? '#8b5cf6' : '#d1d5db'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {!sendEmail && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#8b5cf6' }} />}
                    </div>
                  </div>
                  <input type="radio" checked={!sendEmail} onChange={() => setSendEmail(false)} style={{ display: 'none' }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '2px' }}>Ne pas envoyer (je transmettrai moi-même)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pratique pour les onboarding en présentiel ou formation groupée.</div>
                  </div>
                </label>
              </div>

              <div style={{ background: '#f8fafc', margin: '0 -2rem -2rem -2rem', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-color)', borderBottomLeftRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-lg)' }}>
                <button type="button" className="btn-action outline" onClick={() => setShowModal(false)} style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>Annuler</button>
                <button type="submit" className="btn-action primary" style={{ fontWeight: 600 }}>
                  <UserPlus size={18} /> Créer et envoyer les identif.
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Modifier le responsable */}
      {showEditModal && selectedResp && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: 'var(--radius-lg)', padding: '2rem',
            width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>Modifier le responsable</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Mettez à jour les informations du profil.</p>
              </div>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={(e) => { 
              e.preventDefault();
              setResponsables(responsables.map(r => r.id === selectedResp.id ? { ...r, nom: formData.prenom + ' ' + formData.nom, departement: formData.departement } : r));
              setCreatedResp({ ...formData, isEdit: true }); 
              setShowEditModal(false); 
              setShowConfirm(true); 
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, color: 'var(--primary-dark)', fontSize: '0.8rem' }}>Nom</label>
                  <input className="form-input" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, color: 'var(--primary-dark)', fontSize: '0.8rem' }}>Prénom</label>
                  <input className="form-input" value={formData.prenom} onChange={(e) => setFormData({ ...formData, prenom: e.target.value })} required />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--primary-dark)', fontSize: '0.8rem' }}>Email professionnel</label>
                <input className="form-input" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, color: 'var(--primary-dark)', fontSize: '0.8rem' }}>Département / Matière</label>
                  <div style={{ position: 'relative' }}>
                    <select className="form-input" style={{ appearance: 'none' }} value={formData.departement} onChange={(e) => setFormData({ ...formData, departement: e.target.value })} required>
                      <option value="Informatique">Informatique</option>
                      <option value="Management">Management</option>
                      <option value="Ressources Humaines">Ressources Humaines</option>
                      <option value="Finance">Finance</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                    <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, color: 'var(--primary-dark)', fontSize: '0.8rem' }}>N° Téléphone</label>
                  <input className="form-input" value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn-action outline" onClick={() => setShowEditModal(false)} style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>Annuler</button>
                <button type="submit" className="btn-action primary" style={{ fontWeight: 600 }}>Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmation */}
      {showConfirm && createdResp && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: 'var(--radius-lg)', padding: '2rem',
            width: '100%', maxWidth: '420px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
              {createdResp.isEdit ? 'Profil mis à jour !' : 
               createdResp.isDelete ? 'Responsable supprimé' : 
               createdResp.isStatusChange ? 'Statut mis à jour !' :
               'Responsable créé avec succès !'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              👨‍🏫 {createdResp.prenom} {createdResp.nom}
            </p>
            
            {!createdResp.isEdit && !createdResp.isDelete && !createdResp.isStatusChange && (
              <>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  📧 Identifiants envoyés à : <strong>{createdResp.email}</strong>
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Le responsable pourra se connecter immédiatement.<br />
                  Il devra changer son mot de passe à la première connexion.
                </p>
              </>
            )}

            {createdResp.isEdit && !createdResp.isDelete && (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Les modifications ont bien été enregistrées.
              </p>
            )}

            {createdResp.isDelete && (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Ce compte a bien été supprimé de la base de données.
              </p>
            )}

            {createdResp.isStatusChange && (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Le compte a bien été {createdResp.newStatus === 'active' ? 'réactivé' : 'désactivé'}.
              </p>
            )}

            <button className="btn-action primary" style={{ padding: '0.75rem 2rem' }} onClick={() => { setShowConfirm(false); setCreatedResp(null); }}>
              OK ✅
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Activer / Désactiver */}
      {showStatusModal && selectedResp && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: 'var(--radius-lg)', padding: '2rem',
            width: '100%', maxWidth: '420px'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '1rem' }}>
              {selectedResp.statut === 'active' ? 'Désactiver le compte' : 'Réactiver le compte'}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {selectedResp.statut === 'active' 
                ? <>Êtes-vous sûr de vouloir désactiver l'accès de <strong>{selectedResp.nom}</strong> ? Il ne pourra plus se connecter au portail, mais son historique d'heures validées sera conservé.</>
                : <>Êtes-vous sûr de vouloir réactiver l'accès de <strong>{selectedResp.nom}</strong> ? Il pourra de nouveau se connecter au portail.</>
              }
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn-action outline" onClick={() => setShowStatusModal(false)}>Annuler</button>
              <button 
                className="btn-action primary" 
                style={selectedResp.statut === 'active' ? { background: '#f59e0b', borderColor: '#f59e0b' } : { background: '#16a34a', borderColor: '#16a34a' }}
                onClick={() => { 
                  setResponsables(responsables.map(r => r.id === selectedResp.id ? { ...r, statut: r.statut === 'active' ? 'inactive' : 'active' } : r));
                  setShowStatusModal(false); 
                  const parts = selectedResp.nom.split(' ');
                  setCreatedResp({ 
                    prenom: parts[0], 
                    nom: parts.slice(1).join(' '), 
                    isStatusChange: true,
                    newStatus: selectedResp.statut === 'active' ? 'inactive' : 'active'
                  });
                  setShowConfirm(true); 
                }}
              >
                {selectedResp.statut === 'active' ? 'Oui, désactiver' : 'Oui, réactiver'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Supprimer */}
      {showDeleteModal && selectedResp && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: 'var(--radius-lg)', padding: '2rem',
            width: '100%', maxWidth: '420px', borderTop: '4px solid #dc2626'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#dc2626', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={24} /> Supprimer le responsable
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Cette action est irréversible. Le profil de <strong>{selectedResp.nom}</strong> sera définitivement supprimé du système.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn-action outline" onClick={() => setShowDeleteModal(false)}>Annuler</button>
              <button className="btn-action primary" style={{ background: '#dc2626', borderColor: '#dc2626' }} onClick={() => { 
                setResponsables(responsables.filter(r => r.id !== selectedResp.id));
                setShowDeleteModal(false); 
                const parts = selectedResp.nom.split(' ');
                setCreatedResp({ prenom: parts[0], nom: parts.slice(1).join(' '), isDelete: true });
                setShowConfirm(true); 
              }}>
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminResponsables;
