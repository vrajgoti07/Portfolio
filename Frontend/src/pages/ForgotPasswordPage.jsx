import { useState } from 'react';
import Reveal from '../components/Reveal';
import NotificationToast from '../components/NotificationToast';
import { forgotPassword } from '../api';
import { Eye, EyeOff, Lock, Mail, KeyRound, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);

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
      <div className="container" style={{ maxWidth: '480px' }}>
        {notification && (
          <NotificationToast
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        <Reveal>
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '2.5rem',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative'
            }}
          >
            {/* Top accent line */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
              }}
            />

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(233, 162, 59, 0.1)',
                  border: '1px solid rgba(233, 162, 59, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                  color: 'var(--accent-secondary)'
                }}
              >
                <KeyRound size={22} />
              </div>

              <span
                style={{
                  fontFamily: 'var(--font-code)',
                  fontSize: '0.75rem',
                  color: 'var(--accent-secondary)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}
              >
                Security Recovery
              </span>
              <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem', marginBottom: '0.4rem' }}>
                Reset Password
              </h1>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Enter your registered email and choose a new secure password.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                style={{
                  background: 'rgba(229, 107, 111, 0.12)',
                  border: '1px solid var(--color-error)',
                  color: 'var(--color-error)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem 1rem',
                  fontSize: '0.88rem',
                  marginBottom: '1.25rem',
                  fontWeight: 500
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="reset-email" className="form-label">
                  Registered Email Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                  />
                  <input
                    id="reset-email"
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reset-new-password" className="form-label">
                  New Password (min. 6 characters) *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                  />
                  <input
                    id="reset-new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '38px', paddingRight: '40px' }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reset-confirm-password" className="form-label">
                  Confirm New Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                  />
                  <input
                    id="reset-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button
                id="reset-submit-btn"
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem' }}
              >
                {loading ? <span>Updating Password...</span> : <span>Update Password</span>}
              </button>
            </form>

            <div
              style={{
                marginTop: '1.5rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-color)',
                textAlign: 'center',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)'
              }}
            >
              <button
                onClick={() => onNavigate('/login')}
                style={{
                  color: 'var(--text-secondary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 500
                }}
              >
                <ArrowLeft size={14} />
                <span>Back to Login</span>
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
