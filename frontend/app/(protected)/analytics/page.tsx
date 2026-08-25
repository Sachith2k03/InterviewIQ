"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Activity,
  Award,
  BarChart3,
  Brain,
  Clock3,
  Flame,
  RefreshCw,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";

import { getAnalytics, type AnalyticsResponse } from "@/lib/api/analytics";

const PIE_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#06b6d4"];

interface SummaryCardProps {
  title: string;
  value: string;
  description: string;
  icon: typeof Activity;
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: SummaryCardProps) {
  return (
    <article className="rounded-xl border border-white/10 bg-[#101a2e] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>

          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

interface SkillRowProps {
  label: string;
  score: number;
}

function SkillRow({ label, score }: SkillRowProps) {
  const normalizedScore = Math.max(0, Math.min(score, 100));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-slate-300">{label}</span>

        <span className="text-sm font-semibold text-white">
          {score.toFixed(1)}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-blue-500 transition-all"
          style={{
            width: `${normalizedScore}%`,
          }}
        />
      </div>
    </div>
  );
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);

  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getAnalytics();

      setAnalytics(data);
    } catch (error) {
      setAnalytics(null);

      setError(
        error instanceof Error ? error.message : "Failed to load analytics.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const trendData = useMemo(() => {
    if (!analytics) {
      return [];
    }

    return analytics.performance_trend.map((point, index) => ({
      interview: index + 1,

      date: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(new Date(point.completed_at)),

      jobRole: point.job_role,

      overall: point.overall_score,

      technical: point.technical_score,

      communication: point.communication_score,

      confidence: point.confidence_score,

      fluency: point.fluency_score,
    }));
  }, [analytics]);

  const distributionData = useMemo(() => {
    if (!analytics) {
      return [];
    }

    return analytics.interview_distribution.map((item) => ({
      name: item.interview_type,
      value: item.count,
    }));
  }, [analytics]);

  const totalDistribution = distributionData.reduce(
    (total, item) => total + item.value,
    0,
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-40 animate-pulse rounded bg-white/10" />

          <div className="mt-2 h-4 w-80 animate-pulse rounded bg-white/5" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({
            length: 5,
          }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-xl bg-white/5"
            />
          ))}
        </div>

        <div className="h-96 animate-pulse rounded-xl bg-white/5" />

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="h-80 animate-pulse rounded-xl bg-white/5" />

          <div className="h-80 animate-pulse rounded-xl bg-white/5" />
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6">
        <h1 className="font-semibold text-red-300">Analytics unavailable</h1>

        <p className="mt-2 text-sm text-red-300/70">
          {error ?? "Analytics data could not be loaded."}
        </p>

        <Button
          type="button"
          variant="outline"
          className="mt-4 border-red-500/20 bg-red-500/10 text-red-200 hover:bg-red-500/20"
          onClick={() => void loadAnalytics()}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  const {
    summary,
    skill_averages,
    difficulty_performance,
    type_performance,
    practice_activity,
    insights,
  } = analytics;

  const improvementPositive = insights.improvement_percentage >= 0;

  const weeklyPositive = summary.weekly_progress >= 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}

      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>

        <p className="mt-1 text-sm text-slate-400">
          Track your progress, understand your strengths and identify where to
          focus next.
        </p>
      </div>

      {/* Summary */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          title="Completed"
          value={String(summary.completed_interviews)}
          description="Completed interviews"
          icon={BarChart3}
        />

        <SummaryCard
          title="Average Score"
          value={`${summary.average_score.toFixed(1)}%`}
          description="Across all interviews"
          icon={Activity}
        />

        <SummaryCard
          title="Best Score"
          value={`${summary.best_score.toFixed(1)}%`}
          description="Highest performance"
          icon={Award}
        />

        <SummaryCard
          title="Practice Time"
          value={formatMinutes(summary.practice_minutes)}
          description="Active interview time"
          icon={Clock3}
        />

        <SummaryCard
          title="Current Streak"
          value={`${summary.current_streak} ${
            summary.current_streak === 1 ? "day" : "days"
          }`}
          description="Consecutive practice days"
          icon={Flame}
        />
      </div>

      {/* Progress overview */}

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-white/10 bg-[#101a2e] p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Weekly Progress
          </p>

          <div className="mt-3 flex items-center gap-3">
            {weeklyPositive ? (
              <TrendingUp className="h-6 w-6 text-emerald-400" />
            ) : (
              <TrendingDown className="h-6 w-6 text-red-400" />
            )}

            <span
              className={
                weeklyPositive
                  ? "text-2xl font-semibold text-emerald-400"
                  : "text-2xl font-semibold text-red-400"
              }
            >
              {weeklyPositive ? "+" : ""}
              {summary.weekly_progress.toFixed(1)}%
            </span>
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Compared with your previous seven-day performance period.
          </p>
        </section>

        <section className="rounded-xl border border-white/10 bg-[#101a2e] p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Overall Improvement
          </p>

          <div className="mt-3 flex items-center gap-3">
            {improvementPositive ? (
              <TrendingUp className="h-6 w-6 text-blue-400" />
            ) : (
              <TrendingDown className="h-6 w-6 text-red-400" />
            )}

            <span
              className={
                improvementPositive
                  ? "text-2xl font-semibold text-blue-400"
                  : "text-2xl font-semibold text-red-400"
              }
            >
              {improvementPositive ? "+" : ""}
              {insights.improvement_percentage.toFixed(1)}%
            </span>
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Comparison between your earlier and most recent scored interviews.
          </p>
        </section>
      </div>

      {/* Overall performance trend */}

      <section className="rounded-xl border border-white/10 bg-[#101a2e] p-5">
        <div>
          <h2 className="font-semibold text-white">
            Overall Performance Trend
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Your overall scores across recent completed interviews.
          </p>
        </div>

        {trendData.length === 0 ? (
          <div className="flex h-72 items-center justify-center">
            <div className="text-center">
              <BarChart3 className="mx-auto h-8 w-8 text-slate-600" />

              <p className="mt-3 text-sm text-slate-500">
                Complete scored interviews to build your performance history.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{
                  top: 10,
                  right: 15,
                  bottom: 0,
                  left: -20,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148,163,184,0.10)"
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "#64748b",
                    fontSize: 11,
                  }}
                />

                <YAxis
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "#64748b",
                    fontSize: 11,
                  }}
                />

                <Tooltip
                  contentStyle={{
                    background: "#0c1527",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                  }}
                  labelStyle={{
                    color: "#94a3b8",
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="overall"
                  name="Overall"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{
                    fill: "#3b82f6",
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Skill averages */}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
        <section className="rounded-xl border border-white/10 bg-[#101a2e] p-5">
          <h2 className="font-semibold text-white">Skill Performance</h2>

          <p className="mt-1 text-xs text-slate-500">
            Average scores across your evaluated interview skills.
          </p>

          <div className="mt-6 space-y-5">
            <SkillRow label="Technical" score={skill_averages.technical} />

            <SkillRow
              label="Communication"
              score={skill_averages.communication}
            />

            <SkillRow label="Confidence" score={skill_averages.confidence} />

            <SkillRow label="Fluency" score={skill_averages.fluency} />
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-emerald-400" />

              <p className="text-sm font-medium text-emerald-300">
                Strongest Skill
              </p>
            </div>

            <p className="mt-4 text-xl font-semibold text-white">
              {insights.strongest_skill ?? "Not available"}
            </p>

            <p className="mt-1 text-sm text-emerald-300">
              {insights.strongest_skill_score.toFixed(1)}%
            </p>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-5">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-amber-400" />

              <p className="text-sm font-medium text-amber-300">Focus Area</p>
            </div>

            <p className="mt-4 text-xl font-semibold text-white">
              {insights.weakest_skill ?? "Not available"}
            </p>

            <p className="mt-1 text-sm text-amber-300">
              {insights.weakest_skill_score.toFixed(1)}%
            </p>
          </div>
        </section>
      </div>

      {/* Skill trends */}
      <section className="rounded-xl border border-white/10 bg-[#101a2e] p-5">
        <div>
          <h2 className="font-semibold text-white">Skill Trends</h2>

          <p className="mt-1 text-xs text-slate-500">
            See how each evaluated skill changes over your recent interviews.
          </p>
        </div>

        {trendData.length === 0 ? (
          <div className="flex h-72 items-center justify-center text-sm text-slate-500">
            No skill trend data yet.
          </div>
        ) : (
          <div className="mt-6">
            {/* Chart */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{
                    top: 10,
                    right: 20,
                    bottom: 5,
                    left: -10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148,163,184,0.10)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "#64748b",
                      fontSize: 11,
                    }}
                    tickMargin={10}
                  />

                  <YAxis
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "#64748b",
                      fontSize: 11,
                    }}
                    tickMargin={8}
                    width={40}
                  />

                  <Tooltip
                    contentStyle={{
                      background: "#0c1527",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                    }}
                    labelStyle={{
                      color: "#94a3b8",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="technical"
                    name="Technical"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 5,
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="communication"
                    name="Communication"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 5,
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="confidence"
                    name="Confidence"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 5,
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="fluency"
                    name="Fluency"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 5,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-white/5 pt-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                <span className="text-xs text-slate-400">Technical</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />

                <span className="text-xs text-slate-400">Communication</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />

                <span className="text-xs text-slate-400">Confidence</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />

                <span className="text-xs text-slate-400">Fluency</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Difficulty / type */}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-white/10 bg-[#101a2e] p-5">
          <h2 className="font-semibold text-white">
            Performance by Difficulty
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Compare your average results across difficulty levels.
          </p>

          {difficulty_performance.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-slate-500">
              No difficulty data available.
            </div>
          ) : (
            <div className="mt-5 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={difficulty_performance}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148,163,184,0.10)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="difficulty"
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "#64748b",
                      fontSize: 11,
                    }}
                  />

                  <YAxis
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "#64748b",
                      fontSize: 11,
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      background: "#0c1527",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                    }}
                  />

                  <Bar
                    dataKey="average_score"
                    name="Average Score"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-white/10 bg-[#101a2e] p-5">
          <h2 className="font-semibold text-white">
            Performance by Interview Type
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Identify the interview formats where you perform best.
          </p>

          {type_performance.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-slate-500">
              No interview type data available.
            </div>
          ) : (
            <div className="mt-5 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={type_performance}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148,163,184,0.10)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="interview_type"
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "#64748b",
                      fontSize: 10,
                    }}
                  />

                  <YAxis
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "#64748b",
                      fontSize: 11,
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      background: "#0c1527",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                    }}
                  />

                  <Bar
                    dataKey="average_score"
                    name="Average Score"
                    fill="#8b5cf6"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      {/* Practice + Distribution */}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-white/10 bg-[#101a2e] p-5">
          <h2 className="font-semibold text-white">Practice Activity</h2>

          <p className="mt-1 text-xs text-slate-500">
            Track how consistently you are practicing.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-white/5 bg-[#0c1527] p-4 text-center">
              <p className="text-2xl font-semibold text-white">
                {practice_activity.this_week}
              </p>

              <p className="mt-1 text-xs text-slate-500">This Week</p>
            </div>

            <div className="rounded-lg border border-white/5 bg-[#0c1527] p-4 text-center">
              <p className="text-2xl font-semibold text-white">
                {practice_activity.last_week}
              </p>

              <p className="mt-1 text-xs text-slate-500">Last Week</p>
            </div>

            <div className="rounded-lg border border-white/5 bg-[#0c1527] p-4 text-center">
              <p className="text-2xl font-semibold text-white">
                {practice_activity.this_month}
              </p>

              <p className="mt-1 text-xs text-slate-500">This Month</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-[#101a2e] p-5">
          <h2 className="font-semibold text-white">
            Interview Type Distribution
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            See which interview formats you practice most.
          </p>

          {distributionData.length === 0 ? (
            <div className="flex h-56 items-center justify-center text-sm text-slate-500">
              No distribution data available.
            </div>
          ) : (
            <div className="mt-4 grid items-center gap-4 sm:grid-cols-[180px_1fr]">
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={43}
                      outerRadius={68}
                      paddingAngle={3}
                    >
                      {distributionData.map((item, index) => (
                        <Cell
                          key={item.name}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        background: "#0c1527",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "10px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {distributionData.map((item, index) => {
                  const percentage =
                    totalDistribution > 0
                      ? Math.round((item.value / totalDistribution) * 100)
                      : 0;

                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-sm"
                          style={{
                            backgroundColor:
                              PIE_COLORS[index % PIE_COLORS.length],
                          }}
                        />

                        <span className="truncate text-sm text-slate-300">
                          {item.name}
                        </span>
                      </div>

                      <span className="text-sm font-medium text-white">
                        {percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Insights */}

      <section className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-violet-500/5 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
            <Brain className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold text-white">Performance Insights</h2>

            <p className="text-xs text-slate-500">
              Key takeaways from your interview history.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-white/5 bg-[#0c1527]/80 p-4">
            <p className="text-xs text-slate-500">Strongest Area</p>

            <p className="mt-2 font-semibold text-emerald-400">
              {insights.strongest_skill ?? "Not available"}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              {insights.strongest_skill_score.toFixed(1)}% average
            </p>
          </div>

          <div className="rounded-lg border border-white/5 bg-[#0c1527]/80 p-4">
            <p className="text-xs text-slate-500">Focus Area</p>

            <p className="mt-2 font-semibold text-amber-400">
              {insights.weakest_skill ?? "Not available"}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              {insights.weakest_skill_score.toFixed(1)}% average
            </p>
          </div>

          <div className="rounded-lg border border-white/5 bg-[#0c1527]/80 p-4">
            <p className="text-xs text-slate-500">Improvement</p>

            <p
              className={
                improvementPositive
                  ? "mt-2 font-semibold text-blue-400"
                  : "mt-2 font-semibold text-red-400"
              }
            >
              {improvementPositive ? "+" : ""}
              {insights.improvement_percentage.toFixed(1)}%
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Recent vs earlier performance
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
