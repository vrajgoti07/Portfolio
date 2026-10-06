import './PageLoader.css';

/**
 * PageLoader — Accessible, responsive Suspense fallback for lazy-loaded route chunks.
 * Features:
 * - Proper ARIA semantics (role="status", aria-live="polite", aria-busy="true")
 * - Layout-stability preserving min-height to prevent cumulative layout shift (CLS)
 * - Semantic design tokens with clean developer/engineering aesthetic
 * - Supports prefers-reduced-motion
 */
export default function PageLoader({ message = 'Loading module...' }) {
  return (
    <div
      className="page-loader-container"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="page-loader-card">
        <div className="page-loader-spinner" aria-hidden="true" />
        <div className="page-loader-text">
          <span className="page-loader-title">{message}</span>
          <span className="page-loader-subtitle">Optimizing bundle via dynamic code splitting</span>
        </div>
      </div>
      <span className="sr-only">Content is loading, please wait...</span>
    </div>
  );
}
