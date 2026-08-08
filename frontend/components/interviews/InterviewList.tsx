import type { InterviewHistoryItem } from "@/lib/api/interviews";

import { EmptyInterviewState } from "./EmptyInterviewState";
import { InterviewCard } from "./InterviewCard";

interface InterviewListProps {
    interviews: InterviewHistoryItem[];
    onInterviewDeleted: () => void;
}

export function InterviewList({
    interviews,
    onInterviewDeleted,
}: InterviewListProps) {
    if (interviews.length === 0) {
        return <EmptyInterviewState />;
    }

    return (
        <div className="grid gap-5">
            {interviews.map((interview) => (
                <InterviewCard
                    key={interview.id}
                    interview={interview}
                    onDeleted={onInterviewDeleted}
                />
            ))}
        </div>
    );
}