import { useRef, useEffect, useState } from 'react';
import { skills } from '../data/portfolioData';
import Reveal from './Reveal';

// Tech stack icons represented as styled badges
const TECH_TAGS = [
  { name: 'Python', color: '#00ADD8' },
  { name: 'Node.js', color: '#CE422B' },
  { name: 'React', color: '#61DAFB' },
  // { name: 'Next.js', color: '#ffffff' },
  { name: 'TypeScript', color: '#3178C6' },
  { name: 'FastAPI', color: '#6C63FF' },
  { name: 'Redis', color: '#DC382D' },
  { name: 'PostgreSQL', color: '#336791' },
  { name: 'Docker', color: '#2496ED' },
  { name: 'MongoDB', color: '#326CE5' },
  // { name: 'eBPF', color: '#00D4FF' },
  { name: 'Next.js', color: '#654FF0' },
  // { name: 'GraphQL', color: '#E535AB' },
  { name: 'Java', color: '#7B42BC' },
];

export default function Skills() {
  return (
    <section id="skills">
      <div className="container">
        {/* Header */}
        <Reveal>
          <div style={{ marginBottom: '3rem' }}>
            <span className="section-tag">Expertise</span>
            <h2 className="section-title">Technical Skills</h2>
            <p className="section-desc">
              Deep expertise across the full stack — from silicon-level eBPF tracing to pixel-perfect UIs.
            </p>
          </div>
        </Reveal>

        {/* Skill bars */}
        <Reveal>
          <div className="skills-grid" style={{ marginBottom: '3rem' }}>
            {skills.map((skill, idx) => (
              <SkillItem key={idx} skill={skill} delay={idx * 100} />
            ))}
          </div>
        </Reveal>

        {/* Tech cloud */}
        <Reveal delay={200}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: '16px',
            padding: '2rem',
          }}>
            <p style={{
              fontFamily: 'var(--font-code)',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}>
              Tech Stack
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              {TECH_TAGS.map((tag, i) => (
                <span
                  key={i}
                  style={{
                    fontFamily: 'var(--font-code)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: tag.color,
                    background: `${tag.color}14`,
                    border: `1px solid ${tag.color}30`,
                    padding: '0.3rem 0.8rem',
                    borderRadius: '6px',
                    transition: 'all 0.2s',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${tag.color}25`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `${tag.color}14`;
                    e.currentTarget.style.transform = '';
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SkillItem({ skill, delay }) {
  const ref = useRef(null);
  const [triggered, setTriggered] = useState(false);
  const [width, setWidth] = useState('0%');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (triggered) {
      const timer = setTimeout(() => setWidth(`${skill.percentage}%`), delay);
      return () => clearTimeout(timer);
    }
  }, [triggered, skill.percentage, delay]);

  return (
    <div ref={ref} className="skill-item">
      <div className="skill-header">
        <span className="skill-name">{skill.name}</span>
        <span className="skill-pct">{skill.percentage}%</span>
      </div>
      <div className="skill-bar-track">
        <div className="skill-bar-fill" style={{ width }} />
      </div>
    </div>
  );
}
