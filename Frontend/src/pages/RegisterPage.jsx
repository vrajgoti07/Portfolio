import { useState } from 'react';
import Reveal from '../components/Reveal';
import NotificationToast from '../components/NotificationToast';
import { registerUser } from '../api';
import { Eye, EyeOff, Lock, Mail, UserPlus, CheckCircle2 } from 'lucide-react';

export default function RegisterPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter an email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please provide a valid email format.');
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
      setError('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser(email.trim(), password);
      setNotification({
        type: 'success',
        message: data.message || 'Account registered! Redirecting to login...'
      });
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        onNavigate('/login');
      }, 1400);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check details and retry.');
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
          <div className="auth-card">
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
                  background: 'rgba(255, 107, 53, 0.1)',
                  border: '1px solid rgba(255, 107, 53, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                  color: 'var(--accent-primary)'
                }}
              >
                <UserPlus size={22} />
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
                Join the Team
              </span>
              <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem', marginBottom: '0.4rem' }}>
                Create New Account
              </h1>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Sign up to collaborate on tasks, track deliverables, and receive notifications.
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
                <label htmlFor="reg-email" className="form-label">
                  Email Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                  />
                  <input
                    id="reg-email"
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
                <label htmlFor="reg-password" className="form-label">
                  Password (min. 6 characters) *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                  />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Create a secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                <label htmlFor="reg-confirm-password" className="form-label">
                  Confirm Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                  />
                  <input
                    id="reg-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button
                id="register-submit-btn"
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem' }}
              >
                {loading ? (
                  <span>Registering Account...</span>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Create Account</span>
                  </>
                )}
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
              Already registered?{' '}
              <button
                onClick={() => onNavigate('/login')}
                style={{ color: 'var(--accent-primary)', fontWeight: 600 }}
              >
                Sign In
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
