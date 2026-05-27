import { useState } from 'react';

/**
 * GamificationDashboard
 *
 * Placeholder page displayed when the user navigates to the Gamification tab.
 * Replace the contents of this file with the full implementation once built.
 */
export default function GamificationDashboard() {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      {/* Trophy icon */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(123,111,255,0.18), rgba(0,212,255,0.14))',
          border: '1.5px solid rgba(123,111,255,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
          boxShadow: '0 0 32px rgba(123,111,255,0.18)',
        }}
      >
        🏆
      </div>

      <div>
        <h1
          style={{
            margin: 0,
            fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
            fontWeight: 700,
            background: 'linear-gradient(135deg, var(--accent, #7b6fff), var(--accent2, #00d4ff))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Gamification Hub
        </h1>
        <p
          style={{
            margin: '12px 0 0',
            color: 'var(--t2, #94a3b8)',
            fontSize: '1rem',
            maxWidth: 480,
            lineHeight: 1.7,
          }}
        >
          Earn XP, unlock badges, and climb the leaderboard as you participate
          in NexaSphere events, activities, and projects. Full features coming
          soon!
        </p>
      </div>

      {/* Teaser cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 16,
          width: '100%',
          maxWidth: 600,
          marginTop: 8,
        }}
      >
        {[
          { emoji: '⭐', label: 'XP Points', value: '—' },
          { emoji: '🥇', label: 'Badges', value: '—' },
          { emoji: '📈', label: 'Leaderboard', value: '—' },
          { emoji: '🎯', label: 'Challenges', value: '—' },
        ].map(({ emoji, label, value }) => (
          <div
            key={label}
            onMouseEnter={() => setHovered(label)}
            onMouseLeave={() => setHovered(false)}
            style={{
              padding: '20px 16px',
              borderRadius: 14,
              background:
                hovered === label
                  ? 'linear-gradient(135deg,rgba(123,111,255,0.12),rgba(0,212,255,0.09))'
                  : 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              transition: 'background 0.25s, transform 0.2s',
              transform: hovered === label ? 'translateY(-3px)' : 'none',
              cursor: 'default',
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>{emoji}</div>
            <div style={{ color: 'var(--t2, #94a3b8)', fontSize: '0.8rem', marginBottom: 4 }}>
              {label}
            </div>
            <div style={{ color: 'var(--t1, #e2e8f0)', fontSize: '1.25rem', fontWeight: 700 }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      <p style={{ color: 'var(--t3, #64748b)', fontSize: '0.78rem', marginTop: 8 }}>
        Feature under active development · Stay tuned 🚀
      </p>
    </div>
  );
}
