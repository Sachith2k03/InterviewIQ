"use client";

import { useState } from "react";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { ProfileProvider } from "@/contexts/ProfileContext";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] =
    useState(false);

  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] =
    useState(false);

  function handleMobileMenuClick() {
    setIsMobileSidebarOpen((previous) => !previous);
  }

  function handleDesktopSidebarToggle() {
    setIsDesktopSidebarCollapsed((previous) => !previous);
  }

  return (
    <ProfileProvider>
      <div className="flex min-h-screen bg-[#020617] text-white">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
          isDesktopCollapsed={isDesktopSidebarCollapsed}
          onDesktopToggle={handleDesktopSidebarToggle}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            onMobileMenuClick={handleMobileMenuClick}
            isMobileSidebarOpen={isMobileSidebarOpen}
          />

          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </ProfileProvider>
  );
}