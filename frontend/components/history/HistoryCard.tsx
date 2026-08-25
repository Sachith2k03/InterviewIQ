import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  Clock3,
  FileText,
  Trophy,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import type { InterviewHistoryItem } from "@/lib/api/interviews";

interface HistoryCardProps {
  interview: InterviewHistoryItem;
}

function formatLabel(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDuration(durationSeconds: number | null): string {
  if (durationSeconds === null) {
    return "--";
  }

  const hours = Math.floor(durationSeconds / 3600);

  const minutes = Math.floor((durationSeconds % 3600) / 60);

  const seconds = durationSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

function getScoreStyle(score: number | null): string {
  if (score === null) {
    return "text-muted-foreground";
  }

  if (score >= 80) {
    return "text-emerald-400";
  }

  if (score >= 65) {
    return "text-blue-400";
  }

  return "text-amber-400";
}

export function HistoryCard({ interview }: HistoryCardProps) {
  const dateValue = interview.completed_at ?? interview.created_at;

  const interviewDate = new Date(dateValue).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Card className="overflow-hidden border-border/70 bg-card/70 p-0">
      <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-semibold">
              {interview.job_role}
            </h3>

            <Badge variant="secondary">
              {formatLabel(interview.interview_type)}
            </Badge>

            <Badge variant="outline">{formatLabel(interview.difficulty)}</Badge>
          </div>

          <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0" />

              <span>{interviewDate}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 shrink-0" />

              <span>{formatDuration(interview.duration_seconds)}</span>
            </div>

            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 shrink-0" />

              <span className="truncate">
                {interview.resume_title ?? "Resume unavailable"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 shrink-0" />

              <span>
                {interview.question_count}{" "}
                {interview.question_count === 1 ? "question" : "questions"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-5 border-t border-border/60 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div className="min-w-20 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Trophy className="h-3.5 w-3.5" />
              Score
            </div>

            <p
              className={`mt-1 text-2xl font-bold ${getScoreStyle(
                interview.overall_score,
              )}`}
            >
              {interview.overall_score !== null
                ? `${interview.overall_score}%`
                : "--"}
            </p>
          </div>

          <Button asChild variant="outline">
            <Link href={`/reports/${interview.id}`}>View Report</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
