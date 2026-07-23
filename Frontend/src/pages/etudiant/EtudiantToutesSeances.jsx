import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, Filter, Search } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getEtudiantSeances } from '../../services/api';

const EtudiantToutesSeances = () => {
  const navigate = useNavigate();
  const { searchTerm: headerSearch = '', setSearchTerm: setHeaderSearch } = useOutletContext() || {};

  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterMatiere, setFilterMatiere] = useState('');
  const [filterStatut, setFilterStatut] = useState('');

  const searchTerm = headerSearch;
  const setSearchTerm = (value) => setHeaderSearch?.(value);
  useEffect(() => {
    setLoading(true);
    setError('');
    getEtudiantSeances()
      .then((data) => setSeances(data.seances || []))
      .catch((err) => setError(err.message || 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  const matieresUniques = useMemo(() => {
    return [...new Set(seances.map(s => s.matiere).filter(Boolean))];
  }, [seances]);

  const statutsUniques = ['prévu', 'passé', 'annulé'];

  const filteredSeances = seances.filter(seance => {
    const matchSearch = (seance.matiere || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (seance.dateL || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchMatiere = filterMatiere ? seance.matiere === filterMatiere : true;
    const matchStatut = filterStatut ? seance.statut === filterStatut : true;

    return matchSearch && matchMatiere && matchStatut;
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/etudiant/seances')}
          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.5rem', borderRadius: '8px' }}
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="etudiant-page-title" style={{ margin: 0 }}>Historique des Séances</h1>
          <p className="etudiant-page-subtitle" style={{ margin: 0 }}>Retrouvez toutes vos séances passées, prévues ou annulées.</p>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 250px', position: 'relative' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Rechercher par date ou matière..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="etudiant-search-input"
            style={{ width: '100%', paddingLeft: '2.5rem', margin: 0 }}
          />
        </div>

        <div style={{ flex: '1 1 200px', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Filter size={18} color="#64748b" />
          <select
            value={filterMatiere}
            onChange={(e) => setFilterMatiere(e.target.value)}
            style={{ flex: 1, padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', cursor: 'pointer', backgroundColor: '#f8fafc' }}
          >
            <option value="">Toutes les matières</option>
            {matieresUniques.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: '1 1 200px', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Filter size={18} color="#64748b" />
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            style={{ flex: 1, padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', cursor: 'pointer', backgroundColor: '#f8fafc' }}
          >
            <option value="">Tous les statuts</option>
            {statutsUniques.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>Chargement…</p>
          </div>
        ) : filteredSeances.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Date</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Horaire</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Matière</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Salle</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredSeances.map((s, idx) => (
                <tr key={s.id} style={{ borderBottom: idx !== filteredSeances.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>{s.dateL}</td>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: '#475569' }}>{s.horaire}</td>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: '#475569' }}>{s.matiere}</td>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: '#475569' }}>{s.salle}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    {s.statut === 'prévu' && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#dcfce3', color: '#16a34a', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a' }}></div>
                        Prévu
                      </span>
                    )}
                    {s.statut === 'passé' && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#e2e8f0', color: '#475569', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#64748b' }}></div>
                        Passé
                      </span>
                    )}
                    {s.statut === 'annulé' && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#dc2626' }}></div>
                        Annulé
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>Aucune séance ne correspond à vos filtres.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EtudiantToutesSeances;
