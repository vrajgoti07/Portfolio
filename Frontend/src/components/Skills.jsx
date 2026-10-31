import { useState, useMemo } from 'react';
import Reveal from './Reveal';
import { skillCategories } from '../data/portfolioData';
import { Layers, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Skills() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = useMemo(() => {
    return [{ id: 'all', title: 'All Disciplines' }, ...skillCategories];
  }, []);

  const displayedSkills = useMemo(() => {
    if (selectedCategory === 'all') {
      return skillCategories.flatMap((cat) =>
        cat.skills.map((skill) => ({ ...skill, categoryTitle: cat.title, categoryId: cat.id }))
      );
    }
    const cat = skillCategories.find((c) => c.id === selectedCategory);
    return cat ? cat.skills.map((skill) => ({ ...skill, categoryTitle: cat.title, categoryId: cat.id })) : [];
  }, [selectedCategory]);

  return (
    <section id="skills" className="skills-section">
      <div className="container">
        {/* Header */}
        <Reveal>
          <div style={{ marginBottom: '2.5rem' }}>
            <span className="section-tag">Technical Competencies</span>
            <h2 className="section-title">Skills &amp; Technology Stack</h2>
            <p className="section-desc">
              Organized by engineering discipline — backed by genuine project applications, coursework, and technical implementations.
            </p>
          </div>
        </Reveal>

        {/* Category Switcher Tabs */}
        <Reveal delay={100}>
          <div className="skill-category-tabs" role="tablist" aria-label="Skill categories">
            {categories.map((cat) => (
              <button
                key={cat.id}
                role="tab"
                aria-selected={selectedCategory === cat.id}
                className={`skill-tab-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.id === 'all' && <Layers size={13} style={{ display: 'inline', marginRight: '6px' }} />}
                {cat.id === 'ai-ml' && <Sparkles size={13} style={{ display: 'inline', marginRight: '6px' }} />}
                {cat.title}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Skills Cards Grid */}
        <Reveal delay={200}>
          <div className="skills-cards-grid">
            {displayedSkills.map((skill, idx) => (
              <div
                key={`${skill.name}-${idx}`}
                className="skill-card"
                style={{
                  borderLeft: skill.highlight ? '3px solid var(--accent-primary)' : '1px solid var(--border-color)'
                }}
              >
                <div>
                  <div className="skill-card-top">
                    <span className="skill-card-name">{skill.name}</span>
                    <span className="skill-card-badge">{skill.level}</span>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-code)',
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    {skill.categoryTitle}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    marginTop: '1rem',
                    fontSize: '0.76rem',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <CheckCircle2 size={13} color="var(--accent-primary)" />
                  <span>Production &amp; Practical Use</span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
