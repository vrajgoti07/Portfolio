import React from 'react';
import { projects } from '../data/portfolioData';
import Reveal from './Reveal';

// Activity icon
const Activity = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);

// External link icon
const ExternalLink = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

export default function Projects() {
  return (
    <section id="projects" style={{ background: 'var(--bg-card)' }}>
      <div className="container">
        {/* Header */}
        <Reveal>
          <div style={{ marginBottom: '3rem' }}>
            <span className="section-tag">Featured Work</span>
            <h2 className="section-title">Projects That Ship</h2>
            <p className="section-desc">
              A selection of production systems I've architected and delivered — built for scale, reliability, and performance.
            </p>
          </div>
        </Reveal>

        {/* Grid */}
        <div className="projects-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.25rem'
        }}>
          {projects.map((project, idx) => (
            <Reveal key={idx} delay={idx * 100}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project }) {
  const techChips = project.tech.split(' / ');

  return (
    <div className="project-card">
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <span className="project-tag">{project.extension}</span>
        <a
          href={project.href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '2px',
            transition: 'color 0.2s',
            display: 'flex',
            alignItems: 'center',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          aria-label="View project"
        >
          <ExternalLink />
        </a>
      </div>

      {/* Content */}
      <h3 className="project-title">{project.name}</h3>
      <p className="project-desc">{project.desc}</p>

      {/* Metric */}
      <div className="project-metric">
        <Activity />
        <span>{project.metric}</span>
      </div>

      {/* Tech chips */}
      <div className="project-tech-list">
        {techChips.map((t, i) => (
          <span key={i} className="tech-chip">{t.trim()}</span>
        ))}
      </div>
    </div>
  );
}
