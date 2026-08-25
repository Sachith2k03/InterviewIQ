"use client";

import { useEffect, useMemo, useState } from "react";

import { History, Search } from "lucide-react";

import { HistoryCard } from "@/components/history/HistoryCard";

import { InterviewPagination } from "@/components/interviews";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  getInterviews,
  type InterviewHistoryItem,
  type PaginationMeta,
} from "@/lib/api/interviews";

const PAGE_SIZE = 10;

const initialPagination: PaginationMeta = {
  page: 1,
  page_size: PAGE_SIZE,
  total_items: 0,
  total_pages: 0,
  has_next: false,
  has_previous: false,
};

export default function HistoryPage() {
  const [interviews, setInterviews] = useState<InterviewHistoryItem[]>([]);

  const [pagination, setPagination] =
    useState<PaginationMeta>(initialPagination);

  const [page, setPage] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");

  const [retryCount, setRetryCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadHistory() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getInterviews(page, PAGE_SIZE, "completed");

        if (isCancelled) {
          return;
        }

        setInterviews(response.data);

        setPagination(response.pagination);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load interview history.",
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadHistory();

    return () => {
      isCancelled = true;
    };
  }, [page, retryCount]);

  const filteredInterviews = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return interviews;
    }

    return interviews.filter((interview) => {
      return (
        interview.job_role.toLowerCase().includes(query) ||
        interview.interview_type.toLowerCase().includes(query) ||
        interview.difficulty.toLowerCase().includes(query)
      );
    });
  }, [interviews, searchQuery]);

  const handlePrevious = () => {
    if (isLoading || !pagination.has_previous) {
      return;
    }

    setPage((currentPage) => Math.max(currentPage - 1, 1));
  };

  const handleNext = () => {
    if (isLoading || !pagination.has_next) {
      return;
    }

    setPage((currentPage) => currentPage + 1);
  };

  const handleRetry = () => {
    setRetryCount((count) => count + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Interview History</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Review your completed interviews and revisit your performance reports.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by role, type or difficulty..."
          className="pl-9"
        />
      </div>

      {/* Error */}
      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>

          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={handleRetry}
          >
            Try Again
          </Button>
        </div>
      ) : null}

      {/* Loading */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-xl border bg-muted/30"
            />
          ))}
        </div>
      ) : error ? null : (
        <>
          {/* Empty history */}
          {interviews.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <History className="h-6 w-6 text-primary" />
              </div>

              <h2 className="mt-4 text-lg font-semibold">
                No completed interviews
              </h2>

              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Your completed interviews will appear here after you finish your
                first mock interview.
              </p>
            </div>
          ) : filteredInterviews.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center">
              <Search className="h-8 w-8 text-muted-foreground" />

              <h2 className="mt-4 font-semibold">No matching interviews</h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Try another search term.
              </p>

              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInterviews.map((interview) => (
                <HistoryCard key={interview.id} interview={interview} />
              ))}
            </div>
          )}

          {interviews.length > 0 ? (
            <InterviewPagination
              pagination={pagination}
              onPrevious={handlePrevious}
              onNext={handleNext}
              isLoading={isLoading}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
