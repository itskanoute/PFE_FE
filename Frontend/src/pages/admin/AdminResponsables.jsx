import { useState, useEffect, useMemo, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import AnimatedCounter from '../../components/AnimatedCounter';
import {
  getAdminResponsables,
  createAdminResponsable,
  updateAdminResponsable,
  toggleAdminResponsableStatus,
  deleteAdminResponsable,
  getAdminSchoolSettings,
} from '../../services/api';
import {
  Users, Clock, Building2, Plus, Pencil, Link2,
  ShieldOff, ShieldCheck, ChevronLeft, ChevronRight,
  X, Copy, Eye, EyeOff, Lock, ChevronDown, UserPlus, Trash2, AlertTriangle
} from 'lucide-react';

const ITEMS_PER_PAGE = 9;
const DEFAULT_DEPARTMENTS = ['Informatique', 'Management', 'Ressources Humaines', 'Finance', 'Marketing', 'Réseaux'];

const AdminResponsables = () => {
  const { searchTerm = '' } = useOutletContext() ?? {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ total: 0, heuresAValider: 0, departements: 0 });
  const [responsables, setResponsables] = useState([]);
  const [emailDomain, setEmailDomain] = useState('escp.eu');

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedResp, setSelectedResp] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [createdResp, setCreatedResp] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', departement: '', telephone: ''
  });

  const loadData = useCallback(async () => {
    try {
      setError('');
      const [data, schoolData] = await Promise.all([
        getAdminResponsables(),
        getAdminSchoolSettings().catch(() => null),
      ]);
      setStats(data.stats);
      setResponsables(data.responsables);
      if (schoolData?.school?.domaineEmail) {
        setEmailDomain(schoolData.school.domaineEmail.replace('@', ''));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const departmentOptions = useMemo(() => {
    const fromData = responsables.map((r) => r.departement).filter(Boolean);
    return [...new Set([...DEFAULT_DEPARTMENTS, ...fromData])].sort();
  }, [responsables]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return responsables;
    return responsables.filter((r) =>
      r.nom.toLowerCase().includes(q) ||
      r.departement?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q)
    );
  }, [responsables, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await createAdminResponsable({
        firstName: formData.prenom,
        lastName: formData.nom,
        email: formData.email,
        department: formData.departement,
        phone: formData.telephone || undefined,
      });
      setCreatedResp({
        ...formData,
        password: result.temporaryPassword,
        sendEmail,
      });
      setShowModal(false);
      setShowConfirm(true);
      setFormData({ nom: '', prenom: '', email: '', departement: '', telephone: '' });
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedResp) return;
    setSubmitting(true);
    try {
      await updateAdminResponsable(selectedResp.id, {
        firstName: formData.prenom,
        lastName: formData.nom,
        email: formData.email,
        department: formData.departement,
        phone: formData.telephone || undefined,
      });
      setCreatedResp({ ...formData, isEdit: true });
      setShowEditModal(false);
      setShowConfirm(true);
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedResp) return;
    setSubmitting(true);
    try {
      await toggleAdminResponsableStatus(selectedResp.id);
      const newStatus = selectedResp.statut === 'active' ? 'inactive' : 'active';
      setShowStatusModal(false);
      const parts = selectedResp.nom.split(' ');
      setCreatedResp({
        prenom: parts[0],
        nom: parts.slice(1).join(' '),
        isStatusChange: true,
        newStatus,
      });
      setShowConfirm(true);
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedResp) return;
    setSubmitting(true);
    try {
      await deleteAdminResponsable(selectedResp.id);
      setShowDeleteModal(false);
      const parts = selectedResp.nom.split(' ');
      setCreatedResp({
        prenom: parts[0],
        nom: parts.slice(1).join(' '),
        isDelete: true,
      });
      setShowConfirm(true);
      setSelectedResp(null);
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (r) => {
    setFormData({
      prenom: r.firstName || r.nom.split(' ')[0],
      nom: r.lastName || r.nom.split(' ').slice(1).join(' '),
      email: r.email || '',
      departement: r.departement,
      telephone: r.phone || '',
    });
    setSelectedResp(r);
    setShowEditModal(true);
  };

  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  if (loading) {
    return <div className="content-card" style={{ padding: '2rem' }}>Chargement des responsables...</div>;
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

      {paginated.length === 0 ? (
        <div className="content-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          {searchTerm.trim() ? 'Aucun responsable ne correspond à votre recherche.' : 'Aucun responsable enregistré.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          {paginated.map((r) => (
            <div key={r.id} className="content-card" style={{ padding: 0, overflow: 'hidden', opacity: r.statut === 'inactive' ? 0.7 : 1 }}>
              <div style={{ padding: '1.5rem' }}>
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

              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.75rem 1.5rem', borderTop: '1px solid var(--border-color)', background: '#fafafa'
              }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="header-icon-btn" title="Modifier" onClick={() => openEditModal(r)}>
                    <Pencil size={16} />
                  </button>
                  {r.email && (
                    <a
                      href={`mailto:${r.email}?subject=Vos%20identifiants%20EduManage&body=Bonjour%20${encodeURIComponent(r.nom)},%0A%0AVoici%20vos%20identifiants%20de%20connexion%20pour%20le%20portail%20EduManage.%0A%0AEmail:%20${encodeURIComponent(r.email)}%0A%0ACordialement,%0AL'équipe%20Admin`}
                      className="header-icon-btn"
                      title="Renvoyer identifiants"
                      style={{ display: 'inline-flex', textDecoration: 'none', color: 'inherit' }}
                    >
                      <Link2 size={16} />
                    </a>
                  )}
                  <button
                    className="header-icon-btn"
                    title="Supprimer"
                    onClick={() => { setSelectedResp(r); setShowDeleteModal(true); }}
                  >
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
      )}

      {filtered.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Affichage de {paginated.length} sur {filtered.length} responsable{filtered.length > 1 ? 's' : ''} pédagogique{filtered.length > 1 ? 's' : ''}
            {searchTerm.trim() ? ` (filtré sur ${stats.total} au total)` : ''}
          </span>
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                className="btn-action outline"
                style={{ padding: '0.4rem 0.6rem' }}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              >
                <ChevronLeft size={16} />
              </button>
              {pageNumbers.map((p) => (
                <button
                  key={p}
                  className={`btn-action ${currentPage === p ? 'primary' : 'outline'}`}
                  style={{ padding: '0.4rem 0.75rem', minWidth: '36px' }}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="btn-action outline"
                style={{ padding: '0.4rem 0.6rem' }}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

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
                <input className="form-input" type="email" placeholder={`m.dupont@${emailDomain}`} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  L'adresse doit obligatoirement se terminer par @{emailDomain}
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
                      {departmentOptions.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, color: 'var(--primary-dark)', fontSize: '0.8rem' }}>N° Téléphone (Optionnel)</label>
                  <input className="form-input" placeholder="+33 6 12 34 56 78" value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} />
                </div>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
                  <Lock size={14} /> Mot de passe temporaire
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Un mot de passe sécurisé sera généré automatiquement à la création du compte.
                </p>
              </div>

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
                <button type="submit" className="btn-action primary" style={{ fontWeight: 600 }} disabled={submitting}>
                  <UserPlus size={18} /> {submitting ? 'Création...' : 'Créer et envoyer les identif.'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

            <form onSubmit={handleEdit}>
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
                      {departmentOptions.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
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
                <button type="submit" className="btn-action primary" style={{ fontWeight: 600 }} disabled={submitting}>
                  {submitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

            {!createdResp.isEdit && !createdResp.isStatusChange && !createdResp.isDelete && (
              <>
                {createdResp.sendEmail ? (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    📧 Identifiants envoyés à : <strong>{createdResp.email}</strong>
                  </p>
                ) : (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Transmettez manuellement les identifiants à <strong>{createdResp.email}</strong>
                  </p>
                )}
                {createdResp.password && (
                  <div style={{ background: '#f8fafc', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem', border: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Mot de passe temporaire</div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <code style={{ flex: 1, fontWeight: 700, fontSize: '0.9rem' }}>
                        {showPassword ? createdResp.password : '••••••••••'}
                      </code>
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button type="button" onClick={() => navigator.clipboard.writeText(createdResp.password)} className="btn-action outline" style={{ padding: '0.4rem 0.6rem' }}>
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                )}
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Le responsable devra changer son mot de passe à la première connexion.
                </p>
              </>
            )}

            {createdResp.isEdit && (
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

            <button className="btn-action primary" style={{ padding: '0.75rem 2rem' }} onClick={() => { setShowConfirm(false); setCreatedResp(null); setShowPassword(false); }}>
              OK ✅
            </button>
          </div>
        </div>
      )}

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
                onClick={handleToggleStatus}
                disabled={submitting}
              >
                {submitting ? '...' : selectedResp.statut === 'active' ? 'Oui, désactiver' : 'Oui, réactiver'}
              </button>
            </div>
          </div>
        </div>
      )}

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
              <button
                className="btn-action primary"
                style={{ background: '#dc2626', borderColor: '#dc2626' }}
                onClick={handleDelete}
                disabled={submitting}
              >
                {submitting ? 'Suppression...' : 'Oui, supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminResponsables;
