import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';

const DEFAULT_NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Tasks', path: '/tasks' },
  { label: 'Projects', path: '/projects' },
  { label: 'Contact', path: '/contact' },
];

export default function Navbar({
  currentPath,
  onNavigate,
  mobileOpen,
  setMobileOpen,
  theme,
  onToggleTheme,
  navItems = DEFAULT_NAV_ITEMS,
  user,
  isAuthenticated,
  onLogout
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);

  const userEmail = (user?.email || '').toLowerCase().trim();
  const isAdmin = userEmail === 'vrajgoti07@gmail.com' || user?.role === 'admin';

  const isItemActive = (item) => {
    if (item.path === '/') {
      return currentPath === '/' || currentPath === '/home' || currentPath === '/index.html' || currentPath === '';
    }
    if (item.path === '/task' || item.path === '/tasks') {
      return currentPath === '/task' || currentPath === '/tasks';
    }
    return currentPath === item.path;
  };

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      {/* Logo */}
      <a className="nav-logo" href="/" onClick={(e) => { e.preventDefault(); onNavigate('/'); }}>
        <span className="nav-logo-dot" />
        Vraj Goti
      </a>

      {/* Desktop links */}
      <ul className="nav-links">
        {navItems.map((item) => {
          const active = isItemActive(item);
          return (
            <li key={item.path}>
              <button
                id={`nav-${item.label.toLowerCase()}`}
                className={`nav-link ${active ? 'active' : ''}`}
                onClick={() => onNavigate(item.path)}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="nav-badge-pill">{item.badge}</span>
                )}
              </button>
            </li>
          );
        })}

        {/* Exclusive Admin Navigation Link */}
        {isAdmin && (
          <li>
            <button
              id="nav-admin-dashboard"
              className={`nav-link ${currentPath === '/admin' ? 'active' : ''}`}
              onClick={() => onNavigate('/admin')}
              style={{
                background: currentPath === '/admin' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                color: '#F59E0B',
                borderRadius: '8px',
                padding: '0.35rem 0.75rem',
                fontWeight: 700
              }}
            >
              👑 Admin
            </button>
          </li>
        )}
      </ul>

      {/* Auth Actions & Theme Toggle */}
      <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span
              id="user-badge"
              style={{
                fontFamily: 'var(--font-code)',
                fontSize: '0.75rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '100px',
                background: isAdmin ? 'rgba(245, 158, 11, 0.15)' : 'rgba(108, 99, 255, 0.15)',
                border: isAdmin ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(108, 99, 255, 0.35)',
                color: isAdmin ? '#F59E0B' : 'var(--accent-secondary)',
                maxWidth: '180px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              title={user?.email || 'Authenticated User'}
            >
              {isAdmin ? `👑 ${user?.email}` : (user?.email || 'Logged In')}
            </span>
            <button
              id="logout-btn"
              onClick={onLogout}
              className="btn-secondary"
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.8rem',
                borderRadius: '8px',
                cursor: 'pointer',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#EF4444'
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              id="nav-login-btn"
              onClick={() => onNavigate('/login')}
              className={`nav-link ${currentPath === '/login' ? 'active' : ''}`}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Login
            </button>
            <button
              id="nav-register-btn"
              onClick={() => onNavigate('/register')}
              className="btn-primary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem', borderRadius: '8px', cursor: 'pointer' }}
            >
              Register
            </button>
          </div>
        )}

        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      {/* Hamburger */}
      <button
        id="hamburger-btn"
        className="hamburger"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        <span style={{ transform: mobileOpen ? 'rotate(45deg) translate(5px, 5px)' : '' }} />
        <span style={{ opacity: mobileOpen ? 0 : 1 }} />
        <span style={{ transform: mobileOpen ? 'rotate(-45deg) translate(5px, -5px)' : '' }} />
      </button>
    </nav>
  );
}
