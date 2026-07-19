import React, { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';

const NAV_ITEMS = [
  { label: 'Home',       id: 'home' },
  { label: 'Projects',   id: 'projects' },
  { label: 'Skills',     id: 'skills' },
  { label: 'Experience', id: 'experience' },
];

export default function Navbar({ 
  activeSection, 
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
      <a className="nav-logo" href="#home" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>
        <span className="nav-logo-dot" />
        Vraj Goti
      </a>

      {/* Desktop links */}
      <ul className="nav-links">
        {NAV_ITEMS.map((item) => (
          <li key={item.id}>
            <button
              id={`nav-${item.id}`}
              className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>

      {/* Action toggles and CTA */}
      <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <button
          id="nav-contact-cta"
          className="nav-cta"
          onClick={() => onNavigate('contact')}
        >
          Hire Me
        </button>
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
