import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProjectsPage from './pages/ProjectsPage';
import TaskPage from './pages/TaskPage';
import ContactPage from './pages/ContactPage';
import SkillsPage from './pages/SkillsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import NotificationToast from './components/NotificationToast';
import { getToken, removeToken, getMe } from './api';

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
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

  // Scroll progress tracker
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Tasks', path: '/tasks' },
    { label: 'Projects', path: '/projects' },
    { label: 'Contact', path: '/contact' },
  ];

  const isAdmin = (user?.email || '').toLowerCase().trim() === 'vrajgoti07@gmail.com' || user?.role === 'admin';

  const renderContent = () => {
    const path = currentPath.replace(/\/+$/, '') || '/';

    switch (path) {
      case '/':
      case '/index.html':
      case '/home':
        return <Home onNavigate={handleNavigate} />;
      case '/projects':
        return <ProjectsPage onNavigate={handleNavigate} />;
      case '/task':
      case '/tasks':
        // Crucial requirement: Tasks page strictly renders task details and never redirects or shows login!
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
      {/* Scroll progress bar */}
      <div
        className="scroll-progress"
        style={{ width: `${scrollProgress}%` }}
      />

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
        navItems={navItems}
        user={user}
        isAuthenticated={Boolean(token)}
        onLogout={handleLogout}
      />

      {/* Mobile menu */}
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        {navItems.map((item) => (
          <button
            key={item.path}
            className="mobile-nav-link"
            onClick={() => handleNavigate(item.path)}
          >
            <span>{item.label}</span>
            {item.badge && (
              <span className="nav-item-badge">{item.badge}</span>
            )}
          </button>
        ))}

        {isAdmin && (
          <button
            className="mobile-nav-link"
            style={{ color: '#F59E0B', fontWeight: 700 }}
            onClick={() => handleNavigate('/admin')}
          >
            <span>👑 Admin Dashboard</span>
          </button>
        )}

        {token ? (
          <button
            className="mobile-nav-link"
            style={{ color: '#EF4444' }}
            onClick={handleLogout}
          >
            <span>Logout ({user?.email || 'User'})</span>
          </button>
        ) : (
          <>
            <button
              className="mobile-nav-link"
              onClick={() => handleNavigate('/login')}
            >
              <span>Login</span>
            </button>
            <button
              className="mobile-nav-link"
              onClick={() => handleNavigate('/register')}
            >
              <span>Register</span>
            </button>
          </>
        )}
      </div>

      {/* Pages */}
      <main>
        {renderContent()}
      </main>

      <Footer />
    </>
  );
}
