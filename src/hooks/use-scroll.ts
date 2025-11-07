import { useEffect, useRef, useState } from 'react';

/**
 * Optimized scroll hook using requestAnimationFrame for better performance
 */
export function useScroll() {
  const [scrollY, setScrollY] = useState(0);
  const rafId = useRef<number | null>(null);
  const ticking = useRef(false);

  useEffect(() => {
    const updateScroll = () => {
      setScrollY(window.scrollY);
      ticking.current = false;
    };

    const handleScroll = () => {
      if (!ticking.current) {
        rafId.current = requestAnimationFrame(updateScroll);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return scrollY;
}

/**
 * Optimized scroll hook with throttling for navbar/header updates
 */
export function useScrollThreshold(threshold: number = 20) {
  const [isScrolled, setIsScrolled] = useState(false);
  const rafId = useRef<number | null>(null);
  const ticking = useRef(false);

  useEffect(() => {
    const updateScroll = () => {
      setIsScrolled(window.scrollY > threshold);
      ticking.current = false;
    };

    const handleScroll = () => {
      if (!ticking.current) {
        rafId.current = requestAnimationFrame(updateScroll);
        ticking.current = true;
      }
    };

    // Initial check
    updateScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [threshold]);

  return isScrolled;
}

/**
 * Optimized parallax scroll hook using requestAnimationFrame
 */
export function useParallax(speed: number = 0.5) {
  const [offset, setOffset] = useState(0);
  const rafId = useRef<number | null>(null);
  const ticking = useRef(false);

  useEffect(() => {
    const updateParallax = () => {
      setOffset(window.pageYOffset * speed);
      ticking.current = false;
    };

    const handleScroll = () => {
      if (!ticking.current) {
        rafId.current = requestAnimationFrame(updateParallax);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [speed]);

  return offset;
}

/**
 * Hook to detect scroll direction (up/down)
 */
export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const lastScrollY = useRef(0);
  const rafId = useRef<number | null>(null);
  const ticking = useRef(false);

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      
      // Only update if scroll difference is significant (more than 5px)
      if (Math.abs(scrollY - lastScrollY.current) > 5) {
        const direction = scrollY > lastScrollY.current ? 'down' : 'up';
        setScrollDirection(direction);
        lastScrollY.current = scrollY > 0 ? scrollY : 0;
      }
      
      ticking.current = false;
    };

    const handleScroll = () => {
      if (!ticking.current) {
        rafId.current = requestAnimationFrame(updateScrollDirection);
        ticking.current = true;
      }
    };

    // Initialize
    lastScrollY.current = window.scrollY;
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return scrollDirection;
}

