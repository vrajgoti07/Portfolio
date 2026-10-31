import { useState, useEffect, useCallback, useMemo } from 'react';
import Reveal from './Reveal';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import RepoCard from './RepoCard';
import GithubIcon from './GithubIcon';
import { featuredProjects } from '../data/portfolioData';
import { Search, ExternalLink, CheckCircle2, ArrowRight } from 'lucide-react';

const GITHUB_USERNAME = 'vrajgoti07';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`;

const PROJECT_CATEGORIES = [
  'All',
  'AI & ML',
  'Full Stack',
  'Backend',
  'Frontend',
  'Other'
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Recently Updated' },
  { value: 'stars', label: 'Most Stars' },
  { value: 'az', label: 'Name (A → Z)' },
  { value: 'oldest', label: 'Oldest First' },
];

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

export default function Projects({ onNavigate }) {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [activeCategory, setActiveCategory] = useState('All');

  // Fetch GitHub repositories
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
      setError('Unable to fetch live GitHub repositories. Please verify internet connection and retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadInitial() {
      try {
        const response = await fetch(GITHUB_API_URL);
        if (!response.ok) {
          throw new Error(`GitHub API status: ${response.status}`);
        }
        const data = await response.json();
        if (!ignore) {
          setRepos(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error('GitHub fetch error:', err);
          setError('Unable to fetch live GitHub repositories. Please retry.');
          setLoading(false);
        }
      }
    }
    loadInitial();
    return () => {
      ignore = true;
    };
  }, []);

  // Filter featured projects by category
  const filteredFeatured = useMemo(() => {
    if (activeCategory === 'All') return featuredProjects;
    return featuredProjects.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  // Filter and sort GitHub repos
  const filteredAndSortedRepos = useMemo(() => {
    return repos
      .filter((repo) => {
        // Search text match
        const query = search.toLowerCase().trim();
        const matchesQuery = !query ||
          repo.name.toLowerCase().includes(query) ||
          (repo.description && repo.description.toLowerCase().includes(query)) ||
          (repo.language && repo.language.toLowerCase().includes(query));

        if (!matchesQuery) return false;

        // Category filter match for repos
        if (activeCategory === 'All') return true;
        const lang = (repo.language || '').toLowerCase();
        const desc = (repo.description || '').toLowerCase();
        const name = repo.name.toLowerCase();

        if (activeCategory === 'AI & ML') {
          return lang.includes('python') || desc.includes('ai') || desc.includes('ml') || desc.includes('learning');
        }
        if (activeCategory === 'Backend') {
          return lang.includes('python') || lang.includes('javascript') || desc.includes('api') || desc.includes('backend') || desc.includes('server');
        }
        if (activeCategory === 'Frontend') {
          return lang.includes('javascript') || lang.includes('typescript') || desc.includes('react') || desc.includes('ui') || desc.includes('css');
        }
        if (activeCategory === 'Full Stack') {
          return desc.includes('full') || desc.includes('task') || name.includes('portfolio') || name.includes('awdf');
        }
        return true;
      })
      .sort(getSortComparator(sort));
  }, [repos, search, sort, activeCategory]);

  return (
    <section id="projects" className="projects-section">
      <div className="container">
        {/* Header */}
        <Reveal>
          <div style={{ marginBottom: '2.5rem' }}>
            <span className="section-tag">Featured Works &amp; Repositories</span>
            <h2 className="section-title">Projects That Deliver Value</h2>
            <p className="section-desc">
              High-impact full-stack architectures, AI explorations, and live production code pulled directly from GitHub <strong>@{GITHUB_USERNAME}</strong>.
            </p>
          </div>
        </Reveal>

        {/* Category Tabs & Search Controls */}
        <Reveal delay={100}>
          <div className="projects-filter-bar">
            {/* Category tabs */}
            <div className="project-category-tabs" role="tablist" aria-label="Project categories">
              {PROJECT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={activeCategory === cat}
                  className={`category-tab-btn ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search & Sort controls */}
            <div className="projects-search-sort">
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Search projects &amp; tech..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input-box"
                  style={{ paddingLeft: '32px' }}
                  aria-label="Search repositories"
                />
              </div>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="sort-select-box"
                aria-label="Sort repositories"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Reveal>

        {/* Featured Projects Showcase */}
        {filteredFeatured.length > 0 && (
          <Reveal delay={150}>
            <div style={{ marginBottom: '3rem' }}>
              {filteredFeatured.map((project) => (
                <div key={project.id} className="featured-project-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <span className="featured-badge">{project.badge}</span>
                    <span
                      style={{
                        fontFamily: 'var(--font-code)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--color-success)',
                        background: 'rgba(85, 182, 133, 0.1)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full)'
                      }}
                    >
                      ● {project.status}
                    </span>
                  </div>

                  <h3 className="featured-title">{project.name}</h3>
                  <p className="featured-desc">{project.description}</p>

                  {/* Key Features List */}
                  <ul className="featured-features-list">
                    {project.features.map((feat, i) => (
                      <li key={i}>
                        <CheckCircle2 size={16} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Tech stack badges */}
                  <div className="tech-tag-row">
                    {project.tech.map((t, i) => (
                      <span key={i} className="tech-pill">{t}</span>
                    ))}
                  </div>

                  {/* CTA Actions */}
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {project.internalRoute && (
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          if (onNavigate) onNavigate(project.internalRoute);
                        }}
                        style={{ padding: '0.55rem 1.25rem', fontSize: '0.86rem' }}
                      >
                        <span>Launch Tasks Application</span>
                        <ArrowRight size={15} />
                      </button>
                    )}

                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                        style={{ padding: '0.55rem 1.25rem', fontSize: '0.86rem' }}
                      >
                        <GithubIcon size={15} />
                        <span>View Repository</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {/* Live GitHub Repositories Header */}
        <Reveal delay={200}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Live GitHub Repositories ({filteredAndSortedRepos.length})
            </h3>
            <a
              href={`https://github.com/${GITHUB_USERNAME}?tab=repositories`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.84rem',
                color: 'var(--accent-primary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontWeight: 600
              }}
            >
              <span>GitHub Profile</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </Reveal>

        {/* Loading State */}
        {loading && <Spinner message="Fetching verified repositories from GitHub..." />}

        {/* Error State */}
        {!loading && error && (
          <ErrorMessage message={error} onRetry={fetchRepositories} />
        )}

        {/* Repos Grid */}
        {!loading && !error && filteredAndSortedRepos.length > 0 && (
          <Reveal delay={250}>
            <div className="repos-grid">
              {filteredAndSortedRepos.map((repo) => (
                <RepoCard key={repo.id} repo={repo} />
              ))}
            </div>
          </Reveal>
        )}

        {/* Empty Search State */}
        {!loading && !error && filteredAndSortedRepos.length === 0 && (
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '3rem 2rem',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}
          >
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              No repositories match your filter "{search || activeCategory}"
            </p>
            <p style={{ fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Try clearing your search query or switching categories.
            </p>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSearch('');
                setActiveCategory('All');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
