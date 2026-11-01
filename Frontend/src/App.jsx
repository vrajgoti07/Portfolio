import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import SkillsPage from './pages/SkillsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import NotFound from './pages/NotFound';
import NotificationToast from './components/NotificationToast';
import PageLoader from './components/PageLoader';
import ScrollProgress from './components/ScrollProgress';
import { getToken, removeToken, getMe } from './api';

// Route-based Code Splitting (React.lazy)
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const TaskPage = lazy(() => import('./pages/TaskPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ExperiencePage = lazy(() => import('./pages/ExperiencePage'));

// Stable navigation configuration
const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Skills', path: '/skills' },
  { label: 'Projects', path: '/projects' },
  { label: 'Experience', path: '/experience' },
  { label: 'Tasks', path: '/tasks' },
  { label: 'Contact', path: '/contact' },
];

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Theme state: defaults to dark mode, saved in local storage
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  // Routing state
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname.toLowerCase());

  // Authentication state
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUser] = useState(() => {
    const savedEmail = localStorage.getItem('user_email');
    const savedRole = localStorage.getItem('user_role') || (savedEmail === 'vrajgoti07@gmail.com' ? 'admin' : 'user');
    return savedEmail ? { email: savedEmail, role: savedRole } : null;
  });
  const [globalNotification, setGlobalNotification] = useState(null);

  // Synchronize Theme with DOM
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Lock body scroll and listen for Escape key when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen]);

  // Central navigation handler
  const handleNavigate = useCallback((path) => {
    const cleanPath = path.toLowerCase();
    if (window.location.pathname.toLowerCase() !== cleanPath) {
      window.history.pushState({}, '', cleanPath);
      setCurrentPath(cleanPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileOpen(false);
  }, []);

  // Listen to popstate for browser back/forward routing
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname.toLowerCase());
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Fetch current user details if token is present
  useEffect(() => {
    if (token) {
      getMe()
        .then((userData) => {
          if (userData) {
            setUser(userData);
            if (userData.email) {
              localStorage.setItem('user_email', userData.email);
            }
            if (userData.role) {
              localStorage.setItem('user_role', userData.role);
            }
          }
        })
        .catch((err) => {
          console.warn('Initial session validation error:', err.message);
        });
    }
  }, [token]);

  // Listen for unauthorized 401 events to redirect to login
  useEffect(() => {
    const handleUnauthorized = () => {
      setTokenState(null);
      setUser(null);
      setGlobalNotification({
        type: 'error',
        message: 'Session expired. Please sign in again.'
      });
      handleNavigate('/login');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [handleNavigate]);

  // Handle successful login
  const handleLoginSuccess = (authData) => {
    setTokenState(authData.token);
    const email = localStorage.getItem('user_email');
    const role = localStorage.getItem('user_role') || (email === 'vrajgoti07@gmail.com' ? 'admin' : 'user');
    if (email) {
      setUser({ email, role });
    }
    // Refresh user profile
    getMe()
      .then((userData) => setUser(userData))
      .catch(() => { });
  };

  // Handle Logout
  const handleLogout = () => {
    removeToken();
    setTokenState(null);
    setUser(null);
    setGlobalNotification({
      type: 'success',
      message: 'Signed out successfully.'
    });
    handleNavigate('/login');
  };

  const isAdmin = (user?.email || '').toLowerCase().trim() === 'vrajgoti07@gmail.com' || user?.role === 'admin';

  const renderContent = () => {
    const path = currentPath.replace(/\/+$/, '') || '/';

    switch (path) {
      case '/':
      case '/index.html':
      case '/home':
        return <Home onNavigate={handleNavigate} />;
      case '/about':
        return <AboutPage onNavigate={handleNavigate} />;
      case '/experience':
        return <ExperiencePage />;
      case '/projects':
        return <ProjectsPage onNavigate={handleNavigate} />;
      case '/task':
      case '/tasks':
        return <TaskPage onNavigate={handleNavigate} user={user} onLogout={handleLogout} />;
      case '/admin':
        return <AdminDashboard onNavigate={handleNavigate} />;
      case '/forgot-password':
        return <ForgotPasswordPage onNavigate={handleNavigate} />;
      case '/login':
        return <LoginPage onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />;
      case '/register':
        return <RegisterPage onNavigate={handleNavigate} />;
      case '/contact':
        return <ContactPage onNavigate={handleNavigate} />;
      case '/skills':
        return <SkillsPage onNavigate={handleNavigate} />;
      default:
        return <NotFound onBackToHome={() => handleNavigate('/')} onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      {/* Isolated scroll progress bar */}
      <ScrollProgress />

      {/* Global Notification Toast */}
      {globalNotification && (
        <NotificationToast
          type={globalNotification.type}
          message={globalNotification.message}
          onClose={() => setGlobalNotification(null)}
        />
      )}

      {/* Navbar */}
      <Navbar
        currentPath={currentPath}
        onNavigate={handleNavigate}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        user={user}
        isAuthenticated={Boolean(token)}
        onLogout={handleLogout}
      />

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile menu drawer */}
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        {NAV_ITEMS.map((item) => {
          const isActive = currentPath === item.path || (item.path === '/' && (currentPath === '' || currentPath === '/home' || currentPath === '/index.html'));
          return (
            <button
              key={item.path}
              className={`mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => handleNavigate(item.path)}
            >
              <span>{item.label}</span>
              {isActive && <span className="mobile-active-indicator" aria-hidden="true">●</span>}
            </button>
          );
        })}

        {isAdmin && (
          <button
            className="mobile-nav-link"
            style={{ color: 'var(--accent-secondary, #E9A23B)', fontWeight: 700 }}
            onClick={() => handleNavigate('/admin')}
          >
            <span>👑 Admin Dashboard</span>
          </button>
        )}

        {token ? (
          <button
            className="mobile-nav-link"
            style={{ color: 'var(--color-error, #E56B6F)' }}
            onClick={handleLogout}
          >
            <span>Logout ({user?.email || 'User'})</span>
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              className="mobile-nav-link"
              onClick={() => handleNavigate('/login')}
            >
              <span>Login</span>
            </button>
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem' }}
              onClick={() => handleNavigate('/register')}
            >
              <span>Register</span>
            </button>
          </div>
        )}
      </div>

      {/* Route-level Suspense Boundary */}
      <main id="main-content">
        <Suspense fallback={<PageLoader />}>
          {renderContent()}
        </Suspense>
      </main>

      <Footer onNavigate={handleNavigate} />
    </>
  );
}
