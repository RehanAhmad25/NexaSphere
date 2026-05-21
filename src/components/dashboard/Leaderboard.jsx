import React from 'react';

export default function Leaderboard({ users, currentUserId }) {
  if (!users || users.length === 0) return null;

  return (
    <div className="leaderboard" style={{ background: 'var(--bg-glass)', padding: '24px', borderRadius: '16px', border: '1px solid var(--b2)' }}>
      <h3 style={{ color: 'var(--t1)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        🏆 Top Tech Explorers
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {users.map((user, index) => {
          const isMe = user.userId === currentUserId;
          return (
            <div key={user.id || index} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px', borderRadius: '12px',
              background: isMe ? 'var(--c1-15)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${isMe ? 'var(--c1-50)' : 'transparent'}`,
              transition: 'background 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ 
                  color: index < 3 ? 'var(--c1)' : 'var(--t2)', 
                  fontWeight: 'bold', 
                  width: '24px', 
                  textAlign: 'center' 
                }}>
                  #{index + 1}
                </span>
                <div>
                  <div style={{ color: 'var(--t1)', fontWeight: isMe ? 'bold' : 'normal' }}>
                    {user.username} {isMe && '(You)'}
                  </div>
                  <div style={{ color: 'var(--t2)', fontSize: '0.8rem' }}>Lvl {user.level}</div>
                </div>
              </div>
              <div style={{ color: 'var(--c1)', fontWeight: 'bold' }}>
                {user.xp} XP
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
