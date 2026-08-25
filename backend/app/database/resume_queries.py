from datetime import datetime, timezone
from typing import cast
from postgrest.types import CountMethod

from app.database.client import supabase
from app.exceptions.custom_exceptions import (
    DatabaseException,
    InterviewIQException,
    NotFoundException,
)


def create_resume(
    user_id: str,
    title: str,
    file_name: str,
    file_path: str,
    sanitized_text: str | None = None,
) -> dict[str, object]:
    """Save a new resume record."""

    try:
        response = (
            supabase.table("resumes")
            .insert(
                {
                    "user_id": user_id,
                    "title": title,
                    "file_name": file_name,
                    "storage_path": file_path,
                    "sanitized_text": sanitized_text,
                }
            )
            .execute()
        )

        if not response.data:
            raise DatabaseException(
                "Failed to create resume."
            )

        return cast(
            dict[str, object],
            response.data[0],
        )

    except InterviewIQException:
        raise

    except Exception as error:
        raise DatabaseException(
            "Failed to create resume."
        ) from error


def get_resume(
    resume_id: str,
) -> dict[str, object]:
    """Get a resume by its ID."""

    try:
        response = (
            supabase.table("resumes")
            .select(
                "id, user_id, title, file_name, storage_path, "
                "sanitized_text, is_archived, archived_at, "
                "created_at, updated_at"
            )
            .eq("id", resume_id)
            .limit(1)
            .execute()
        )

        if not response.data:
            raise NotFoundException(
                "Resume not found."
            )

        return cast(
            dict[str, object],
            response.data[0],
        )

    except InterviewIQException:
        raise

    except Exception as error:
        raise DatabaseException(
            "Failed to retrieve resume."
        ) from error


def get_user_resumes(
    user_id: str,
) -> list[dict[str, object]]:
    """Get all active resumes belonging to a user."""

    try:
        response = (
            supabase.table("resumes")
            .select(
                "id, user_id, title, file_name, storage_path, "
                "is_archived, created_at, updated_at"
            )
            .eq("user_id", user_id)
            .eq("is_archived", False)
            .order("created_at", desc=True)
            .execute()
        )

        return cast(
            list[dict[str, object]],
            response.data or [],
        )

    except InterviewIQException:
        raise

    except Exception as error:
        raise DatabaseException(
            "Failed to retrieve resumes."
        ) from error


def count_active_user_resumes(
    user_id: str,
) -> int:
    """Count the user's active resumes."""

    try:
        response = (
            supabase.table("resumes")
            .select(
                "id",
                count=CountMethod.exact,
            )
            .eq("user_id", user_id)
            .eq("is_archived", False)
            .execute()
        )

        return response.count or 0

    except InterviewIQException:
        raise

    except Exception as error:
        raise DatabaseException(
            "Failed to count active resumes."
        ) from error


def is_resume_used_by_interviews(
    resume_id: str,
) -> bool:
    """Check whether any interview references the resume."""

    try:
        response = (
            supabase.table("interviews")
            .select("id")
            .eq("resume_id", resume_id)
            .limit(1)
            .execute()
        )

        return bool(response.data)

    except InterviewIQException:
        raise

    except Exception as error:
        raise DatabaseException(
            "Failed to check resume usage."
        ) from error


def archive_resume(
    resume_id: str,
) -> dict[str, object]:
    """
    Archive a used resume.

    The database row remains available for interview history,
    but the PDF path and sanitized text are removed.
    """

    try:
        response = (
            supabase.table("resumes")
            .update(
                {
                    "is_archived": True,
                    "archived_at": datetime.now(
                        timezone.utc
                    ).isoformat(),
                    "storage_path": None,
                    "sanitized_text": None,
                }
            )
            .eq("id", resume_id)
            .eq("is_archived", False)
            .execute()
        )

        if not response.data:
            raise NotFoundException(
                "Resume not found or already archived."
            )

        return cast(
            dict[str, object],
            response.data[0],
        )

    except InterviewIQException:
        raise

    except Exception as error:
        raise DatabaseException(
            "Failed to archive resume."
        ) from error


def delete_resume(
    resume_id: str,
) -> None:
    """Permanently delete an unused resume record."""

    try:
        response = (
            supabase.table("resumes")
            .delete()
            .eq("id", resume_id)
            .execute()
        )

        if not response.data:
            raise NotFoundException(
                "Resume not found."
            )

    except InterviewIQException:
        raise

    except Exception as error:
        raise DatabaseException(
            "Failed to delete resume."
        ) from error