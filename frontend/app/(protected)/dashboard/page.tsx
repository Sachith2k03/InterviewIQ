// This is temporary code to get the JWT access token for test the APIs.
"use client";

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

const dashboardStats = [
  {
    title: "Interviews Completed",
    value: "24",
    description: "+5 compared with last week",
    icon: BarChart3,
  },
  {
    title: "Average Score",
    value: "72%",
    description: "+7% compared with last week",
    icon: Gauge,
  },
  {
    title: "Current Streak",
    value: "7 days",
    description: "Keep your practice streak going",
    icon: Flame,
  },
  {
    title: "Weekly Progress",
    value: "+12%",
    description: "Improvement during this week",
    icon: TrendingUp,
  },
];

import { useEffect } from "react"; // remove this import before production
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

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <GreetingCard />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
          />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
        <PerformanceChart />
        <RecentInterviewCard />
      </section>
    </div>
  );
}


