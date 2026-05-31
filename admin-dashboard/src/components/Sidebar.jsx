import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AdminIcon } from './AdminIcon';

/* URL of the public website — configurable via .env */
const WEBSITE_URL = import.meta.env.VITE_WEBSITE_URL || 'http://localhost:5175';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: 'Dashboard' },
  { to: '/dashboard/events', label: 'Events', icon: 'Calendar' },
  {
    to: '/dashboard/activity-events',
    label: 'Activity Events',
    icon: 'Target',
  },
  { to: '/dashboard/core-team', label: 'Core Team', icon: 'Users' },
  { to: '/dashboard/membership', label: 'Membership', icon: 'FileText' },
  { to: '/dashboard/recruitment', label: 'Recruitment', icon: 'UserPlus' },
  { to: '/dashboard/certificates', label: 'Certificates', icon: 'Award' },
  { to: '/dashboard/announcements', label: 'Announcements', icon: 'Megaphone' },
];

export function Sidebar() {
  const { email, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <>
      {/* ── Mobile hamburger button ── */}
      <button
        className="sidebar-hamburger"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`ham-line${open ? ' open' : ''}`} />
        <span className={`ham-line${open ? ' open' : ''}`} />
        <span className={`ham-line${open ? ' open' : ''}`} />
      </button>

      {/* ── Backdrop (mobile only) ── */}
      {open && <div className="sidebar-backdrop" onClick={close} aria-hidden="true" />}

      <aside className={`sidebar${open ? ' sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-dot" />
          <span>NexaSphere Admin</span>
        </div>

        {/* Back to website link */}
        <a
          href={WEBSITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-back-link"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 20px',
            fontSize: '0.75rem',
            color: 'var(--admin-text-muted, #888)',
            textDecoration: 'none',
            borderBottom: '1px solid var(--admin-border, rgba(255,255,255,0.06))',
            marginBottom: '8px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--admin-accent, #CC1111)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--admin-text-muted, #888)')}
        >
          <AdminIcon name="ArrowLeft" size={12} aria-hidden="true" />
          Back to Website
        </a>

        <nav className="sidebar-nav">
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={close}
            >
              <AdminIcon name={icon} size={16} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="sidebar-email">{email}</span>
          <button className="btn-logout" onClick={logout} aria-label={`Logout ${email}`}>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
