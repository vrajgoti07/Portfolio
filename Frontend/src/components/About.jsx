import Reveal from './Reveal';
import { technicalPillars } from '../data/portfolioData';
import { GraduationCap, Compass, BookOpen, CheckCircle2 } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="about-section">
      <div className="container">
        {/* Section Header */}
        <Reveal>
          <div style={{ marginBottom: '3rem' }}>
            <span className="section-tag">Identity &amp; Vision</span>
            <h2 className="section-title">About &amp; Engineering Philosophy</h2>
            <p className="section-desc">
              Bridging robust software craftsmanship with intelligent digital systems.
            </p>
          </div>
        </Reveal>

        <div className="about-grid">
          {/* LEFT SIDE: Editorial Typography & Story */}
          <Reveal>
            <div className="editorial-story">
              <p>
                I am a <span className="editorial-highlight">Software Engineer &amp; Creative Developer</span> passionate
                about the synthesis of modern frontend interfaces, resilient backend architectures, and intelligent machine learning systems.
              </p>

              <p>
                My development philosophy centers on <span className="editorial-highlight">engineering for reliability</span>: building
                applications where every component is thoughtfully structured, APIs are strictly validated, asynchronous tasks are decoupled
                to safeguard the event loop, and caching is engineered to guarantee low latency.
              </p>

              {/* Education & Focus Info Block */}
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  marginTop: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <GraduationCap size={22} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      Computer Engineering &amp; IT Studies
                    </h4>
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Undergraduate study focusing on Advanced Web Development Frameworks (ITUE301), Database Systems, Distributed Algorithms, and Machine Learning.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <Compass size={22} color="var(--accent-secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      Technical Interests &amp; Direction
                    </h4>
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Artificial Intelligence &amp; Autonomous Agents, High-Throughput REST APIs, Role-Based Access Control, Dockerized Environments, and Python Tooling.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <BookOpen size={22} color="var(--color-success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      Current Learning &amp; Goals
                    </h4>
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Deepening expertise in Deep Learning model integration, event-driven microservices, performance profiling, and modern accessible user interfaces.
                    </p>
                  </div>
                </div>
              </div>

              {/* Guiding Principles */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
                <span className="tech-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={13} color="var(--accent-primary)" />
                  Clean Architecture
                </span>
                <span className="tech-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={13} color="var(--accent-primary)" />
                  Decoupled Async Events
                </span>
                <span className="tech-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={13} color="var(--accent-primary)" />
                  Pragmatic Innovation
                </span>
                <span className="tech-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={13} color="var(--accent-primary)" />
                  Accessible Design
                </span>
              </div>
            </div>
          </Reveal>

          {/* RIGHT SIDE: Structured Engineering Pillars */}
          <Reveal delay={150}>
            <div className="pillar-cards-grid">
              {technicalPillars.map((pillar, i) => (
                <div key={i} className="pillar-card">
                  <span className="pillar-tag">{pillar.tag}</span>
                  <h3 className="pillar-title">{pillar.title}</h3>
                  <p className="pillar-desc">{pillar.description}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
