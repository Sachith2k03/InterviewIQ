import { createClient } from "@/lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface DashboardPerformancePoint {
    date: string;
    score: number;
}

export interface DashboardInterviewDistribution {
    type: string;
    count: number;
}

export interface DashboardRecentInterview {
    id: string;
    job_role: string;
    interview_type: string;
    difficulty: string;
    status: string;
    created_at: string;
    completed_at: string | null;
    duration_seconds: number | null;
    overall_score: number | null;
    pdf_path: string | null;
}

export interface DashboardResponse {
    interviews_completed: number;
    average_score: number;
    best_score: number;
    current_streak: number;
    weekly_progress: number;
    practice_minutes: number;
    performance: DashboardPerformancePoint[];
    interview_distribution: DashboardInterviewDistribution[];
    recent_interview: DashboardRecentInterview | null;
}

async function getAccessToken(): Promise<string> {
    const supabase = createClient();

    const {
        data: { session },
        error,
    } = await supabase.auth.getSession();

    if (error) {
        throw new Error(error.message);
    }

    if (!session?.access_token) {
        throw new Error("User is not authenticated.");
    }

    return session.access_token;
}

async function getErrorMessage(
    response: Response,
    fallback: string,
): Promise<string> {
    try {
        const data = (await response.json()) as {
            detail?: string;
            message?: string;
        };

        return data.detail ?? data.message ?? fallback;
    } catch {
        return fallback;
    }
}

export async function getDashboard(): Promise<DashboardResponse> {
    if (!API_URL) {
        throw new Error(
            "NEXT_PUBLIC_API_URL is not configured.",
        );
    }

    const accessToken = await getAccessToken();

    const response = await fetch(
        `${API_URL}/dashboard`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
        },
    );

    if (!response.ok) {
        throw new Error(
            await getErrorMessage(
                response,
                "Failed to load dashboard data.",
            ),
        );
    }

    return (await response.json()) as DashboardResponse;
}