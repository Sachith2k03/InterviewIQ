import { createClient } from "@/lib/supabase";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getProfile(): Promise<Profile> {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const supabase = createClient();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  if (!session?.access_token) {
    throw new Error("User is not authenticated");
  }

  const response = await fetch(`${API_URL}/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = "Failed to load profile";

    try {
      const errorData = (await response.json()) as {
        detail?: string;
      };

      message = errorData.detail ?? message;
    } catch {
      // Ignore invalid backend error responses.
    }

    throw new Error(message);
  }

  return (await response.json()) as Profile;
}