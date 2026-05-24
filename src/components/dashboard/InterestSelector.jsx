import React from 'react';

const DOMAINS = [
  'Web Dev', 'AI/ML', 'Cloud', 'Cybersecurity', 'Mobile Dev', 'DevOps', 'UI/UX', 'Data Science', 'Blockchain'
];

export default function InterestSelector({ selectedInterests, onToggleInterest }) {
  return (
    <div className="interest-selector">
      <h3 style={{ marginBottom: '16px', color: 'var(--t1)', fontSize: '1.2rem' }}>Your Tech Interests</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {DOMAINS.map(domain => {
          const isActive = selectedInterests.includes(domain);
          return (
            <button
              key={domain}
              onClick={() => onToggleInterest(domain)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: `1px solid ${isActive ? 'var(--c1)' : 'var(--b2)'}`,
                background: isActive ? 'var(--c1-15)' : 'var(--bg-glass)',
                color: isActive ? 'var(--c1)' : 'var(--t2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontWeight: isActive ? '600' : '400',
                backdropFilter: 'blur(8px)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.border = '1px solid var(--c1-50)';
                  e.currentTarget.style.color = 'var(--t1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.border = '1px solid var(--b2)';
                  e.currentTarget.style.color = 'var(--t2)';
                }
              }}
            >
              {domain}
            </button>
          );
        })}
      </div>
    </div>
  );
}
