import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/lib/api/interviews";

interface InterviewPaginationProps {
    pagination: PaginationMeta;
    onPrevious: () => void;
    onNext: () => void;
    isLoading?: boolean;
}

export function InterviewPagination({
    pagination,
    onPrevious,
    onNext,
    isLoading = false,
}: InterviewPaginationProps) {
    if (pagination.total_items === 0) {
        return null;
    }

    return (
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
                Showing page {pagination.page} of{" "}
                {Math.max(pagination.total_pages, 1)}
            </p>

            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onPrevious}
                    disabled={
                        isLoading ||
                        !pagination.has_previous
                    }
                >
                    Previous
                </Button>

                <div className="min-w-24 text-center text-sm">
                    Page {pagination.page}
                </div>

                <Button
                    type="button"
                    variant="outline"
                    onClick={onNext}
                    disabled={
                        isLoading ||
                        !pagination.has_next
                    }
                >
                    Next
                </Button>
            </div>
        </div>
    );
}