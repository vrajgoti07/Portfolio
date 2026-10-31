export default function ErrorMessage({ message, onRetry }) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        background: 'var(--bg-card, #22201E)',
        border: '1px solid rgba(229, 107, 111, 0.4)',
        borderRadius: 'var(--radius-md, 10px)',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        maxWidth: '540px',
        margin: '2rem auto',
        boxShadow: 'var(--shadow-md)'
      }}
    >
      <div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: 'rgba(229, 107, 111, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto',
          color: 'var(--color-error, #E56B6F)'
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        Service Notice
      </h3>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        {message || 'Unable to complete network request. Please verify connection and retry.'}
      </p>

      {onRetry && (
        <button
          id="retry-fetch-btn"
          className="btn btn-primary"
          onClick={onRetry}
          style={{ padding: '0.65rem 1.4rem' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Retry Connection
        </button>
      )}
    </div>
  );
}
