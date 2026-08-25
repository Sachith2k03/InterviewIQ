import { createClient } from "@/lib/supabase";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

interface DeleteAccountApiResponse {
  success?: boolean;
  message?: string;
  detail?: string;
}

export async function deleteAccount(): Promise<void> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured.",
    );
  }

  const supabase =
    createClient();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(
      sessionError.message,
    );
  }

  if (!session?.access_token) {
    throw new Error(
      "You must be logged in to delete your account.",
    );
  }

  const response = await fetch(
    `${API_URL}/profile/account`,
    {
      method: "DELETE",
      headers: {
        Accept:
          "application/json",
        Authorization:
          `Bearer ${session.access_token}`,
      },
    },
  );

  let result:
    | DeleteAccountApiResponse
    | null = null;

  try {
    result =
      (await response.json()) as DeleteAccountApiResponse;
  } catch {
    // The response may not contain JSON.
  }

  if (!response.ok) {
    throw new Error(
      result?.message ??
        result?.detail ??
        "Failed to delete account.",
    );
  }
}