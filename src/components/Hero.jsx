import React, { useState, useEffect } from 'react';
import { stats } from '../data/portfolioData';

// Simple arrow-right SVG
const ArrowRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

// Download SVG
const Download = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

export default function Hero({ onNavigate }) {
  const [typed, setTyped] = useState('');
  const [mounted, setMounted] = useState(false);
  const roles = ['Backend Developer', 'Python Developer', 'Database Engineer'];
  const [roleIdx, setRoleIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Typewriter effect cycling through roles
  useEffect(() => {
    const currentRole = roles[roleIdx];
    let timeout;

    if (!isDeleting && charIdx < currentRole.length) {
      timeout = setTimeout(() => setCharIdx((c) => c + 1), 75);
    } else if (!isDeleting && charIdx === currentRole.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx((c) => c - 1), 40);
    } else if (isDeleting && charIdx === 0) {
      setIsDeleting(false);
      setRoleIdx((i) => (i + 1) % roles.length);
    }

    return () => clearTimeout(timeout);
  }, [charIdx, isDeleting, roleIdx]);

  const currentRole = roles[roleIdx];

  return (
    <section id="home" className="hero">
      {/* Animated background */}
      <div className="hero-bg">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
        <div className="hero-grid" />
      </div>

      <div className="container" style={{ width: '100%' }}>
        <div className="hero-content">
          {/* Status badge */}
          <div className={`hero-badge fade-in-up delay-1 ${mounted ? '' : ''}`}>
            <span className="hero-badge-dot" />
            Available for new opportunities
          </div>

          {/* Title */}
          <h1 className="hero-title fade-in-up delay-2">
            <span style={{ color: 'var(--text-secondary)', fontWeight: 300, fontSize: '0.55em', letterSpacing: '0.01em', marginBottom: '0.25rem', fontFamily: 'var(--font-code)' }}>
              Hi, I'm
            </span>
            <span>Vraj Goti</span>
            <span
              className="gradient-text"
              style={{ fontSize: '0.7em', fontWeight: 800, letterSpacing: '-0.02em' }}
            >
              {currentRole.slice(0, charIdx)}
              <span
                style={{
                  display: 'inline-block',
                  width: '3px',
                  height: '0.8em',
                  background: 'var(--accent-primary)',
                  marginLeft: '3px',
                  verticalAlign: 'middle',
                  borderRadius: '2px',
                  animation: 'heartbeat 0.8s step-start infinite',
                }}
              />
            </span>
          </h1>

          {/* Bio */}
          <p className="hero-subtitle fade-in-up delay-3">
            I build high-throughput backend APIs, scalable distributed databases, and custom Python tooling. 
            Passionate about clean architecture, system performance, and elegant database optimization.
          </p>

          {/* Actions */}
          <div className="hero-actions fade-in-up delay-4">
            <button
              id="hero-view-work"
              className="btn btn-primary"
              onClick={() => onNavigate('/projects')}
            >
              View My Work <ArrowRight />
            </button>
            <button
              id="hero-contact"
              className="btn btn-ghost"
              onClick={() => onNavigate('/contact')}
            >
              Get In Touch
            </button>
          </div>

          {/* Stats */}
          <div className="hero-stats fade-in-up delay-5">
            {stats.map((stat, i) => (
              <div key={i}>
                <span className="hero-stat-value">{stat.value}</span>
                <span className="hero-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="scroll-indicator">
        <div className="scroll-mouse">
          <div className="scroll-wheel" />
        </div>
        <span>scroll</span>
      </div>
    </section>
  );
}
