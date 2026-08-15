import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProjectsPage from './pages/ProjectsPage';
import TaskPage from './pages/TaskPage';
import ContactPage from './pages/ContactPage';
import SkillsPage from './pages/SkillsPage';
import NotFound from './pages/NotFound';

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Theme state: defaults to dark mode, saved in local storage
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  // Routing state
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname.toLowerCase());

  // Synchronize Theme with DOM
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

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

  // Central navigation handler
  const handleNavigate = (path) => {
    const cleanPath = path.toLowerCase();
    if (window.location.pathname.toLowerCase() !== cleanPath) {
      window.history.pushState({}, '', cleanPath);
      setCurrentPath(cleanPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileOpen(false);
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Projects', path: '/projects' },
    { label: 'Contact', path: '/contact' },
  ];

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
        return <TaskPage onNavigate={handleNavigate} />;
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

      {/* Navbar */}
      <Navbar
        currentPath={currentPath}
        onNavigate={handleNavigate}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        navItems={navItems}
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
      </div>

      {/* Pages */}
      <main>
        {renderContent()}
      </main>

      <Footer />
    </>
  );
}
