import { Star, GitFork, ExternalLink } from 'lucide-react';
import GithubIcon from './GithubIcon';

/* ─── Warm Harmonious Language Color Map (Zero Blue/Cyan/Purple) ─── */
const LANG_COLORS = {
  JavaScript: '#E9A23B',
  TypeScript: '#D48628',
  Python: '#FF6B35',
  HTML: '#FF7D4D',
  CSS: '#E85924',
  Java: '#B87333',
  'C++': '#E56B6F',
  C: '#8C827A',
  Shell: '#55B685',
  Vue: '#55B685',
};

export default function RepoCard({ repo }) {
  const formatDate = (isoString) => {
    if (!isoString) return '—';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const langColor = LANG_COLORS[repo.language] || 'var(--accent-primary)';

  return (
    <div className="repo-card">
      <div>
        {/* Top meta row */}
        <div className="repo-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'var(--font-code)',
                fontSize: '0.7rem',
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--radius-xs)',
                background: 'rgba(255, 107, 53, 0.1)',
                border: '1px solid rgba(255, 107, 53, 0.25)',
                color: 'var(--accent-primary)',
                fontWeight: 600
              }}
            >
              {repo.visibility === 'private' ? '🔒 Private' : '🌐 Public'}
            </span>
            {repo.language && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontFamily: 'var(--font-code)',
                  fontSize: '0.72rem',
                  color: 'var(--text-secondary)'
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: langColor,
                    display: 'inline-block'
                  }}
                />
                {repo.language}
              </span>
            )}
          </div>

          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${repo.name} on GitHub`}
            title="View Repository on GitHub"
            style={{
              color: 'var(--text-secondary)',
              padding: '0.25rem',
              borderRadius: 'var(--radius-xs)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color var(--motion-fast)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <ExternalLink size={16} />
          </a>
        </div>

        {/* Name */}
        <h3 className="repo-card-title">{repo.name}</h3>

        {/* Description */}
        <p className="repo-card-desc">
          {repo.description || 'Public software repository maintained by @vrajgoti07.'}
        </p>
      </div>

      <div>
        {/* Actions & Meta */}
        <div className="repo-card-meta">
          <div className="repo-meta-stats">
            <span className="repo-meta-item" title={`${repo.stargazers_count} stars`}>
              <Star size={13} color="var(--accent-secondary)" />
              <span>{repo.stargazers_count}</span>
            </span>
            <span className="repo-meta-item" title={`${repo.forks_count} forks`}>
              <GitFork size={13} color="var(--text-secondary)" />
              <span>{repo.forks_count}</span>
            </span>
          </div>

          <span>Updated {formatDate(repo.updated_at)}</span>
        </div>

        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{
            width: '100%',
            marginTop: '1rem',
            padding: '0.55rem',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <GithubIcon size={14} />
          <span>View on GitHub</span>
        </a>
      </div>
    </div>
  );
}
