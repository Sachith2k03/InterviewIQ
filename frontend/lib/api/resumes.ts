import { createClient } from "@/lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Resume {
    id: string;
    user_id: string;
    title: string;
    file_name: string;
    storage_path: string | null;
    is_archived: boolean;
    created_at: string;
    updated_at: string | null;
}

interface ResumeListResponse {
    success: boolean;
    message: string;
    data: Resume[];
}

interface ResumeUploadResponse {
    success: boolean;
    message: string;
    data: Resume;
}

export interface ResumeDeleteResponse {
    success: boolean;
    message: string;
    action: "deleted" | "archived";
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
        const errorData = (await response.json()) as {
            detail?: string;
            message?: string;
            error?: {
                message?: string;
            };
        };

        return (
            errorData.detail ??
            errorData.message ??
            errorData.error?.message ??
            fallback
        );
    } catch {
        return fallback;
    }
}

export async function getResumes(): Promise<Resume[]> {
    if (!API_URL) {
        throw new Error(
            "NEXT_PUBLIC_API_URL is not configured.",
        );
    }

    const accessToken = await getAccessToken();

    const response = await fetch(
        `${API_URL}/resumes`,
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
                "Failed to load resumes.",
            ),
        );
    }

    const result =
        (await response.json()) as ResumeListResponse;

    return result.data;
}

export async function uploadResume(
    file: File,
    title: string,
): Promise<Resume> {
    if (!API_URL) {
        throw new Error(
            "NEXT_PUBLIC_API_URL is not configured.",
        );
    }

    const accessToken = await getAccessToken();

    const formData = new FormData();

    formData.append("file", file);
    formData.append("title", title);

    const response = await fetch(
        `${API_URL}/upload/resume`,
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
                "Failed to upload resume.",
            ),
        );
    }

    const result =
        (await response.json()) as ResumeUploadResponse;

    return result.data;
}

export async function removeResume(
    resumeId: string,
): Promise<ResumeDeleteResponse> {
    if (!API_URL) {
        throw new Error(
            "NEXT_PUBLIC_API_URL is not configured.",
        );
    }

    const accessToken = await getAccessToken();

    const response = await fetch(
        `${API_URL}/resumes/${resumeId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    );

    if (!response.ok) {
        throw new Error(
            await getErrorMessage(
                response,
                "Failed to remove resume.",
            ),
        );
    }

    return (await response.json()) as ResumeDeleteResponse;
}