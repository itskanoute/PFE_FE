import React, { useState } from 'react';
import { 
  Download, 
  Send, 
  BarChart2, 
  CheckCircle, 
  MoreHorizontal, 
  XCircle, 
  Hourglass, 
  CheckSquare, 
  History, 
  AlertTriangle, 
  Mail,
  Check,
  X
} from 'lucide-react';
import './responsable.css';

const ResponsableHeures = () => {

  const initialHeuresAttente = [
    { id: 1, init: 'LM', color: '#e0e7ff', textColor: '#3730a3', name: 'Léa M.', date: '15/10/2023', heures: '04h 00', comment: 'Séance TD Finance' },
    { id: 2, init: 'LM', color: '#e0e7ff', textColor: '#3730a3', name: 'Léa M.', date: '17/10/2023', heures: '02h 30', comment: 'Correction copies' },
    { id: 3, init: 'ML', color: '#fef3c7', textColor: '#92400e', name: 'Marie L.', date: '17/10/2023', heures: '01h 30', comment: 'Réunion pédagogique' },
    { id: 4, init: 'PD', color: '#ffedd5', textColor: '#9a3412', name: 'Paul D.', date: '22/10/2023', heures: '03h 00', comment: 'Labo Informatique' }
  ];

  const initialHeuresTraitees = [
    { id: 101, name: 'Marie L.', subject: 'Session Marketing', hours: '06h 00', status: 'PAYÉ', date: 'Validé le 20/10 par Système', type: 'success' },
    { id: 102, name: 'Paul D.', subject: 'Support Technique', hours: '02h 00', status: 'REJETÉ', date: 'Refusé le 19/10 par J. Dupont', type: 'error' },
    { id: 103, name: 'Léa M.', subject: 'Soutien Maths', hours: '05h 00', status: 'PAYÉ', date: 'Validé le 18/10 par J. Dupont', type: 'success' }
  ];

  const [heuresAttente, setHeuresAttente] = useState(initialHeuresAttente);
  const [heuresTraitees, setHeuresTraitees] = useState(initialHeuresTraitees);

  const [selectedHeures, setSelectedHeures] = useState([]);

  // Stats dynamiques
  const totalMensuel = "48h";
  const valides = "36h";
  const attente = heuresAttente.length > 0 ? (heuresAttente.length * 2) + "h" : "00h"; // Dummy dynamic
  const refusees = "04h";

  const handleAction = (id, action) => {
    const item = heuresAttente.find(h => h.id === id);
    if (!item) return;

    // Remove from attente
    setHeuresAttente(heuresAttente.filter(h => h.id !== id));

    // Add to traitees
    const newTraite = {
      id: Date.now(),
      name: item.name,
      subject: item.comment,
      hours: item.heures,
      status: action === 'valider' ? 'PAYÉ' : 'REJETÉ',
      date: action === 'valider' ? 'Validé à l\'instant' : 'Refusé à l\'instant',
      type: action === 'valider' ? 'success' : 'error'
    };

    setHeuresTraitees([newTraite, ...heuresTraitees]);
  };

  const toggleSelectAll = () => {
    if (selectedHeures.length === heuresAttente.length) {
      setSelectedHeures([]);
    } else {
      setSelectedHeures(heuresAttente.map(h => h.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedHeures.includes(id)) {
      setSelectedHeures(selectedHeures.filter(h => h !== id));
    } else {
      setSelectedHeures([...selectedHeures, id]);
    }
  };

  const handleBulkAction = (action) => {
    const newTraitees = [];
    const remainingAttente = [...heuresAttente];

    selectedHeures.forEach(id => {
      const itemIndex = remainingAttente.findIndex(h => h.id === id);
      if (itemIndex > -1) {
        const item = remainingAttente[itemIndex];
        remainingAttente.splice(itemIndex, 1);
        newTraitees.push({
          id: Date.now() + Math.random(),
          name: item.name,
          subject: item.comment,
          hours: item.heures,
          status: action === 'valider' ? 'PAYÉ' : 'REJETÉ',
          date: action === 'valider' ? 'Validé en lot' : 'Refusé en lot',
          type: action === 'valider' ? 'success' : 'error'
        });
      }
    });

    setHeuresAttente(remainingAttente);
    setHeuresTraitees([...newTraitees, ...heuresTraitees]);
    setSelectedHeures([]);
  };

  return (
    <div className="resp-dashboard" style={{ paddingBottom: '3rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            Validation des Heures
          </h1>
          <p style={{ color: '#475569', fontSize: '1rem', maxWidth: '800px', margin: 0 }}>
            Gestion et approbation des relevés d'heures pour les assistants d'enseignement.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => window.print()} style={{ backgroundColor: 'white', color: '#0f172a', border: '1px solid #cbd5e1', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Download size={18} />
            Exporter PDF
          </button>
          <button onClick={() => window.location.href = "mailto:?bcc=lea@ecole.fr,paul@ecole.fr,marie@ecole.fr&subject=Relevés d'heures mensuels&body=Bonjour à tous, vos heures du mois sont validées. Merci !"} style={{ backgroundColor: '#1e1b4b', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <Send size={18} />
            Notifier tout
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        
        {/* Total Mensuel */}
        <div style={{ flex: 1, minWidth: '200px', backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #1e1b4b', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Mensuel</span>
            <BarChart2 size={18} color="#0f172a" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e1b4b', lineHeight: 1 }}>{totalMensuel}</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981' }}>+12% vs M-1</span>
          </div>
        </div>

        {/* Validées */}
        <div style={{ flex: 1, minWidth: '200px', backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Validées</span>
            <CheckCircle size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {valides}
          </div>
        </div>

        {/* En attente */}
        <div style={{ flex: 1, minWidth: '200px', backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>En attente</span>
            <MoreHorizontal size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {attente}
          </div>
        </div>

        {/* Refusées */}
        <div style={{ flex: 1, minWidth: '200px', backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #ef4444', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Refusées</span>
            <XCircle size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {refusees}
          </div>
        </div>

      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* Main Content (Left) */}
        <div style={{ flex: '2', minWidth: '600px' }}>
          
          {/* Heures en attente */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '2rem' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Hourglass size={20} color="#b45309" />
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Heures en attente</h2>
              </div>
              {selectedHeures.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleBulkAction('valider')} style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Check size={14} /> Valider ({selectedHeures.length})
                  </button>
                  <button onClick={() => handleBulkAction('refuser')} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <X size={14} /> Refuser ({selectedHeures.length})
                  </button>
                </div>
              )}
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem 1.5rem', width: '40px' }}><input type="checkbox" onChange={toggleSelectAll} checked={heuresAttente.length > 0 && selectedHeures.length === heuresAttente.length} style={{ cursor: 'pointer' }} /></th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Assistant</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Date</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Heures</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Commentaire</th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {heuresAttente.map((heure) => (
                  <tr key={heure.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1.25rem 1.5rem' }}><input type="checkbox" onChange={() => toggleSelect(heure.id)} checked={selectedHeures.includes(heure.id)} style={{ cursor: 'pointer' }} /></td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: heure.color, color: heure.textColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                          {heure.init}
                        </div>
                        <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>{heure.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem', color: '#475569', fontSize: '0.9rem' }}>{heure.date}</td>
                    <td style={{ padding: '1.25rem 1rem', fontWeight: 700, color: '#0f172a' }}>{heure.heures}</td>
                    <td style={{ padding: '1.25rem 1rem', color: '#64748b', fontStyle: 'italic', fontSize: '0.9rem' }}>{heure.comment}</td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleAction(heure.id, 'valider')} style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} title="Valider">
                          <Check size={16} />
                        </button>
                        <button onClick={() => handleAction(heure.id, 'refuser')} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} title="Refuser">
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {heuresAttente.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Toutes les heures en attente ont été traitées.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Heures déjà traitées */}
          <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <History size={20} color="#10b981" />
              <CheckSquare size={20} color="#10b981" />
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Heures déjà traitées</h2>
            </div>
            
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {heuresTraitees.map((item) => (
                <div key={item.id} style={{ backgroundColor: 'white', border: `1px solid ${item.type === 'success' ? '#e2e8f0' : '#fee2e2'}`, borderRadius: '8px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ backgroundColor: item.type === 'success' ? '#ecfdf5' : '#fef2f2', color: item.type === 'success' ? '#10b981' : '#ef4444', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.type === 'success' ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>{item.name} - {item.subject}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{item.date}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', marginBottom: '0.3rem' }}>{item.hours}</div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, backgroundColor: item.type === 'success' ? '#dcfce7' : '#fee2e2', color: item.type === 'success' ? '#059669' : '#dc2626', padding: '0.2rem 0.5rem', borderRadius: '4px', letterSpacing: '0.05em' }}>
                      {item.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Sidebar (Right) */}
        <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Séances annulées (Warning Block) */}
          <div style={{ backgroundColor: '#450a0a', borderRadius: '12px', padding: '1.5rem', color: '#fca5a5', position: 'relative', overflow: 'hidden' }}>
            {/* Background Icon */}
            <div style={{ position: 'absolute', right: '-20px', top: '10px', opacity: 0.05, transform: 'scale(2)' }}>
              <XCircle size={100} color="white" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '50%' }}></div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#fef2f2' }}>Séances annulées</h3>
            </div>
            
            <p style={{ fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
              Les assistants suivants ont des séances annulées ce mois-ci. Aucune heure ne doit être validée pour ces créneaux.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '8px', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: '#fef2f2' }}>LM</div>
                <div>
                  <div style={{ fontWeight: 600, color: '#fef2f2', fontSize: '0.9rem' }}>Léa M.</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Annulation TD Finance (18/10)</div>
                </div>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '8px', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: '#fef2f2' }}>PD</div>
                <div>
                  <div style={{ fontWeight: 600, color: '#fef2f2', fontSize: '0.9rem' }}>Paul D.</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Maladie - Support Labo (23/10)</div>
                </div>
              </div>
            </div>

            <button onClick={() => window.location.href = "mailto:admin@ecole.fr?subject=Problème avec les heures annulées"} style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'background 0.2s', position: 'relative', zIndex: 1 }}>
              <Mail size={18} />
              Contacter l'administration
            </button>
          </div>

          {/* Récapitulatif */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Récapitulatif par Assistant</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Léa M.</span>
                  <span style={{ fontWeight: 600, color: '#475569' }}>15h / 20h</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '75%', backgroundColor: '#1e1b4b', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Marie L.</span>
                  <span style={{ fontWeight: 600, color: '#475569' }}>12h / 12h</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '100%', backgroundColor: '#10b981', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>Paul D.</span>
                  <span style={{ fontWeight: 600, color: '#475569' }}>9h / 16h</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '56%', backgroundColor: '#f59e0b', borderRadius: '4px' }}></div>
                </div>
              </div>

            </div>
          </div>

          {/* Banner Image */}
          <div style={{ borderRadius: '12px', overflow: 'hidden', position: 'relative', height: '160px', backgroundImage: 'url("https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
              <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>Support académique : 100% opérationnel</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default ResponsableHeures;
