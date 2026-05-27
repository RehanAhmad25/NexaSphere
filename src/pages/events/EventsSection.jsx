import { useEffect } from 'react';
import { DynamicIcon } from '../../shared/Icons';

export default function EventsSection({ onEventClick, events = [] }) {
  useEffect(()=>{
    const obs=new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting && !e.target.classList.contains('fired')){
          e.target.classList.add('fired');
          e.target.addEventListener('animationend', () => {
            e.target.style.opacity = '1';
            e.target.style.transform = 'none';
          }, { once: true });
          obs.unobserve(e.target);
        }
      });
    },{threshold:.1});
    document.querySelectorAll('#section-events .pop-in,#section-events .pop-left,#section-events .pop-right,#section-events .pop-word').forEach(el=>obs.observe(el));
    return()=>obs.disconnect();
  },[]);

  // Auto-detect: if date has passed, treat as completed regardless of stored status
  const now = Date.now();
  const parseDate = ev => {
    const raw = ev.dateText ?? ev.date ?? '';
    const d = new Date(raw);
    return isNaN(d) ? null : d;
  };
  const getEffectiveStatus = ev => {
    if (ev.status === 'completed') return 'completed';
    const d = parseDate(ev);
    if (d && d.getTime() < now) return 'completed'; // date passed → auto-complete
    return ev.status || 'upcoming';
  };

  // Sort: upcoming first (earliest date first), then completed (most recent first)
  const sortedEvents = [...events]
    .map(ev => ({ ...ev, _effectiveStatus: getEffectiveStatus(ev) }))
    .sort((a, b) => {
      const aIsUpcoming = a._effectiveStatus !== 'completed';
      const bIsUpcoming = b._effectiveStatus !== 'completed';
      if (aIsUpcoming !== bIsUpcoming) return bIsUpcoming ? 1 : -1;
      const da = parseDate(a)?.getTime() ?? 0;
      const db = parseDate(b)?.getTime() ?? 0;
      return aIsUpcoming ? da - db : db - da;
    });

  return (
    <section className="section" id="section-events">
      <div className="container">
        <div className="section-heading">
          <h2 className="section-title pop-word">Our Events</h2>
          <p className="section-subtitle pop-in" style={{animationDelay:'.1s'}}>Where Ideas Come to Life</p>
        </div>
        <div className="events-timeline">
          {sortedEvents.map((ev,i)=>{
            const hasDetailPage = !!ev.hasDetailPage;
            return (
              <div className="timeline-item" key={ev.id}>
                <div className={`timeline-dot${ev._effectiveStatus === 'upcoming' ? ' upcoming' : ''}`}/>
                <div
                  className={`timeline-card shimmer ${i%2===0?'pop-left':'pop-right'}`}
                  style={{
                    animationDelay:`${i*.11}s`,
                    cursor: hasDetailPage ? 'pointer' : 'default',
                    transition: 'all .28s ease',
                  }}
                  onClick={hasDetailPage ? () => onEventClick?.(ev) : undefined}
                  onMouseEnter={hasDetailPage ? e => {
                    e.currentTarget.style.borderColor = 'rgba(168,85,247,.45)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(168,85,247,.15)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  } : undefined}
                  onMouseLeave={hasDetailPage ? e => {
                    e.currentTarget.style.borderColor = '';
                    e.currentTarget.style.boxShadow = '';
                    e.currentTarget.style.transform = '';
                  } : undefined}
                >
                  <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'7px'}}>
                    <span style={{display:'flex',color:'var(--c1)'}}><DynamicIcon name={ev.icon || 'Calendar'} size={30} /></span>
                    <div className="timeline-event-name" style={hasDetailPage ? { color: '#a855f7' } : {}}>{ev.name}</div>
                    {hasDetailPage && (
                      <span style={{
                        marginLeft: 'auto', fontSize: '.6rem', padding: '2px 8px',
                        borderRadius: '10px', background: 'rgba(168,85,247,.12)',
                        color: '#a855f7', border: '1px solid rgba(168,85,247,.3)',
                        fontFamily: "'Space Mono', monospace", whiteSpace: 'nowrap',
                      }}>View Details →</span>
                    )}
                  </div>
                  <div className="timeline-event-date" style={{display:'flex',alignItems:'center',gap:'6px'}}>
                    <DynamicIcon name="Calendar" size={14} /> {ev.dateText ?? ev.date}
                  </div>
                  <p className="timeline-event-desc">{ev.description}</p>
                  <div style={{display:'flex',alignItems:'center',gap:'7px',flexWrap:'wrap'}}>
                    <span className={`timeline-badge ${ev._effectiveStatus}`}>
                      {ev._effectiveStatus === 'completed' ? (
                        <><DynamicIcon name="CheckCircle" size={14} style={{marginRight:'4px'}} /> Completed</>
                      ) : (
                        <><DynamicIcon name="Calendar" size={14} style={{marginRight:'4px'}} /> Upcoming</>
                      )}
                    </span>
                    {ev.tags?.map(t=>(
                      <span key={t} style={{fontSize:'.68rem',padding:'2px 8px',borderRadius:'10px',background:'var(--c2a)',color:'var(--c2)',border:'1px solid var(--c2b)',fontWeight:600}}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          {events.length>0&&(
            <div className="timeline-item">
              <div className="timeline-dot upcoming"/>
              <div className="timeline-card pop-in" style={{textAlign:'center',color:'var(--t3)'}}>
                <DynamicIcon name="Rocket" size={24} style={{color:'var(--c1)',marginBottom:'8px'}} />
                <p style={{marginTop:'6px',fontSize:'.84rem'}}>More events are being planned. Watch this space!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

