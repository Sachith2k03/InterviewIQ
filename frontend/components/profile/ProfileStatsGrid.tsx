import {
    Award,
    CheckCircle2,
    Clock3,
    Trophy,
} from "lucide-react";

import { Card } from "@/components/ui/card";

interface ProfileStatsGridProps {
    completedInterviews: number;
    averageScore: number | null;
    practiceMinutes: number;
    bestScore: number | null;
}

interface StatCardProps {
    label: string;
    value: string;
    description: string;
    icon: React.ComponentType<{
        className?: string;
    }>;
}

function formatPracticeTime(
    totalMinutes: number,
): string {
    if (totalMinutes <= 0) {
        return "0 min";
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
        return `${minutes} min`;
    }

    if (minutes === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${minutes}m`;
}

function StatCard({
    label,
    value,
    description,
    icon: Icon,
}: StatCardProps) {
    return (
        <Card className="border-white/10 bg-[#111a2d] p-5 text-white">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {label}
                    </p>

                    <p className="mt-2 text-2xl font-bold">
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        {description}
                    </p>
                </div>

                <div className="rounded-lg bg-blue-500/10 p-3 text-blue-400">
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </Card>
    );
}

export function ProfileStatsGrid({
    completedInterviews,
    averageScore,
    practiceMinutes,
    bestScore,
}: ProfileStatsGridProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
                label="Interviews Completed"
                value={completedInterviews.toString()}
                description="Completed practice sessions"
                icon={CheckCircle2}
            />

            <StatCard
                label="Average Score"
                value={
                    averageScore !== null
                        ? `${Math.round(averageScore)}%`
                        : "--"
                }
                description="Across evaluated interviews"
                icon={Award}
            />

            <StatCard
                label="Practice Time"
                value={formatPracticeTime(
                    practiceMinutes,
                )}
                description="Total interview duration"
                icon={Clock3}
            />

            <StatCard
                label="Best Score"
                value={
                    bestScore !== null
                        ? `${Math.round(bestScore)}%`
                        : "--"
                }
                description="Highest overall score"
                icon={Trophy}
            />
        </div>
    );
}