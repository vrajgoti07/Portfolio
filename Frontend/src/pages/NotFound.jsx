import { Terminal, ArrowRight } from 'lucide-react';
import Reveal from '../components/Reveal';

export default function NotFound({ onBackToHome, onNavigate }) {
  return (
    <div
      style={{
        paddingTop: '120px',
        paddingBottom: '5rem',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
    >
      <div className="container" style={{ maxWidth: '480px' }}>
        <Reveal>
          <div className="auth-card" style={{ textAlign: 'center' }}>
            {/* Top accent */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
              }}
            />

            {/* Error Code */}
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '5rem',
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: '-0.04em',
                background: 'var(--grad-hero)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.75rem'
              }}
            >
              404
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Resource Not Located
            </h3>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
              The path requested could not be resolved in the portfolio application tree.
            </p>

            {/* Console details */}
            <div
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                fontFamily: 'var(--font-code)',
                fontSize: '0.76rem',
                textAlign: 'left',
                color: 'var(--text-secondary)',
                marginBottom: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', marginBottom: '0.2rem' }}>
                <Terminal size={14} />
                <span>sys.resolution_failure</span>
              </div>
              <div>status: 404_NOT_FOUND</div>
              <div>endpoint: {window.location.pathname}</div>
              <div>fallback: return ~/workspace</div>
            </div>

            <button
              onClick={onBackToHome || (() => onNavigate('/'))}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem' }}
            >
              <span>Return to Portfolio</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
