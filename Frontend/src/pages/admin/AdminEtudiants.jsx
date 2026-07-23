import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import AnimatedCounter from '../../components/AnimatedCounter';
import { getAdminStudents, createAdminStudent } from '../../services/api';
import {
  Users, ShieldCheck, CreditCard, AlertTriangle,
  Filter, ChevronDown, MoreVertical, Mail,
  UserPlus, Download, CheckCircle2, XCircle,
  X, Copy, Eye, EyeOff, Lock, Pencil, Trash2, Key, ShieldOff
} from 'lucide-react';

const AdminEtudiants = () => {
  const navigate = useNavigate();
  const { searchTerm = '' } = useOutletContext() ?? {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalInscrits: 0,
    assistantsActifs: 0,
    ibanValides: 0,
    ibanManquants: 0,
  });
  const [etudiants, setEtudiants] = useState([]);
  const [filieres, setFilieres] = useState([]);

  const [filterFiliere, setFilterFiliere] = useState('');
  const [filterIban, setFilterIban] = useState(false);
  const [filterAssistant, setFilterAssistant] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // States for actions modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedEtudiant, setSelectedEtudiant] = useState(null);

  const [createdEtudiant, setCreatedEtudiant] = useState(null);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', filiere: '', identifiant: ''
  });

  const loadData = useCallback(async () => {
    try {
      setError('');
      const data = await getAdminStudents({
        filiere: filterFiliere || undefined,
        ibanMissing: filterIban || undefined,
        assistantOnly: filterAssistant || undefined,
      });
      setStats(data.stats);
      setEtudiants(data.students);
      setFilieres(data.filieres || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filterFiliere, filterIban, filterAssistant]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await createAdminStudent({
        firstName: formData.prenom,
        lastName: formData.nom,
        email: formData.email,
        studentNumber: formData.identifiant,
        major: formData.filiere,
        sendEmail,
      });
      setCreatedEtudiant({
        ...formData,
        password: result.temporaryPassword,
        sendEmail,
        emailSent: Boolean(result.emailSent),
        emailWarning: result.emailWarning || null,
      });
      setGeneratedPassword(result.temporaryPassword || '');
      setShowPassword(true);
      setShowModal(false);
      setShowConfirm(true);
      setFormData({ nom: '', prenom: '', email: '', filiere: '', identifiant: '' });
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEtudiants = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return etudiants;
    return etudiants.filter((e) =>
      e.nom.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q) ||
      e.identifiant?.toLowerCase().includes(q) ||
      e.filiere?.toLowerCase().includes(q)
    );
  }, [etudiants, searchTerm]);

  if (loading) {
    return <div className="content-card" style={{ padding: '2rem' }}>Chargement des étudiants...</div>;
  }

  if (error) {
    return (
      <div className="content-card" style={{ padding: '2rem', color: '#b91c1c' }}>
        {error}
      </div>
    );
  }

  return (
    <>
      {/* Title */}
      <div className="page-header">
        <div className="page-title-row">
          <div>
            <h1 className="page-title">Étudiants inscrits ({stats.totalInscrits})</h1>
            <p className="page-subtitle">
              Gérez les dossiers académiques et le statut des assistants pour l'année en cours.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-action primary" style={{ padding: '0.75rem 1.25rem' }} onClick={() => setShowModal(true)}>
              <UserPlus size={16} /> Inscrire un étudiant
            </button>
            <button className="btn-action outline" style={{ padding: '0.75rem 1.25rem' }}>
              <Download size={16} /> Exporter CSV
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <select
            className="form-input"
            style={{ paddingRight: '2rem', appearance: 'none', minWidth: '200px', fontSize: '0.8rem' }}
            value={filterFiliere}
            onChange={(e) => setFilterFiliere(e.target.value)}
          >
            <option value="">Toutes les filières</option>
            {filieres.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6b7280' }} />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={filterIban} onChange={(e) => setFilterIban(e.target.checked)} />
          IBAN manquant
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={filterAssistant} onChange={(e) => setFilterAssistant(e.target.checked)} />
          Assistants actifs
        </label>

        <div style={{ flex: 1 }} />

        <button className="btn-action primary" style={{ background: '#7c3aed' }} onClick={() => setShowAdvancedFilters(true)}>
          <Filter size={14} /> Filtres avancés
        </button>
      </div>

      {/* Table */}
      <div className="data-table-container" style={{ marginBottom: '1.5rem' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Nom de l'étudiant</th>
              <th>Identifiant</th>
              <th>Filière</th>
              <th>Statut IBAN</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEtudiants.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  {searchTerm.trim() ? 'Aucun étudiant ne correspond à votre recherche.' : 'Aucun étudiant inscrit.'}
                </td>
              </tr>
            ) : filteredEtudiants.map((e) => (
              <tr key={e.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', background: e.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: '0.7rem', flexShrink: 0
                    }}>
                      {e.initials}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{e.nom}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{e.email}</div>
                    </div>
                  </div>
                </td>
                <td>{e.identifiant}</td>
                <td><span className="badge neutral">{e.filiere}</span></td>
                <td>
                  {e.ibanOk ? (
                    <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={20} />
                    </span>
                  ) : (
                    <span style={{ color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <XCircle size={20} />
                    </span>
                  )}
                </td>
                <td>
                  <div>
                    <span className={`badge ${e.statut === 'assistant' ? 'info' : 'neutral'}`}>
                      {e.statut === 'assistant' ? '👨‍🏫 Assistant' : 'Inscrit'}
                    </span>
                    {!e.ibanOk && e.statut === 'assistant' && (
                      <button
                        type="button"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          if (!e.email) {
                            alert("Aucun email trouvé pour cet étudiant.");
                            return;
                          }
                          const subject = encodeURIComponent('Rappel — IBAN manquant sur EduManage');
                          const body = encodeURIComponent(
                            `Bonjour ${e.firstName || e.prenom || ''},\n\nVotre dossier indique que votre IBAN n'est pas encore renseigné.\nMerci de le compléter dans votre profil EduManage afin de permettre le versement de vos heures.\n\nCordialement,\nL'administration`
                          );
                          window.location.href = `mailto:${e.email}?subject=${subject}&body=${body}`;
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          fontSize: '0.65rem', color: '#dc2626', fontWeight: 700,
                          background: 'none', border: 'none', cursor: 'pointer', marginTop: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                        <Mail size={12} /> Rappel IBAN
                      </button>
                    )}
                  </div>
                </td>
                <td style={{ position: 'relative' }}>
                  <button 
                    className="header-icon-btn" 
                    onClick={() => setActiveDropdown(activeDropdown === e.id ? null : e.id)}
                    onBlur={() => setTimeout(() => setActiveDropdown(null), 200)}
                  >
                    <MoreVertical size={16} />
                  </button>

                  {activeDropdown === e.id && (
                    <div style={{
                      position: 'absolute', right: '0', top: '100%', marginTop: '0.25rem',
                      background: 'white', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
                      border: '1px solid var(--border-color)', padding: '0.5rem', zIndex: 100, minWidth: '220px',
                      display: 'flex', flexDirection: 'column', gap: '4px'
                    }}>
                      <button 
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '0.5rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-color)', borderRadius: '4px' }} 
                        onMouseEnter={(event) => event.target.style.background = '#f3f4f6'} onMouseLeave={(event) => event.target.style.background = 'none'}
                        onMouseDown={() => navigate(`/admin/etudiants/${e.id}`)}
                      >
                        <Eye size={14} /> Voir le profil complet
                      </button>
                      <button 
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '0.5rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-color)', borderRadius: '4px' }} 
                        onMouseEnter={(event) => event.target.style.background = '#f3f4f6'} onMouseLeave={(event) => event.target.style.background = 'none'}
                        onMouseDown={() => { setSelectedEtudiant(e); setFormData({ nom: e.nom.split(' ')[1] || '', prenom: e.nom.split(' ')[0] || '', email: e.email, filiere: e.filiere, identifiant: e.identifiant }); setShowEditModal(true); setActiveDropdown(null); }}
                      >
                        <Pencil size={14} /> Modifier l'étudiant
                      </button>
                      {e.statut === 'assistant' ? (
                        <button 
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '0.5rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem', color: '#d97706', borderRadius: '4px' }} 
                          onMouseEnter={(event) => event.target.style.background = '#fef3c7'} onMouseLeave={(event) => event.target.style.background = 'none'}
                          onMouseDown={() => { setSelectedEtudiant(e); setShowRoleModal(true); setActiveDropdown(null); }}
                        >
                          <ShieldOff size={14} /> Retirer le rôle d'Assistant
                        </button>
                      ) : (
                        <button 
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '0.5rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem', color: '#16a34a', borderRadius: '4px' }} 
                          onMouseEnter={(event) => event.target.style.background = '#dcfce7'} onMouseLeave={(event) => event.target.style.background = 'none'}
                          onMouseDown={() => { setSelectedEtudiant(e); setShowRoleModal(true); setActiveDropdown(null); }}
                        >
                          <ShieldCheck size={14} /> Nommer Assistant
                        </button>
                      )}
                      <button 
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '0.5rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-color)', borderRadius: '4px' }} 
                        onMouseEnter={(event) => event.target.style.background = '#f3f4f6'} onMouseLeave={(event) => event.target.style.background = 'none'}
                        onMouseDown={() => { setSelectedEtudiant(e); setGeneratedPassword(Math.random().toString(36).slice(-8) + 'A!'); setShowPasswordModal(true); setActiveDropdown(null); }}
                      >
                        <Key size={14} /> Réinitialiser mot de passe
                      </button>
                      
                      <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />
                      
                      <button 
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '0.5rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem', color: '#dc2626', borderRadius: '4px' }} 
                        onMouseEnter={(event) => event.target.style.background = '#fef2f2'} onMouseLeave={(event) => event.target.style.background = 'none'}
                        onMouseDown={() => { setSelectedEtudiant(e); setShowDeleteModal(true); setActiveDropdown(null); }}
                      >
                        <Trash2 size={14} /> Supprimer l'étudiant
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stats résumé en bas */}
      <div className="stats-grid">
        <div className="stat-card" style={{ background: 'var(--primary-dark)', borderColor: 'var(--primary-dark)' }}>
          <div className="stat-content">
            <div className="stat-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Total Inscrits</div>
            <div className="stat-value" style={{ color: 'white' }}><AnimatedCounter value={stats.totalInscrits} /></div>
          </div>
          <Users size={28} style={{ color: 'rgba(255,255,255,0.3)' }} />
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Assistants Actifs</div>
            <div className="stat-value"><AnimatedCounter value={stats.assistantsActifs} /></div>
          </div>
          <ShieldCheck size={28} style={{ color: '#dbeafe' }} />
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">IBAN Validés</div>
            <div className="stat-value" style={{ color: '#16a34a' }}><AnimatedCounter value={stats.ibanValides} /></div>
          </div>
          <CreditCard size={28} style={{ color: '#dcfce7' }} />
        </div>

        <div className="stat-card" style={{ background: '#fef2f2', borderColor: '#fecaca' }}>
          <div className="stat-content">
            <div className="stat-label" style={{ color: '#dc2626' }}>IBAN Manquants</div>
            <div className="stat-value" style={{ color: '#dc2626' }}><AnimatedCounter value={stats.ibanManquants} prefix="0" /></div>
          </div>
          <AlertTriangle size={28} style={{ color: '#fecaca' }} />
        </div>
      </div>

      {/* Modal Créer un étudiant */}
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
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>Inscrire un étudiant</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Créez un profil académique pour un étudiant.</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, color: 'var(--primary-dark)', fontSize: '0.8rem' }}>Nom</label>
                  <input className="form-input" placeholder="Ex: Martin" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, color: 'var(--primary-dark)', fontSize: '0.8rem' }}>Prénom</label>
                  <input className="form-input" placeholder="Ex: Léa" value={formData.prenom} onChange={(e) => setFormData({ ...formData, prenom: e.target.value })} required />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--primary-dark)', fontSize: '0.8rem' }}>Email institutionnel</label>
                <input className="form-input" type="email" placeholder="l.martin@university.fr" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Accepté : domaine de l'école ou @gmail.com
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, color: 'var(--primary-dark)', fontSize: '0.8rem' }}>Filière</label>
                  <div style={{ position: 'relative' }}>
                    <select 
                      className="form-input" 
                      style={{ appearance: 'none', color: formData.filiere ? 'inherit' : '#9ca3af' }} 
                      value={formData.filiere} 
                      onChange={(e) => setFormData({ ...formData, filiere: e.target.value })} 
                      required
                    >
                      <option value="" disabled hidden>Choisir une filière</option>
                      {filieres.length > 0 ? (
                        filieres.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))
                      ) : (
                        <>
                          <option value="L2 Informatique">L2 Informatique</option>
                          <option value="L3 Informatique">L3 Informatique</option>
                          <option value="M1 Informatique">M1 Informatique</option>
                          <option value="M2 Informatique">M2 Informatique</option>
                        </>
                      )}
                    </select>
                    <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, color: 'var(--primary-dark)', fontSize: '0.8rem' }}>Numéro étudiant</label>
                  <input className="form-input" placeholder="Ex: 2023-0001" value={formData.identifiant} onChange={(e) => setFormData({ ...formData, identifiant: e.target.value })} required />
                </div>
              </div>

              {/* Mot de passe généré */}
              <div style={{ background: '#f3f4f6', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lock size={14} /> Mot de passe temporaire
                  </div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Généré automatiquement à l'inscription
                  </div>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Un mot de passe sécurisé sera créé et affiché après validation (et envoyé par email si demandé).
                </p>
              </div>

              {/* Envoi identifiants */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                  <div style={{ 
                    width: '20px', height: '20px', borderRadius: '50%', border: sendEmail ? '6px solid var(--primary-dark)' : '1px solid #9ca3af',
                    background: 'white', marginTop: '2px', flexShrink: 0, transition: 'all 0.2s' 
                  }} />
                  <input type="radio" checked={sendEmail} onChange={() => setSendEmail(true)} style={{ display: 'none' }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '2px' }}>Envoyer par email automatiquement</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>L'étudiant recevra ses accès dès la validation du formulaire.</div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                  <div style={{ 
                    width: '20px', height: '20px', borderRadius: '50%', border: !sendEmail ? '6px solid var(--primary-dark)' : '1px solid #9ca3af',
                    background: 'white', marginTop: '2px', flexShrink: 0, transition: 'all 0.2s' 
                  }} />
                  <input type="radio" checked={!sendEmail} onChange={() => setSendEmail(false)} style={{ display: 'none' }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '2px' }}>Ne pas envoyer</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Les accès seront transmis via le système scolarité.</div>
                  </div>
                </label>
              </div>

              <div style={{ background: '#f8fafc', margin: '0 -2rem -2rem -2rem', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-color)', borderBottomLeftRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-lg)' }}>
                <button type="button" className="btn-action outline" onClick={() => setShowModal(false)} style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>Annuler</button>
                <button type="submit" className="btn-action primary" style={{ fontWeight: 600 }} disabled={submitting}>
                  <UserPlus size={18} /> {submitting ? 'Inscription...' : "Inscrire l'étudiant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmation Générique */}
      {showConfirm && createdEtudiant && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: 'var(--radius-lg)', padding: '2rem',
            width: '100%', maxWidth: '420px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Étudiant inscrit !</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              🎓 {createdEtudiant.prenom} {createdEtudiant.nom}
            </p>
            {createdEtudiant.emailSent ? (
              <p style={{ fontSize: '0.875rem', color: '#047857', marginBottom: '1rem' }}>
                📧 Identifiants envoyés à <strong>{createdEtudiant.email}</strong>
              </p>
            ) : createdEtudiant.sendEmail ? (
              <p style={{ fontSize: '0.875rem', color: '#b45309', marginBottom: '1rem' }}>
                ⚠️ Email non envoyé{createdEtudiant.emailWarning ? ` — ${createdEtudiant.emailWarning}` : ''}.
              </p>
            ) : (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Transmettez manuellement les accès à <strong>{createdEtudiant.email}</strong>
              </p>
            )}
            {createdEtudiant.password && (
              <div style={{ background: '#f8fafc', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem', border: '1px solid var(--border-color)', textAlign: 'left' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Mot de passe temporaire</div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <code style={{ flex: 1, fontWeight: 700, fontSize: '0.9rem' }}>
                    {showPassword ? createdEtudiant.password : '••••••••••'}
                  </code>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button type="button" onClick={() => navigator.clipboard.writeText(createdEtudiant.password)} className="btn-action outline" style={{ padding: '0.4rem 0.6rem' }}>
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            )}
            <button className="btn-action primary" style={{ padding: '0.75rem 2rem' }} onClick={() => { setShowConfirm(false); setCreatedEtudiant(null); }}>
              OK ✅
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Modifier l'étudiant */}
      {showEditModal && selectedEtudiant && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: 'var(--radius-lg)', padding: '2rem',
            width: '100%', maxWidth: '520px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>Modifier l'étudiant</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Mettez à jour les informations du profil.</p>
              </div>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); setCreatedEtudiant(formData); setShowEditModal(false); setShowConfirm(true); }}>
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
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--primary-dark)', fontSize: '0.8rem' }}>Email institutionnel</label>
                <input className="form-input" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, color: 'var(--primary-dark)', fontSize: '0.8rem' }}>Filière</label>
                  <div style={{ position: 'relative' }}>
                    <select className="form-input" style={{ appearance: 'none' }} value={formData.filiere} onChange={(e) => setFormData({ ...formData, filiere: e.target.value })} required>
                      <option value="L2 Informatique">L2 Informatique</option>
                      <option value="L3 Informatique">L3 Informatique</option>
                      <option value="M1 Management">M1 Management</option>
                    </select>
                    <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, color: 'var(--primary-dark)', fontSize: '0.8rem' }}>Numéro étudiant</label>
                  <input className="form-input" value={formData.identifiant} onChange={(e) => setFormData({ ...formData, identifiant: e.target.value })} required />
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

      {/* MODAL: Changer de Rôle */}
      {showRoleModal && selectedEtudiant && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: 'var(--radius-lg)', padding: '2rem',
            width: '100%', maxWidth: '420px'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '1rem' }}>Confirmation</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Êtes-vous sûr de vouloir <strong>{selectedEtudiant.statut === 'assistant' ? "retirer le rôle d'Assistant" : "nommer Assistant"}</strong> l'étudiant {selectedEtudiant.nom} ?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn-action outline" onClick={() => setShowRoleModal(false)}>Annuler</button>
              <button className="btn-action primary" onClick={() => { setCreatedEtudiant({ nom: selectedEtudiant.nom, prenom: '' }); setShowRoleModal(false); setShowConfirm(true); }}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Réinitialiser mot de passe */}
      {showPasswordModal && selectedEtudiant && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: 'var(--radius-lg)', padding: '2rem',
            width: '100%', maxWidth: '480px'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '1rem' }}>Nouveau mot de passe</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Le mot de passe de <strong>{selectedEtudiant.nom}</strong> a été réinitialisé.
            </p>
            <div style={{ background: '#f3f4f6', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={14} /> Mot de passe temporaire
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <input type="text" className="form-input" value={generatedPassword} readOnly style={{ fontWeight: 600, background: 'white' }} />
                </div>
                <button type="button" onClick={() => navigator.clipboard.writeText(generatedPassword)} className="btn-action outline" style={{ background: 'white', color: 'var(--primary-dark)', borderColor: 'var(--border-color)', gap: '6px', fontWeight: 600 }}>
                  <Copy size={16} /> Copier
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-action primary" onClick={() => setShowPasswordModal(false)}>Terminer</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Supprimer */}
      {showDeleteModal && selectedEtudiant && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: 'var(--radius-lg)', padding: '2rem',
            width: '100%', maxWidth: '420px', borderTop: '4px solid #dc2626'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#dc2626', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={24} /> Supprimer l'étudiant
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Cette action est irréversible. Toutes les données de <strong>{selectedEtudiant.nom}</strong>, y compris ses heures déclarées, seront définitivement perdues.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn-action outline" onClick={() => setShowDeleteModal(false)}>Annuler</button>
              <button className="btn-action primary" style={{ background: '#dc2626', borderColor: '#dc2626' }} onClick={() => { setShowDeleteModal(false); setShowConfirm(true); setCreatedEtudiant({ nom: selectedEtudiant.nom, prenom: 'Suppression de' }) }}>
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Advanced Filters Modal */}
      {showAdvancedFilters && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: 'var(--radius-lg)', padding: '2rem',
            width: '100%', maxWidth: '500px', boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={20} /> Filtres Avancés
              </h2>
              <button onClick={() => setShowAdvancedFilters(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--primary-dark)', fontSize: '0.85rem' }}>Année d'inscription</label>
                <select className="form-input" style={{ width: '100%' }}>
                  <option>Toutes les années</option>
                  <option>2026-2027</option>
                  <option>2025-2026</option>
                </select>
              </div>
              
              <div>
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--primary-dark)', fontSize: '0.85rem' }}>Responsable pédagogique</label>
                <select className="form-input" style={{ width: '100%' }}>
                  <option>Tous les responsables</option>
                  <option>M. Ettori</option>
                  <option>Mme Durand</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--primary-dark)', fontSize: '0.85rem' }}>Statut du contrat</label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked /> Signé
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked /> En attente
                  </label>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn-action outline" onClick={() => setShowAdvancedFilters(false)}>
                Réinitialiser
              </button>
              <button className="btn-action primary" onClick={() => setShowAdvancedFilters(false)}>
                Appliquer les filtres
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminEtudiants;
