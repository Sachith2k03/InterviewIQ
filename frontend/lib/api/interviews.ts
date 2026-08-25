import { createClient } from "@/lib/supabase";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

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

export type InterviewStatusFilter =
  | "pending"
  | "in_progress"
  | "completed"
  | "evaluated"
  | "cancelled";

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

export interface CreateInterviewPayload {
  resume_id: string;
  job_role: string;

  interview_type:
    | "technical"
    | "behavioral"
    | "system_design"
    | "hr"
    | "mixed";

  difficulty:
    | "easy"
    | "medium"
    | "hard";

  question_count: number;
}

export interface InterviewDetail {
  id: string;
  user_id: string;
  resume_id: string | null;

  job_role: string;
  interview_type: string;
  difficulty: string;
  question_count: number;
  status: string;

  started_at: string | null;
  completed_at: string | null;

  duration_seconds: number | null;
  last_resumed_at: string | null;

  created_at: string;
  updated_at: string;
}

interface InterviewDetailResponse {
  success: boolean;
  message: string;
  data: InterviewDetail;
}

export interface InterviewQuestion {
  id: string;
  interview_id: string;
  question_number: number;
  question: string;
  created_at: string;
}

interface InterviewQuestionListResponse {
  success: boolean;
  message: string;
  data: InterviewQuestion[];
}

async function getAccessToken(): Promise<string> {
  const supabase =
    createClient();

  const {
    data: { session },
    error,
  } =
    await supabase.auth.getSession();

  if (error) {
    throw new Error(
      error.message,
    );
  }

  if (!session?.access_token) {
    throw new Error(
      "User is not authenticated.",
    );
  }

  return session.access_token;
}

