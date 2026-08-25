import { MessageSquareText } from "lucide-react";

interface QuestionCardProps {
  questionNumber: number;
  question: string;
}

export default function QuestionCard({
  questionNumber,
  question,
}: QuestionCardProps) {
  return (
    <div className="w-full min-w-0 shrink-0">
      <div className="flex items-center gap-2 text-blue-400">
        <MessageSquareText className="h-4 w-4 shrink-0" />

        <span className="text-[11px] font-semibold uppercase tracking-wide sm:text-xs lg:text-sm">
          Question {questionNumber}
        </span>
      </div>

      <h1 className="mt-3 max-w-4xl break-words text-[15px] font-semibold leading-[22px] text-white sm:text-lg sm:leading-7 lg:text-xl lg:leading-8">
        {question}
      </h1>
    </div>
  );
}
