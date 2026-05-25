import React, { useState, useEffect } from 'react';
import InterestSelector from '../../components/dashboard/InterestSelector';
import QuestTracker from '../../components/dashboard/QuestTracker';
import Leaderboard from '../../components/dashboard/Leaderboard';
import AiMentor from '../../components/dashboard/AiMentor';
import { DashboardCardSkeleton } from '../../components/ui/skeleton/DashboardCardSkeleton';

export default function DashboardPage({ onBack }) {
  // Mock current user for demonstration
  const [currentUser] = useState({ id: 'user_123', name: 'Explorer' });
  const [interests, setInterests] = useState([]);
  const [quests, setQuests] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    // In a real implementation, we would fetch this from Java Backend
    // Example: fetch(`/api/dashboard/quests/${currentUser.id}`)
    setQuests([
      { id: 'q1', title: 'Complete AI Review', description: 'Submit code to the AI Mentor.', xpReward: 100, completed: false },
      { id: 'q2', title: 'Select Interests', description: 'Choose at least 3 tech interests.', xpReward: 50, completed: false }
    ]);

    setLeaderboard([
      { id: 'u1', userId: 'user_123', username: 'Explorer', xp: 450, level: 3 },
      { id: 'u2', userId: 'user_456', username: 'TechNinja', xp: 850, level: 5 },
      { id: 'u3', userId: 'user_789', username: 'CodeMaster', xp: 320, level: 2 }
    ].sort((a,b) => b.xp - a.xp));
  }, [currentUser]);

  const toggleInterest = (domain) => {
    setInterests(prev => {
      const newInterests = prev.includes(domain) ? prev.filter(d => d !== domain) : [...prev, domain];
      
      // Quest trigger
      if (newInterests.length >= 3) {
        completeQuest('q2');
      }
      return newInterests;
    });
  };

  const completeQuest = (questId) => {
    setQuests(prev => prev.map(q => q.id === questId ? { ...q, completed: true } : q));
  };

  const fetchRecommendations = async () => {
    if (interests.length === 0) return;
    setLoadingRecs(true);
    try {
      const base = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
      const res = await fetch(`${base}/recommend/events/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.recommended_events || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRecs(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecommendations();
    }, 1000);
    return () => clearTimeout(timer);
  }, [interests]);

  return (
    <div className="dashboard-page" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: 'var(--t1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', background: 'linear-gradient(90deg, #fff, var(--c1))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Welcome back, {currentUser.name}
        </h1>
        {onBack && (
          <button onClick={onBack} className="btn" style={{ background: 'var(--bg-glass)', border: '1px solid var(--b2)', color: 'var(--t1)' }}>
            Home
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'var(--bg-glass)', padding: '24px', borderRadius: '16px', border: '1px solid var(--b2)' }}>
            <InterestSelector selectedInterests={interests} onToggleInterest={toggleInterest} />
          </div>

          <div style={{ background: 'var(--bg-glass)', padding: '24px', borderRadius: '16px', border: '1px solid var(--b2)' }}>
            <h3 style={{ marginBottom: '16px', color: 'var(--t1)' }}>Personalized Recommendations</h3>
            {interests.length === 0 ? (
              <p style={{ color: 'var(--t2)' }}>Select some interests above to see recommendations!</p>
            ) : loadingRecs ? (
              <DashboardCardSkeleton count={3} />
            ) : recommendations.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recommendations.map((rec, i) => (
                  <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--c1-50)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--c1)' }}>{rec.title || 'Event'}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--t2)' }}>Match Score: {Math.round((rec.score || 0.8) * 100)}%</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--t2)' }}>No new recommendations based on your current interests.</p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <QuestTracker quests={quests} onCompleteQuest={completeQuest} />
          <Leaderboard users={leaderboard} currentUserId={currentUser.id} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <AiMentor />
        </div>
      </div>
    </div>
  );
}
