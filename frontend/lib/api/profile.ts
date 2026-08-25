import { createClient } from "@/lib/supabase";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

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

async function getErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const data =
      await response.json();

    return (
      data?.message ??
      data?.detail ??
      fallback
    );
  } catch {
    return fallback;
  }
}

export async function getProfile(): Promise<Profile> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured.",
    );
  }

  const accessToken =
    await getAccessToken();

  const response =
    await fetch(
      `${API_URL}/profile`,
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
    throw new Error(
      await getErrorMessage(
        response,
        "Failed to load profile.",
      ),
    );
  }

  return (
    await response.json()
  ) as Profile;
}

export async function updateProfile(
  fullName: string,
): Promise<Profile> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured.",
    );
  }

  const accessToken =
    await getAccessToken();

  const response =
    await fetch(
      `${API_URL}/profile`,
      {
        method: "PATCH",
        headers: {
          Accept:
            "application/json",
          Authorization:
            `Bearer ${accessToken}`,
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          full_name:
            fullName,
        }),
      },
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Failed to update profile.",
      ),
    );
  }

  return (
    await response.json()
  ) as Profile;
}

export async function uploadProfileAvatar(
  file: File,
): Promise<Profile> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured.",
    );
  }

  const accessToken =
    await getAccessToken();

  const formData =
    new FormData();

  formData.append(
    "avatar",
    file,
  );

  const response =
    await fetch(
      `${API_URL}/profile/avatar`,
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
        body: formData,
      },
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Failed to update profile picture.",
      ),
    );
  }

  return (
    await response.json()
  ) as Profile;
}