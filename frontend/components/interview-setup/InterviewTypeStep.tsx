"use client";

import {
  BriefcaseBusiness,
  Code2,
  HeartHandshake,
  Network,
  UsersRound,
} from "lucide-react";

import { Card } from "@/components/ui/card";


export type InterviewTypeValue =
  | "technical"
  | "behavioral"
  | "system_design"
  | "hr"
  | "mixed";

interface InterviewTypeOption {
  value: InterviewTypeValue;
  title: string;
  description: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
}

interface InterviewTypeStepProps {
  selectedType: InterviewTypeValue | null;
  onSelect: (type: InterviewTypeValue) => void;
}

const interviewTypes: InterviewTypeOption[] = [
  {
    value: "technical",
    title: "Technical",
    description:
      "Solve coding and technical problems tailored to your role.",
    icon: Code2,
  },
  {
    value: "behavioral",
    title: "Behavioral",
    description:
      "Practice communication, teamwork, and situational questions.",
    icon: UsersRound,
  },
  {
    value: "system_design",
    title: "System Design",
    description:
      "Work through architecture and real-world system design scenarios.",
    icon: Network,
  },
  {
    value: "hr",
    title: "HR Interview",
    description:
      "Practice common HR and company-fit interview questions.",
    icon: HeartHandshake,
  },
  {
    value: "mixed",
    title: "Mixed Interview",
    description:
      "Practice a combination of different interview question types.",
    icon: BriefcaseBusiness,
  },
];

export default function InterviewTypeStep({
  selectedType,
  onSelect,
}: InterviewTypeStepProps) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div>
        <p className="text-sm font-medium text-blue-400">
          Step 1 of 5
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
          Choose Interview Type
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Select the type of interview you want to practice.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {interviewTypes.map((type) => {
          const Icon = type.icon;
          const isSelected =
            selectedType === type.value;

          return (
            <button
              key={type.value}
              type="button"
              onClick={() =>
                onSelect(type.value)
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
                  {type.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {type.description}
                </p>

                {isSelected ? (
                  <div className="mt-5">
                    <span className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-300">
                      Selected
                    </span>
                  </div>
                ) : null}
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}