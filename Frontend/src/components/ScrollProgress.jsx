import { useState, useEffect } from 'react';

/**
 * ScrollProgress — Isolated scroll progress bar.
 * Performance Benefit:
 * Keeping scroll listener and state inside this self-contained leaf component
 * prevents the root App component and its entire child tree from re-rendering
 * continuously on every scroll event (identified via React DevTools Profiler audit).
 */
export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
          if (totalScroll > 0) {
            setProgress((window.scrollY / totalScroll) * 100);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="scroll-progress"
      style={{ width: `${progress}%` }}
      aria-hidden="true"
    />
  );
}
