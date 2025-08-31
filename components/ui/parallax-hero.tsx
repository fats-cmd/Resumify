"use client";

import { useEffect, useRef, useState } from "react";

interface ParallaxHeroProps {
  children: React.ReactNode;
  className?: string;
}

export function ParallaxHero({ children, className = "" }: ParallaxHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const handleScroll = () => {
      if (!heroRef.current) return;

      const scrolled = window.pageYOffset;
      const parallaxSpeed = 0.5;
      
      // Apply transform to create parallax effect
      heroRef.current.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMounted]);

  return (
    <div ref={heroRef} className={className}>
      {children}
    </div>
  );
}