export default function NotificationToast({ type = 'success', message, onClose }) {
  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1.25rem',
        borderRadius: 'var(--radius-md, 10px)',
        marginBottom: '1.5rem',
        background: isSuccess ? 'rgba(85, 182, 133, 0.12)' : 'rgba(229, 107, 111, 0.12)',
        border: `1px solid ${isSuccess ? 'var(--color-success, #55B685)' : 'var(--color-error, #E56B6F)'}`,
        color: isSuccess ? 'var(--color-success, #55B685)' : 'var(--color-error, #E56B6F)',
        fontSize: '0.92rem',
        fontWeight: '600',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
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
            fontSize: '1.25rem',
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
