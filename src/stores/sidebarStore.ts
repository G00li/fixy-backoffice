import { create } from 'zustand';

interface SidebarStore {
  // State
  isExpanded: boolean;
  isMobileOpen: boolean;
  isHovered: boolean;
  activeItem: string | null;
  openSubmenu: string | null;
  
  // Actions
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setIsHovered: (isHovered: boolean) => void;
  setActiveItem: (item: string | null) => void;
  toggleSubmenu: (item: string) => void;
  closeMobileSidebar: () => void;
}

/**
 * Zustand store for sidebar state management
 * 
 * Benefits over Context API:
 * - Components only re-render when the specific state they use changes
 * - No need for complex memoization
 * - Better performance with less boilerplate
 * - Automatic optimization of re-renders
 */
export const useSidebarStore = create<SidebarStore>((set) => ({
  // Initial state
  isExpanded: true,
  isMobileOpen: false,
  isHovered: false,
  activeItem: null,
  openSubmenu: null,

  // Actions
  toggleSidebar: () => set((state) => ({ 
    isExpanded: !state.isExpanded 
  })),

  toggleMobileSidebar: () => set((state) => ({ 
    isMobileOpen: !state.isMobileOpen 
  })),

  setIsHovered: (isHovered: boolean) => set({ isHovered }),

  setActiveItem: (activeItem: string | null) => set({ activeItem }),

  toggleSubmenu: (item: string) => set((state) => ({
    openSubmenu: state.openSubmenu === item ? null : item
  })),

  closeMobileSidebar: () => set({ isMobileOpen: false }),
}));
