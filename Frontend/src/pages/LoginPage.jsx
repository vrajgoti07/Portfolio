import { useState } from 'react';
import Reveal from '../components/Reveal';
import NotificationToast from '../components/NotificationToast';
import { loginUser } from '../api';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage({ onNavigate, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
          ? 'Admin credentials verified. Redirecting to Executive Dashboard...'
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
                <Lock size={22} />
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
                RBAC Access Control
              </span>
              <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem', marginBottom: '0.4rem' }}>
                Sign In to Platform
              </h1>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Access your task management workspace and administrative controls.
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
                <label htmlFor="login-email" className="form-label">
                  Email Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                  />
                  <input
                    id="login-email"
                    type="email"
                    required
                    placeholder="vrajgoti07@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '38px' }}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                  <label htmlFor="login-password" className="form-label" style={{ margin: 0 }}>
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => onNavigate('/forgot-password')}
                    style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 500 }}
                  >
                    Forgot password?
                  </button>
                </div>

                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                  />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '38px', paddingRight: '40px' }}
                    autoComplete="current-password"
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

              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem' }}
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Hint */}
            <div
              style={{
                marginTop: '1.5rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-color)',
                textAlign: 'center',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: 'var(--accent-secondary)' }}>
                <ShieldCheck size={14} />
                <span style={{ fontWeight: 600 }}>Admin Account:</span>
                <code>vrajgoti07@gmail.com</code>
              </div>
              <p style={{ margin: 0 }}>
                Don't have an account?{' '}
                <button
                  onClick={() => onNavigate('/register')}
                  style={{ color: 'var(--accent-primary)', fontWeight: 600 }}
                >
                  Create Account
                </button>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
