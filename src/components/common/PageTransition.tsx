'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const previousPathname = useRef(pathname);
  
  // Use ref to store children without triggering re-renders
  const childrenRef = useRef(children);
  
  // Update children ref on every render (doesn't cause re-render)
  childrenRef.current = children;

  useEffect(() => {
    // Only transition if pathname actually changed
    if (pathname !== previousPathname.current) {
      setIsTransitioning(true);
      
      // Quick fade out/in
      const fadeTimer = setTimeout(() => {
        setIsTransitioning(false);
      }, 100);

      previousPathname.current = pathname;
      
      return () => clearTimeout(fadeTimer);
    }
  }, [pathname]); // ✅ Removed 'children' from dependencies

  return (
    <div
      className={`transition-opacity duration-100 ${
        isTransitioning ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {childrenRef.current}
    </div>
  );
}
