"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Briefcase,
  Calendar,
  Clock,
  FileText,
  Loader2,
  Trash2,
  Trophy,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  onClick?: () => void;
}

function formatInterviewType(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatStatus(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDuration(durationSeconds: number | null): string {
  if (durationSeconds === null || durationSeconds <= 0) {
    return "--";
  }

  const minutes = Math.floor(durationSeconds / 60);

  const seconds = durationSeconds % 60;

  if (minutes === 0) {
    return `${seconds} sec`;
  }

  if (seconds === 0) {
    return `${minutes} min`;
  }

  return `${minutes} min ${seconds} sec`;
}

function getStatusClasses(status: string): string {
  switch (status.toLowerCase()) {
    case "completed":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";

    case "in_progress":
      return "border-blue-500/20 bg-blue-500/10 text-blue-400";

    case "cancelled":
      return "border-red-500/20 bg-red-500/10 text-red-400";

    case "pending":
      return "border-amber-500/20 bg-amber-500/10 text-amber-400";

    default:
      return "border-white/10 bg-white/5 text-slate-400";
  }
}

export function InterviewCard({
  interview,
  onDeleted,
  onClick,
}: InterviewCardProps) {
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);

  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const normalizedStatus = interview.status.toLowerCase();

  const isCompleted = normalizedStatus === "completed";

  const interviewDate = new Date(interview.created_at).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );

  useEffect(() => {
    if (!deleteError) {
      return;
    }

    const timer = setTimeout(() => {
      setDeleteError(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [deleteError]);

  const handleCardClick = () => {
    if (isDeleting) {
      return;
    }

    if (onClick) {
      onClick();
      return;
    }

    /*
     * Completed interviews should open
     * their report.
     *
     * Non-completed interviews can open
     * the interview route.
     */
    if (isCompleted) {
      router.push(`/reports/${interview.id}`);

      return;
    }

    router.push(`/interviews/${interview.id}`);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setDeleteError(null);

      await deleteInterview(interview.id);

      setShowDeleteConfirmation(false);

      onDeleted();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete interview.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();

            handleCardClick();
          }
        }}
        className="
          cursor-pointer
          border-white/10
          bg-[#111a2d]
          p-5
          text-white
          transition-all
          duration-200
          hover:border-blue-500/30
          hover:bg-[#14203a]
          sm:p-6
        "
      >
        {/* Top */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-white">
              {interview.job_role}
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              {formatInterviewType(interview.interview_type)}
            </p>
          </div>

          <Badge
            variant="outline"
            className={`w-fit ${getStatusClasses(interview.status)}`}
          >
            {formatStatus(interview.status)}
          </Badge>
        </div>

        {/* Information */}
        <div className="mt-5 grid grid-cols-1 gap-4 text-sm text-slate-300 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 shrink-0 text-slate-500" />

            <span>{formatInterviewType(interview.difficulty)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 shrink-0 text-slate-500" />

            <span>
              {interview.overall_score !== null
                ? `${interview.overall_score}%`
                : "Not evaluated"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-slate-500" />

            <span>{interviewDate}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-slate-500" />

            <span>{formatDuration(interview.duration_seconds)}</span>
          </div>

          <div className="flex min-w-0 items-center gap-2 sm:col-span-2">
            <FileText className="h-4 w-4 shrink-0 text-slate-500" />

            <span className="truncate">
              {interview.resume_title ?? "Resume unavailable"}
            </span>
          </div>
        </div>

        {/* Error */}
        {deleteError ? (
          <div className="mt-5 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
            <p className="text-sm text-red-400">{deleteError}</p>
          </div>
        ) : null}

        {/* Actions */}
        <div
          className="mt-6 flex flex-col-reverse gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-end"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={() => setShowDeleteConfirmation(true)}
            className="
              border-red-500/20
              bg-red-500/10
              text-red-400
              hover:border-red-500/40
              hover:bg-red-500/15
              hover:text-red-300
            "
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>

          {isCompleted ? (
            <Button
              asChild
              variant="outline"
              className="
                border-white/10
                bg-white/5
                text-slate-200
                hover:bg-white/10
                hover:text-white
              "
            >
              <Link href={`/reports/${interview.id}`}>View Report</Link>
            </Button>
          ) : null}
        </div>
      </Card>

      {/* Delete confirmation */}
      <AlertDialog
        open={showDeleteConfirmation}
        onOpenChange={(open) => {
          if (!isDeleting) {
            setShowDeleteConfirmation(open);
          }
        }}
      >
        <AlertDialogContent className="border-white/10 bg-[#111a2d] text-white sm:max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
                <Trash2 className="h-5 w-5" />
              </div>

              <AlertDialogTitle className="text-lg text-white">
                Delete Interview
              </AlertDialogTitle>
            </div>

            <AlertDialogDescription className="pt-2 leading-6 text-slate-400">
              Are you sure you want to permanently delete your{" "}
              <span className="font-medium text-slate-200">
                {interview.job_role}
              </span>{" "}
              interview?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
            <p className="text-sm leading-5 text-red-300">
              This will remove the interview and its associated responses and
              report data. This action cannot be undone.
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="
                border-white/10
                bg-white/5
                text-slate-300
                hover:bg-white/10
                hover:text-white
              "
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();

                void handleDelete();
              }}
              className="
                bg-red-600
                text-white
                hover:bg-red-500
                focus-visible:ring-red-500
              "
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Interview
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
