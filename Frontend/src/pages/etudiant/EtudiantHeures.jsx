import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Hourglass, Plus, Eye, Download, ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { getEtudiantHeures, getEtudiantHeuresDeclarables, declareEtudiantHeures } from '../../services/api';

const EtudiantHeures = () => {
  const { searchTerm = '' } = useOutletContext() || {};
  const [months, setMonths] = useState([]);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [heures, setHeures] = useState([]);
  const [stats, setStats] = useState({ total: 0, validees: 0, en_attente: 0, refusees: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isDeclareModalOpen, setIsDeclareModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedHeure, setSelectedHeure] = useState(null);
  const [declarables, setDeclarables] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [declareError, setDeclareError] = useState('');
  const [declaring, setDeclaring] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  const loadHeures = (monthValue) => {
    setLoading(true);
    setError('');
    getEtudiantHeures(monthValue ? { month: monthValue } : {})
      .then((data) => {
        const monthList = data.months || [];
        setMonths(monthList);

        // First load without month: pick latest month and refetch filtered
        if (!monthValue && monthList.length > 0) {
          setCurrentMonthIndex(0);
          return getEtudiantHeures({ month: monthList[0].value }).then((filtered) => {
            setHeures(filtered.heures || []);
            setStats(filtered.stats || { total: 0, validees: 0, en_attente: 0, refusees: 0 });
            if (filtered.months?.length) setMonths(filtered.months);
          });
        }

        setHeures(data.heures || []);
        setStats(data.stats || { total: 0, validees: 0, en_attente: 0, refusees: 0 });
        if (monthValue && monthList.length > 0) {
          const idx = monthList.findIndex((m) => m.value === monthValue);
          setCurrentMonthIndex(idx >= 0 ? idx : 0);
        }
      })
      .catch((err) => setError(err.message || 'Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadHeures();
  }, []);

  const openDeclareModal = () => {
    setDeclareError('');
    setSelectedSessionId('');
    setIsDeclareModalOpen(true);
    getEtudiantHeuresDeclarables()
      .then((data) => setDeclarables(data.seances || []))
      .catch((err) => setDeclareError(err.message || 'Impossible de charger les séances'));
  };

  const selectedDeclarable = declarables.find((s) => String(s.sessionId) === String(selectedSessionId));

  const handleDeclareSubmit = async (e) => {
    e.preventDefault();
    setDeclareError('');
    if (!selectedSessionId) {
      setDeclareError('Sélectionnez une séance');
      return;
    }
    setDeclaring(true);
    try {
      await declareEtudiantHeures({ sessionId: Number(selectedSessionId) });
      setIsDeclareModalOpen(false);
      loadHeures();
      alert('Vos heures ont été déclarées et sont en attente de validation.');
    } catch (err) {
      setDeclareError(err.message || 'Erreur lors de la déclaration');
    } finally {
      setDeclaring(false);
    }
  };

  const formatStatNumber = (n) => {
    const num = Number(n) || 0;
    return Number.isInteger(num) ? num : Math.round(num * 10) / 10;
  };

  const handleExportReleve = (format) => {
    const chosen = format === 'csv' ? 'csv' : 'excel';
    const monthLabel = months[currentMonthIndex]?.label || 'periode';
    const slug = months[currentMonthIndex]?.value || 'export';
    const statusLabel = (s) =>
      ({ validee: 'Validée', en_attente: 'En attente', refusee: 'Refusée' }[s] || s || '');

    const rows = heures.map((h) => ({
      date: h.date || '',
      horaire: h.horaire || '',
      matiere: h.matiere || '',
      duree: h.duree || `${h.durationHours || 0}h`,
      statut: statusLabel(h.statut),
    }));

    let blob;
    let filename;

    if (chosen === 'csv') {
      const lines = [
        'Relevé des heures EduManage',
        `Période : ${monthLabel}`,
        '',
        'Date;Horaire;Matière;Durée;Statut',
        ...rows.map((r) => [r.date, r.horaire, r.matiere, r.duree, r.statut].join(';')),
        '',
        `Total validées;${formatStatNumber(stats.validees)}h`,
        `En attente;${formatStatNumber(stats.en_attente)}h`,
        `Refusées;${formatStatNumber(stats.refusees)}h`,
      ];
      blob = new Blob([`\uFEFF${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
      filename = `releve-heures-${slug}.csv`;
    } else {
      const escapeXml = (value) =>
        String(value ?? '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      const cell = (value) => `<Cell><Data ss:Type="String">${escapeXml(value)}</Data></Cell>`;
      const rowsXml = [
        `<Row>${cell('Relevé des heures EduManage')}</Row>`,
        `<Row>${cell(`Période : ${monthLabel}`)}</Row>`,
        '<Row></Row>',
        `<Row>${['Date', 'Horaire', 'Matière', 'Durée', 'Statut'].map((h) => cell(h)).join('')}</Row>`,
        ...rows.map(
          (r) => `<Row>${[r.date, r.horaire, r.matiere, r.duree, r.statut].map((v) => cell(v)).join('')}</Row>`
        ),
        '<Row></Row>',
        `<Row>${cell('Total validées')}${cell('')}${cell('')}${cell(`${formatStatNumber(stats.validees)}h`)}${cell('')}</Row>`,
        `<Row>${cell('En attente')}${cell('')}${cell('')}${cell(`${formatStatNumber(stats.en_attente)}h`)}${cell('')}</Row>`,
        `<Row>${cell('Refusées')}${cell('')}${cell('')}${cell(`${formatStatNumber(stats.refusees)}h`)}${cell('')}</Row>`,
      ].join('');

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Relevé heures">
    <Table>${rowsXml}
    </Table>
  </Worksheet>
</Workbook>`;
      blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
      filename = `releve-heures-${slug}.xls`;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handlePrevMonth = () => {
    if (currentMonthIndex > 0) {
      const nextIdx = currentMonthIndex - 1;
      setCurrentMonthIndex(nextIdx);
      setCurrentPage(1);
      loadHeures(months[nextIdx].value);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex < months.length - 1) {
      const nextIdx = currentMonthIndex + 1;
      setCurrentMonthIndex(nextIdx);
      setCurrentPage(1);
      loadHeures(months[nextIdx].value);
    }
  };

  const handleSelectMonth = (idx) => {
    setCurrentMonthIndex(idx);
    setCurrentPage(1);
    setIsMonthPickerOpen(false);
    loadHeures(months[idx].value);
  };

  const q = searchTerm.trim().toLowerCase();
  const filteredHeures = !q
    ? heures
    : heures.filter((h) =>
      (h.matiere || '').toLowerCase().includes(q) ||
      (h.horaire || '').toLowerCase().includes(q) ||
      (h.date || '').toLowerCase().includes(q) ||
      (h.statut || '').toLowerCase().includes(q)
    );
  const totalPages = Math.max(1, Math.ceil(filteredHeures.length / itemsPerPage));
  const displayedHeures = filteredHeures.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (statut) => {
    switch (statut) {
      case 'validee':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#dcfce3', color: '#16a34a', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}><CheckCircle size={14} /> Validée</span>;
      case 'en_attente':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#fef3c7', color: '#d97706', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}><Hourglass size={14} /> En attente</span>;
      case 'refusee':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}><XCircle size={14} /> Refusée</span>;
      default:
        return null;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 className="etudiant-page-title">Mes Heures</h1>
          <p className="etudiant-page-subtitle">Consultez et suivez l'état de vos heures déclarées.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem 1rem', gap: '1.5rem', position: 'relative' }}>
          <button onClick={handlePrevMonth} disabled={currentMonthIndex === 0 || months.length === 0} style={{ background: 'none', border: 'none', cursor: currentMonthIndex === 0 || months.length === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', opacity: currentMonthIndex === 0 || months.length === 0 ? 0.3 : 1 }}>
            <ChevronLeft size={20} color="#64748b" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#0f172a', minWidth: '110px', justifyContent: 'center' }}>
            {months[currentMonthIndex]?.label || (loading ? '…' : 'Aucun mois')}
          </div>
          <button onClick={handleNextMonth} disabled={currentMonthIndex >= months.length - 1 || months.length === 0} style={{ background: 'none', border: 'none', cursor: currentMonthIndex >= months.length - 1 || months.length === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', opacity: currentMonthIndex >= months.length - 1 || months.length === 0 ? 0.3 : 1 }}>
            <ChevronRight size={20} color="#64748b" />
          </button>
          <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }}></div>
          <button
            onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <Calendar size={20} color={isMonthPickerOpen ? "#3730a3" : "#0f172a"} />
          </button>

          {isMonthPickerOpen && months.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', right: '0', marginTop: '0.5rem', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden', minWidth: '180px' }}>
              {months.map((m, idx) => (
                <button
                  key={m.value}
                  onClick={() => handleSelectMonth(idx)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.75rem 1rem',
                    background: currentMonthIndex === idx ? '#f1f5f9' : 'white',
                    border: 'none',
                    borderBottom: idx !== months.length - 1 ? '1px solid #f1f5f9' : 'none',
                    cursor: 'pointer',
                    color: currentMonthIndex === idx ? '#1e1b4b' : '#475569',
                    fontWeight: currentMonthIndex === idx ? 700 : 500,
                  }}
                  onMouseOver={(e) => { if (currentMonthIndex !== idx) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                  onMouseOut={(e) => { if (currentMonthIndex !== idx) e.currentTarget.style.backgroundColor = 'white'; }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>

        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={24} color="#3730a3" />
            </div>
            <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>Total du mois</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e1b4b', lineHeight: 1 }}>{formatStatNumber(stats.total)}</span>
            <span style={{ fontSize: '1rem', color: '#64748b' }}>heures</span>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#dcfce3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={24} color="#16a34a" />
            </div>
            <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>Validées</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#16a34a', lineHeight: 1 }}>{formatStatNumber(stats.validees)}</span>
            <span style={{ fontSize: '1rem', color: '#64748b' }}>heures</span>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Hourglass size={24} color="#d97706" />
            </div>
            <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>En attente</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#d97706', lineHeight: 1 }}>{formatStatNumber(stats.en_attente)}</span>
            <span style={{ fontSize: '1rem', color: '#64748b' }}>heures</span>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <XCircle size={24} color="#dc2626" />
            </div>
            <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>Refusées</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#dc2626', lineHeight: 1 }}>{formatStatNumber(stats.refusees)}</span>
            <span style={{ fontSize: '1rem', color: '#64748b' }}>heures</span>
          </div>
        </div>

      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>

        <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Détails des séances</h2>
            <button
              onClick={openDeclareModal}
              style={{ backgroundColor: '#1e1b4b', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
            >
              <Plus size={16} />
              Déclarer des heures
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Date</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Matière</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Horaire</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Durée</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Statut</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textAlign: 'center' }}>Détail</th>
              </tr>
            </thead>
            <tbody>
              {!loading && displayedHeures.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Aucune heure pour ce mois</td>
                </tr>
              ) : (
                displayedHeures.map((h, idx) => (
                  <tr key={h.id} style={{ borderBottom: idx !== displayedHeures.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>{h.date}</td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ fontSize: '0.9rem', color: '#0f172a' }}>{h.matiere}</div>
                      {h.statut === 'refusee' && h.motif && (
                        <div style={{ fontSize: '0.75rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                          <XCircle size={12} /> Motif : {h.motif}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: '#475569' }}>{h.horaire}</td>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: '#475569' }}>{h.duree}</td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      {getStatusBadge(h.statut)}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                      <button
                        onClick={() => { setSelectedHeure(h); setIsDetailModalOpen(true); }}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                      >
                        <Eye size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Affichage de {heures.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
              {Math.min(currentPage * itemsPerPage, heures.length)} sur {heures.length} séances
            </span>
            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: '0.25rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px', background: 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    style={{
                      padding: '0.25rem 0.75rem',
                      border: currentPage === i + 1 ? 'none' : '1px solid #e2e8f0',
                      borderRadius: '4px',
                      background: currentPage === i + 1 ? '#1e1b4b' : 'white',
                      color: currentPage === i + 1 ? 'white' : '#0f172a',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{ padding: '0.25rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px', background: 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div style={{ backgroundColor: '#1e1b4b', borderRadius: '12px', padding: '1.5rem', color: 'white' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Besoin d'aide ?</h3>
            <p style={{ fontSize: '0.9rem', color: '#c7d2fe', margin: '0 0 1.5rem 0', lineHeight: '1.5' }}>
              Si vous constatez une erreur dans vos heures ou si vous souhaitez contester un refus, contactez votre coordinateur pédagogique.
            </p>
            <a
              href={`mailto:support@edumanage.fr?subject=${encodeURIComponent('Aide — Mes heures EduManage')}&body=${encodeURIComponent('Bonjour,\n\nJe souhaite une aide concernant mes heures déclarées sur EduManage.\n\nCordialement')}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', fontWeight: 700, cursor: 'pointer', textDecoration: 'none' }}
            >
              Contacter le support <ChevronRight size={16} />
            </a>
          </div>

          <div
            style={{ backgroundColor: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '2rem 1.5rem', textAlign: 'center' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <Download size={20} color="#1e1b4b" />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem 0' }}>Exporter le relevé</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleExportReleve('csv')}
                style={{
                  width: '100%', padding: '0.65rem 1rem', borderRadius: '8px',
                  border: '1px solid #cbd5e1', background: 'white', color: '#1e1b4b',
                  fontWeight: 700, cursor: 'pointer',
                }}
              >
                Télécharger CSV (.csv)
              </button>
              <button
                type="button"
                onClick={() => handleExportReleve('excel')}
                style={{
                  width: '100%', padding: '0.65rem 1rem', borderRadius: '8px', border: 'none',
                  background: '#1e1b4b', color: 'white', fontWeight: 700, cursor: 'pointer',
                }}
              >
                Télécharger Excel (.xls)
              </button>
            </div>
          </div>

        </div>

      </div>

      {isDetailModalOpen && selectedHeure && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Détail de la déclaration</h3>
              <button onClick={() => setIsDetailModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Matière:</strong> {selectedHeure.matiere}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Date:</strong> {selectedHeure.date}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Horaire:</strong> {selectedHeure.horaire} ({selectedHeure.duree})
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Statut:</strong> {getStatusBadge(selectedHeure.statut)}
              </div>
              {selectedHeure.motif && (
                <div style={{ backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '8px', color: '#991b1b', fontSize: '0.9rem' }}>
                  <strong>Motif de refus :</strong> {selectedHeure.motif}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isDeclareModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Déclarer des heures</h3>
              <button onClick={() => setIsDeclareModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleDeclareSubmit} style={{ padding: '1.5rem' }}>
              {declareError && (
                <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '8px', fontSize: '0.9rem' }}>
                  {declareError}
                </div>
              )}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Séance à déclarer</label>
                <select
                  required
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  <option value="">Sélectionnez une séance assignée...</option>
                  {declarables.map((s) => (
                    <option key={s.sessionId} value={s.sessionId}>{s.label}</option>
                  ))}
                </select>
                {declarables.length === 0 && (
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    Aucune séance assignée disponible. Le responsable doit d&apos;abord vous assigner une séance.
                  </p>
                )}
              </div>
              {selectedDeclarable && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#475569' }}>
                  <div><strong>Matière :</strong> {selectedDeclarable.matiere}</div>
                  <div><strong>Date :</strong> {selectedDeclarable.dateLabel}</div>
                  <div><strong>Horaire :</strong> {selectedDeclarable.horaire}</div>
                  <div><strong>Durée :</strong> {selectedDeclarable.durationHours}h</div>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setIsDeclareModalOpen(false)} style={{ padding: '0.5rem 1rem', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>Annuler</button>
                <button type="submit" disabled={declaring || !selectedSessionId} style={{ padding: '0.5rem 1rem', backgroundColor: '#1e1b4b', color: 'white', border: 'none', borderRadius: '6px', cursor: declaring ? 'wait' : 'pointer', opacity: declaring || !selectedSessionId ? 0.7 : 1 }}>
                  {declaring ? 'Envoi…' : 'Soumettre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EtudiantHeures;
