import React, { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';

const NAV_ITEMS = [
  { label: 'Home',     path: '/' },
  { label: 'Projects', path: '/projects' },
  { label: 'Contact',  path: '/contact' },
];

export default function Navbar({ 
  currentPath, 
  onNavigate, 
  mobileOpen, 
  setMobileOpen,
  theme,
  onToggleTheme
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      {/* Logo */}
      <a className="nav-logo" href="/" onClick={(e) => { e.preventDefault(); onNavigate('/'); }}>
        <span className="nav-logo-dot" />
        Vraj Goti
      </a>

      {/* Desktop links */}
      <ul className="nav-links">
        {NAV_ITEMS.map((item) => {
          const isActive = currentPath === item.path || (item.path === '/' && (currentPath === '/home' || currentPath === '/index.html'));
          return (
            <li key={item.path}>
              <button
                id={`nav-${item.label.toLowerCase()}`}
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={() => onNavigate(item.path)}
              >
                {item.label}
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

