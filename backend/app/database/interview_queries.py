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
            .single()
            .execute()
        )

        if not response.data:
            raise NotFoundException("Interview not found.")

        logger.info(f"Interview fetched successfully: {interview_id}")

        data = cast(dict[str, Any], response.data)
        return data

    except InterviewIQException:
        raise

    except Exception as e:
        logger.error(f"Failed to fetch interview: {str(e)}")
        raise DatabaseException(str(e))


def get_user_interviews(
    user_id: str,
) -> list[dict[str, object]]:
    """Get all interviews belonging to a user."""

    logger.info(f"Fetching interviews for user: {user_id}")

    try:
        response = (
            supabase.table("interviews")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )

        data = cast(list[dict[str, Any]], response.data)
        logger.info(f"{len(data)} interviews fetched successfully for user: {user_id}")
        return data

    except InterviewIQException:
        raise

    except Exception as e:
        logger.error(f"Failed to fetch user interviews: {str(e)}")
        raise DatabaseException(str(e))


def update_interview_status(
    interview_id: str,
    status: InterviewStatus,
    started_at: datetime | None = None,
    completed_at: datetime | None = None,
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


def save_response(
    interview_id: str,
    question_number: int,
    question: str,
    audio_storage_path: str | None = None,
    transcript: str | None = None,
    answer_duration_seconds: int | None = None,
) -> dict[str, object]:
    """Save a user's response."""

    logger.info(
        f"Saving response for interview {interview_id}, question {question_number}"
    )

    try:
        response = (
            supabase.table("interview_responses")
            .insert(
                {
                    "interview_id": interview_id,
                    "question_number": question_number,
                    "question": question,
                    "audio_storage_path": audio_storage_path,
                    "transcript": transcript,
                    "answer_duration_seconds": answer_duration_seconds,
                }
            )
            .execute()
        )

        if not response.data:
            raise DatabaseException("Failed to save response.")


        data = cast(list[dict[str, Any]], response.data)
        logger.info(
            f"Response saved successfully: {data[0]['id']}"
        )

        return data[0]

    except InterviewIQException:
        raise

    except Exception as e:
        logger.error(f"Failed to save response: {str(e)}")
        raise DatabaseException(str(e))


def update_response_analysis(
    response_id: str,
    technical_score: float,
    communication_score: float,
    confidence_score: float,
    fluency_score: float,
    overall_score: float,
    question_feedback: str,
) -> dict[str, object]:
    """Save AI evaluation for a response."""

    logger.info(
        f"Updating AI analysis for response: {response_id}"
    )

    try:
        response = (
            supabase.table("interview_responses")
            .update(
                {
                    "technical_score": technical_score,
                    "communication_score": communication_score,
                    "confidence_score": confidence_score,
                    "fluency_score": fluency_score,
                    "overall_score": overall_score,
                    "question_feedback": question_feedback,
                }
            )
            .eq("id", response_id)
            .execute()
        )

        if not response.data:
            raise DatabaseException("Failed to update response analysis.")

        logger.info(
            f"AI analysis updated successfully: {response_id}"
        )

        data = cast(dict[str, Any], response.data)
        logger.info(f"AI analysis updated successfully: {response_id}")
        return data

    except InterviewIQException:
        raise

    except Exception as e:
        logger.error(
            f"Failed to update response analysis: {str(e)}"
        )
        raise DatabaseException(str(e))


def get_interview_responses(
    interview_id: str,
) -> list[dict[str, object]]:
    """Get all responses for an interview."""

    logger.info(
        f"Fetching responses for interview: {interview_id}"
    )

    try:
        response = (
            supabase.table("interview_responses")
            .select("*")
            .eq("interview_id", interview_id)
            .order("question_number")
            .execute()
        )

        if not response.data:
            raise NotFoundException("No responses found for this interview.")
        

        data = cast(list[dict[str, Any]], response.data)
        logger.info(
            f"{len(data)} responses fetched successfully for interview: {interview_id}"
        )
        return data

    except InterviewIQException:
        raise

    except Exception as e:
        logger.error(
            f"Failed to fetch interview responses: {str(e)}"
        )
        raise DatabaseException(str(e))