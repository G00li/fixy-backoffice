"use client";

import { useMemo } from "react";
import { useSidebar } from "@/context/SidebarContext";
import { UserProvider } from "@/context/UserContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import PageTransition from "@/components/common/PageTransition";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Memoize margin calculation to prevent unnecessary recalculations
  const mainContentMargin = useMemo(() => {
    if (isMobileOpen) return "ml-0";
    if (isExpanded || isHovered) return "lg:ml-[290px]";
    return "lg:ml-[90px]";
  }, [isMobileOpen, isExpanded, isHovered]);

  return (
    <UserProvider>
      <div className="min-h-screen xl:flex">
        {/* Sidebar and Backdrop - These stay mounted and never unmount */}
        <AppSidebar />
        <Backdrop />
        
        {/* Main Content Area */}
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
        >
          {/* Header - Stays mounted and never unmounts */}
          <AppHeader />
          
          {/* Only page content transitions - Sidebar and Header remain static */}
          <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </div>
      </div>
    </UserProvider>
  );
}
