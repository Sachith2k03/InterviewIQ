import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
} from "lucide-react";

export default function RecentInterviewCard() {
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
                Frontend Developer
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Technical Interview
              </p>
            </div>
          </div>

          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
            Completed
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CalendarDays className="h-4 w-4 text-slate-500" />
            July 18, 2026
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock3 className="h-4 w-4 text-slate-500" />
            38 minutes
          </div>
        </div>

        <div className="mt-5 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Overall score
            </span>

            <span className="text-lg font-semibold text-white">
              78%
            </span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
            <div className="h-full w-[78%] rounded-full bg-blue-500" />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <Link
          href="/reports/latest"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          View Report
          <ArrowRight className="h-4 w-4" />
        </Link>

        <Link
          href="/interviews/new"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          Start New Interview
        </Link>
      </div>
    </section>
  );
}