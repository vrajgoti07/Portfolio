import React from 'react';
import { experience } from '../data/portfolioData';
import Reveal from './Reveal';

export default function Experience() {
  return (
    <section id="experience" style={{ background: 'var(--bg-card)' }}>
      <div className="container">
        {/* Header */}
        <Reveal>
          <div style={{ marginBottom: '3rem' }}>
            <span className="section-tag">Career</span>
            <h2 className="section-title">Work Experience</h2>
            <p className="section-desc">
              A track record of delivering impactful engineering at high-growth companies.
            </p>
          </div>
        </Reveal>

        {/* Timeline */}
        <div style={{ maxWidth: '680px' }}>
          <div className="timeline">
            {experience.map((exp, idx) => (
              <Reveal key={idx} delay={idx * 120}>
                <div className="timeline-item">
                  <div className="timeline-dot" />

                  <div className="timeline-meta">
                    <span className="timeline-period">{exp.dates}</span>
                    <span className="timeline-company">{exp.hash}</span>
                  </div>

                  <div className="timeline-role">{exp.role}</div>
                  <p className="timeline-desc">{exp.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
