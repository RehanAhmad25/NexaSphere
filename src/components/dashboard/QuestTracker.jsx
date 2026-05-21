import React from 'react';

export default function QuestTracker({ quests, onCompleteQuest }) {
  if (!quests || quests.length === 0) {
    return (
      <div className="quest-tracker" style={{ background: 'var(--bg-glass)', padding: '24px', borderRadius: '16px', border: '1px solid var(--b2)' }}>
        <h3 style={{ color: 'var(--t1)', marginBottom: '16px' }}>Current Quests</h3>
        <p style={{ color: 'var(--t2)' }}>No active quests. Check back later!</p>
      </div>
    );
  }

  const completedCount = quests.filter(q => q.completed).length;
  const progressPercent = Math.round((completedCount / quests.length) * 100) || 0;

  return (
    <div className="quest-tracker" style={{ background: 'var(--bg-glass)', padding: '24px', borderRadius: '16px', border: '1px solid var(--b2)', position: 'relative', overflow: 'hidden' }}>
      <h3 style={{ color: 'var(--t1)', marginBottom: '8px' }}>Daily Tech Quests</h3>
      
      {/* Progress Bar */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ flex: 1, height: '8px', background: 'var(--b2)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--c1), #ff6b6b)', transition: 'width 0.5s ease' }} />
        </div>
        <span style={{ color: 'var(--t2)', fontSize: '0.9rem', fontWeight: 'bold' }}>{progressPercent}%</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {quests.map(quest => (
          <div key={quest.id} style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
            padding: '12px 16px', borderRadius: '12px', 
            background: quest.completed ? 'var(--c1-15)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${quest.completed ? 'var(--c1-50)' : 'var(--b2)'}`,
            transition: 'all 0.3s ease'
          }}>
            <div>
              <h4 style={{ color: 'var(--t1)', fontSize: '1rem', marginBottom: '4px', textDecoration: quest.completed ? 'line-through' : 'none' }}>{quest.title}</h4>
              <p style={{ color: 'var(--t2)', fontSize: '0.85rem' }}>{quest.description}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: 'var(--c1)', fontWeight: 'bold', fontSize: '0.9rem' }}>+{quest.xpReward} XP</span>
              <button 
                onClick={() => !quest.completed && onCompleteQuest(quest.id)}
                disabled={quest.completed}
                style={{
                  background: quest.completed ? 'transparent' : 'var(--c1)',
                  color: quest.completed ? 'var(--c1)' : '#fff',
                  border: quest.completed ? '1px solid var(--c1)' : 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  cursor: quest.completed ? 'default' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  opacity: quest.completed ? 0.7 : 1
                }}
              >
                {quest.completed ? 'Done' : 'Complete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
