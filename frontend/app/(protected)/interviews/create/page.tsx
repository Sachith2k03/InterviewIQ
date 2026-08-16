"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  DifficultyStep,
  InterviewTypeStep,
  JobRoleStep,
  PreparationStep,
  ResumeStep,
  type InterviewDifficultyValue,
  type InterviewTypeValue,
} from "@/components/interview-setup";

import {
  createInterview,
  generateInterviewQuestions,
  startInterview,
} from "@/lib/api/interviews";

interface InterviewSetupData {
  interviewType: InterviewTypeValue | null;
  jobRole: string;

  resumeId: string | null;
  resumeTitle: string;

  difficulty: InterviewDifficultyValue | null;
  questionCount: number;
}

type TransitionDirection = "forward" | "backward";

type TransitionPhase = "idle" | "exiting" | "entering";

const initialSetupData: InterviewSetupData = {
  interviewType: null,
  jobRole: "",

  resumeId: null,
  resumeTitle: "",

  difficulty: null,
  questionCount: 5,
};

const SELECTION_DELAY = 120;
const EXIT_DURATION = 180;

export default function CreateInterviewPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);

  const [setupData, setSetupData] =
    useState<InterviewSetupData>(initialSetupData);

  const [isStarting, setIsStarting] = useState(false);

  const [startError, setStartError] = useState<string | null>(null);

  const [transitionDirection, setTransitionDirection] =
    useState<TransitionDirection>("forward");

  const [transitionPhase, setTransitionPhase] =
    useState<TransitionPhase>("idle");

  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }

      if (selectionTimerRef.current) {
        clearTimeout(selectionTimerRef.current);
      }
    };
  }, []);

  const navigateToStep = (nextStep: number) => {
    if (transitionPhase !== "idle" || nextStep === step) {
      return;
    }

    const direction: TransitionDirection =
      nextStep > step ? "forward" : "backward";

    setTransitionDirection(direction);
    setTransitionPhase("exiting");

    transitionTimerRef.current = setTimeout(() => {
      setStep(nextStep);
      setTransitionPhase("entering");

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTransitionPhase("idle");
        });
      });
    }, EXIT_DURATION);
  };

  const navigateAfterSelection = (nextStep: number) => {
    if (selectionTimerRef.current) {
      clearTimeout(selectionTimerRef.current);
    }

    selectionTimerRef.current = setTimeout(() => {
      navigateToStep(nextStep);
    }, SELECTION_DELAY);
  };

  // --------------------------------
  // Step 1 - Interview Type
  // --------------------------------

  const handleInterviewTypeSelect = (type: InterviewTypeValue) => {
    setSetupData((currentData) => ({
      ...currentData,
      interviewType: type,
    }));

    navigateAfterSelection(2);
  };

  // --------------------------------
  // Step 2 - Job Role
  // --------------------------------

  const handleJobRoleSelect = (role: string) => {
    setSetupData((currentData) => ({
      ...currentData,
      jobRole: role,
    }));

    navigateAfterSelection(3);
  };

  // --------------------------------
  // Step 3 - Resume
  // --------------------------------

  const handleResumeSelect = (resumeId: string, resumeTitle: string) => {
    setSetupData((currentData) => ({
      ...currentData,
      resumeId,
      resumeTitle,
    }));

    navigateAfterSelection(4);
  };

  // --------------------------------
  // Step 4 - Difficulty + Questions
  // --------------------------------

  const handleDifficultyChange = (difficulty: InterviewDifficultyValue) => {
    setSetupData((currentData) => ({
      ...currentData,
      difficulty,
    }));
  };

  const handleQuestionCountChange = (questionCount: number) => {
    setSetupData((currentData) => ({
      ...currentData,
      questionCount,
    }));
  };

  const goToPreparationStep = () => {
    if (!setupData.difficulty) {
      return;
    }

    setStartError(null);

    navigateToStep(5);
  };

  // --------------------------------
  // Step 5 - Start Interview
  // --------------------------------

  const handleStartInterview = async () => {
    if (
      !setupData.interviewType ||
      !setupData.jobRole.trim() ||
      !setupData.resumeId ||
      !setupData.difficulty
    ) {
      setStartError("Interview setup is incomplete.");

      return;
    }

    try {
      setIsStarting(true);
      setStartError(null);

      // 1. Create interview
      const interview = await createInterview({
        resume_id: setupData.resumeId,

        job_role: setupData.jobRole.trim(),

        interview_type: setupData.interviewType,

        difficulty: setupData.difficulty,

        question_count: setupData.questionCount,
      });

      // 2. Generate questions
      await generateInterviewQuestions(interview.id);

      // 3. Start interview
      await startInterview(interview.id);

      // 4. Navigate to interview room
      router.push(`/interviews/${interview.id}`);
    } catch (error) {
      setStartError(
        error instanceof Error
          ? error.message
          : "Failed to prepare the interview.",
      );
    } finally {
      setIsStarting(false);
    }
  };

  // --------------------------------
  // Animation Classes
  // --------------------------------

  const getTransitionClasses = () => {
    if (transitionPhase === "exiting") {
      return transitionDirection === "forward"
        ? "-translate-x-5 opacity-0"
        : "translate-x-5 opacity-0";
    }

    if (transitionPhase === "entering") {
      return transitionDirection === "forward"
        ? "translate-x-5 opacity-0"
        : "-translate-x-5 opacity-0";
    }

    return "translate-x-0 opacity-100";
  };

  return (
    <div className="min-h-full overflow-hidden bg-[#050d1d] px-4 py-8 sm:px-6 lg:px-8">
      <div
        className={`
          transform-gpu
          transition-all
          duration-200
          ease-out
          ${getTransitionClasses()}
        `}
      >
        {step === 1 ? (
          <InterviewTypeStep
            selectedType={setupData.interviewType}
            onSelect={handleInterviewTypeSelect}
          />
        ) : null}

        {step === 2 ? (
          <JobRoleStep
            selectedRole={setupData.jobRole}
            onSelect={handleJobRoleSelect}
            onBack={() => navigateToStep(1)}
          />
        ) : null}

        {step === 3 ? (
          <ResumeStep
            selectedResumeId={setupData.resumeId}
            onSelect={handleResumeSelect}
            onBack={() => navigateToStep(2)}
          />
        ) : null}

        {step === 4 ? (
          <DifficultyStep
            difficulty={setupData.difficulty}
            questionCount={setupData.questionCount}
            onDifficultyChange={handleDifficultyChange}
            onQuestionCountChange={handleQuestionCountChange}
            onBack={() => navigateToStep(3)}
            onContinue={goToPreparationStep}
          />
        ) : null}

        {step === 5 && setupData.interviewType && setupData.difficulty ? (
          <PreparationStep
            interviewType={setupData.interviewType}
            jobRole={setupData.jobRole}
            resumeTitle={setupData.resumeTitle}
            difficulty={setupData.difficulty}
            questionCount={setupData.questionCount}
            isStarting={isStarting}
            error={startError}
            onBack={() => {
              if (!isStarting) {
                navigateToStep(4);
              }
            }}
            onStart={handleStartInterview}
          />
        ) : null}
      </div>
    </div>
  );
}
