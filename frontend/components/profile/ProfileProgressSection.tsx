"use client";

import {
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

import { Card } from "@/components/ui/card";

export interface PerformanceTrendPoint {
    label: string;
    score: number;
}

export interface InterviewDistributionPoint {
    type: string;
    count: number;
}

interface ProfileProgressSectionProps {
    performanceData: PerformanceTrendPoint[];
    distributionData: InterviewDistributionPoint[];
}

const CHART_COLORS = [
    "#3b82f6",
    "#8b5cf6",
    "#06b6d4",
    "#f59e0b",
    "#10b981",
];

interface TooltipEntry {
    value?: number;
    name?: string;
    payload?: {
        type?: string;
        label?: string;
    };
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipEntry[];
    label?: string;
}

function PerformanceTooltip({
    active,
    payload,
    label,
}: CustomTooltipProps) {
    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div className="rounded-lg border border-white/10 bg-[#0c1527] px-3 py-2 shadow-xl">
            <p className="text-xs text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-sm font-semibold text-white">
                Score: {payload[0].value ?? 0}%
            </p>
        </div>
    );
}

function DistributionTooltip({
    active,
    payload,
}: CustomTooltipProps) {
    if (!active || !payload?.length) {
        return null;
    }

    const item = payload[0];

    return (
        <div className="rounded-lg border border-white/10 bg-[#0c1527] px-3 py-2 shadow-xl">
            <p className="text-sm font-medium text-white">
                {item.payload?.type ?? item.name}
            </p>

            <p className="mt-1 text-xs text-slate-400">
                {item.value ?? 0} interviews
            </p>
        </div>
    );
}

function EmptyChartState({
    message,
}: {
    message: string;
}) {
    return (
        <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/[0.02]">
            <p className="text-sm text-slate-500">
                {message}
            </p>
        </div>
    );
}

export function ProfileProgressSection({
    performanceData,
    distributionData,
}: ProfileProgressSectionProps) {
    const totalInterviews = distributionData.reduce(
        (total, item) => total + item.count,
        0,
    );

    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold text-white">
                    Your Progress
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                    Review how your interview performance has
                    changed over time.
                </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <Card className="border-white/10 bg-[#111a2d] p-6 text-white">
                    <div>
                        <h3 className="text-sm font-semibold">
                            Performance Trend
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                            Overall scores from your recent
                            completed interviews
                        </p>
                    </div>

                    <div className="mt-6">
                        {performanceData.length === 0 ? (
                            <EmptyChartState message="Complete an interview to see your performance trend." />
                        ) : (
                            <div className="h-72 w-full">
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >
                                    <LineChart
                                        data={performanceData}
                                        margin={{
                                            top: 10,
                                            right: 10,
                                            left: -20,
                                            bottom: 0,
                                        }}
                                    >
                                        <XAxis
                                            dataKey="label"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fill: "#64748b",
                                                fontSize: 12,
                                            }}
                                        />

                                        <YAxis
                                            domain={[0, 100]}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fill: "#64748b",
                                                fontSize: 12,
                                            }}
                                        />

                                        <Tooltip
                                            content={
                                                <PerformanceTooltip />
                                            }
                                            cursor={{
                                                stroke: "#334155",
                                                strokeDasharray:
                                                    "4 4",
                                            }}
                                        />

                                        <Line
                                            type="monotone"
                                            dataKey="score"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            dot={{
                                                r: 4,
                                                fill: "#3b82f6",
                                                strokeWidth: 0,
                                            }}
                                            activeDot={{
                                                r: 6,
                                                fill: "#60a5fa",
                                            }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="border-white/10 bg-[#111a2d] p-6 text-white">
                    <div>
                        <h3 className="text-sm font-semibold">
                            Interview Distribution
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                            Interviews grouped by interview type
                        </p>
                    </div>

                    <div className="mt-6">
                        {distributionData.length === 0 ? (
                            <EmptyChartState message="Your interview distribution will appear here." />
                        ) : (
                            <div className="grid items-center gap-6 sm:grid-cols-[minmax(0,1fr)_180px]">
                                <div className="relative h-72">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <PieChart>
                                            <Pie
                                                data={
                                                    distributionData
                                                }
                                                dataKey="count"
                                                nameKey="type"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={68}
                                                outerRadius={98}
                                                paddingAngle={4}
                                                stroke="none"
                                            >
                                                {distributionData.map(
                                                    (
                                                        item,
                                                        index,
                                                    ) => (
                                                        <Cell
                                                            key={`${item.type}-${index}`}
                                                            fill={
                                                                CHART_COLORS[
                                                                    index %
                                                                        CHART_COLORS.length
                                                                ]
                                                            }
                                                        />
                                                    ),
                                                )}
                                            </Pie>

                                            <Tooltip
                                                content={
                                                    <DistributionTooltip />
                                                }
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>

                                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold">
                                            {totalInterviews}
                                        </span>

                                        <span className="mt-1 text-xs text-slate-500">
                                            Total
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {distributionData.map(
                                        (item, index) => (
                                            <div
                                                key={item.type}
                                                className="flex items-center justify-between gap-4"
                                            >
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <span
                                                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                CHART_COLORS[
                                                                    index %
                                                                        CHART_COLORS.length
                                                                ],
                                                        }}
                                                    />

                                                    <span className="truncate text-sm text-slate-300">
                                                        {item.type}
                                                    </span>
                                                </div>

                                                <span className="text-sm font-semibold text-white">
                                                    {item.count}
                                                </span>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </section>
    );
}