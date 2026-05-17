import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Calendar, Zap } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';

/* ── Highlight matched keyword in text ── */
function Highlight({ text, query }) {
  if (!query || !text) return <>{text}</>;
  const safe  = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = String(text).split(new RegExp(`(${safe})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
          ? (
            <mark key={i} style={{
              background: 'rgba(204,17,17,0.85)',
              color: '#fff',
              borderRadius: '3px',
              padding: '0 2px',
              fontWeight: 700,
            }}>
              {part}
            </mark>
          )
          : part
      )}
    </>
  );
}

/* ── Type badge colours ── */
const TYPE_STYLE = {
  activity: { bg: 'rgba(204,17,17,0.15)', color: 'var(--c1)',  icon: <Zap      size={16} color="var(--c1)"/>  },
  event:    { bg: 'rgba(90,90,255,0.15)', color: '#9999ff',    icon: <Calendar size={16} color="#9999ff"/>    },
};

export default function SearchBar({ open, onClose, activities, events, onNavigate, onEventClick }) {
  const inputRef = useRef(null);
  const { query, setQuery, filter, setFilter, results, clearSearch } = useSearch(activities, events);

  /* Auto-focus when overlay opens */
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
    clearSearch();
  }, [open]);                        // eslint-disable-line

  /* Escape key closes overlay */
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [open, onClose]);

  /* Navigate to result on click */
  const handleClick = result => {
    if (result.type === 'activity') onNavigate('activity', result.key);
    else                            onEventClick(result.event);
    onClose();
    clearSearch();
  };

  return (
    <AnimatePresence>
      {open && (
        /* ── Backdrop ── */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={e => e.target === e.currentTarget && onClose()}
          style={{
            position: 'fixed', inset: 0, zIndex: 9000,
            background: 'rgba(0,0,0,0.82)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            padding: '72px 16px 32px',
            overflowY: 'auto',
          }}
        >
          {/* ── Panel ── */}
          <motion.div
            initial={{ y: -28, opacity: 0, scale: 0.97 }}
            animate={{ y: 0,   opacity: 1, scale: 1    }}
            exit   ={{ y: -16, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: '100%', maxWidth: '680px',
              background: 'var(--bg)',
              border: '1px solid rgba(204,17,17,0.22)',
              borderRadius: '18px',
              overflow: 'hidden',
              boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(204,17,17,0.08)',
            }}
          >

            {/* ── Input row ── */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}>
              <Search size={20} color="var(--c1)" style={{ flexShrink: 0 }}/>

              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search activities, events…"
                aria-label="Search"
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: 'var(--t1)', fontSize: '1.05rem', fontFamily: 'inherit',
                }}
              />

              {query && (
                <button
                  onClick={clearSearch}
                  aria-label="Clear search"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t2)', display: 'flex', padding: '4px' }}
                >
                  <X size={17}/>
                </button>
              )}

              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.07)', border: 'none', cursor: 'pointer',
                  color: 'var(--t2)', padding: '5px 10px', borderRadius: '7px',
                  fontSize: '0.74rem', fontFamily: 'inherit', letterSpacing: '0.05em',
                }}
              >
                ESC
              </button>
            </div>

            {/* ── Filter pills ── */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '11px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}>
              {['all', 'activities', 'events'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    background: filter === f ? 'var(--c1)' : 'rgba(255,255,255,0.07)',
                    color:      filter === f ? '#fff'      : 'var(--t2)',
                    border: 'none', borderRadius: '20px',
                    padding: '5px 15px', fontSize: '0.8rem',
                    cursor: 'pointer', fontFamily: 'inherit',
                    textTransform: 'capitalize',
                    transition: 'background 0.18s, color 0.18s',
                  }}
                >
                  {f === 'all' ? 'All' : f}
                </button>
              ))}

              {/* Result count */}
              {query && (
                <span style={{ marginLeft: 'auto', color: 'var(--t2)', fontSize: '0.78rem' }}>
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* ── Results area ── */}
            <div style={{ maxHeight: '420px', overflowY: 'auto' }}>

              {/* Empty prompt */}
              {!query && (
                <div style={{ padding: '44px 20px', textAlign: 'center', color: 'var(--t2)' }}>
                  <Search size={34} color="rgba(204,17,17,0.35)" style={{ marginBottom: '12px' }}/>
                  <div style={{ fontSize: '0.95rem', marginBottom: '8px' }}>
                    Type to search activities &amp; events
                  </div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.6 }}>
                    Press{' '}
                    <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                      Ctrl+K
                    </kbd>
                    {' '}anytime to open search
                  </div>
                </div>
              )}

              {/* No results */}
              {query && results.length === 0 && (
                <div style={{ padding: '44px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.8rem', marginBottom: '12px' }}>🔍</div>
                  <div style={{ color: 'var(--t1)', fontWeight: 600, fontSize: '1rem', marginBottom: '6px' }}>
                    No results for &ldquo;{query}&rdquo;
                  </div>
                  <div style={{ color: 'var(--t2)', fontSize: '0.88rem' }}>
                    Try different keywords or change the filter
                  </div>
                </div>
              )}

              {/* Result rows */}
              {results.map(result => {
                const ts = TYPE_STYLE[result.type];
                return (
                  <button
                    key={result.id + result.type}
                    onClick={() => handleClick(result)}
                    style={{
                      width: '100%', textAlign: 'left',
                      background: 'none', border: 'none',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      padding: '14px 20px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '14px',
                      transition: 'background 0.15s', color: 'var(--t1)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(204,17,17,0.07)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    {/* Icon */}
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '11px', flexShrink: 0,
                      background: ts.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {ts.icon}
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '3px' }}>
                        <Highlight text={result.title} query={query}/>
                      </div>
                      {result.description && (
                        <div style={{
                          color: 'var(--t2)', fontSize: '0.82rem',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          <Highlight text={result.description.slice(0, 90)} query={query}/>
                          {result.description.length > 90 && '…'}
                        </div>
                      )}
                      <span style={{
                        display: 'inline-block', marginTop: '5px',
                        fontSize: '0.7rem', padding: '1px 9px', borderRadius: '10px',
                        background: ts.bg, color: ts.color, textTransform: 'capitalize',
                      }}>
                        {result.type}
                      </span>
                    </div>

                    <ArrowRight size={15} color="var(--t2)" style={{ flexShrink: 0 }}/>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}