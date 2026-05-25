import { useState, useEffect } from 'react';
import { BRAND_LOGO_FULL, BRAND_LOGO_ICON } from './brandAssets';
import NotificationBell from '../components/NotificationBell';

const TABS = ['Home', 'Activities', 'Events', 'Projects', 'Roadmaps', 'Portfolio', 'About', 'Team', 'Contact'];

import { ThemeToggle } from '../components/common/ThemeToggle';

function BookmarkToggle({ onToggle }) {
  return (
    <button
      className="ns-bookmark-toggle"
      onClick={onToggle}
      aria-label="Open Bookmarks"
      title="Saved Bookmarks"
      style={{
        background: 'none',
        border: 'none',
        color: 'var(--t1)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px',
        borderRadius: '50%',
        transition: 'background 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
      </svg>
    </button>
  );
}

export default function Navbar({ activeTab, onTabChange, onApply, onJoin, onToggleBookmarks }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobile,   setMobile]   = useState(window.innerWidth <= 768);

  useEffect(() => {
    const s = () => setScrolled(window.scrollY > 20);
    const r = () => setMobile(window.innerWidth <= 768);
    window.addEventListener('scroll', s, { passive: true });
    window.addEventListener('resize', r, { passive: true });
    return () => {
      window.removeEventListener('scroll', s);
      window.removeEventListener('resize', r);
    };
  }, []);

  const handleTab = tab => onTabChange(tab);

  if (mobile) return (
    <nav className="ns-navbar-mobile">
      <div 
      className="ns-mobile-top"
      onClick={() => handleTab('Home')}
      style={{ cursor: 'pointer' }}
      aria-label="Go to homepage"
      >
        <img src={BRAND_LOGO_ICON} alt="NexaSphere" className="ns-mobile-logo-ns"/>
        <span className="ns-mobile-brand"><span>NexaSphere</span></span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <NotificationBell />
          <BookmarkToggle onToggle={onToggleBookmarks} />
          <ThemeToggle />
        </div>
      </div>
      <div className="ns-mobile-tabs">
        {TABS.map(t => (
          <button
            key={t}
            className={`ns-mobile-tab${activeTab === t ? ' active' : ''}${t === 'Contact' ? ' contact-tab' : ''}`}
            onClick={() => handleTab(t)}
          >
            {t}
          </button>
        ))}
        <button className="ns-mobile-tab ns-mobile-cta" onClick={onJoin} aria-label="Join as Member">Join</button>
        <button className="ns-mobile-tab ns-mobile-cta ns-mobile-cta-apply" onClick={onApply} aria-label="Apply for Core Team">Apply</button>
      </div>
    </nav>
  );

  return (
    <nav className={`ns-navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="container">
        <div 
        className="ns-nav-logos"
        onClick={() => handleTab('Home')}
        style={{ cursor: 'pointer' }}
        aria-label="Go to homepage"
        >
          <img src={BRAND_LOGO_FULL} alt="NexaSphere" className="ns-nav-logo-ns ns-nav-logo-icon"/>
          <div className="ns-nav-divider"/>
          <span className="ns-nav-brand">NexaSphere</span>
        </div>

        <ul className="ns-nav-tabs">
          {TABS.map(t => (
            <li key={t}>
              <button
                className={`ns-nav-tab${activeTab === t ? ' active' : ''}${t === 'Contact' ? ' contact-nav-tab' : ''}`}
                onClick={() => handleTab(t)}
              >
                {t}
              </button>
            </li>
          ))}
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <NotificationBell />
          <BookmarkToggle onToggle={onToggleBookmarks} />
          <div className="ns-nav-ctas">
            <button className="btn btn-sm btn-outline ns-nav-cta-btn" onClick={onJoin} aria-label="Join as Member">Join</button>
            <button className="btn btn-sm btn-primary ns-nav-cta-btn" onClick={onApply} aria-label="Apply for Core Team">Apply</button>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}