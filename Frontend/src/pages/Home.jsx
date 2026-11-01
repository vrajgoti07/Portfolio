import Hero from '../components/Hero';
import Reveal from '../components/Reveal';
import {
  User,
  Layers,
  Briefcase,
  Milestone,
  Mail,
  CheckSquare,
  ArrowRight
} from 'lucide-react';

const PORTFOLIO_HUBS = [
  {
    title: 'About & Philosophy',
    description: 'Explore my engineering background, computer engineering foundation, and core development philosophy.',
    path: '/about',
    icon: User,
    tag: 'Identity & Vision'
  },
  {
    title: 'Skills & Stack',
    description: 'Deep dive into 7 organized technical categories covering AI, backend architecture, databases, and DevOps.',
    path: '/skills',
    icon: Layers,
    tag: 'Competencies'
  },
  {
    title: 'Projects Showcase',
    description: 'Featured full-stack platforms, AI initiatives, and live public repositories synchronized with GitHub.',
    path: '/projects',
    icon: Briefcase,
    tag: 'Production Work'
  },
  {
    title: 'Experience Journey',
    description: 'Chronological timeline of academic milestones, systems engineering achievements, and technical specializations.',
    path: '/experience',
    icon: Milestone,
    tag: 'Milestones'
  },
  {
    title: 'Contact & Collaboration',
    description: 'Direct messaging form, verified contact details, location info, and 1-click clipboard copy.',
    path: '/contact',
    icon: Mail,
    tag: 'Communication'
  },
  {
    title: 'Task Management Engine',
    description: 'Live interactive full-stack Kanban platform with JWT RBAC, in-memory caching, and event-driven notifications.',
    path: '/tasks',
    icon: CheckSquare,
    tag: 'Live Platform'
  }
];

export default function Home({ onNavigate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <Hero onNavigate={onNavigate} />

      {/* Separate Pages Directory Hub */}
      <section style={{ padding: '4rem 0 6rem 0', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <span className="section-tag">Dedicated Pages</span>
              <h2 className="section-title">Explore Portfolio Sections</h2>
              <p className="section-desc" style={{ margin: '0 auto' }}>
                Select any discipline below or use the top navigation bar to open each dedicated page.
              </p>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div
              className="home-hubs-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                gap: '1.5rem'
              }}
            >
              {PORTFOLIO_HUBS.map((hub, idx) => {
                const Icon = hub.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => onNavigate(hub.path)}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.8rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all var(--motion-base)',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 107, 53, 0.45)';
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-code)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: 'var(--accent-secondary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em'
                          }}
                        >
                          {hub.tag}
                        </span>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(255, 107, 53, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-primary)'
                          }}
                        >
                          <Icon size={18} />
                        </div>
                      </div>

                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        {hub.title}
                      </h3>

                      <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                        {hub.description}
                      </p>
                    </div>

                    <button
                      className="btn btn-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate(hub.path);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.6rem 1rem',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <span>Open {hub.title.split(' ')[0]} Page</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
