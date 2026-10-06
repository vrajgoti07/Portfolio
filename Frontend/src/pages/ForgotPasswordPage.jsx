import { useState } from 'react';
import Reveal from '../components/Reveal';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import NotificationToast from '../components/NotificationToast';
import { forgotPassword } from '../api';

export default function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword(email.trim(), newPassword);
      setSuccess(true);
      setNotification({
        type: 'success',
        message: response.message || 'Password reset successfully! Redirecting to login...'
      });

      setTimeout(() => {
        onNavigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please verify your email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        paddingTop: '100px',
        paddingBottom: '5rem',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
    >
      {notification && (
        <NotificationToast
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div style={{ width: '100%', maxWidth: '460px', margin: '0 auto', padding: '0 1.25rem' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-code)',
                fontSize: '0.8rem',
                color: 'var(--accent-secondary)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}
            >
              Account Recovery
            </span>
            <h1
              style={{
                fontSize: '2.2rem',
                fontWeight: 800,
                marginTop: '0.4rem',
                marginBottom: '0.6rem',
                background: 'var(--grad-text)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Reset Password
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Enter your registered email and choose a new secure password
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="task-form-card" style={{ padding: '2rem', backdropFilter: 'blur(16px)' }}>
            {error && (
              <div style={{ marginBottom: '1.5rem' }}>
                <ErrorMessage message={error} onDismiss={() => setError('')} />
              </div>
            )}

            {success ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                <h3 style={{ color: '#10B981', marginBottom: '0.5rem', fontWeight: 700 }}>Password Updated!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
                  Your password has been changed. You will be redirected to the sign-in screen.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => onNavigate('/login')}
                  style={{ width: '100%' }}
                >
                  Go to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="task-form-group">
                  <label htmlFor="reset-email" className="task-label">
                    Registered Email Address <span style={{ color: 'var(--accent-tertiary)' }}>*</span>
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    className="task-input"
                    placeholder="Enter your email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="task-form-group">
                  <label htmlFor="reset-new-password" className="task-label">
                    New Password <span style={{ color: 'var(--accent-tertiary)' }}>*</span>
                  </label>
                  <input
                    id="reset-new-password"
                    type="password"
                    className="task-input"
                    placeholder="At least 6 characters..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="task-form-group">
                  <label htmlFor="reset-confirm-password" className="task-label">
                    Confirm New Password <span style={{ color: 'var(--accent-tertiary)' }}>*</span>
                  </label>
                  <input
                    id="reset-confirm-password"
                    type="password"
                    className="task-input"
                    placeholder="Repeat new password..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  id="reset-submit-btn"
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                  style={{
                    width: '100%',
                    marginTop: '1.25rem',
                    padding: '0.85rem',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.95rem',
                    fontWeight: 600
                  }}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </form>
            )}

            <div
              style={{
                marginTop: '1.75rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-card)',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.88rem',
                color: 'var(--text-secondary)'
              }}
            >
              <button
                id="back-to-login-link"
                onClick={() => onNavigate('/login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-secondary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                ← Back to Sign In
              </button>

              <button
                id="to-register-link"
                onClick={() => onNavigate('/register')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                Need an account?
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
