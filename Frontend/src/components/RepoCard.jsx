/* ─── Inline SVG Icons ──────────────────────────────────────── */

/** Star icon */
const StarIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="0"
    aria-hidden="true"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

/** Fork icon */
const ForkIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="18" r="3" />
    <circle cx="6" cy="6" r="3" />
    <circle cx="18" cy="6" r="3" />
    <path d="M6 9v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9" />
    <line x1="12" y1="12" x2="12" y2="15" />
  </svg>
);

/** External link icon */
const ExternalLinkIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

/** GitHub mark icon */
const GitHubIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

/* ─── Language colour map ───────────────────────────────────── */
/** Maps common language names to a colour so the dot is meaningful. */
const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Vue: '#41b883',
  Svelte: '#ff3e00',
};

/**
 * RepoCard — Displays a single GitHub repository with full details.
 *
 * Props:
 *   repo {Object} — GitHub REST API repository object
 */
export default function RepoCard({ repo }) {
  /* Format the ISO date string to a readable "Month DD, YYYY" */
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
    <div className="repo-card project-card">
      {/* ── Top row: visibility badge + external link ─────────── */}
      <div className="repo-card__top">
        <span className="repo-visibility-badge">
          {repo.visibility === 'private' ? '🔒 Private' : '🌐 Public'}
        </span>

        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="repo-github-btn"
          aria-label={`Open ${repo.name} on GitHub`}
          title="View on GitHub"
        >
          <GitHubIcon />
          <ExternalLinkIcon />
        </a>
      </div>

      {/* ── Repo name ─────────────────────────────────────────── */}
      <h3 className="repo-name project-title">{repo.name}</h3>

      {/* ── Description ───────────────────────────────────────── */}
      <p className="repo-desc project-desc">
        {repo.description || 'No description provided.'}
      </p>

      {/* ── Stats row: stars + forks ───────────────────────────── */}
      <div className="repo-stats">
        <span className="repo-stat" title={`${repo.stargazers_count} stars`}>
          <StarIcon />
          {repo.stargazers_count}
        </span>
        <span className="repo-stat" title={`${repo.forks_count} forks`}>
          <ForkIcon />
          {repo.forks_count}
        </span>
      </div>

      {/* ── Language + last updated ────────────────────────────── */}
      <div className="repo-meta">
        {repo.language && (
          <span className="repo-language">
            <span
              className="repo-lang-dot"
              style={{ background: langColor }}
            />
            {repo.language}
          </span>
        )}
        <span className="repo-updated">
          Updated {formatDate(repo.updated_at)}
        </span>
      </div>

      {/* ── GitHub CTA button ──────────────────────────────────── */}
      <a
        href={repo.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-ghost repo-open-btn"
        aria-label={`Open ${repo.name} on GitHub`}
      >
        <GitHubIcon />
        Open on GitHub
      </a>
    </div>
  );
}
