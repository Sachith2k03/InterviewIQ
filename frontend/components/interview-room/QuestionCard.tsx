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
    <div className="shrink-0">
      <div className="flex items-center gap-2 text-blue-400">
        <MessageSquareText className="h-4 w-4" />

        <span className="text-xs font-medium uppercase tracking-wider">
          Question {questionNumber}
        </span>
      </div>

      <h1 className="mt-2 max-w-4xl text-lg font-semibold leading-7 text-white lg:text-xl">
        {question}
      </h1>
    </div>
  );
}
