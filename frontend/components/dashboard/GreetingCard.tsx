"use client";

import Link from "next/link";
import { ArrowRight, History } from "lucide-react";

import { useProfile } from "@/contexts/ProfileContext";

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

export default function GreetingCard() {
  const { profile, isLoading } = useProfile();

  const firstName =
    profile?.full_name?.trim().split(/\s+/)[0] || "there";

  return (
    <section className="relative overflow-hidden rounded-xl border border-white/10 bg-[#101a2e] p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-400">
            {getGreeting()}
          </p>

          <h1 className="text-2xl font-semibold text-white sm:text-3xl">
            Hi{" "}
            {isLoading ? (
              <span className="inline-block h-7 w-28 animate-pulse rounded bg-white/10" />
            ) : (
              firstName
            )}
            ! 👋
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Start a new mock interview, review your previous sessions,
            and continue improving your interview confidence.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/interviews/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Start New Interview
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/history"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <History className="h-4 w-4" />
            Check History
          </Link>
        </div>
      </div>
    </section>
  );
}