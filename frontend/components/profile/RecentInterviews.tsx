import Link from "next/link";
import {
    ArrowRight,
    CalendarDays,
    FileText,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export interface RecentInterviewItem {
    id: string;
    jobRole: string;
    interviewType: string;
    status: string;
    overallScore: number | null;
    createdAt: string;
}

interface RecentInterviewsProps {
    interviews: RecentInterviewItem[];
}

function formatLabel(value: string): string {
    return value
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase(),
        );
}

function formatDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function getStatusVariant(
    status: string,
): "default" | "secondary" | "outline" | "destructive" {
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus === "completed") {
        return "default";
    }

    if (
        normalizedStatus === "pending" ||
        normalizedStatus === "in_progress"
    ) {
        return "secondary";
    }

    if (
        normalizedStatus === "cancelled" ||
        normalizedStatus === "failed"
    ) {
        return "destructive";
    }

    return "outline";
}

export function RecentInterviews({
    interviews,
}: RecentInterviewsProps) {
    return (
        <section className="space-y-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                    <h2 className="text-lg font-semibold text-white">
                        Recent Interviews
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                        Review your latest mock interview sessions.
                    </p>
                </div>

                {interviews.length > 0 ? (
                    <Button
                        asChild
                        variant="ghost"
                        className="w-fit text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                    >
                        <Link href="/interviews">
                            View All
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                ) : null}
            </div>

            <Card className="overflow-hidden border-white/10 bg-[#111a2d] text-white">
                {interviews.length === 0 ? (
                    <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
                        <div className="rounded-full bg-blue-500/10 p-4 text-blue-400">
                            <FileText className="h-6 w-6" />
                        </div>

                        <h3 className="mt-4 text-base font-semibold">
                            No interviews yet
                        </h3>

                        <p className="mt-2 max-w-md text-sm text-slate-400">
                            Complete your first mock interview to see
                            your recent activity here.
                        </p>

                        <Button asChild className="mt-5">
                            <Link href="/interviews/create">
                                Start Interview
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="divide-y divide-white/10">
                        {interviews.map((interview) => {
                            const isCompleted =
                                interview.status.toLowerCase() ===
                                "completed";

                            return (
                                <div
                                    key={interview.id}
                                    className="flex flex-col gap-4 p-5 transition hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="truncate font-medium text-slate-100">
                                                {interview.jobRole}
                                            </h3>

                                            <Badge
                                                variant={getStatusVariant(
                                                    interview.status,
                                                )}
                                            >
                                                {formatLabel(
                                                    interview.status,
                                                )}
                                            </Badge>
                                        </div>

                                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
                                            <span>
                                                {formatLabel(
                                                    interview.interviewType,
                                                )}
                                            </span>

                                            <span className="flex items-center gap-1.5">
                                                <CalendarDays className="h-3.5 w-3.5" />
                                                {formatDate(
                                                    interview.createdAt,
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                                        <div className="text-right">
                                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                                Score
                                            </p>

                                            <p className="mt-1 text-lg font-semibold">
                                                {interview.overallScore !==
                                                null
                                                    ? `${Math.round(
                                                          interview.overallScore,
                                                      )}%`
                                                    : "--"}
                                            </p>
                                        </div>

                                        {isCompleted ? (
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="sm"
                                                className="border-white/10 bg-white/5 hover:bg-white/10"
                                            >
                                                <Link
                                                    href={`/reports/${interview.id}`}
                                                >
                                                    View Report
                                                </Link>
                                            </Button>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>
        </section>
    );
}