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
    parsed_text: str | None = None,
):
    """Save a new resume."""

    try:
        response = (
            supabase.table("resumes")
            .insert(
                {
                    "user_id": user_id,
                    "title": title,
                    "file_name": file_name,
                    "storage_path": file_path,
                    "parsed_text": parsed_text,
                }
            )
            .execute()
        )

        return response.data

    except InterviewIQException:
        raise

    except Exception as e:
        raise DatabaseException(str(e))


def get_resume(resume_id: str):
    """Get a resume."""

    try:
        response = (
            supabase.table("resumes")
            .select("*")
            .eq("id", resume_id)
            .single()
            .execute()
        )

        if not response.data:
            raise NotFoundException("Resume not found.")

        return response.data

    except InterviewIQException:
        raise

    except Exception as e:
        raise DatabaseException(str(e))


def get_user_resumes(user_id: str):
    """Get all resumes belonging to a user."""

    try:
        response = (
            supabase.table("resumes")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )

        return response.data

    except InterviewIQException:
        raise

    except Exception as e:
        raise DatabaseException(str(e))


def delete_resume(resume_id: str):
    """Delete a resume."""

    try:
        response = (
            supabase.table("resumes")
            .delete()
            .eq("id", resume_id)
            .execute()
        )

        return response.data

    except InterviewIQException:
        raise

    except Exception as e:
        raise DatabaseException(str(e))