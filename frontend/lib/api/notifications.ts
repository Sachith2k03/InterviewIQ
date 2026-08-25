import { createClient } from "@/lib/supabase";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

export interface NotificationItem {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  related_interview_id: string | null;
  created_at: string;
}

export interface NotificationListResponse {
  success: boolean;
  message: string;
  data: NotificationItem[];
  unread_count: number;
}

export interface NotificationUnreadCountResponse {
  success: boolean;
  unread_count: number;
}

export interface NotificationDetailResponse {
  success: boolean;
  message: string;
  data: NotificationItem;
}

interface NotificationActionResponse {
  success: boolean;
  message: string;
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

async function getErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const result =
      await response.json();

    return (
      result?.message ??
      result?.detail ??
      fallback
    );
  } catch {
    return fallback;
  }
}

export async function getNotifications(
  limit = 20,
): Promise<NotificationListResponse> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured.",
    );
  }

  const accessToken =
    await getAccessToken();

  const response =
    await fetch(
      `${API_URL}/notifications?limit=${limit}`,
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
        "Failed to load notifications.",
      ),
    );
  }

  return (
    await response.json()
  ) as NotificationListResponse;
}

export async function getUnreadNotificationCount(): Promise<number> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured.",
    );
  }

  const accessToken =
    await getAccessToken();

  const response =
    await fetch(
      `${API_URL}/notifications/unread-count`,
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
        "Failed to load notification count.",
      ),
    );
  }

  const result =
    (await response.json()) as NotificationUnreadCountResponse;

  return result.unread_count;
}

export async function markNotificationAsRead(
  notificationId: string,
): Promise<NotificationItem> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured.",
    );
  }

  const accessToken =
    await getAccessToken();

  const response =
    await fetch(
      `${API_URL}/notifications/${notificationId}/read`,
      {
        method: "PATCH",
        headers: {
          Accept:
            "application/json",
          Authorization:
            `Bearer ${accessToken}`,
        },
      },
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Failed to update notification.",
      ),
    );
  }

  const result =
    (await response.json()) as NotificationDetailResponse;

  return result.data;
}

export async function markAllNotificationsAsRead(): Promise<void> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured.",
    );
  }

  const accessToken =
    await getAccessToken();

  const response =
    await fetch(
      `${API_URL}/notifications/read-all`,
      {
        method: "PATCH",
        headers: {
          Accept:
            "application/json",
          Authorization:
            `Bearer ${accessToken}`,
        },
      },
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Failed to update notifications.",
      ),
    );
  }
}

export async function deleteNotification(
  notificationId: string,
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
      `${API_URL}/notifications/${notificationId}`,
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
    throw new Error(
      await getErrorMessage(
        response,
        "Failed to delete notification.",
      ),
    );
  }
}