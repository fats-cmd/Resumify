"use client"

import { useEffect, useState } from 'react';

type ScrollDirection = 'up' | 'down' | null;

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (typeof window === 'undefined') return;
    
    let ticking = false;
    let lastY = window.scrollY;
    
    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      
      // Only update if we've scrolled more than 5px to avoid jittery behavior
      if (Math.abs(scrollY - lastY) < 5) {
        ticking = false;
        return;
      }
      
      // Don't hide navbar when near the top
      if (scrollY < 50) {
        if (scrollDirection !== 'up') {
          setScrollDirection('up');
        }
        lastY = scrollY;
        setLastScrollY(lastY);
        ticking = false;
        return;
      }
      
      const direction = scrollY > lastY ? 'down' : 'up';
      
      if (direction !== scrollDirection) {
        setScrollDirection(direction);
      }
      
      lastY = scrollY > 0 ? scrollY : 0;
      setLastScrollY(lastY);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Initial check
    updateScrollDirection();
    
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [scrollDirection]);

  return mounted ? scrollDirection : null;
}
