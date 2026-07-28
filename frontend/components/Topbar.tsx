"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, Menu } from "lucide-react";

import { useProfile } from "@/contexts/ProfileContext";
import { getInitials } from "@/lib/utils/get-initials";

interface TopbarProps {
  onMobileMenuClick: () => void;
  isMobileSidebarOpen: boolean;
}

export default function Topbar({
  onMobileMenuClick,
  isMobileSidebarOpen,
}: TopbarProps) {
  const { profile,authAvatarUrl, isLoading } = useProfile();

  const userName = profile?.full_name || "InterviewIQ User";
  const email = profile?.email || "View profile";
  const avatarUrl = profile?.avatar_url || authAvatarUrl || null;
  const initials = getInitials(userName);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#050d1d]/95 px-4 backdrop-blur-xl sm:px-6">
      {/* Mobile menu */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuClick}
          aria-label={
            isMobileSidebarOpen
              ? "Close navigation"
              : "Open navigation"
          }
          aria-expanded={isMobileSidebarOpen}
          aria-controls="dashboard-sidebar"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:border-blue-500/40 hover:bg-white/5 hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications */}
        <button
          type="button"
          aria-label="View notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          <Bell className="h-[18px] w-[18px]" />

          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-500 ring-2 ring-[#050d1d]" />
        </button>

        {/* Profile */}
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-lg p-1 transition hover:bg-white/5 sm:pr-3"
        >
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-blue-500/40 bg-blue-600 text-sm font-semibold text-white">
            {isLoading ? (
              <span className="text-xs">...</span>
            ) : avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={`${userName}'s profile picture`}
                fill
                sizes="36px"
                className="object-cover"
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <div className="hidden min-w-0 text-left md:block">
            <p className="max-w-40 truncate text-sm font-medium text-white">
              {isLoading ? "Loading..." : userName}
            </p>

            <p className="max-w-40 truncate text-xs text-slate-500">
              {isLoading ? "Loading profile..." : email}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}