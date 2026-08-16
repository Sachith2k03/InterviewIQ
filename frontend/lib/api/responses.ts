import { createClient } from "@/lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface InterviewResponse {
  id: string;
  interview_id: string;
  question_number: number;

  audio_storage_path: string | null;
  transcript: string | null;
  answer_duration_seconds: number | null;

  technical_score: number | null;
  communication_score: number | null;
  confidence_score: number | null;
  fluency_score: number | null;
  overall_score: number | null;

  question_feedback: string | null;

  created_at: string;
  updated_at: string;
}

interface ResponseDetailResponse {
  success: boolean;
  message: string;
  data: InterviewResponse;
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
      "User is not authenticated.",
    );
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
      error?: {
        message?: string;
      };
    };

    return (
      data.detail ??
      data.message ??
      data.error?.message ??
      fallback
    );
  } catch {
    return fallback;
  }
}

export async function submitInterviewResponse(
  interviewId: string,
  questionNumber: number,
  audioBlob: Blob,
  durationSeconds: number,
): Promise<InterviewResponse> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured.",
    );
  }

  const accessToken =
    await getAccessToken();

  const formData = new FormData();

  formData.append(
    "interview_id",
    interviewId,
  );

  formData.append(
    "question_number",
    questionNumber.toString(),
  );

  formData.append(
    "answer_duration_seconds",
    durationSeconds.toString(),
  );

  const audioFile = new File(
    [audioBlob],
    `question_${questionNumber}.webm`,
    {
      type: "audio/webm",
    },
  );

  formData.append(
    "audio_file",
    audioFile,
  );

  const response = await fetch(
    `${API_URL}/responses/submit`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Failed to submit interview response.",
      ),
    );
  }

  const result =
    (await response.json()) as ResponseDetailResponse;

  return result.data;
}

interface ResponseListResponse {
  success: boolean;
  message: string;
  data: InterviewResponse[];
}

export async function getInterviewResponses(
  interviewId: string,
): Promise<InterviewResponse[]> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured.",
    );
  }

  const accessToken =
    await getAccessToken();

  const response = await fetch(
    `${API_URL}/responses/interview/${interviewId}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Failed to load interview responses.",
      ),
    );
  }

  const result =
    (await response.json()) as ResponseListResponse;

  return result.data;
}