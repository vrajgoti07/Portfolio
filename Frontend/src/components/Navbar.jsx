import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import { ShieldCheck, LogOut, CheckSquare } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Skills', path: '/skills' },
  { label: 'Projects', path: '/projects' },
  { label: 'Experience', path: '/experience' },
  { label: 'Contact', path: '/contact' },
];

export default function Navbar({
  currentPath,
  onNavigate,
  mobileOpen,
  setMobileOpen,
  theme,
  onToggleTheme,
  user,
  isAuthenticated,
  onLogout
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const userEmail = (user?.email || '').toLowerCase().trim();
  const isAdmin = userEmail === 'vrajgoti07@gmail.com' || user?.role === 'admin';

  const handleNavClick = (path) => {
    onNavigate(path);
    setMobileOpen(false);
  };

  const isNavActive = (path) => {
    const cleanPath = (currentPath || '').replace(/\/+$/, '') || '/';
    if (path === '/') {
      return cleanPath === '/' || cleanPath === '/home' || cleanPath === '/index.html';
    }
    if (path === '/tasks') {
      return cleanPath === '/tasks' || cleanPath === '/task';
    }
    return cleanPath === path;
  };

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      {/* Brand Monogram Logo */}
      <a
        className="nav-brand"
        href="/"
        onClick={(e) => {
          e.preventDefault();
          handleNavClick('/');
        }}
        id="nav-logo-link"
        aria-label="Vraj Goti Portfolio Home"
      >
        <div className="nav-monogram">VG</div>
        <div className="nav-brand-text">
          <span className="nav-brand-name">Vraj Goti</span>
          <span className="nav-brand-tag">Engineering</span>
        </div>
      </a>

      {/* Desktop Main Links */}
      <ul className="nav-links">
        {NAV_ITEMS.map((item) => {
          const active = isNavActive(item.path);
          return (
            <li key={item.label}>
              <button
                id={`nav-${item.label.toLowerCase()}`}
                className={`nav-link ${active ? 'active' : ''}`}
                onClick={() => handleNavClick(item.path)}
              >
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}

        {/* Dedicated Tasks Platform Link */}
        <li>
          <button
            id="nav-tasks"
            className={`nav-link ${isNavActive('/tasks') ? 'active' : ''}`}
            onClick={() => handleNavClick('/tasks')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <CheckSquare size={14} color="var(--accent-primary)" />
            <span>Tasks</span>
          </button>
        </li>

        {/* Admin Dashboard Pill when Authorized */}
        {isAdmin && (
          <li>
            <button
              id="nav-admin-dashboard"
              className={`nav-admin-badge ${currentPath === '/admin' ? 'active' : ''}`}
              onClick={() => handleNavClick('/admin')}
              title="Executive Admin Panel"
            >
              <ShieldCheck size={14} />
              <span>Admin</span>
            </button>
          </li>
        )}
      </ul>

      {/* Actions: Auth & Theme */}
      <div className="nav-actions">
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span
              id="user-badge"
              className={`user-badge-pill ${isAdmin ? 'admin' : ''}`}
              title={user?.email || 'Authenticated User'}
            >
              {isAdmin ? `👑 ${user?.email}` : (user?.email || 'User')}
            </span>
            <button
              id="logout-btn"
              onClick={onLogout}
              className="btn-ghost"
              style={{
                padding: '0.4rem 0.8rem',
                fontSize: '0.82rem',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: 'var(--color-error)'
              }}
              title="Sign Out"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="nav-auth-buttons" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              id="nav-login-btn"
              onClick={() => onNavigate('/login')}
              className={`nav-link ${currentPath === '/login' ? 'active' : ''}`}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            >
              Login
            </button>
            <button
              id="nav-register-btn"
              onClick={() => onNavigate('/register')}
              className="btn btn-primary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
            >
              Register
            </button>
          </div>
        )}

        <ThemeToggle theme={theme} onToggle={onToggleTheme} />

        {/* Hamburger Mobile Menu Toggle */}
        <button
          id="hamburger-btn"
          className="hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          aria-expanded={mobileOpen}
        >
          <span style={{ transform: mobileOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span style={{ opacity: mobileOpen ? 0 : 1 }} />
          <span style={{ transform: mobileOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>
      </div>
    </nav>
  );
}
