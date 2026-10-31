import Reveal from './Reveal';
import { journeyTimeline } from '../data/portfolioData';
import { Milestone, Calendar, Award } from 'lucide-react';

export default function Experience() {
  return (
    <section id="experience" className="experience-section">
      <div className="container">
        {/* Header */}
        <Reveal>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 1.5rem auto' }}>
            <span className="section-tag">Chronological Milestones</span>
            <h2 className="section-title">Experience &amp; Learning Journey</h2>
            <p className="section-desc" style={{ margin: '0 auto' }}>
              Verified engineering track record, academic foundation, and architectural milestones.
            </p>
          </div>
        </Reveal>

        {/* Timeline */}
        <Reveal delay={150}>
          <div className="timeline-container">
            {journeyTimeline.map((item, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-node" aria-hidden="true" />
                <div className="timeline-card">
                  <div className="timeline-meta">
                    <span className="timeline-period">
                      <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      {item.year}
                    </span>
                    <span className="timeline-category">{item.category}</span>
                  </div>

                  <h3 className="timeline-title">{item.title}</h3>
                  <h4 className="timeline-subtitle">{item.subtitle}</h4>
                  <p className="timeline-desc">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Verified Technical Standards Banner */}
        <Reveal delay={250}>
          <div
            style={{
              maxWidth: '860px',
              margin: '3rem auto 0 auto',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 107, 53, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-primary)',
                  flexShrink: 0
                }}
              >
                <Award size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                  Engineering Competency Verified
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Hands-on mastery of REST APIs, Event-Driven concurrency, Caching invalidation, RBAC security, and Docker containerization.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-success)', fontFamily: 'var(--font-code)', fontSize: '0.82rem', fontWeight: 600 }}>
              <Milestone size={16} />
              <span>Production Standards</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
