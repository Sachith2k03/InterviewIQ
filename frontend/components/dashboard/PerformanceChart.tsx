"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const performanceData = [
  { date: "Jul 01", score: 28 },
  { date: "Jul 05", score: 38 },
  { date: "Jul 09", score: 55 },
  { date: "Jul 13", score: 44 },
  { date: "Jul 17", score: 68 },
  { date: "Jul 21", score: 57 },
  { date: "Jul 25", score: 74 },
  { date: "Jul 29", score: 61 },
];

export default function PerformanceChart() {
  return (
    <section className="rounded-xl border border-white/10 bg-[#101a2e] p-4 sm:p-5">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white">
            Performance Trend
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Your average interview score over time
          </p>
        </div>

        <select
          defaultValue="month"
          aria-label="Select performance period"
          className="rounded-lg border border-white/10 bg-[#0a1324] px-3 py-2 text-xs text-slate-300 outline-none transition focus:border-blue-500/50"
        >
          <option value="month">This Month</option>
          <option value="three-months">Last 3 Months</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={performanceData}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148, 163, 184, 0.1)"
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
              cursor={{
                stroke: "rgba(59, 130, 246, 0.25)",
                strokeWidth: 1,
              }}
              contentStyle={{
                backgroundColor: "#0a1324",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "#ffffff",
              }}
              labelStyle={{
                color: "#94a3b8",
              }}
            />

            <Line
              type="monotone"
              dataKey="score"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{
                fill: "#3b82f6",
                stroke: "#bfdbfe",
                strokeWidth: 2,
                r: 3,
              }}
              activeDot={{
                r: 5,
                fill: "#2563eb",
                stroke: "#ffffff",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}