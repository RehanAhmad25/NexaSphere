import React, { useState, useEffect } from 'react';
import TeamCard from '../../components/collab/TeamCard';
import JoinRequestModal from '../../components/collab/JoinRequestModal';
import SkillSwapBoard from '../../components/collab/SkillSwapBoard';

const mockTeams = [
  { id: 't1', name: 'Quantum Coders', hackathonName: 'Global Hack 2026', description: 'Building an AI powered teammate finder using React and FastAPI. Need help with the frontend.', vacantRoles: ['Frontend', 'UI/UX'], techStack: ['React', 'FastAPI', 'Figma'] },
  { id: 't2', name: 'SecureNet', hackathonName: 'CyberDefenders', description: 'Creating a decentralized zero-trust network protocol. Looking for cybersecurity enthusiasts.', vacantRoles: ['Cybersecurity', 'Backend'], techStack: ['Rust', 'Docker'] },
  { id: 't3', name: 'Mobile Innovators', hackathonName: 'AppFest', description: 'Developing a cross-platform mobile app for community health tracking.', vacantRoles: ['Mobile'], techStack: ['Flutter', 'Firebase'] }
];

export default function CollabPage({ onBack }) {
  const [activeTab, setActiveTab] = useState('find-team'); // 'find-team', 'skill-swap'
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    // In a real scenario, this would fetch from the Java backend API
    setTeams(mockTeams);
  }, []);

  const handleJoinSubmit = async (requestData) => {
    // Send request to Java backend / Python notification webhook
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.vacantRoles.some(r => r.toLowerCase().includes(search.toLowerCase())) ||
    t.techStack.some(ts => ts.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="page-container" style={{ minHeight: '100vh', paddingTop: '40px', paddingBottom: '80px', position: 'relative' }}>
      
      {/* Back button */}
      <div style={{ padding: '0 24px', maxWidth: '1200px', margin: '0 auto', marginBottom: '24px' }}>
        <button 
          onClick={onBack}
          style={{
            background: 'transparent', border: 'none', color: 'var(--c1)', cursor: 'pointer',
            fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600
          }}
        >
          &larr; Back to Home
        </button>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <header style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 className="pop-word" style={{ 
            fontFamily: "'Orbitron', monospace", fontSize: 'clamp(2rem, 5vw, 3.5rem)', 
            margin: '0 0 16px 0', background: 'linear-gradient(135deg, #CC1111, #FF4444)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Collaboration Hub
          </h1>
          <p style={{ color: 'var(--t2)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Find the perfect team for your next hackathon or swap skills with other developers.
          </p>
        </header>

        {/* Custom Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '40px' }}>
          <button 
            onClick={() => setActiveTab('find-team')}
            style={{
              padding: '12px 24px', borderRadius: '30px', fontWeight: 600, fontSize: '1rem',
              border: activeTab === 'find-team' ? '1px solid var(--c1)' : '1px solid rgba(255,255,255,0.1)',
              background: activeTab === 'find-team' ? 'rgba(204,17,17,0.1)' : 'var(--surface)',
              color: activeTab === 'find-team' ? 'var(--c1)' : 'var(--t2)',
              cursor: 'pointer', transition: 'all 0.3s'
            }}
          >
            Find a Team
          </button>
          <button 
            onClick={() => setActiveTab('skill-swap')}
            style={{
              padding: '12px 24px', borderRadius: '30px', fontWeight: 600, fontSize: '1rem',
              border: activeTab === 'skill-swap' ? '1px solid var(--c1)' : '1px solid rgba(255,255,255,0.1)',
              background: activeTab === 'skill-swap' ? 'rgba(204,17,17,0.1)' : 'var(--surface)',
              color: activeTab === 'skill-swap' ? 'var(--c1)' : 'var(--t2)',
              cursor: 'pointer', transition: 'all 0.3s'
            }}
          >
            Skill-Swap Board
          </button>
        </div>

        {activeTab === 'find-team' && (
          <div className="pop-in">
            {/* Search/Filter Bar */}
            <div style={{ marginBottom: '32px', display: 'flex', gap: '16px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input 
                  type="text" 
                  placeholder="Search by role, tech stack, or team name..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: '100%', padding: '16px 20px 16px 48px',
                    background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px', color: 'var(--t1)', fontSize: '1rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}
                />
                <svg style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--t2)' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {filteredTeams.map(team => (
                <TeamCard key={team.id} team={team} onJoin={setSelectedTeam} />
              ))}
              {filteredTeams.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--t2)' }}>
                  No teams found matching your criteria.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'skill-swap' && (
          <div className="pop-in">
            <SkillSwapBoard />
          </div>
        )}
      </div>

      {selectedTeam && (
        <JoinRequestModal 
          team={selectedTeam} 
          onClose={() => setSelectedTeam(null)} 
          onSubmit={handleJoinSubmit}
        />
      )}
    </div>
  );
}
