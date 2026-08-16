"use client";

import { useCallback, useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { Loader2, RefreshCw } from "lucide-react";

import {
  AIInterviewerPanel,
  InterviewHeader,
  QuestionCard,
  VoiceRecorder,
} from "@/components/interview-room";

import { Button } from "@/components/ui/button";

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

import {
  completeInterview,
  getInterview,
  getInterviewQuestions,
  pauseInterview,
  pauseInterviewKeepAlive,
  resumeInterview,
  type InterviewDetail,
  type InterviewQuestion,
} from "@/lib/api/interviews";

import { getInterviewResponses } from "@/lib/api/responses";

export default function InterviewRoomPage() {
  const params = useParams<{
    interviewId: string;
  }>();

  const router = useRouter();

  const interviewId = params.interviewId;

  const [interview, setInterview] = useState<InterviewDetail | null>(null);

  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [isCompletingInterview, setIsCompletingInterview] = useState(false);

  const [completionError, setCompletionError] = useState<string | null>(null);

  const [isCompleted, setIsCompleted] = useState(false);

  const [elapsedTime, setElapsedTime] = useState(0);

  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);

  const [isLeavingInterview, setIsLeavingInterview] = useState(false);

  /*
   * Load interview,
   * questions,
   * responses,
   * and resume active timer.
   */
  const loadInterviewRoom = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setCompletionError(null);

      const [interviewData, questionData, responseData] = await Promise.all([
        getInterview(interviewId),
        getInterviewQuestions(interviewId),
        getInterviewResponses(interviewId),
      ]);

      const sortedQuestions = [...questionData].sort(
        (first, second) => first.question_number - second.question_number,
      );

      setQuestions(sortedQuestions);

      /*
       * Already completed.
       */
      if (interviewData.status.toLowerCase() === "completed") {
        setInterview(interviewData);

        setElapsedTime(interviewData.duration_seconds ?? 0);

        setIsCompleted(true);

        return;
      }

      /*
       * Resume active timer.
       */
      let activeInterview = interviewData;

      if (interviewData.status.toLowerCase() === "in_progress") {
        activeInterview = await resumeInterview(interviewId);
      }

      setInterview(activeInterview);

      setElapsedTime(activeInterview.duration_seconds ?? 0);

      /*
       * Determine already
       * answered questions.
       */
      const answeredQuestionNumbers = new Set(
        responseData.map((response) => response.question_number),
      );

      /*
       * Find first unanswered
       * question.
       */
      const firstUnansweredIndex = sortedQuestions.findIndex(
        (question) => !answeredQuestionNumbers.has(question.question_number),
      );

      /*
       * Resume interview from first
       * unanswered question.
       */
      if (firstUnansweredIndex !== -1) {
        setCurrentQuestionIndex(firstUnansweredIndex);

        return;
      }

      /*
       * Recovery case:
       *
       * All questions already have
       * responses, but interview
       * was never finalized.
       */
      if (sortedQuestions.length > 0) {
        try {
          setIsCompletingInterview(true);

          const completedInterview = await completeInterview(interviewId);

          setInterview(completedInterview);

          setElapsedTime(completedInterview.duration_seconds ?? 0);

          setIsCompleted(true);
        } catch (error) {
          setCompletionError(
            error instanceof Error
              ? error.message
              : "All answers were submitted, but the interview could not be finalized.",
          );
        } finally {
          setIsCompletingInterview(false);
        }
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to load interview.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [interviewId]);

  /*
   * Initial room load.
   */
  useEffect(() => {
    void loadInterviewRoom();
  }, [loadInterviewRoom]);

  /*
   * Live visual timer.
   */
  useEffect(() => {
    if (!interview) {
      return;
    }

    if (interview.status.toLowerCase() !== "in_progress") {
      setElapsedTime(interview.duration_seconds ?? 0);

      return;
    }

    const savedDuration = interview.duration_seconds ?? 0;

    if (!interview.last_resumed_at) {
      setElapsedTime(savedDuration);

      return;
    }

    const resumedAt = new Date(interview.last_resumed_at).getTime();

    if (Number.isNaN(resumedAt)) {
      setElapsedTime(savedDuration);

      return;
    }

    const updateTimer = () => {
      const activeSegmentSeconds = Math.max(
        Math.floor((Date.now() - resumedAt) / 1000),
        0,
      );

      setElapsedTime(savedDuration + activeSegmentSeconds);
    };

    updateTimer();

    const timer = window.setInterval(updateTimer, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [interview]);

  /*
   * Pause active interview
   * during normal navigation.
   */
  const pauseCurrentInterview = useCallback(async () => {
    if (
      !interview ||
      interview.status.toLowerCase() !== "in_progress" ||
      !interview.last_resumed_at
    ) {
      return;
    }

    try {
      const pausedInterview = await pauseInterview(interview.id);

      setInterview(pausedInterview);

      setElapsedTime(pausedInterview.duration_seconds ?? 0);
    } catch (error) {
      console.error("Failed to pause interview:", error);
    }
  }, [interview]);

  /*
   * Pause when browser/tab
   * is closed, refreshed,
   * or navigated away.
   */
  useEffect(() => {
    if (
      !interview ||
      interview.status.toLowerCase() !== "in_progress" ||
      !interview.last_resumed_at
    ) {
      return;
    }

    const handlePageHide = () => {
      void pauseInterviewKeepAlive(interview.id);
    };

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [interview]);

  /*
   * Explicitly leave room.
   */
  const handleLeaveInterview = async () => {
    try {
      setIsLeavingInterview(true);
      await pauseCurrentInterview();
      setShowLeaveConfirmation(false);
      router.push("/interviews");
    } finally {
      setIsLeavingInterview(false);
    }
  };

  /*
   * Called only after:
   *
   * audio upload
   * transcription
   * AI evaluation
   * DB persistence
   *
   * all succeed.
   */
  const handleResponseSubmitted = async () => {
    const isLastQuestion = currentQuestionIndex >= questions.length - 1;

    /*
     * More questions remain.
     */
    if (!isLastQuestion) {
      setCurrentQuestionIndex((currentIndex) => currentIndex + 1);

      return;
    }

    /*
     * Last answer completed.
     */
    try {
      setIsCompletingInterview(true);

      setCompletionError(null);

      const completedInterview = await completeInterview(interviewId);

      setInterview(completedInterview);

      setElapsedTime(completedInterview.duration_seconds ?? 0);

      setIsCompleted(true);
    } catch (error) {
      setCompletionError(
        error instanceof Error
          ? error.message
          : "Failed to complete interview.",
      );
    } finally {
      setIsCompletingInterview(false);
    }
  };

  /*
   * Initial loading
   */
  if (isLoading) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center bg-[#050d1d]">
        <div className="text-center">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-blue-400" />

          <p className="mt-4 text-sm text-slate-400">
            Preparing your interview...
          </p>
        </div>
      </div>
    );
  }

  /*
   * Loading error
   */
  if (error || !interview) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center bg-[#050d1d] px-4">
        <div className="max-w-md rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <p className="text-sm text-red-400">
            {error ?? "Interview could not be loaded."}
          </p>

          <div className="mt-5 flex justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => void loadInterviewRoom()}
              className="border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>

            <Button type="button" onClick={() => router.push("/interviews")}>
              Back to Interviews
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * No questions
   */
  if (questions.length === 0) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center bg-[#050d1d] px-4">
        <div className="max-w-md rounded-xl border border-white/10 bg-[#111a2d] p-6 text-center">
          <h1 className="text-lg font-semibold text-white">
            No questions available
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Interview questions were not found for this session.
          </p>

          <Button
            type="button"
            className="mt-5"
            onClick={() => router.push("/interviews")}
          >
            Back to Interviews
          </Button>
        </div>
      </div>
    );
  }

  /*
   * Completed state
   */
  if (isCompleted) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center bg-[#050d1d] px-4">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111a2d] p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <span className="text-3xl text-emerald-400">✓</span>
          </div>

          <h1 className="mt-5 text-2xl font-bold text-white">
            Interview Completed
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            You&apos;ve completed all interview questions. Your responses have
            been saved and evaluated.
          </p>

          <div className="mt-4 rounded-lg border border-white/10 bg-[#0c1527] px-4 py-3">
            <p className="text-xs text-slate-500">Active Interview Time</p>

            <p className="mt-1 font-mono text-lg font-semibold text-white">
              {formatInterviewTime(elapsedTime)}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/interviews")}
              className="border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              Back to Interviews
            </Button>

            <Button
              type="button"
              onClick={() => router.push(`/reports/${interviewId}`)}
              className="bg-blue-600 text-white hover:bg-blue-500"
            >
              View Report
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#050d1d]">
      <InterviewHeader
        jobRole={interview.job_role}
        interviewType={interview.interview_type}
        difficulty={interview.difficulty}
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={questions.length}
        elapsedTime={elapsedTime}
        onEnd={() => {
          setShowLeaveConfirmation(true);
        }}
      />

      <div className="grid min-h-0 flex-1 gap-4 overflow-hidden p-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <main className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#071126] p-5 lg:p-6">
          <QuestionCard
            questionNumber={currentQuestion.question_number}
            question={currentQuestion.question}
          />

          <VoiceRecorder
            key={currentQuestion.question_number}
            interviewId={interview.id}
            questionNumber={currentQuestion.question_number}
            onSubmitted={handleResponseSubmitted}
          />

          {completionError ? (
            <div className="mx-auto mb-2 max-w-md rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-center">
              <p className="text-sm text-red-400">{completionError}</p>

              <Button
                type="button"
                variant="outline"
                disabled={isCompletingInterview}
                onClick={() => void handleResponseSubmitted()}
                className="mt-3 border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-200"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Completion
              </Button>
            </div>
          ) : null}
        </main>

        <AIInterviewerPanel />
      </div>

      {isCompletingInterview ? (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#050d1d]/80 backdrop-blur-sm">
          <div className="rounded-xl border border-white/10 bg-[#111a2d] px-8 py-6 text-center shadow-xl">
            <Loader2 className="mx-auto h-7 w-7 animate-spin text-blue-400" />

            <p className="mt-3 text-sm font-medium text-slate-200">
              Completing your interview...
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Please don&apos;t close this page.
            </p>
          </div>
        </div>
      ) : null}

      <AlertDialog
        open={showLeaveConfirmation}
        onOpenChange={(open) => {
          if (!isLeavingInterview) {
            setShowLeaveConfirmation(open);
          }
        }}
      >
        <AlertDialogContent className="border-white/10 bg-[#111a2d] text-white sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-white">
              Leave Interview?
            </AlertDialogTitle>

            <AlertDialogDescription className="leading-6 text-slate-400">
              Your completed answers and current progress will be saved. You can
              return later and continue from the next unanswered question.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
            <p className="text-sm leading-5 text-blue-200">
              Leaving will pause your interview timer. Time spent outside the
              interview will not be counted.
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isLeavingInterview}
              className="border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            >
              Continue Interview
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={isLeavingInterview}
              onClick={(event) => {
                event.preventDefault();

                void handleLeaveInterview();
              }}
              className="bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-500"
            >
              {isLeavingInterview ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Leaving...
                </>
              ) : (
                "Leave Interview"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function formatInterviewTime(totalSeconds: number): string {
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
