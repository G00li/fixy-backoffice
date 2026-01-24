import { useSidebarStore } from "@/stores/sidebarStore";
import React from "react";

/**
 * Backdrop component - Optimized with Zustand
 * Only re-renders when isMobileOpen changes
 */
const Backdrop: React.FC = () => {
  // Use Zustand selector to only subscribe to isMobileOpen
  const isMobileOpen = useSidebarStore((state) => state.isMobileOpen);
  const toggleMobileSidebar = useSidebarStore((state) => state.toggleMobileSidebar);

  if (!isMobileOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
      onClick={toggleMobileSidebar}
    />
  );
};

export default React.memo(Backdrop);
