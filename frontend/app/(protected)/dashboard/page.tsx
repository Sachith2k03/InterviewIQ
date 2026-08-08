"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  Flame,
  Gauge,
  TrendingUp,
} from "lucide-react";

import GreetingCard from "@/components/dashboard/GreetingCard";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import RecentInterviewCard from "@/components/dashboard/RecentInterviewCard";
import StatCard from "@/components/dashboard/StatCard";
import {
  getDashboard,
  type DashboardData,
} from "@/lib/api/dashboard";


import { createClient } from "@/lib/supabase"; // remove this import before production

export default function DashboardPage() {
  //TODO: Remove the following code before production.
  useEffect(() => {
    const getToken = async () => {
      const supabase = createClient();

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Session error:", error);
        return;
      }

      console.log("SESSION:", session);
      console.log("JWT ACCESS TOKEN:", session?.access_token);
    };

    getToken();
  }, []);
  //TODO: Remove the above code before production.

  const [dashboard, setDashboard] =
      useState<DashboardData | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadDashboard = useCallback(async () => {
      try {
        setIsLoading(true);
        setError(null);

        const dashboardData = await getDashboard();

        setDashboard(dashboardData);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load dashboard";

        setDashboard(null);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }, []);

    useEffect(() => {
      void loadDashboard();
    }, [loadDashboard]);

    if (isLoading) {
      return (
        <div className="mx-auto w-full max-w-7xl space-y-5">
          <div className="h-44 animate-pulse rounded-xl bg-white/5" />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-xl bg-white/5"
              />
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
            <div className="h-96 animate-pulse rounded-xl bg-white/5" />
            <div className="h-96 animate-pulse rounded-xl bg-white/5" />
          </div>
        </div>
      );
    }

    if (error || !dashboard) {
      return (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5">
          <h1 className="font-medium text-red-300">
            Dashboard unavailable
          </h1>

          <p className="mt-1 text-sm text-red-300/70">
            {error ?? "Dashboard data could not be loaded."}
          </p>

          <button
            type="button"
            onClick={() => void loadDashboard()}
            className="mt-4 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/30"
          >
            Try Again
          </button>
        </div>
      );
    }

    const statistics = [
      {
        title: "Interviews Completed",
        value: dashboard.interviews_completed.toString(),
        description: "Completed mock interviews",
        icon: BarChart3,
      },
      {
        title: "Average Score",
        value: `${dashboard.average_score.toFixed(1)}%`,
        description: `Best score: ${dashboard.best_score.toFixed(1)}%`,
        icon: Gauge,
      },
      {
        title: "Current Streak",
        value: `${dashboard.current_streak} ${
          dashboard.current_streak === 1
            ? "day"
            : "days"
        }`,
        description: "Consecutive practice days",
        icon: Flame,
      },
      {
        title: "Weekly Progress",
        value: `${
          dashboard.weekly_progress > 0 ? "+" : ""
        }${dashboard.weekly_progress.toFixed(1)}%`,
        description: "Compared with the previous seven days",
        icon: TrendingUp,
      },
    ];

    return (
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <GreetingCard />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statistics.map((statistic) => (
            <StatCard
              key={statistic.title}
              title={statistic.title}
              value={statistic.value}
              description={statistic.description}
              icon={statistic.icon}
            />
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
          <PerformanceChart
            data={dashboard.performance}
          />

          <RecentInterviewCard
            interview={dashboard.recent_interview}
          />
        </section>
      </div>
    );
  }


