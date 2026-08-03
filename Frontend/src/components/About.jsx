import React, { useRef, useState, useEffect } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { stats } from '../data/portfolioData';

export default function About() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-12 w-full">
      {stats.map((stat, idx) => (
        <StatCard key={idx} value={stat.value} label={stat.label} />
      ))}
    </div>
  );
}

function StatCard({ value, label }) {
  const cardRef = useRef(null);
  const isIntersecting = useIntersectionObserver(cardRef, { threshold: 0.1, triggerOnce: true });
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (isIntersecting && !hasAnimated) {
      setHasAnimated(true);
      const numeric = parseInt(value, 10);
      
      if (reducedMotion || isNaN(numeric)) {
        setCount(numeric);
        return;
      }

      let startTime = null;
      const duration = 1500;

      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out quadratic
        const ease = progress * (2 - progress);
        setCount(Math.floor(ease * numeric));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(numeric);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isIntersecting, value, hasAnimated, reducedMotion]);

  // Extract suffix like "+", "%"
  const suffix = value.replace(/[0-9]/g, '');

  return (
    <div ref={cardRef} className="stat-card hard-box p-6 text-left">
      <span className="font-display text-[38px] font-bold text-ink mb-2 block">
        {isIntersecting ? count : 0}
        {suffix}
      </span>
      <span className="font-code text-xs text-soft">{label}</span>
    </div>
  );
}
