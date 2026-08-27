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
      setNotification({ type: 'success', message: 'Login successful! Redirecting to tasks...' });
      if (onLoginSuccess) {
        onLoginSuccess(data);
      }
      setTimeout(() => {
        onNavigate('/tasks');
      }, 600);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '5rem', minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
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
              Practical 7 Authentication
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
              Welcome Back
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Sign in to manage your MongoDB-backed tasks securely
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
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="task-form-group">
                <label htmlFor="login-password" className="task-label">
                  Password <span style={{ color: 'var(--accent-tertiary)' }}>*</span>
                </label>
                <input
                  id="login-password"
                  type="password"
                  className="task-input"
                  placeholder="Enter your password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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
