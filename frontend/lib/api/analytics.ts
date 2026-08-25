import { createClient } from "@/lib/supabase";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

export interface AnalyticsSummary {
  completed_interviews: number;
  average_score: number;
  best_score: number;
  current_streak: number;
  practice_minutes: number;
  weekly_progress: number;
}

export interface AnalyticsSkillAverages {
  technical: number;
  communication: number;
  confidence: number;
  fluency: number;
}

export interface AnalyticsTrendPoint {
  interview_id: string;
  job_role: string;
  completed_at: string;

  overall_score: number;
  technical_score: number;
  communication_score: number;
  confidence_score: number;
  fluency_score: number;
}

export interface AnalyticsDifficultyPerformance {
  difficulty: string;
  interview_count: number;
  average_score: number;
}

export interface AnalyticsTypePerformance {
  interview_type: string;
  interview_count: number;
  average_score: number;
}

export interface AnalyticsInterviewDistribution {
  interview_type: string;
  count: number;
}

export interface AnalyticsPracticeActivity {
  this_week: number;
  last_week: number;
  this_month: number;
}

export interface AnalyticsInsights {
  strongest_skill: string | null;
  strongest_skill_score: number;

  weakest_skill: string | null;
  weakest_skill_score: number;

  improvement_percentage: number;
}

export interface AnalyticsResponse {
  summary: AnalyticsSummary;

  skill_averages: AnalyticsSkillAverages;

  performance_trend: AnalyticsTrendPoint[];

  difficulty_performance:
    AnalyticsDifficultyPerformance[];

  type_performance:
    AnalyticsTypePerformance[];

  interview_distribution:
    AnalyticsInterviewDistribution[];

  practice_activity: AnalyticsPracticeActivity;

  insights: AnalyticsInsights;
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
    throw new Error(
      "You must be logged in to view analytics.",
    );
  }

  return session.access_token;
}

export async function getAnalytics(): Promise<AnalyticsResponse> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured.",
    );
  }

  const accessToken =
    await getAccessToken();

  const response = await fetch(
    `${API_URL}/analytics`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization:
          `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    let message =
      "Failed to load analytics.";

    try {
      const result =
        await response.json();

      message =
        result?.message ??
        result?.detail ??
        message;
    } catch {
      // Keep fallback message.
    }

    throw new Error(message);
  }

  return (
    await response.json()
  ) as AnalyticsResponse;
}