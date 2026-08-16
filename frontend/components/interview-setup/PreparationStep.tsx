"use client";

import { useEffect, useState } from "react";
import {
  Check,
  FileText,
  Loader2,
  Mic,
  RefreshCw,
  Wifi,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PreparationStepProps {
  interviewType: string;
  jobRole: string;
  resumeTitle: string;
  difficulty: string;
  questionCount: number;
  isStarting: boolean;
  error: string | null;
  onBack: () => void;
  onStart: () => void;
}

type MicrophoneStatus =
  | "checking"
  | "ready"
  | "denied"
  | "unavailable";

function formatLabel(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

export default function PreparationStep({
  interviewType,
  jobRole,
  resumeTitle,
  difficulty,
  questionCount,
  isStarting,
  error,
  onBack,
  onStart,
}: PreparationStepProps) {
  const [microphoneStatus, setMicrophoneStatus] =
    useState<MicrophoneStatus>("checking");

  const [isOnline, setIsOnline] =
    useState<boolean>(
      typeof navigator !== "undefined"
        ? navigator.onLine
        : true,
    );

  const checkMicrophone = async () => {
    try {
      setMicrophoneStatus("checking");

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setMicrophoneStatus("unavailable");
        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      stream
        .getTracks()
        .forEach((track) => track.stop());

      setMicrophoneStatus("ready");
    } catch {
      setMicrophoneStatus("denied");
    }
  };

  useEffect(() => {
    void checkMicrophone();

    const handleOnline = () =>
      setIsOnline(true);

    const handleOffline = () =>
      setIsOnline(false);

    window.addEventListener(
      "online",
      handleOnline,
    );

    window.addEventListener(
      "offline",
      handleOffline,
    );

    return () => {
      window.removeEventListener(
        "online",
        handleOnline,
      );

      window.removeEventListener(
        "offline",
        handleOffline,
      );
    };
  }, []);

  const microphoneReady =
    microphoneStatus === "ready";

  const readyToStart =
    microphoneReady &&
    isOnline &&
    !isStarting;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div>
        <button
          type="button"
          onClick={onBack}
          disabled={isStarting}
          className="text-sm text-slate-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          ← Back to Challenge
        </button>

        <p className="mt-6 text-sm font-medium text-blue-400">
          Step 5 of 5
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
          Preparation Check
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Make sure everything is ready before
          starting your interview.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="border-white/10 bg-[#111a2d] p-6">
          <h2 className="text-base font-semibold text-white">
            System Check
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            InterviewIQ needs your microphone and an
            internet connection.
          </p>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0c1527] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <Mic className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-medium text-white">
                    Microphone
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Required for voice answers
                  </p>
                </div>
              </div>

              {microphoneStatus ===
              "checking" ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
              ) : microphoneReady ? (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  <Check className="h-4 w-4" />
                </div>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    void checkMicrophone()
                  }
                  className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                >
                  <RefreshCw className="mr-2 h-3.5 w-3.5" />
                  Retry
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0c1527] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <Wifi className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-medium text-white">
                    Internet Connection
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Required for AI processing
                  </p>
                </div>
              </div>

              {isOnline ? (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  <Check className="h-4 w-4" />
                </div>
              ) : (
                <span className="text-xs font-medium text-red-400">
                  Offline
                </span>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0c1527] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <FileText className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-medium text-white">
                    Resume Selected
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {resumeTitle}
                  </p>
                </div>
              </div>

              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <Check className="h-4 w-4" />
              </div>
            </div>
          </div>

          {!microphoneReady &&
          microphoneStatus !== "checking" ? (
            <p className="mt-4 text-sm text-amber-400">
              Allow microphone access in your browser
              before starting the interview.
            </p>
          ) : null}
        </Card>

        <Card className="border-white/10 bg-[#111a2d] p-6">
          <h2 className="text-base font-semibold text-white">
            Interview Summary
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Review your selections before starting.
          </p>

          <div className="mt-6 divide-y divide-white/10 rounded-lg border border-white/10 bg-[#0c1527]">
            <SummaryRow
              label="Interview Type"
              value={formatLabel(
                interviewType,
              )}
            />

            <SummaryRow
              label="Target Role"
              value={jobRole}
            />

            <SummaryRow
              label="Resume"
              value={resumeTitle}
            />

            <SummaryRow
              label="Difficulty"
              value={formatLabel(
                difficulty,
              )}
            />

            <SummaryRow
              label="Questions"
              value={`${questionCount}`}
            />
          </div>

          {readyToStart ? (
            <div className="mt-5 flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                <Check className="h-4 w-4" />
              </div>

              <div>
                <p className="text-sm font-medium text-emerald-300">
                  You&apos;re ready!
                </p>

                <p className="mt-1 text-xs leading-5 text-emerald-200/70">
                  Your setup is complete. Start whenever
                  you&apos;re ready.
                </p>
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-sm text-red-400">
                {error}
              </p>
            </div>
          ) : null}

          <Button
            type="button"
            onClick={onStart}
            disabled={!readyToStart}
            className="mt-6 h-11 w-full bg-blue-600 text-white hover:bg-blue-500"
          >
            {isStarting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparing Interview...
              </>
            ) : (
              "Start Interview"
            )}
          </Button>

          <p className="mt-3 text-center text-xs text-slate-500">
            Questions will be generated specifically for
            your role and selected resume.
          </p>
        </Card>
      </div>
    </div>
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
}

function SummaryRow({
  label,
  value,
}: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="max-w-60 truncate text-right text-sm font-medium text-slate-200">
        {value}
      </span>
    </div>
  );
}