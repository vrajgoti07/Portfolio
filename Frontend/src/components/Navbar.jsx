import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';

const DEFAULT_NAV_ITEMS = [
  { label: 'Home', path: '/' },
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
  navItems = DEFAULT_NAV_ITEMS
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);

  const isItemActive = (item) => {
    if (item.path === '/') {
      return currentPath === '/' || currentPath === '/home' || currentPath === '/index.html' || currentPath === '';
    }
    if (item.path === '/task') {
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
      </ul>

      {/* Action toggles */}
      <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
