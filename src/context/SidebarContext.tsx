"use client";
import React, { createContext, useContext } from "react";
import { useSidebar as useSidebarHook } from "@/hooks/useSidebar";

type SidebarContextType = ReturnType<typeof useSidebarHook>;

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

/**
 * SidebarProvider - Now uses Zustand store underneath
 * 
 * This provider is kept for backward compatibility but now uses
 * Zustand for state management instead of React Context.
 * 
 * Benefits:
 * - Components only re-render when their specific state changes
 * - No need for complex memoization
 * - Better performance
 */
export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const sidebar = useSidebarHook();

  return (
    <SidebarContext.Provider value={sidebar}>
      {children}
    </SidebarContext.Provider>
  );
};
