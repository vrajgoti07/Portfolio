import { useState, useEffect, useCallback } from 'react';
import Reveal from './Reveal';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import RepoCard from './RepoCard';

/* ─── Configuration ─────────────────────────────────────────── */
const GITHUB_USERNAME = 'vrajgoti07';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`;

/* ─── Sort options config ────────────────────────────────────── */
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'stars', label: 'Most Stars' },
  { value: 'az', label: 'A → Z' },
];

/* ─── Sort comparator ────────────────────────────────────────── */
function getSortComparator(sortKey) {
  switch (sortKey) {
    case 'oldest':
      return (a, b) => new Date(a.created_at) - new Date(b.created_at);
    case 'stars':
      return (a, b) => b.stargazers_count - a.stargazers_count;
    case 'az':
      return (a, b) => a.name.localeCompare(b.name);
    case 'newest':
    default:
      return (a, b) => new Date(b.updated_at) - new Date(a.updated_at);
  }
}

/* ─── Icons ─────────────────────────────────────────────────── */
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SortIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="6" y1="12" x2="18" y2="12" />
    <line x1="9" y1="18" x2="15" y2="18" />
  </svg>
);

export default function Projects() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');

  /* ── Fetch GitHub repositories ──────────────────────────────── */
  const fetchRepositories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(GITHUB_API_URL);
      if (!response.ok) {
        throw new Error(`GitHub API responded with status ${response.status}`);
      }
      const data = await response.json();
      setRepos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('GitHub fetch error:', err);
      setError('Unable to fetch GitHub repositories. Please check your internet connection and retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  /* ── Filtered & Sorted Repos ────────────────────────────────── */
  const filteredAndSorted = repos
    .filter((repo) => {
      const query = search.toLowerCase().trim();
      if (!query) return true;
      return (
        repo.name.toLowerCase().includes(query) ||
        (repo.description && repo.description.toLowerCase().includes(query)) ||
        (repo.language && repo.language.toLowerCase().includes(query))
      );
    })
    .sort(getSortComparator(sort));

  return (
    <section id="projects" className="projects-page-section">
      <div className="container">
        {/* ── Section Header ───────────────────────────────────── */}
        <Reveal>
          <div style={{ marginBottom: '2.5rem' }}>
            <span className="section-tag">GitHub Repositories</span>
            <h1 className="section-title">Projects That Ship</h1>
            <p className="section-desc">
              Live data pulled directly from GitHub for <strong>@{GITHUB_USERNAME}</strong> — a real-time view of my
              public repositories, filtered and sorted on the fly.
            </p>
          </div>
        </Reveal>

        {/* Loading State */}
        {loading && <Spinner />}

        {/* Error State */}
        {!loading && error && (
          <ErrorMessage onRetry={fetchRepositories} message={error} />
        )}

        {/* Success State */}
        {!loading && !error && (
          <>
            {/* Search + Sort controls */}
            <Reveal delay={100}>
              <div className="repos-controls">
                {/* Search input */}
                <div className="repos-search-wrap">
                  <SearchIcon />
                  <input
                    id="repos-search-input"
                    type="text"
                    className="repos-search-input"
                    placeholder="Search repositories by name, description, or language..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search repositories"
                  />
                  {search && (
                    <button
                      className="repos-search-clear"
                      onClick={() => setSearch('')}
                      aria-label="Clear search"
                      title="Clear"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Sort dropdown */}
                <div className="repos-sort-wrap">
                  <SortIcon />
                  <select
                    id="repos-sort-select"
                    className="repos-sort-select"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    aria-label="Sort repositories"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Result count badge */}
                <span className="repos-count-badge">
                  {filteredAndSorted.length}{' '}
                  {filteredAndSorted.length === 1 ? 'repo' : 'repos'}
                </span>
              </div>
            </Reveal>

            {/* Empty state when filter yields no results */}
            {filteredAndSorted.length === 0 ? (
              <Reveal>
                <div className="repos-empty">
                  <p className="repos-empty-text">No repositories match "{search}".</p>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setSearch('')}
                  >
                    Clear Search Filter
                  </button>
                </div>
              </Reveal>
            ) : (
              /* Repository grid */
              <div
                className="projects-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '1.25rem',
                  marginTop: '1.5rem',
                }}
              >
                {filteredAndSorted.map((repo, idx) => (
                  <Reveal key={repo.id} delay={Math.min(idx * 40, 400)}>
                    <RepoCard repo={repo} />
                  </Reveal>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
