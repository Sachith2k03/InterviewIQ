import { createClient } from "@/lib/supabase";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

export interface InterviewReport {
  id: string;
  interview_id: string;

  overall_score: number;
  technical_score: number;
  communication_score: number;
  confidence_score: number;
  fluency_score: number;

  strengths: string[];
  weaknesses: string[];
  suggestions: string[];

  pdf_storage_path: string | null;

  created_at: string;
  updated_at: string | null;
}

interface ReportDetailResponse {
  success: boolean;
  message: string;
  data: InterviewReport;
}

async function getAccessToken(): Promise<string> {
  const supabase = createClient();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

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

async function getErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const data = await response.json();

    return (
      data.detail ??
      data.message ??
      fallback
    );
  } catch {
    return fallback;
  }
}

export async function getReport(
  interviewId: string,
): Promise<InterviewReport> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured.",
    );
  }

  const accessToken =
    await getAccessToken();

  const response = await fetch(
    `${API_URL}/reports/${interviewId}`,
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
    throw new Error(
      await getErrorMessage(
        response,
        "Failed to load interview report.",
      ),
    );
  }

  const result =
    (await response.json()) as ReportDetailResponse;

  return result.data;
}

export async function generateReport(
  interviewId: string,
): Promise<InterviewReport> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured.",
    );
  }

  const accessToken =
    await getAccessToken();

  const response = await fetch(
    `${API_URL}/reports/${interviewId}/generate`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization:
          `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Failed to generate interview report.",
      ),
    );
  }

  const result =
    (await response.json()) as ReportDetailResponse;

  return result.data;
}
export async function downloadReportPdf(
  interviewId: string,
): Promise<void> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured.",
    );
  }

  const accessToken =
    await getAccessToken();

  const response = await fetch(
    `${API_URL}/reports/${interviewId}/pdf`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Failed to download interview report PDF.",
      ),
    );
  }

  const blob =
    await response.blob();

  const downloadUrl =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href =
    downloadUrl;

  link.download =
    `InterviewIQ_${interviewId}.pdf`;

  document.body.appendChild(
    link,
  );

  link.click();

  link.remove();

  URL.revokeObjectURL(
    downloadUrl,
  );
}