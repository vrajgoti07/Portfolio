import { useState } from 'react';
import Reveal from '../components/Reveal';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import NotificationToast from '../components/NotificationToast';
import { loginUser } from '../api';

export default function LoginPage({ onNavigate, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser(email, password);
      const user = data.user || {};
      const isAdmin = user.role === 'admin' || email.trim().toLowerCase() === 'vrajgoti07@gmail.com';

      setNotification({
        type: 'success',
        message: isAdmin
          ? 'Admin authentication verified! Loading Executive Dashboard...'
          : 'Sign in successful! Redirecting to tasks...'
      });

      if (onLoginSuccess) {
        onLoginSuccess(data);
      }

      setTimeout(() => {
        if (isAdmin) {
          onNavigate('/admin');
        } else {
          onNavigate('/tasks');
        }
      }, 700);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
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
              Account Authentication
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
              Sign In
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Access your assigned tasks or executive management portal
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

            <form onSubmit={handleSubmit}>
              <div className="task-form-group">
                <label htmlFor="login-email" className="task-label">
                  Email Address <span style={{ color: 'var(--accent-tertiary)' }}>*</span>
                </label>
                <input
                  id="login-email"
                  type="email"
                  className="task-input"
                  placeholder="Enter email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="task-form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="login-password" className="task-label" style={{ margin: 0 }}>
                    Password <span style={{ color: 'var(--accent-tertiary)' }}>*</span>
                  </label>
                  <button
                    type="button"
                    id="forgot-password-link"
                    onClick={() => onNavigate('/forgot-password')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-secondary)',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  id="login-password"
                  type="password"
                  className="task-input"
                  placeholder="Enter password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{ marginTop: '0.4rem' }}
                  required
                />
              </div>

              <button
                id="login-submit-btn"
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
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            <div
              style={{
                marginTop: '1.75rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-card)',
                textAlign: 'center',
                fontSize: '0.88rem',
                color: 'var(--text-secondary)'
              }}
            >
              Don't have an account?{' '}
              <button
                id="to-register-link"
                onClick={() => onNavigate('/register')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-secondary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Register here
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
