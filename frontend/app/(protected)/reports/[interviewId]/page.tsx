"use client";

import { useCallback, useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Lightbulb,
  Loader2,
  RefreshCw,
  Target,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  getInterview,
  getInterviewQuestions,
  type InterviewDetail,
  type InterviewQuestion,
} from "@/lib/api/interviews";

import {
  getInterviewResponses,
  type InterviewResponse,
} from "@/lib/api/responses";

import {
  downloadReportPdf,
  generateReport,
  getReport,
  type InterviewReport,
} from "@/lib/api/reports";

export default function ReportPage() {
  const params = useParams<{
    interviewId: string;
  }>();

  const router = useRouter();

  const interviewId = params.interviewId;

  const [interview, setInterview] = useState<InterviewDetail | null>(null);

  const [report, setReport] = useState<InterviewReport | null>(null);

  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);

  const [responses, setResponses] = useState<InterviewResponse[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const [pdfError, setPdfError] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [interviewData, questionData, responseData] = await Promise.all([
        getInterview(interviewId),
        getInterviewQuestions(interviewId),
        getInterviewResponses(interviewId),
      ]);

      let reportData: InterviewReport;

      try {
        reportData = await getReport(interviewId);
      } catch {
        /*
         * Recovery for completed
         * interviews that don't
         * have a report yet.
         */
        reportData = await generateReport(interviewId);
      }

      const sortedQuestions = [...questionData].sort(
        (first, second) => first.question_number - second.question_number,
      );

      const sortedResponses = [...responseData].sort(
        (first, second) => first.question_number - second.question_number,
      );

      setInterview(interviewData);

      setReport(reportData);

      setQuestions(sortedQuestions);

      setResponses(sortedResponses);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load interview report.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [interviewId]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);

      setPdfError(null);

      await downloadReportPdf(interviewId);

      /*
       * Refresh report data so
       * pdf_storage_path reflects
       * the newly generated file.
       */
      const refreshedReport = await getReport(interviewId);

      setReport(refreshedReport);
    } catch (error) {
      setPdfError(
        error instanceof Error ? error.message : "Failed to download PDF.",
      );
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#050d1d]">
        <div className="text-center">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-blue-400" />

          <p className="mt-4 text-sm text-slate-400">
            Preparing your report...
          </p>
        </div>
      </div>
    );
  }

  if (error || !interview || !report) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#050d1d] px-4">
        <div className="w-full max-w-md rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <TriangleAlert className="mx-auto h-8 w-8 text-red-400" />

          <p className="mt-4 text-sm text-red-400">
            {error ?? "Report could not be loaded."}
          </p>

          <div className="mt-5 flex justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => void loadReport()}
              className="border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>

            <Button type="button" onClick={() => router.push("/interviews")}>
              Interviews
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const scoreItems = [
    {
      label: "Technical",
      value: report.technical_score,
    },
    {
      label: "Communication",
      value: report.communication_score,
    },
    {
      label: "Confidence",
      value: report.confidence_score,
    },
    {
      label: "Fluency",
      value: report.fluency_score,
    },
  ];

  return (
    <div className="min-h-full bg-[#050d1d] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}

        <div className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.push("/interviews")}
              className="mb-4 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Interviews
            </button>

            <p className="text-sm font-medium text-blue-400">
              Interview Report
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {interview.job_role}
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              {formatLabel(interview.interview_type)}
              {" • "}
              {formatLabel(interview.difficulty)}
              {" • "}
              {questions.length} questions
            </p>
          </div>

          <Button
            type="button"
            onClick={() => void handleDownloadPdf()}
            disabled={isDownloadingPdf}
            className="bg-blue-600 text-white hover:bg-blue-500"
          >
            {isDownloadingPdf ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}

            {isDownloadingPdf ? "Preparing PDF..." : "Download PDF"}
          </Button>
        </div>

        {/* PDF error */}

        {pdfError ? (
          <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-400">{pdfError}</p>
          </div>
        ) : null}

        {/* Overall score */}

        <div className="mt-6 grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Card className="flex flex-col items-center justify-center border-white/10 bg-[#111a2d] p-8 text-center">
            <div className="flex h-36 w-36 items-center justify-center rounded-full border-[10px] border-blue-500/20 bg-blue-500/5">
              <div>
                <p className="text-4xl font-bold text-white">
                  {formatScore(report.overall_score)}
                </p>

                <p className="mt-1 text-xs text-slate-400">Overall Score</p>
              </div>
            </div>

            <h2 className="mt-5 text-lg font-semibold text-white">
              {getPerformanceLabel(report.overall_score)}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Based on your performance across all interview questions.
            </p>
          </Card>

          {/* Score breakdown */}

          <Card className="border-white/10 bg-[#111a2d] p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-blue-400" />

              <div>
                <h2 className="font-semibold text-white">
                  Performance Breakdown
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Average scores across all responses
                </p>
              </div>
            </div>

            <div className="mt-7 space-y-6">
              {scoreItems.map((item) => (
                <ScoreBar
                  key={item.label}
                  label={item.label}
                  score={item.value}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* Feedback */}

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <FeedbackCard
            title="Strengths"
            icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
            items={report.strengths}
          />

          <FeedbackCard
            title="Areas to Improve"
            icon={<Target className="h-5 w-5 text-amber-400" />}
            items={report.weaknesses}
          />

          <FeedbackCard
            title="Suggestions"
            icon={<Lightbulb className="h-5 w-5 text-blue-400" />}
            items={report.suggestions}
          />
        </div>

        {/* Question feedback */}

        <section className="mt-8">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Question Feedback
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Review your performance for each interview question.
            </p>
          </div>

          <div className="mt-5 space-y-4">
            {questions.map((question) => {
              const response = responses.find(
                (item) => item.question_number === question.question_number,
              );

              return (
                <QuestionFeedbackCard
                  key={question.id}
                  question={question}
                  response={response}
                />
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

interface ScoreBarProps {
  label: string;
  score: number;
}

function ScoreBar({ label, score }: ScoreBarProps) {
  const safeScore = Math.max(0, Math.min(score, 100));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-slate-300">{label}</span>

        <span className="text-sm font-semibold text-white">
          {formatScore(safeScore)}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-500"
          style={{
            width: `${safeScore}%`,
          }}
        />
      </div>
    </div>
  );
}

interface FeedbackCardProps {
  title: string;
  icon: React.ReactNode;
  items: string[];
}

function FeedbackCard({ title, icon, items }: FeedbackCardProps) {
  return (
    <Card className="border-white/10 bg-[#111a2d] p-6">
      <div className="flex items-center gap-3">
        {icon}

        <h2 className="font-semibold text-white">{title}</h2>
      </div>

      <ul className="mt-5 space-y-3">
        {items.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className="flex gap-3 text-sm leading-6 text-slate-400"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500" />

            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

interface QuestionFeedbackCardProps {
  question: InterviewQuestion;
  response: InterviewResponse | undefined;
}

function QuestionFeedbackCard({
  question,
  response,
}: QuestionFeedbackCardProps) {
  return (
    <Card className="border-white/10 bg-[#111a2d] p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            Question {question.question_number}
          </p>

          <h3 className="mt-2 text-sm font-medium leading-6 text-white sm:text-base">
            {question.question}
          </h3>
        </div>

        {response?.overall_score != null ? (
          <div className="shrink-0 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-center">
            <p className="text-lg font-bold text-blue-300">
              {formatScore(response.overall_score)}
            </p>

            <p className="text-[10px] uppercase tracking-wide text-slate-500">
              Score
            </p>
          </div>
        ) : null}
      </div>

      {response ? (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MiniScore label="Technical" score={response.technical_score} />

            <MiniScore
              label="Communication"
              score={response.communication_score}
            />

            <MiniScore label="Confidence" score={response.confidence_score} />

            <MiniScore label="Fluency" score={response.fluency_score} />
          </div>

          {response.transcript ? (
            <div className="mt-5 rounded-lg border border-white/5 bg-[#0c1527] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Your Answer
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                {response.transcript}
              </p>
            </div>
          ) : null}

          {response.question_feedback ? (
            <div className="mt-4 rounded-lg border border-blue-500/10 bg-blue-500/5 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-blue-400">
                AI Feedback
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                {response.question_feedback}
              </p>
            </div>
          ) : null}
        </>
      ) : (
        <p className="mt-4 text-sm text-slate-500">
          No response was found for this question.
        </p>
      )}
    </Card>
  );
}

interface MiniScoreProps {
  label: string;
  score: number | null;
}

function MiniScore({ label, score }: MiniScoreProps) {
  return (
    <div className="rounded-lg border border-white/5 bg-[#0c1527] px-3 py-3">
      <p className="text-xs text-slate-500">{label}</p>

      <p className="mt-1 text-sm font-semibold text-white">
        {score !== null ? formatScore(score) : "--"}
      </p>
    </div>
  );
}

function formatScore(score: number): string {
  const rounded = Math.round(score * 10) / 10;

  return `${rounded}%`;
}

function formatLabel(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getPerformanceLabel(score: number): string {
  if (score >= 90) {
    return "Excellent Performance";
  }

  if (score >= 80) {
    return "Great Performance";
  }

  if (score >= 70) {
    return "Good Performance";
  }

  if (score >= 60) {
    return "Fair Performance";
  }

  return "Keep Practicing";
}
