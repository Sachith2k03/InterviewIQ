import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
} from "lucide-react";

import type {
  DashboardRecentInterview,
} from "@/lib/api/dashboard";

interface RecentInterviewCardProps {
  interview: DashboardRecentInterview | null;
}

function formatInterviewType(interviewType: string): string {
  return interviewType
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function RecentInterviewCard({
  interview,
}: RecentInterviewCardProps) {
  if (!interview) {
    return (
      <section className="rounded-xl border border-white/10 bg-[#101a2e] p-4 sm:p-5">
        <div>
          <h2 className="text-base font-semibold text-white">
            Recent Interview
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Your latest completed interview
          </p>
        </div>

        <div className="mt-6 flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <BriefcaseBusiness className="h-6 w-6" />
          </div>

          <p className="mt-4 text-sm font-medium text-white">
            No completed interviews yet
          </p>

          <p className="mt-2 max-w-64 text-xs leading-5 text-slate-500">
            Complete your first mock interview to see its results here.
          </p>

          <Link
            href="/interviews/create"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Start First Interview
          </Link>
        </div>
      </section>
    );
  }

  const completedDate = interview.completed_at
    ? new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(interview.completed_at))
    : "Date unavailable";

  const durationMinutes =
    interview.duration_seconds !== null
      ? Math.max(
          1,
          Math.round(interview.duration_seconds / 60),
        )
      : null;

  const score = Math.min(
    100,
    Math.max(0, interview.overall_score ?? 0),
  );

  const hasScore = interview.overall_score !== null;

  return (
    <section className="rounded-xl border border-white/10 bg-[#101a2e] p-4 sm:p-5">
      <div>
        <h2 className="text-base font-semibold text-white">
          Recent Interview
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Your latest completed interview
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-[#0a1324] p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {interview.job_role}
              </p>

              <p className="mt-1 text-xs capitalize text-slate-500">
                {formatInterviewType(interview.interview_type)}
              </p>
            </div>
          </div>

          <span className="shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
            Completed
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CalendarDays className="h-4 w-4 shrink-0 text-slate-500" />
            <span>{completedDate}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock3 className="h-4 w-4 shrink-0 text-slate-500" />

            <span>
              {durationMinutes !== null
                ? `${durationMinutes} ${
                    durationMinutes === 1
                      ? "minute"
                      : "minutes"
                  }`
                : "Duration unavailable"}
            </span>
          </div>
        </div>

        <div className="mt-5 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Overall score
            </span>

            <span className="text-lg font-semibold text-white">
              {hasScore ? `${score.toFixed(1)}%` : "Not scored"}
            </span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-blue-500 transition-[width] duration-500"
              style={{
                width: `${hasScore ? score : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {interview.pdf_path ? (
          <Link
            href={`/reports/${interview.id}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            View Report
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex h-10 cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-blue-600/40 text-sm font-medium text-white/50"
          >
            Report Unavailable
          </button>
        )}

        <Link
          href="/interviews/create"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          Start New Interview
        </Link>
      </div>
    </section>
  );
}