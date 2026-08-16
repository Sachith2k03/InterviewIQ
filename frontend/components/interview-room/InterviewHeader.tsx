"use client";

import { Clock, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface InterviewHeaderProps {
  jobRole: string;
  interviewType: string;
  difficulty: string;

  currentQuestion: number;
  totalQuestions: number;

  elapsedTime: number;

  onEnd: () => void;
}

function formatLabel(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatTimer(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);

  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}`;
}

export default function InterviewHeader({
  jobRole,
  interviewType,
  difficulty,
  currentQuestion,
  totalQuestions,
  elapsedTime,
  onEnd,
}: InterviewHeaderProps) {
  const progress =
    totalQuestions > 0 ? (currentQuestion / totalQuestions) * 100 : 0;

  return (
    <header className="shrink-0 border-b border-white/10 bg-[#050d1d]">
      <div className="flex items-center justify-between gap-4 px-5 py-3 sm:px-7">
        {/* Interview info */}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{jobRole}</p>

          <p className="mt-1 text-xs text-slate-500">
            {formatLabel(interviewType)}

            {" · "}

            {formatLabel(difficulty)}
          </p>
        </div>

        {/* Right controls */}
        <div className="flex shrink-0 items-center gap-3">
          {/* Active timer */}
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <Clock className="h-4 w-4 text-blue-400" />

            <span className="font-mono text-sm font-medium tabular-nums text-slate-200">
              {formatTimer(elapsedTime)}
            </span>
          </div>

          {/* Question progress */}
          <p className="hidden whitespace-nowrap text-sm text-slate-400 sm:block">
            Question{" "}
            <span className="font-medium text-white">{currentQuestion}</span> of{" "}
            {totalQuestions}
          </p>

          {/* End */}
          <Button
            type="button"
            variant="outline"
            onClick={onEnd}
            className="border-red-500/20 bg-red-500/10 text-red-400 hover:border-red-500/40 hover:bg-red-500/15 hover:text-red-300"
          >
            <X className="mr-2 h-4 w-4" />

            <span className="hidden sm:inline">End Interview</span>

            <span className="sm:hidden">End</span>
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/5">
        <div
          className="h-full bg-blue-500 transition-all duration-500"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </header>
  );
}
