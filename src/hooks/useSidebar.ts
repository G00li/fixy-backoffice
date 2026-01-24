'use client';

import { useEffect } from 'react';
import { useSidebarStore } from '@/stores/sidebarStore';

/**
 * Hook wrapper for sidebar store
 * Maintains compatibility with existing code while using Zustand underneath
 * 
 * This hook also handles responsive behavior (mobile detection)
 */
export function useSidebar() {
  const store = useSidebarStore();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      
      // Close mobile sidebar when resizing to desktop
      if (!mobile && store.isMobileOpen) {
        store.closeMobileSidebar();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [store]);

  // Return store with computed values
  return {
    isExpanded: store.isExpanded,
    isMobileOpen: store.isMobileOpen,
    isHovered: store.isHovered,
    activeItem: store.activeItem,
    openSubmenu: store.openSubmenu,
    toggleSidebar: store.toggleSidebar,
    toggleMobileSidebar: store.toggleMobileSidebar,
    setIsHovered: store.setIsHovered,
    setActiveItem: store.setActiveItem,
    toggleSubmenu: store.toggleSubmenu,
  };
}
