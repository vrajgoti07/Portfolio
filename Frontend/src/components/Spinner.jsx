import React from 'react';

/**
 * Spinner — Animated loading indicator shown while GitHub repos are being fetched.
 * Matches the portfolio's dark-glass design language.
 */
export default function Spinner() {
  return (
    <div className="spinner-wrapper" aria-live="polite" aria-label="Loading">
      {/* Spinning ring */}
      <div className="spinner-ring" />

      {/* Pulse dot */}
      <span className="spinner-dot" />

      {/* Label */}
      <p className="spinner-label">Loading GitHub repositories...</p>
    </div>
  );
}
