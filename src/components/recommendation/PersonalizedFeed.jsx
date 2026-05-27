/**
 * PersonalizedFeed
 * Shows a "For You" AI-recommended list of events.
 * Full ML-backed implementation coming soon — this stub renders the
 * events in a simple card grid so the page doesn't break.
 */
export default function PersonalizedFeed({ events = [], onEventClick }) {
  if (!events.length) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--t2, #94a3b8)' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>✨</div>
        <p style={{ margin: 0 }}>No events to recommend yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Section header */}
      <div style={{ marginBottom: 24 }}>
        <h2
          style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--t1, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>✨</span> Recommended For You
        </h2>
        <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: 'var(--t2, #94a3b8)' }}>
          Personalised picks based on your activity — full AI recommendations coming soon.
        </p>
      </div>

      {/* Event cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 18,
        }}
      >
        {events.map((ev) => {
          const clickable = !!ev.hasDetailPage;
          return (
            <div
              key={ev.id}
              onClick={clickable ? () => onEventClick(ev) : undefined}
              style={{
                padding: '20px',
                borderRadius: 14,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                cursor: clickable ? 'pointer' : 'default',
                transition: 'border-color 0.2s, transform 0.2s',
              }}
              onMouseEnter={(e) => {
                if (clickable) {
                  e.currentTarget.style.borderColor = 'rgba(123,111,255,0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  padding: '2px 10px',
                  borderRadius: 20,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  marginBottom: 10,
                  background:
                    ev.status === 'upcoming'
                      ? 'rgba(0,212,255,0.12)'
                      : 'rgba(255,255,255,0.06)',
                  color:
                    ev.status === 'upcoming'
                      ? 'var(--accent2, #00d4ff)'
                      : 'var(--t3, #64748b)',
                }}
              >
                {ev.status === 'upcoming' ? '🔵 Upcoming' : '✅ Completed'}
              </div>
              <h3
                style={{
                  margin: '0 0 6px',
                  fontSize: '0.98rem',
                  fontWeight: 600,
                  color: 'var(--t1, #e2e8f0)',
                  lineHeight: 1.4,
                }}
              >
                {ev.title || ev.name || 'Event'}
              </h3>
              {(ev.dateText || ev.date) && (
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--t2, #94a3b8)' }}>
                  📅 {ev.dateText || ev.date}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
