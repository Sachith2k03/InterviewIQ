"use client";

import {
  Gauge,
  GraduationCap,
  Rocket,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type InterviewDifficultyValue =
  | "easy"
  | "medium"
  | "hard";

interface DifficultyStepProps {
  difficulty: InterviewDifficultyValue | null;
  questionCount: number;
  onDifficultyChange: (
    difficulty: InterviewDifficultyValue,
  ) => void;
  onQuestionCountChange: (
    questionCount: number,
  ) => void;
  onBack: () => void;
  onContinue: () => void;
}

interface DifficultyOption {
  value: InterviewDifficultyValue;
  title: string;
  description: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
}

const difficultyOptions: DifficultyOption[] = [
  {
    value: "easy",
    title: "Beginner",
    description:
      "Great for building confidence and practicing core concepts.",
    icon: GraduationCap,
  },
  {
    value: "medium",
    title: "Intermediate",
    description:
      "Balanced questions with realistic interview-level challenges.",
    icon: Gauge,
  },
  {
    value: "hard",
    title: "Advanced",
    description:
      "Challenging questions designed for deeper technical preparation.",
    icon: Rocket,
  },
];

const questionCountOptions = [5, 10, 15, 20];

export default function DifficultyStep({
  difficulty,
  questionCount,
  onDifficultyChange,
  onQuestionCountChange,
  onBack,
  onContinue,
}: DifficultyStepProps) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to Resume Selection
        </button>

        <p className="mt-6 text-sm font-medium text-blue-400">
          Step 4 of 5
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
          Choose Your Challenge
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Select the difficulty level and how many
          questions you want in this interview.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {difficultyOptions.map((option) => {
          const Icon = option.icon;
          const isSelected =
            difficulty === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                onDifficultyChange(
                  option.value,
                )
              }
              className="text-left"
            >
              <Card
                className={`h-full min-h-48 border p-6 transition-all duration-200 ${
                  isSelected
                    ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-950/30"
                    : "border-white/10 bg-[#111a2d] hover:border-blue-500/40 hover:bg-[#14203a]"
                }`}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    isSelected
                      ? "bg-blue-500/20 text-blue-300"
                      : "bg-blue-500/10 text-blue-400"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <h2 className="mt-5 text-base font-semibold text-white">
                  {option.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {option.description}
                </p>

                {isSelected ? (
                  <span className="mt-5 inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-300">
                    Selected
                  </span>
                ) : null}
              </Card>
            </button>
          );
        })}
      </div>

      <div className="mt-8 rounded-xl border border-white/10 bg-[#111a2d] p-6">
        <div>
          <h2 className="text-base font-semibold text-white">
            Number of Questions
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Choose how many questions you want
            InterviewIQ to generate.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {questionCountOptions.map(
            (count) => {
              const isSelected =
                questionCount === count;

              return (
                <button
                  key={count}
                  type="button"
                  onClick={() =>
                    onQuestionCountChange(
                      count,
                    )
                  }
                  className={`rounded-lg border px-4 py-4 text-center transition ${
                    isSelected
                      ? "border-blue-500 bg-blue-500/10 text-blue-300"
                      : "border-white/10 bg-[#0c1527] text-slate-300 hover:border-blue-500/40 hover:text-white"
                  }`}
                >
                  <span className="text-lg font-semibold">
                    {count}
                  </span>

                  <span className="mt-1 block text-xs text-slate-500">
                    Questions
                  </span>
                </button>
              );
            },
          )}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="border-white/10 bg-white/5 text-white hover:bg-white/10"
        >
          Back
        </Button>

        <Button
          type="button"
          onClick={onContinue}
          disabled={!difficulty}
          className="min-w-36 bg-blue-600 text-white hover:bg-blue-500"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}