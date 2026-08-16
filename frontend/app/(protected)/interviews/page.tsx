"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { InterviewList, InterviewPagination } from "@/components/interviews";
import { Button } from "@/components/ui/button";
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

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<InterviewHistoryItem[]>([]);

  const [pagination, setPagination] =
    useState<PaginationMeta>(initialPagination);

  const [page, setPage] = useState(1);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadInterviews() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getInterviews(page, PAGE_SIZE);

        if (isCancelled) {
          return;
        }

        setInterviews(response.data);
        setPagination(response.pagination);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setError(
          error instanceof Error ? error.message : "Failed to load interviews.",
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadInterviews();

    return () => {
      isCancelled = true;
    };
  }, [page, retryCount]);

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

  const handleInterviewDeleted = () => {
    const isLastItemOnPage = interviews.length === 1;

    if (isLastItemOnPage && page > 1) {
      setPage((currentPage) => currentPage - 1);

      return;
    }

    setRetryCount((count) => count + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interviews</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Continue unfinished interviews, review results, or remove old
            interviews.
          </p>
        </div>

        <Button asChild>
          <Link href="/interviews/create">
            <Plus className="mr-2 h-4 w-4" />
            New Interview
          </Link>
        </Button>
      </div>

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

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({
            length: 3,
          }).map((_, index) => (
            <div
              key={index}
              className="h-52 animate-pulse rounded-xl border bg-muted/30"
            />
          ))}
        </div>
      ) : error ? null : (
        <>
          <InterviewList
            interviews={interviews}
            onInterviewDeleted={handleInterviewDeleted}
          />

          <InterviewPagination
            pagination={pagination}
            onPrevious={handlePrevious}
            onNext={handleNext}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
}
