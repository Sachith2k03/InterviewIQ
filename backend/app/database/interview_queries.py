from datetime import datetime

from app.core.enums import (
    InterviewDifficulty,
    InterviewStatus,
    InterviewType,
)
from app.core.logging import logger
from app.database.client import supabase
from app.exceptions.custom_exceptions import (
    DatabaseException,
    InterviewIQException,
    NotFoundException,
)
from typing import Any, cast
from postgrest.types import CountMethod


def create_interview(
    user_id: str,
    resume_id: str | None,
    job_role: str,
    interview_type: InterviewType,
    difficulty: InterviewDifficulty,
    question_count: int = 10,
) -> dict[str, object]:
    """Create a new interview."""

    logger.info(f"Creating interview for user: {user_id}")

    try:
        response = (
            supabase.table("interviews")
            .insert(
                {
                    "user_id": user_id,
                    "resume_id": resume_id,
                    "job_role": job_role,
                    "interview_type": interview_type.value,
                    "difficulty": difficulty.value,
                    "question_count": question_count,
                }
            )
            .execute()
        )
        
        if not response.data:
            raise DatabaseException("Failed to create interview.")

        data = cast(list[dict[str, Any]], response.data)
        logger.info(
            f"Interview created successfully: {data[0]['id']}"
        )

        return data[0]

    except InterviewIQException:
        raise

    except Exception as e:
        logger.error(f"Failed to create interview: {str(e)}")
        raise DatabaseException(str(e))


def get_interview(
    interview_id: str,
) -> dict[str, object]:
    """Get an interview."""

    logger.info(f"Fetching interview: {interview_id}")

    try:
        response = (
            supabase.table("interviews")
            .select("*")
            .eq("id", interview_id)
            .limit(1)
            .execute()
        )

        if not response.data:
            raise NotFoundException("Interview not found.")

        logger.info(f"Interview fetched successfully: {interview_id}")

        data = cast(dict[str, Any], response.data[0])
        return data

    except InterviewIQException:
        raise

    except Exception as e:
        logger.error(f"Failed to fetch interview: {str(e)}")
        raise DatabaseException(str(e))


def get_user_interviews(
    user_id: str,
    page: int = 1,
    page_size: int = 10,
) -> dict[str, object]:
    """Get paginated interview history belonging to a user."""

    logger.info(
        f"Fetching interviews for user: {user_id}, "
        f"page: {page}, page_size: {page_size}"
    )

    try:
        start = (page - 1) * page_size
        end = start + page_size - 1

        response = (
            supabase
            .table("interview_history_view")
            .select("*", count=CountMethod.exact)
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .range(start, end)
            .execute()
        )

        interviews = cast(
            list[dict[str, Any]],
            response.data or [],
        )

        total_items = response.count or 0

        logger.info(
            f"{len(interviews)} interviews fetched successfully "
            f"for user: {user_id}. Total interviews: {total_items}"
        )

        return {
            "items": interviews,
            "total_items": total_items,
        }

    except InterviewIQException:
        raise

    except Exception as error:
        logger.exception(
            f"Failed to fetch interviews for user: {user_id}"
        )

        raise DatabaseException(
            "Failed to retrieve user interviews."
        ) from error


def update_interview_status(
    interview_id: str,
    status: InterviewStatus,
    started_at: datetime | None = None,
    completed_at: datetime | None = None,
    duration_seconds: int | None = None,
) -> dict[str, object]:
    """Update interview status."""

    logger.info(
        f"Updating interview {interview_id} status to {status.value}"
    )

    update_data: dict[str, Any] = {
        "status": status.value,
    }

    if started_at is not None:
        update_data["started_at"] = started_at.isoformat()

    if completed_at is not None:
        update_data["completed_at"] = completed_at.isoformat()

    if duration_seconds is not None:
        update_data["duration_seconds"] = duration_seconds

    try:
        response = (
            supabase.table("interviews")
            .update(update_data)
            .eq("id", interview_id)
            .execute()
        )

        if not response.data:
            raise DatabaseException("Failed to update interview.")

        logger.info(
            f"Interview updated successfully: {interview_id}"
        )
        data = cast(dict[str, Any], response.data[0])
        return data

    except InterviewIQException:
        raise

    except Exception as e:
        logger.error(f"Failed to update interview: {str(e)}")
        raise DatabaseException(str(e))


def delete_interview(
    interview_id: str,
) -> None:
    """Delete an interview."""

    logger.info(f"Deleting interview: {interview_id}")

    try:
        (
            supabase.table("interviews")
            .delete()
            .eq("id", interview_id)
            .execute()
        )

        logger.info(
            f"Interview deleted successfully: {interview_id}"
        )

    except InterviewIQException:
        raise

    except Exception as e:
        logger.error(f"Failed to delete interview: {str(e)}")
        raise DatabaseException(str(e))


def resume_interview_timer(
    interview_id: str,
    resumed_at: datetime,
) -> dict:
    """
    Start or resume the active interview timer.
    """

    logger.info(
        f"Resuming interview timer: {interview_id}"
    )

    try:
        response = (
            supabase.table("interviews")
            .update(
                {
                    "last_resumed_at": resumed_at.isoformat(),
                }
            )
            .eq("id", interview_id)
            .execute()
        )

        if not response.data:
            raise NotFoundException(
                "Interview not found."
            )

        return cast(
            dict[str, object],
            response.data[0],
        )

    except InterviewIQException:
        raise

    except Exception as error:
        logger.exception(
            "Failed to resume interview timer."
        )

        raise DatabaseException(
            "Failed to resume interview timer."
        ) from error


def pause_interview_timer(
    interview_id: str,
    duration_seconds: int,
) -> dict:
    """
    Save accumulated active duration and pause timer.
    """

    logger.info(
        f"Pausing interview timer: {interview_id}"
    )

    try:
        response = (
            supabase.table("interviews")
            .update(
                {
                    "duration_seconds": duration_seconds,
                    "last_resumed_at": None,
                }
            )
            .eq("id", interview_id)
            .execute()
        )

        if not response.data:
            raise NotFoundException(
                "Interview not found."
            )

        return cast(
            dict[str, object],
            response.data[0],
        )

    except InterviewIQException:
        raise

    except Exception as error:
        logger.exception(
            "Failed to pause interview timer."
        )

        raise DatabaseException(
            "Failed to pause interview timer."
        ) from error
