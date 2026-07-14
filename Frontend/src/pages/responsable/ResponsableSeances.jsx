import React, { useState } from 'react';
import { 
  AlertCircle, 
  UserX, 
  CheckCircle2, 
  History, 
  Calendar, 
  RefreshCw, 
  Plus, 
  Network, 
  Database,
  Users,
  X,
  Search
} from 'lucide-react';
import './responsable.css';

const ResponsableSeances = () => {
  const initialSeances = [
    {
      id: 1,
      date: 'Mar 15/10',
      matiere: 'BDD',
      assistant: 'Léa M.',
      motif: 'RDV',
      status: 'annulee'
    },
    {
      id: 2,
      date: 'Jeu 17/10',
      matiere: 'Java',
      assistant: 'Paul D.',
      motif: '! Urgence',
      status: 'annulee'
    },
    {
      id: 3,
      date: 'Vendredi 18/10',
      time: '14:00 - 16:00',
      matiere: 'Réseaux',
      status: 'sans_assistant'
    },
    {
      id: 4,
      date: 'Mardi 22/10',
      time: '09:00 - 11:00',
      matiere: 'BDD',
      status: 'sans_assistant'
    },
    {
      id: 5,
      date: 'Mar 08/10',
      matiere: 'Algorithmique II',
      assistant: 'Sophie Martin',
      assistantInitials: 'SM',
      assistantColor: '#fcd34d',
      assistantColorText: '#92400e',
      status: 'avec_assistant'
    },
    {
      id: 6,
      date: 'Mer 09/10',
      matiere: 'Web Architecture',
      assistant: 'Julien Ker',
      assistantInitials: 'JK',
      assistantColor: '#ddd6fe',
      assistantColorText: '#5b21b6',
      status: 'avec_assistant'
    }
  ];

  const availableAssistants = [
    { id: 101, name: "Emma Dubois", matiere: "Algorithmique, BDD", grade: "18.5/20" },
    { id: 102, name: "Hugo Lemaire", matiere: "BDD", grade: "16/20" },
    { id: 103, name: "Chloé Petit", matiere: "Développement Web, Réseaux", grade: "19/20" },
    { id: 104, name: "Lucas Girard", matiere: "Réseaux, Java", grade: "14/20" }
  ];

  const historiqueParMois = [
    {
      mois: 'Octobre 2026',
      seances: [
        { id: 201, date: 'Lun 07/10', matiere: 'Java', assistant: 'Lucas Girard', status: 'Terminée' },
        { id: 202, date: 'Ven 04/10', matiere: 'Développement Web', assistant: 'Chloé Petit', status: 'Terminée' },
        { id: 203, date: 'Jeu 03/10', matiere: 'BDD', assistant: 'Hugo Lemaire', status: 'Terminée' },
        { id: 204, date: 'Mar 01/10', matiere: 'Algorithmique I', assistant: 'Emma Dubois', status: 'Terminée' }
      ]
    },
    {
      mois: 'Septembre 2026',
      seances: [
        { id: 205, date: 'Lun 30/09', matiere: 'Réseaux', assistant: 'Lucas Girard', status: 'Terminée' },
        { id: 206, date: 'Ven 27/09', matiere: 'Java', assistant: 'Chloé Petit', status: 'Terminée' },
        { id: 207, date: 'Mer 25/09', matiere: 'Algorithmique II', assistant: 'Emma Dubois', status: 'Terminée' },
        { id: 208, date: 'Lun 16/09', matiere: 'BDD', assistant: 'Hugo Lemaire', status: 'Terminée' },
        { id: 209, date: 'Ven 06/09', matiere: 'Réseaux', assistant: 'Lucas Girard', status: 'Terminée' }
      ]
    },
    {
      mois: 'Août 2026',
      seances: [
        { id: 210, date: 'Ven 30/08', matiere: 'Développement Web', assistant: 'Chloé Petit', status: 'Terminée' },
        { id: 211, date: 'Mar 20/08', matiere: 'Algorithmique I', assistant: 'Emma Dubois', status: 'Terminée' }
      ]
    }
  ];

  const [seances, setSeances] = useState(initialSeances);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSeance, setSelectedSeance] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [newSeance, setNewSeance] = useState({ matiere: '', date: '', time: '' });

  const handleOpenModal = (seance) => {
    setSelectedSeance(seance);
    setSearchTerm('');
    setIsModalOpen(true);
  };

  const handleCreateSeance = (e) => {
    e.preventDefault();
    if (!newSeance.date) return;
    const d = new Date(newSeance.date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const dateStr = `${days[d.getDay()]} ${day}/${month}`;
    
    const newEntry = {
      id: Date.now(),
      date: dateStr,
      time: newSeance.time,
      matiere: newSeance.matiere,
      status: 'sans_assistant'
    };
    
    setSeances([newEntry, ...seances]);
    setIsCreateModalOpen(false);
    setNewSeance({ matiere: '', date: '', time: '' });
  };

  const handleAssigner = (assistant) => {
    setSeances(seances.map(s => {
      if (s.id === selectedSeance.id) {
        return {
          ...s,
          status: 'avec_assistant',
          assistant: assistant.name,
          assistantInitials: assistant.name.split(' ').map(n => n[0]).join('').substring(0, 2),
          assistantColor: '#e0e7ff',
          assistantColorText: '#3730a3'
        };
      }
      return s;
    }));
    setIsModalOpen(false);
  };

  const urgences = seances.filter(s => s.status === 'annulee');
  const sansAssistant = seances.filter(s => s.status === 'sans_assistant');
  const avecAssistant = seances.filter(s => s.status === 'avec_assistant');

  const filteredAssistants = availableAssistants.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.matiere.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHistoriqueParMois = historiqueParMois.map(groupe => {
    return {
      ...groupe,
      seances: groupe.seances.filter(s => 
        s.matiere.toLowerCase().includes(historySearchTerm.toLowerCase()) || 
        s.assistant.toLowerCase().includes(historySearchTerm.toLowerCase())
      )
    };
  }).filter(groupe => groupe.seances.length > 0);

  return (
    <div className="resp-dashboard" style={{ paddingBottom: '3rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            Affectation des assistants
          </h1>
          <p style={{ color: '#475569', fontSize: '1rem', maxWidth: '800px', lineHeight: 1.5 }}>
            Gérez les ressources humaines pour chaque séance. Assurez-vous que chaque cours dispose d'un assistant qualifié pour accompagner les étudiants.
          </p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <Plus size={20} />
          Nouvelle Séance
        </button>
      </div>

      {/* Section: Séances ANNULÉES */}
      {urgences.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ backgroundColor: '#fff7ed', color: '#f97316', padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={20} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Séances ANNULÉES <span style={{ fontSize: '1rem', color: '#475569', fontWeight: 600 }}>(Urgences)</span>
            </h2>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Matière</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assistant</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Motif</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {urgences.map((seance) => (
                  <tr key={seance.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: '#0f172a' }}>{seance.date}</td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>{seance.matiere}</span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', color: '#475569' }}>{seance.assistant}</td>
                    <td style={{ padding: '1.25rem 1.5rem', color: seance.motif.includes('Urgence') ? '#ef4444' : '#475569', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {seance.motif.includes('Urgence') ? <span style={{ fontWeight: 800 }}>!</span> : <Calendar size={16} />}
                      {seance.motif.replace('! ', '')}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                      <button onClick={() => handleOpenModal(seance)} style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                        Réaffecter
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section: Séances sans assistant */}
      {sansAssistant.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserX size={20} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Séances sans assistant
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {sansAssistant.map((seance) => (
              <div key={seance.id} style={{ flex: 1, minWidth: '350px', backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ backgroundColor: '#f1f5f9', padding: '0.75rem', borderRadius: '8px', color: '#475569' }}>
                    {seance.matiere === 'Réseaux' ? <Network size={24} /> : <Database size={24} />}
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{seance.matiere}</h3>
                    <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>{seance.date} • {seance.time}</div>
                  </div>
                </div>
                <button onClick={() => handleOpenModal(seance)} style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                  Affecter
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section: Séances avec assistant */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#dcfce7', color: '#10b981', padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={20} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Séances avec assistant
            </h2>
          </div>
          <button onClick={() => setIsHistoryModalOpen(true)} style={{ background: 'none', border: 'none', color: '#475569', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <History size={18} />
            Historique complet
          </button>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cours</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assistant assigné</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Statut</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {avecAssistant.map((seance) => (
                <tr key={seance.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: '#0f172a' }}>{seance.date}</td>
                  <td style={{ padding: '1.25rem 1.5rem', color: '#475569' }}>{seance.matiere}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ backgroundColor: seance.assistantColor, color: seance.assistantColorText, width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                        {seance.assistantInitials}
                      </div>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{seance.assistant}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 500 }}>
                      <div style={{ width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
                      Confirmé
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <button onClick={() => handleOpenModal(seance)} style={{ background: 'none', border: '1px solid #e2e8f0', color: '#0f172a', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} title="Réaffecter un autre assistant">
                      <RefreshCw size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Layout: Stats & Recruitment */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        
        {/* Taux d'occupation */}
        <div style={{ flex: 1, minWidth: '300px', backgroundColor: '#0f172a', borderRadius: '16px', padding: '2rem', color: 'white', position: 'relative', overflow: 'hidden' }}>
          {/* Background decoration */}
          <div style={{ position: 'absolute', right: '-20px', bottom: '-40px', opacity: 0.1, transform: 'scale(1.5)' }}>
            <Users size={200} />
          </div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '1rem', opacity: 0.9 }}>
              TAUX D'OCCUPATION
            </div>
            <div style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1, marginBottom: '1.5rem' }}>
              {Math.round((avecAssistant.length / seances.length) * 100)}%
            </div>
            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6, opacity: 0.9, maxWidth: '250px' }}>
              La plupart des séances de ce mois sont déjà couvertes par notre équipe d'assistants.
            </p>
          </div>
        </div>

        {/* Recrutement en cours */}
        <div style={{ flex: 2, minWidth: '400px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', overflow: 'hidden' }}>
          <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0' }}>
              Recrutement en cours
            </h3>
            <p style={{ margin: '0 0 1.5rem 0', color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Nous recherchons actuellement 3 nouveaux assistants pour le module "Intelligence Artificielle".
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button style={{ backgroundColor: '#a16207', color: 'white', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                Voir l'offre
              </button>
              <button style={{ backgroundColor: 'transparent', color: '#0f172a', border: '1px solid #cbd5e1', padding: '0.6rem 1.5rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                Partager
              </button>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '200px', backgroundImage: 'url("https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', borderTopLeftRadius: '16px', borderBottomLeftRadius: '16px', margin: '1rem 1rem 1rem 0' }}>
          </div>
        </div>

      </div>

      {/* Modal d'Affectation */}
      {isModalOpen && selectedSeance && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            {/* Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  {selectedSeance.status === 'avec_assistant' ? 'Réaffecter un assistant' : 'Affecter un assistant'}
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {selectedSeance.matiere} • {selectedSeance.date} {selectedSeance.time ? `• ${selectedSeance.time}` : ''}
                </span>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.5rem' }}>
                <X size={24} />
              </button>
            </div>

            {/* Search */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="Rechercher par nom ou matière..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                />
              </div>
            </div>

            {/* List */}
            <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '1rem' }}>
              {filteredAssistants.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Aucun assistant trouvé.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {filteredAssistants.map((assistant) => (
                    <div key={assistant.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', transition: 'all 0.2s', cursor: 'pointer' }} className="resp-card-hover" onClick={() => handleAssigner(assistant)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontWeight: 700, fontSize: '0.9rem' }}>
                          {assistant.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{assistant.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Compétences: {assistant.matiere}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ backgroundColor: '#fffbeb', color: '#b45309', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                          {assistant.grade}
                        </div>
                        <button style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                          Choisir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Modal d'Historique */}
      {isHistoryModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '700px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            {/* Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  Historique Complet
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Toutes les séances passées et terminées
                </span>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.5rem' }}>
                <X size={24} />
              </button>
            </div>

            {/* Search */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="Rechercher par assistant ou matière..." 
                  value={historySearchTerm}
                  onChange={(e) => setHistorySearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                />
              </div>
            </div>

            {/* List */}
            <div style={{ maxHeight: '500px', overflowY: 'auto', padding: '0', position: 'relative' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 20, backgroundColor: '#f8fafc', boxShadow: '0 1px 0 #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cours</th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assistant</th>
                    <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistoriqueParMois.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        Aucun résultat trouvé pour "{historySearchTerm}".
                      </td>
                    </tr>
                  ) : (
                    filteredHistoriqueParMois.map((groupeMois, idx) => (
                      <React.Fragment key={idx}>
                        {/* Sticky Month Header */}
                      <tr>
                        <td colSpan="4" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#f1f5f9', fontWeight: 800, color: '#334155', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', position: 'sticky', top: '44px', zIndex: 10, borderBottom: '1px solid #e2e8f0', borderTop: '1px solid #e2e8f0' }}>
                          {groupeMois.mois}
                        </td>
                      </tr>
                      {groupeMois.seances.map((seance) => (
                        <tr key={seance.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: '#0f172a' }}>{seance.date}</td>
                          <td style={{ padding: '1.25rem 1.5rem', color: '#475569' }}>{seance.matiere}</td>
                          <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: '#0f172a' }}>{seance.assistant}</td>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>{seance.status}</span>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* Modal Création de Séance */}
      {isCreateModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            {/* Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  Créer une Séance
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Planifiez un nouveau cours sans assistant
                </span>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.5rem' }}>
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateSeance} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Matière</label>
                <input 
                  type="text" 
                  placeholder="Ex: Développement Web" 
                  value={newSeance.matiere}
                  onChange={(e) => setNewSeance({...newSeance, matiere: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Date</label>
                <input 
                  type="date" 
                  value={newSeance.date}
                  onChange={(e) => setNewSeance({...newSeance, date: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Créneau horaire (ex: 14:00 - 16:00)</label>
                <input 
                  type="text" 
                  placeholder="Ex: 14:00 - 16:00" 
                  value={newSeance.time}
                  onChange={(e) => setNewSeance({...newSeance, time: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} style={{ backgroundColor: 'transparent', color: '#475569', border: '1px solid #cbd5e1', padding: '0.6rem 1.5rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                  Annuler
                </button>
                <button type="submit" style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                  Créer la séance
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default ResponsableSeances;
