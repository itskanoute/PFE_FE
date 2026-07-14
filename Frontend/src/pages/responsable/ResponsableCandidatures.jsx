import React, { useState } from 'react';
import { User, BookOpen, Star, Check, X, FileText, Download, RefreshCw, Mail, Phone } from 'lucide-react';
import './responsable.css';

const ResponsableCandidatures = () => {
  const [filter, setFilter] = useState('en_attente');

  const initialCandidatures = [
    {
      id: 1,
      name: "Emma Dubois",
      matiere: "Algorithmique",
      grade: "18.5/20",
      motivation: "J'ai toujours été passionnée par l'algorithmique et j'aimerais aider les étudiants de première année à acquérir de bonnes bases.",
      status: "en_attente",
      date: "Il y a 2 jours",
      email: "emma.dubois@edumanage.fr",
      telephone: "06 12 34 56 78"
    },
    {
      id: 2,
      name: "Hugo Lemaire",
      matiere: "Bases de données",
      grade: "16/20",
      motivation: "Mon expérience avec SQL me permet d'expliquer simplement des concepts complexes.",
      status: "en_attente",
      date: "Il y a 3 jours",
      email: "hugo.lemaire@edumanage.fr",
      telephone: "06 23 45 67 89"
    },
    {
      id: 3,
      name: "Chloé Petit",
      matiere: "Développement Web",
      grade: "19/20",
      motivation: "J'aime partager mes connaissances en React et Node.js. Je suis patiente et pédagogue.",
      status: "accepte",
      date: "Il y a 1 semaine",
      email: "chloe.petit@edumanage.fr",
      telephone: "06 34 56 78 90"
    },
    {
      id: 4,
      name: "Lucas Girard",
      matiere: "Réseaux",
      grade: "14/20",
      motivation: "Je souhaite renforcer mes propres connaissances en expliquant aux autres.",
      status: "refuse",
      date: "Il y a 2 semaines",
      email: "lucas.girard@edumanage.fr",
      telephone: "06 45 67 89 01"
    }
  ];

  const [candidaturesList, setCandidaturesList] = useState(initialCandidatures);
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);
  const [selectedCandidat, setSelectedCandidat] = useState(null);

  const handleAccepter = (id) => {
    const candidat = candidaturesList.find(c => c.id === id);
    setCandidaturesList(candidaturesList.map(c => c.id === id ? { ...c, status: 'accepte' } : c));
    window.location.href = `mailto:${candidat.email}?subject=Candidature Acceptée - ${candidat.matiere}&body=Bonjour ${candidat.name},%0D%0A%0D%0ANous avons le plaisir de vous informer que votre candidature pour être assistant en ${candidat.matiere} a été acceptée.`;
  };

  const handleRefuser = (id) => {
    setCandidaturesList(candidaturesList.map(c => c.id === id ? { ...c, status: 'refuse' } : c));
  };

  const handleRepecher = (id) => {
    const candidat = candidaturesList.find(c => c.id === id);
    setCandidaturesList(candidaturesList.map(c => c.id === id ? { ...c, status: 'en_attente' } : c));
    window.location.href = `mailto:${candidat.email}?subject=Candidature Repêchée - ${candidat.matiere}&body=Bonjour ${candidat.name},%0D%0A%0D%0ANous avons réévalué votre candidature en ${candidat.matiere} et souhaitons nous entretenir avec vous.`;
  };

  const handleVoirCV = (candidature) => {
    setSelectedCandidat(candidature);
    setIsCVModalOpen(true);
  };

  const filteredCandidatures = candidaturesList.filter(c => filter === 'all' || c.status === filter);

  return (
    <div className="resp-dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--resp-primary)', margin: 0 }}>
          Candidatures Assistants
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => setFilter('en_attente')}
            style={{ 
              padding: '0.6rem 1.2rem', 
              borderRadius: '20px', 
              border: 'none', 
              fontWeight: 600, 
              cursor: 'pointer',
              backgroundColor: filter === 'en_attente' ? 'var(--resp-accent)' : 'white',
              color: filter === 'en_attente' ? '#fff' : 'var(--resp-text-light)',
              boxShadow: filter === 'en_attente' ? '0 4px 6px -1px rgba(245, 158, 11, 0.2)' : 'none',
              border: filter === 'en_attente' ? 'none' : '1px solid var(--resp-border)'
            }}
          >
            En attente (2)
          </button>
          <button 
            onClick={() => setFilter('accepte')}
            style={{ 
              padding: '0.6rem 1.2rem', 
              borderRadius: '20px', 
              border: 'none', 
              fontWeight: 600, 
              cursor: 'pointer',
              backgroundColor: filter === 'accepte' ? 'var(--resp-success)' : 'white',
              color: filter === 'accepte' ? '#fff' : 'var(--resp-text-light)',
              border: filter === 'accepte' ? 'none' : '1px solid var(--resp-border)'
            }}
          >
            Acceptées
          </button>
          <button 
            onClick={() => setFilter('all')}
            style={{ 
              padding: '0.6rem 1.2rem', 
              borderRadius: '20px', 
              border: 'none', 
              fontWeight: 600, 
              cursor: 'pointer',
              backgroundColor: filter === 'all' ? 'var(--resp-primary)' : 'white',
              color: filter === 'all' ? '#fff' : 'var(--resp-text-light)',
              border: filter === 'all' ? 'none' : '1px solid var(--resp-border)'
            }}
          >
            Toutes
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {filteredCandidatures.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--resp-border)' }}>
            <FileText size={48} color="var(--resp-text-light)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3 style={{ color: 'var(--resp-text)', marginBottom: '0.5rem' }}>Aucune candidature</h3>
            <p style={{ color: 'var(--resp-text-light)' }}>Il n'y a pas de candidatures correspondant à ce filtre pour le moment.</p>
          </div>
        ) : (
          filteredCandidatures.map((candidature) => (
            <div key={candidature.id} style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--resp-border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} className="resp-card-hover">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--resp-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--resp-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.25rem', fontWeight: 700 }}>
                    {candidature.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--resp-text)', margin: '0 0 0.25rem 0' }}>{candidature.name}</h2>
                    <span style={{ fontSize: '0.85rem', color: 'var(--resp-text-light)' }}>Candidature reçue {candidature.date.toLowerCase()}</span>
                  </div>
                </div>
                
                {candidature.status === 'en_attente' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleRefuser(candidature.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fef2f2', color: 'var(--resp-danger)', border: '1px solid #fecaca', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                      <X size={18} />
                      Refuser
                    </button>
                    <button onClick={() => handleAccepter(candidature.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--resp-success)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                      <Check size={18} />
                      Accepter
                    </button>
                  </div>
                )}
                {candidature.status === 'accepte' && (
                  <span style={{ backgroundColor: '#dcfce7', color: 'var(--resp-success)', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Check size={18} /> Candidature acceptée
                  </span>
                )}
                {candidature.status === 'refuse' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ backgroundColor: '#fef2f2', color: 'var(--resp-danger)', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <X size={18} /> Candidature refusée
                    </span>
                    <button onClick={() => handleRepecher(candidature.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', color: 'var(--resp-text)', border: '1px solid var(--resp-border)', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                      <RefreshCw size={16} /> Repêcher
                    </button>
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', padding: '1.5rem', gap: '2rem', flexWrap: 'wrap', backgroundColor: '#f8fafc' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--resp-text-light)', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Motivation</h4>
                  <p style={{ color: 'var(--resp-text)', lineHeight: 1.6, margin: 0, fontStyle: 'italic', backgroundColor: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid var(--resp-border)' }}>
                    "{candidature.motivation}"
                  </p>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '200px' }}>
                  <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--resp-text-light)', fontWeight: 700, marginBottom: '0', letterSpacing: '0.05em' }}>Profil</h4>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--resp-border)' }}>
                    <div style={{ backgroundColor: '#e0e7ff', padding: '0.4rem', borderRadius: '6px', color: 'var(--resp-primary)' }}>
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--resp-text-light)' }}>Matière souhaitée</div>
                      <div style={{ fontWeight: 600, color: 'var(--resp-text)' }}>{candidature.matiere}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--resp-border)' }}>
                    <div style={{ backgroundColor: '#fef3c7', padding: '0.4rem', borderRadius: '6px', color: '#b45309' }}>
                      <Star size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--resp-text-light)' }}>Moyenne obtenue</div>
                      <div style={{ fontWeight: 700, color: 'var(--resp-text)' }}>{candidature.grade}</div>
                    </div>
                  </div>

                  <button onClick={() => handleVoirCV(candidature)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: 'white', color: 'var(--resp-primary)', border: '1px solid var(--resp-primary)', padding: '0.75rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', marginTop: 'auto' }}>
                    <FileText size={16} />
                    Voir le CV
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '200px' }}>
                  <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--resp-text-light)', fontWeight: 700, marginBottom: '0', letterSpacing: '0.05em' }}>Contact</h4>
                  
                  <a href={`mailto:${candidature.email}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--resp-border)', textDecoration: 'none' }}>
                    <div style={{ backgroundColor: '#e0f2fe', padding: '0.4rem', borderRadius: '6px', color: '#0284c7' }}>
                      <Mail size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--resp-text-light)' }}>Email</div>
                      <div style={{ fontWeight: 600, color: 'var(--resp-text)' }}>{candidature.email}</div>
                    </div>
                  </a>
                  
                  <a href={`tel:${candidature.telephone.replace(/\s/g, '')}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--resp-border)', textDecoration: 'none' }}>
                    <div style={{ backgroundColor: '#dcfce7', padding: '0.4rem', borderRadius: '6px', color: '#16a34a' }}>
                      <Phone size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--resp-text-light)' }}>Téléphone</div>
                      <div style={{ fontWeight: 600, color: 'var(--resp-text)' }}>{candidature.telephone}</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Visualisation CV */}
      {isCVModalOpen && selectedCandidat && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '90%', maxWidth: '800px', height: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            
            {/* Header Modal */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--resp-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--resp-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
                  {selectedCandidat.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--resp-text)' }}>CV - {selectedCandidat.name}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--resp-text-light)' }}>Candidat en {selectedCandidat.matiere}</span>
                </div>
              </div>
              <button 
                onClick={() => setIsCVModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--resp-text-light)', cursor: 'pointer', padding: '0.5rem' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Contenu Modal (Faux PDF CV) */}
            <div style={{ flex: 1, padding: '2rem', backgroundColor: '#e2e8f0', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
              <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '600px', padding: '3rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', minHeight: '800px' }}>
                <h1 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '0.5rem', borderBottom: '2px solid #0f172a', paddingBottom: '1rem' }}>{selectedCandidat.name}</h1>
                <p style={{ color: '#475569', marginBottom: '2rem' }}>Étudiant en Informatique • Spécialité {selectedCandidat.matiere}</p>
                
                <h2 style={{ fontSize: '1.2rem', color: '#0f172a', marginTop: '2rem', marginBottom: '1rem' }}>Expérience & Projets</h2>
                <ul style={{ color: '#334155', lineHeight: 1.8, paddingLeft: '1.5rem' }}>
                  <li>Participation à de multiples projets universitaires en {selectedCandidat.matiere}.</li>
                  <li>Excellent relationnel et habitude du travail en équipe.</li>
                  <li>Note obtenue : {selectedCandidat.grade}.</li>
                </ul>

                <h2 style={{ fontSize: '1.2rem', color: '#0f172a', marginTop: '2rem', marginBottom: '1rem' }}>Compétences Techniques</h2>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ padding: '0.3rem 0.8rem', backgroundColor: '#f1f5f9', borderRadius: '4px', fontSize: '0.85rem' }}>Pédagogie</span>
                  <span style={{ padding: '0.3rem 0.8rem', backgroundColor: '#f1f5f9', borderRadius: '4px', fontSize: '0.85rem' }}>{selectedCandidat.matiere}</span>
                  <span style={{ padding: '0.3rem 0.8rem', backgroundColor: '#f1f5f9', borderRadius: '4px', fontSize: '0.85rem' }}>Communication</span>
                </div>
              </div>
            </div>
            
            {/* Footer Modal */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--resp-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--resp-primary)', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                <Download size={18} /> Télécharger le PDF
              </button>
              
              {selectedCandidat.status === 'en_attente' && (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => { handleRefuser(selectedCandidat.id); setIsCVModalOpen(false); }} style={{ padding: '0.5rem 1.5rem', borderRadius: '6px', border: '1px solid #fecaca', backgroundColor: '#fef2f2', color: 'var(--resp-danger)', fontWeight: 600, cursor: 'pointer' }}>
                    Refuser
                  </button>
                  <button onClick={() => { handleAccepter(selectedCandidat.id); setIsCVModalOpen(false); }} style={{ padding: '0.5rem 1.5rem', borderRadius: '6px', border: 'none', backgroundColor: 'var(--resp-success)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                    Accepter
                  </button>
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};

export default ResponsableCandidatures;
