export default function Spinner({ message = 'Loading repositories...' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        gap: '1rem',
        color: 'var(--text-secondary, #A8A29A)'
      }}
      aria-live="polite"
      aria-label="Loading"
    >
      <div
        style={{
          width: '38px',
          height: '38px',
          border: '3px solid rgba(255, 107, 53, 0.2)',
          borderTopColor: 'var(--accent-primary, #FF6B35)',
          borderRadius: '50%',
          animation: 'page-spin 0.8s linear infinite'
        }}
      />
      <p style={{ fontFamily: 'var(--font-code)', fontSize: '0.85rem' }}>{message}</p>
    </div>
  );
}
