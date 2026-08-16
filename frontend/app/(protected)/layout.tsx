"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { ProfileProvider } from "@/contexts/ProfileContext";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] =
    useState(false);

  function handleMobileMenuClick() {
    setIsMobileSidebarOpen((previous) => !previous);
  }

  function handleDesktopSidebarToggle() {
    setIsDesktopSidebarCollapsed((previous) => !previous);
  }

  /*
   * Active interview routes:
   * /interviews/<uuid>
   *
   * But NOT:
   * /interviews
   * /interviews/create
   */
  const isInterviewRoom =
    pathname.startsWith("/interviews/") && pathname !== "/interviews/create";

  return (
    <ProfileProvider>
      <div className="flex h-dvh overflow-hidden bg-[#020617] text-white">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
          isDesktopCollapsed={isDesktopSidebarCollapsed}
          onDesktopToggle={handleDesktopSidebarToggle}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar
            onMobileMenuClick={handleMobileMenuClick}
            isMobileSidebarOpen={isMobileSidebarOpen}
          />

          <main
            className={
              isInterviewRoom
                ? "min-h-0 flex-1 overflow-hidden"
                : "min-h-0 flex-1 overflow-y-auto p-4 md:p-6"
            }
          >
            {children}
          </main>
        </div>
      </div>
    </ProfileProvider>
  );
}
