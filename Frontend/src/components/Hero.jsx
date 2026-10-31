import { useState, useEffect } from 'react';
import { ArrowRight, Mail, FileText, Sparkles, Terminal, Code2, Cpu, Database } from 'lucide-react';
import { heroRoles, personalInfo } from '../data/portfolioData';

export default function Hero({ onNavigate }) {
  const [roleIdx, setRoleIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Typewriter effect cycling through specified roles
  useEffect(() => {
    const currentRole = heroRoles[roleIdx];
    let timer;

    if (!isDeleting && charIdx < currentRole.length) {
      timer = setTimeout(() => setCharIdx((c) => c + 1), 60);
    } else if (!isDeleting && charIdx === currentRole.length) {
      timer = setTimeout(() => setIsDeleting(true), 2400);
    } else if (isDeleting && charIdx > 0) {
      timer = setTimeout(() => setCharIdx((c) => c - 1), 35);
    } else if (isDeleting && charIdx === 0) {
      timer = setTimeout(() => {
        setIsDeleting(false);
        setRoleIdx((r) => (r + 1) % heroRoles.length);
      }, 300);
    }

    return () => clearTimeout(timer);
  }, [charIdx, isDeleting, roleIdx]);

  const currentRole = heroRoles[roleIdx];


  return (
    <section id="hero" className="hero">
      {/* Refined ambient orange glow */}
      <div className="hero-ambient-glow" aria-hidden="true" />

      <div className="container">
        <div className="hero-grid">
          {/* LEFT SIDE: Typography, Roles & CTAs */}
          <div className="hero-content-col">
            {/* Status Badge */}
            <div className="hero-status-badge">
              <span className="pulse-radar-dot" aria-hidden="true" />
              <span>{personalInfo.status}</span>
            </div>

            {/* Intro text */}
            <span className="hero-intro-text">
              Hi, I'm {personalInfo.name}
            </span>

            {/* Main Heading */}
            <h1 className="hero-main-title">
              Building <span className="gradient-text">Intelligent</span><br />
              Digital Experiences.
            </h1>

            {/* Dynamic Typewriter Role */}
            <div className="hero-dynamic-role" aria-live="polite">
              <Terminal size={20} color="var(--accent-secondary)" style={{ marginRight: '0.65rem' }} />
              <span>{currentRole.slice(0, charIdx)}</span>
              <span className="typing-cursor" aria-hidden="true" />
            </div>

            {/* Professional Summary */}
            <p className="hero-summary">
              {personalInfo.bio} Focused on engineering scalable systems with clean architecture,
              responsive design, and verifiable performance.
            </p>

            {/* CTA Buttons */}
            <div className="hero-actions">
              <button
                id="hero-explore-work"
                className="btn btn-primary"
                onClick={() => onNavigate('/projects')}
              >
                <span>Explore My Work</span>
                <ArrowRight size={16} />
              </button>

              <button
                id="hero-connect-btn"
                className="btn btn-secondary"
                onClick={() => onNavigate('/contact')}
              >
                <Mail size={16} />
                <span>Let's Connect</span>
              </button>

              <button
                id="hero-resume-link"
                onClick={() => onNavigate('/about')}
                className="btn btn-ghost"
                title="View Technical Background & Journey"
              >
                <FileText size={16} />
                <span>About &amp; Journey</span>
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: Elegant Interactive Profile Composition */}
          <div className="hero-visual-col">
            <div className="hero-visual-card">
              {/* Technical orbit visualization */}
              <div className="orbit-circle-outer">
                <div className="orbit-circle-inner">
                  <div className="hero-monogram-emblem">VG</div>
                </div>

                {/* Floating technology badges */}
                <div className="floating-tech-badge tech-pos-1">
                  <Code2 size={13} style={{ color: 'var(--accent-primary)', display: 'inline', marginRight: '4px' }} />
                  Python 3.12
                </div>
                <div className="floating-tech-badge tech-pos-2">
                  <Sparkles size={13} style={{ color: 'var(--accent-secondary)', display: 'inline', marginRight: '4px' }} />
                  AI & ML
                </div>
                <div className="floating-tech-badge tech-pos-3">
                  <Cpu size={13} style={{ color: 'var(--accent-primary)', display: 'inline', marginRight: '4px' }} />
                  React 19
                </div>
                <div className="floating-tech-badge tech-pos-4">
                  <Database size={13} style={{ color: 'var(--accent-secondary)', display: 'inline', marginRight: '4px' }} />
                  Node.js / Mongo
                </div>
              </div>

              {/* Technical specifications panel */}
              <div className="hero-spec-grid">
                <div className="spec-item">
                  <span className="spec-label">Specialization</span>
                  <span className="spec-value">Full-Stack & AI</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Core Runtime</span>
                  <span className="spec-value">Python / Node.js</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Architecture</span>
                  <span className="spec-value">Event-Driven / RBAC</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Database</span>
                  <span className="spec-value">MongoDB / Caching</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