export async function getInterviews(
  page = 1,
  pageSize = 10,
  status?: InterviewStatusFilter,
): Promise<InterviewListResponse> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured.",
    );
  }

  const accessToken =
    await getAccessToken();

  const searchParams =
    new URLSearchParams({
      page: String(page),
      page_size: String(
        pageSize,
      ),
    });

  if (status) {
    searchParams.set(
      "status",
      status,
    );
  }

  const response =
    await fetch(
      `${API_URL}/interviews?${searchParams.toString()}`,
      {
        method: "GET",
        headers: {
          Accept:
            "application/json",
          Authorization:
            `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    );

  if (!response.ok) {
    let message =
      "Failed to retrieve interviews.";

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

    throw new Error(
      message,
    );
  }

  const result =
    (await response.json()) as InterviewListResponse;

  return result;
}

export async function deleteInterview(
  interviewId: string,
): Promise<void> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured.",
    );
  }

  const accessToken =
    await getAccessToken();

  const response =
    await fetch(
      `${API_URL}/interviews/${interviewId}`,
      {
        method: "DELETE",
        headers: {
          Accept:
            "application/json",
          Authorization:
            `Bearer ${accessToken}`,
        },
      },
    );

  if (!response.ok) {
    let message =
      "Failed to delete interview.";

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

    throw new Error(
      message,
    );
  }
}

export async function createInterview(
  payload: CreateInterviewPayload,
): Promise<InterviewDetail> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured.",
    );
  }

  const accessToken =
    await getAccessToken();

  const response =
    await fetch(
      `${API_URL}/interviews/create`,
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
          "Content-Type":
            "application/json",
        },
        body:
          JSON.stringify(
            payload,
          ),
      },
    );

  if (!response.ok) {
    let message =
      "Failed to create interview.";

    try {
      const data =
        await response.json();

      message =
        data?.detail ??
        data?.message ??
        message;
    } catch {
      // Keep fallback message.
    }

    throw new Error(
      message,
    );
  }

  const result =
    (await response.json()) as InterviewDetailResponse;

  return result.data;
}

export async function generateInterviewQuestions(
  interviewId: string,
): Promise<void> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured.",
    );
  }

  const accessToken =
    await getAccessToken();

  const response =
    await fetch(
      `${API_URL}/interviews/${interviewId}/questions/generate`,
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
      },
    );

  if (!response.ok) {
    let message =
      "Failed to generate interview questions.";

    try {
      const data =
        await response.json();

      message =
        data?.detail ??
        data?.message ??
        message;
    } catch {
      // Keep fallback message.
    }

    throw new Error(
      message,
    );
  }
}

export async function startInterview(
  interviewId: string,
): Promise<InterviewDetail> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured.",
    );
  }

  const accessToken =
    await getAccessToken();

  const response =
    await fetch(
      `${API_URL}/interviews/${interviewId}/start`,
      {
        method: "PATCH",
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
      },
    );

  if (!response.ok) {
    let message =
      "Failed to start interview.";

    try {
      const data =
        await response.json();

      message =
        data?.detail ??
        data?.message ??
        message;
    } catch {
      // Keep fallback message.
    }

    throw new Error(
      message,
    );
  }

  const result =
    (await response.json()) as InterviewDetailResponse;

  return result.data;
}

export async function getInterview(
  interviewId: string,
): Promise<InterviewDetail> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured.",
    );
  }

  const accessToken =
    await getAccessToken();

  const response =
    await fetch(
      `${API_URL}/interviews/${interviewId}`,
      {
        method: "GET",
        headers: {
          Accept:
            "application/json",
          Authorization:
            `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    );

  if (!response.ok) {
    let message =
      "Failed to load interview.";

    try {
      const data =
        await response.json();

      message =
        data?.detail ??
        data?.message ??
        message;
    } catch {
      // Keep fallback message.
    }

    throw new Error(
      message,
    );
  }

  const result =
    (await response.json()) as InterviewDetailResponse;

  return result.data;
}

export async function getInterviewQuestions(
  interviewId: string,
): Promise<InterviewQuestion[]> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured.",
    );
  }

  const accessToken =
    await getAccessToken();

  const response =
    await fetch(
      `${API_URL}/interviews/${interviewId}/questions`,
      {
        method: "GET",
        headers: {
          Accept:
            "application/json",
          Authorization:
            `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    );

  if (!response.ok) {
    let message =
      "Failed to load interview questions.";

    try {
      const data =
        await response.json();

      message =
        data?.detail ??
        data?.message ??
        message;
    } catch {
      // Keep fallback message.
    }

    throw new Error(
      message,
    );
  }

  const result =
    (await response.json()) as InterviewQuestionListResponse;

  return result.data;
}

export async function completeInterview(
  interviewId: string,
): Promise<InterviewDetail> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured.",
    );
  }

  const accessToken =
    await getAccessToken();

  const response =
    await fetch(
      `${API_URL}/interviews/${interviewId}/complete`,
      {
        method: "PATCH",
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
      },
    );

  if (!response.ok) {
    let message =
      "Failed to complete interview.";

    try {
      const data =
        await response.json();

      message =
        data?.detail ??
        data?.message ??
        message;
    } catch {
      // Keep fallback message.
    }

    throw new Error(
      message,
    );
  }

  const result =
    (await response.json()) as InterviewDetailResponse;

  return result.data;
}

export async function resumeInterview(
  interviewId: string,
): Promise<InterviewDetail> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured.",
    );
  }

  const accessToken =
    await getAccessToken();

  const response =
    await fetch(
      `${API_URL}/interviews/${interviewId}/resume`,
      {
        method: "PATCH",
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
      },
    );

  if (!response.ok) {
    let message =
      "Failed to resume interview.";

    try {
      const data =
        await response.json();

      message =
        data?.detail ??
        data?.message ??
        message;
    } catch {
      // Keep fallback message.
    }

    throw new Error(
      message,
    );
  }

  const result =
    (await response.json()) as InterviewDetailResponse;

  return result.data;
}

export async function pauseInterview(
  interviewId: string,
): Promise<InterviewDetail> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured.",
    );
  }

  const accessToken =
    await getAccessToken();

  const response =
    await fetch(
      `${API_URL}/interviews/${interviewId}/pause`,
      {
        method: "PATCH",
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
      },
    );

  if (!response.ok) {
    let message =
      "Failed to pause interview.";

    try {
      const data =
        await response.json();

      message =
        data?.detail ??
        data?.message ??
        message;
    } catch {
      // Keep fallback message.
    }

    throw new Error(
      message,
    );
  }

  const result =
    (await response.json()) as InterviewDetailResponse;

  return result.data;
}

export async function pauseInterviewKeepAlive(
  interviewId: string,
): Promise<void> {
  if (!API_URL) {
    return;
  }

  const accessToken =
    await getAccessToken();

  await fetch(
    `${API_URL}/interviews/${interviewId}/pause`,
    {
      method: "PATCH",
      headers: {
        Authorization:
          `Bearer ${accessToken}`,
      },
      keepalive: true,
    },
  );
}