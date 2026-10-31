import { ArrowUp, Mail, ExternalLink } from 'lucide-react';
import GithubIcon from './GithubIcon';
import { personalInfo } from '../data/portfolioData';

export default function Footer({ onNavigate }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLinkClick = (path) => {
    if (onNavigate) {
      onNavigate(path);
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Column 1: VG Brand & Bio */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="nav-monogram">VG</div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.1 }}>
                  Vraj Goti
                </h3>
                <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.72rem', color: 'var(--accent-secondary)' }}>
                  Software &amp; AI Developer
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '340px' }}>
              Crafting intelligent digital experiences, resilient full-stack systems, and high-performance backend pipelines.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4 className="footer-col-title">Navigation</h4>
            <ul className="footer-links-list">
              <li>
                <button onClick={() => handleLinkClick('/')}>Home</button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('/about')}>About</button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('/skills')}>Skills</button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('/projects')}>Projects</button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('/experience')}>Experience</button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('/contact')}>Contact</button>
              </li>
              <li>
                <button onClick={() => handleLinkClick('/tasks')}>Tasks Engine</button>
              </li>
            </ul>
          </div>

          {/* Column 3: Verified Connect Links */}
          <div>
            <h4 className="footer-col-title">Connect &amp; Social</h4>
            <ul className="footer-links-list">
              <li>
                <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                  <GithubIcon size={15} />
                  <span>GitHub (@vrajgoti07)</span>
                  <ExternalLink size={12} color="var(--text-muted)" />
                </a>
              </li>
              <li>
                <a href={`mailto:${personalInfo.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Mail size={15} />
                  <span>{personalInfo.email}</span>
                </a>
              </li>
              <li>
                <a href={personalInfo.portfolioRepo} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                  <ExternalLink size={15} />
                  <span>Portfolio Repository</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <p style={{ margin: 0, fontSize: '0.85rem' }}>
            © {new Date().getFullYear()} Vraj Goti. Designed &amp; engineered with production excellence.
          </p>

          <button
            id="footer-back-to-top"
            onClick={scrollToTop}
            className="back-to-top-btn"
            title="Scroll to top of page"
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
}
