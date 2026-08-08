"use client";

import Link from "next/link";
import { useState } from "react";
import {
    Briefcase,
    Calendar,
    Clock,
    FileText,
    Loader2,
    Trash2,
    Trophy,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    deleteInterview,
    type InterviewHistoryItem,
} from "@/lib/api/interviews";

interface InterviewCardProps {
    interview: InterviewHistoryItem;
    onDeleted: () => void;
}

function formatInterviewType(value: string): string {
    return value
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase(),
        );
}

function formatStatus(value: string): string {
    return value
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase(),
        );
}

function formatDuration(
    durationSeconds: number | null,
): string {
    if (durationSeconds === null) {
        return "--";
    }

    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;

    if (minutes === 0) {
        return `${seconds} sec`;
    }

    return `${minutes} min`;
}

export function InterviewCard({
    interview,
    onDeleted,
}: InterviewCardProps) {
    const [isDeleting, setIsDeleting] =
        useState(false);
    const [deleteError, setDeleteError] =
        useState<string | null>(null);

    const interviewDate = new Date(
        interview.created_at,
    ).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    const normalizedStatus =
        interview.status.toLowerCase();

    const isCompleted =
        normalizedStatus === "completed";

    const handleDelete = async () => {
        const confirmed = window.confirm(
            `Delete the interview for "${interview.job_role}"? This action cannot be undone.`,
        );

        if (!confirmed) {
            return;
        }

        try {
            setIsDeleting(true);
            setDeleteError(null);

            await deleteInterview(interview.id);

            onDeleted();
        } catch (error) {
            setDeleteError(
                error instanceof Error
                    ? error.message
                    : "Failed to delete interview.",
            );
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Card className="p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                    <h3 className="text-lg font-semibold">
                        {interview.job_role}
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                        {formatInterviewType(
                            interview.interview_type,
                        )}
                    </p>
                </div>

                <Badge variant="secondary">
                    {formatStatus(interview.status)}
                </Badge>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />

                    <span>
                        {formatInterviewType(
                            interview.difficulty,
                        )}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-muted-foreground" />

                    <span>
                        {interview.overall_score !== null
                            ? `${interview.overall_score}%`
                            : "Not evaluated"}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />

                    <span>{interviewDate}</span>
                </div>

                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />

                    <span>
                        {formatDuration(
                            interview.duration_seconds,
                        )}
                    </span>
                </div>

                <div className="flex items-center gap-2 sm:col-span-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />

                    <span>
                        {interview.resume_title ??
                            "Resume unavailable"}
                    </span>
                </div>
            </div>

            {deleteError ? (
                <p className="mt-4 text-sm text-destructive">
                    {deleteError}
                </p>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                >
                    {isDeleting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                    )}

                    {isDeleting
                        ? "Deleting..."
                        : "Delete"}
                </Button>


                {isCompleted ? (
                    <Button
                        asChild
                        variant="outline"
                    >
                        <Link
                            href={`/reports/${interview.id}`}
                        >
                            View Report
                        </Link>
                    </Button>
                ) : null}
            </div>
        </Card>
    );
}