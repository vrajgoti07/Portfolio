export default function NotificationToast({ type = 'success', message, onClose }) {
  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        padding: '0.85rem 1.25rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        background: isSuccess ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
        border: `1px solid ${isSuccess ? '#10b981' : '#ef4444'}`,
        color: isSuccess ? '#10b981' : '#ef4444',
        fontSize: '0.95rem',
        fontWeight: '500',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>{isSuccess ? '✓' : '⚠️'}</span>
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '1.2rem',
            lineHeight: 1,
            padding: '0 0.25rem'
          }}
          aria-label="Dismiss notification"
        >
          ×
        </button>
      )}
    </div>
  );
}
