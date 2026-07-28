"use client";

import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BriefcaseBusiness,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  UserRound,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase";
import logo from "@/public/images/logo.png";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Interviews",
    href: "/interviews",
    icon: BriefcaseBusiness,
  },
  {
    name: "History",
    href: "/history",
    icon: History,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: UserRound,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: Dispatch<SetStateAction<boolean>>;
  isDesktopCollapsed: boolean;
  onDesktopToggle: () => void;
}

export default function Sidebar({
  isMobileOpen,
  setIsMobileOpen,
  isDesktopCollapsed,
  onDesktopToggle,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Close the mobile sidebar when the user navigates to another page.
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname, setIsMobileOpen]);

  async function handleLogout() {
    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout failed:", error.message);
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Unexpected logout error:", error);
    }
  }

  function isActiveRoute(href: string) {
    if (href === "/dashboard") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      {/* Mobile background overlay */}
      <button
        type="button"
        aria-label="Close navigation"
        onClick={() => setIsMobileOpen(false)}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isMobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-[#030817] transition-all duration-300 ease-in-out lg:static lg:z-auto ${
          isMobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        } ${isDesktopCollapsed ? "w-64 lg:w-20" : "w-64 lg:w-56"}`}
      >
        {/* Logo and sidebar controls */}
        <div
          className={`flex h-16 shrink-0 items-center border-b border-white/10 ${
            isDesktopCollapsed
              ? "justify-between px-5 lg:justify-center lg:px-2"
              : "justify-between px-5"
          }`}
        >
        <div
          className={`flex min-w-0 items-center ${
            isDesktopCollapsed ? "justify-center" : "gap-2"
          }`}
        >
          {/* Hide logo only when desktop sidebar is collapsed */}
          <Link
            href="/dashboard"
            aria-label="InterviewIQ dashboard"
            className={`flex items-center ${
              isDesktopCollapsed ? "lg:hidden" : ""
            }`}
          >
            <Image
              src={logo}
              alt="InterviewIQ"
              width={500}
              height={500}
              className="h-45 w-45 object-contain"
              priority
            />
          </Link>

          {/* Desktop collapse button */}
          <button
            type="button"
            onClick={onDesktopToggle}
            aria-label={
              isDesktopCollapsed
                ? "Expand desktop sidebar"
                : "Collapse desktop sidebar"
            }
            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:border-blue-500/40 hover:bg-white/5 hover:text-white lg:flex"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close mobile sidebar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav
          aria-label="Dashboard navigation"
          className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 py-5"
        >
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                title={isDesktopCollapsed ? item.name : undefined}
                className={`group flex h-10 items-center rounded-lg text-sm font-medium transition-all duration-200 ${
                  isDesktopCollapsed
                    ? "gap-3 px-3 lg:justify-center lg:px-0"
                    : "gap-3 px-3"
                } ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                    : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <Icon
                  className={`h-[18px] w-[18px] shrink-0 transition ${
                    isActive
                      ? "text-white"
                      : "text-slate-500 group-hover:text-blue-400"
                  }`}
                />

                <span
                  className={`whitespace-nowrap ${
                    isDesktopCollapsed ? "lg:hidden" : ""
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="shrink-0 border-t border-white/10 p-3">
          <button
            type="button"
            onClick={handleLogout}
            title={isDesktopCollapsed ? "Logout" : undefined}
            className={`flex h-10 w-full items-center rounded-lg border border-red-500/30 text-sm font-medium text-red-400 transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300 ${
              isDesktopCollapsed
                ? "gap-3 px-3 lg:justify-center lg:px-0"
                : "gap-3 px-3"
            }`}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />

            <span
              className={`whitespace-nowrap ${
                isDesktopCollapsed ? "lg:hidden" : ""
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}