import { createClient } from "@/lib/supabase";

export interface InterviewHistoryItem {
    id: string;
    user_id: string;

    job_role: string;
    interview_type: string;
    difficulty: string;
    question_count: number;
    status: string;

    created_at: string;
    started_at: string | null;
    completed_at: string | null;
    duration_seconds: number | null;

    resume_title: string | null;

    overall_score: number | null;
    technical_score: number | null;
    communication_score: number | null;
    confidence_score: number | null;
    fluency_score: number | null;

    pdf_path: string | null;
}

export interface PaginationMeta {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
}

export interface InterviewListResponse {
    success: boolean;
    message: string;
    data: InterviewHistoryItem[];
    pagination: PaginationMeta;
}

const API_URL =
    process.env.NEXT_PUBLIC_API_URL;

export async function getInterviews(
    page = 1,
    pageSize = 10,
): Promise<InterviewListResponse> {
    const supabase = createClient();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
        throw new Error("You must be logged in to view interviews.");
    }

    const response = await fetch(
        `${API_URL}/interviews?page=${page}&page_size=${pageSize}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${session.access_token}`,
            },
            cache: "no-store",
        },
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result?.message ?? "Failed to retrieve interviews.",
        );
    }

    return result as InterviewListResponse;
}

export async function deleteInterview(
    interviewId: string,
): Promise<void> {
    const supabase = createClient();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
        throw new Error(
            "You must be logged in to delete an interview.",
        );
    }

    const response = await fetch(
        `${API_URL}/interviews/${interviewId}`,
        {
            method: "DELETE",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${session.access_token}`,
            },
        },
    );

    if (!response.ok) {
        let message = "Failed to delete interview.";

        try {
            const result = await response.json();

            message =
                result?.message ??
                result?.detail ??
                message;
        } catch {
            // Keep the default message when the response is not JSON.
        }

        throw new Error(message);
    }
}