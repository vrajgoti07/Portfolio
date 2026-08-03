import { useEffect, useState } from 'react';

export function useIntersectionObserver(
  elementRef,
  { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && triggerOnce) {
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => {
      if (element && !triggerOnce) {
        observer.unobserve(element);
      }
    };
  }, [elementRef, threshold, rootMargin, triggerOnce]);

  return isIntersecting;
}
