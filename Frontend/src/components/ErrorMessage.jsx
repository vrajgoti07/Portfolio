import React from 'react';

/**
 * ErrorMessage — Displayed when the GitHub API call fails.
 * Shows a friendly message and a Retry button to re-trigger the fetch.
 *
 * Props:
 *   onRetry {Function} — callback passed from Projects.jsx to re-fetch repos
 */
export default function ErrorMessage({ onRetry }) {
  return (
    <div className="error-wrapper" role="alert" aria-live="assertive">
      {/* Icon */}
      <div className="error-icon-wrap">
        {/* Warning / broken-link icon */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      {/* Headline */}
      <h3 className="error-title">Something went wrong</h3>

      {/* Message */}
      <p className="error-message">Unable to fetch GitHub repositories.</p>

      {/* Retry button */}
      <button
        id="retry-fetch-repos"
        className="btn btn-primary error-retry-btn"
        onClick={onRetry}
      >
        {/* Refresh icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
        Retry
      </button>
    </div>
  );
}
