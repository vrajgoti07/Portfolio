import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Contact from './components/Contact';
import Footer from './components/Footer';
import NotFound from './pages/NotFound';

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Theme state: defaults to dark mode, saved in local storage
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  // Routing state
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

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
      setCurrentPath(window.location.pathname);
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

  // Active section tracking for single-page scrolling
  useEffect(() => {
    if (currentPath !== '/' && currentPath !== '/index.html') return;

    const sections = ['home', 'projects', 'skills', 'experience', 'contact'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [currentPath]);

  // Scroll to section helper
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  // Central navigation handler
  const handleNavigate = (id) => {
    if (currentPath !== '/' && currentPath !== '/index.html') {
      // If we are on a Not Found path, go to Home first, then scroll
      window.history.pushState({}, '', '/');
      setCurrentPath('/');
      setTimeout(() => {
        scrollTo(id);
      }, 100);
    } else {
      scrollTo(id);
    }
  };

  const handleBackToHome = () => {
    window.history.pushState({}, '', '/');
    setCurrentPath('/');
  };

  const isNotFound = currentPath !== '/' && currentPath !== '/index.html';

  return (
    <>
      {/* Scroll progress bar */}
      {!isNotFound && (
        <div
          className="scroll-progress"
          style={{ width: `${scrollProgress}%` }}
        />
      )}

      {/* Navbar */}
      <Navbar
        activeSection={isNotFound ? '' : activeSection}
        onNavigate={handleNavigate}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      />

      {/* Mobile menu */}
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        {['home', 'projects', 'skills', 'experience', 'contact'].map((id) => (
          <button
            key={id}
            className="mobile-nav-link"
            onClick={() => handleNavigate(id)}
          >
            {id.charAt(0).toUpperCase() + id.slice(1)}
          </button>
        ))}
      </div>

      {/* Pages */}
      <main>
        {isNotFound ? (
          <NotFound onBackToHome={handleBackToHome} />
        ) : (
          <>
            <Hero onNavigate={handleNavigate} />
            <Projects />
            <Skills />
            <Experience />
            <Contact />
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
