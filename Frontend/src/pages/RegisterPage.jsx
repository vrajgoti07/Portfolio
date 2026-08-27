import { useState } from 'react';
import Reveal from '../components/Reveal';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import NotificationToast from '../components/NotificationToast';
import { registerUser } from '../api';

export default function RegisterPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [notification, setNotification] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim()) {
      setError('Please enter an email address.');
      return;
    }
    if (!password) {
      setError('Please enter a password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify and try again.');
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser(email.trim(), password);
      setSuccessMsg(data.message || 'User registered successfully!');
      setNotification({
        type: 'success',
        message: 'Account created! Redirecting to login...'
      });
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        onNavigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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

      <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '0 1.25rem' }}>
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
              Practical 7 User Registration
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
              Create Account
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Register with bcrypt-hashed credentials stored in MongoDB Atlas
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

            {successMsg && (
              <div
                style={{
                  marginBottom: '1.5rem',
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#10B981',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>✓</span>
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="task-form-group">
                <label htmlFor="reg-email" className="task-label">
                  Email Address <span style={{ color: 'var(--accent-tertiary)' }}>*</span>
                </label>
                <input
                  id="reg-email"
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
                <label htmlFor="reg-password" className="task-label">
                  Password <span style={{ color: 'var(--accent-tertiary)' }}>*</span>
                </label>
                <input
                  id="reg-password"
                  type="password"
                  className="task-input"
                  placeholder="At least 6 characters..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="task-form-group">
                <label htmlFor="reg-confirm-password" className="task-label">
                  Confirm Password <span style={{ color: 'var(--accent-tertiary)' }}>*</span>
                </label>
                <input
                  id="reg-confirm-password"
                  type="password"
                  className="task-input"
                  placeholder="Re-enter your password..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <button
                id="register-submit-btn"
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
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Register</span>
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
              Already registered?{' '}
              <button
                id="to-login-link"
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
                Sign In here
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
