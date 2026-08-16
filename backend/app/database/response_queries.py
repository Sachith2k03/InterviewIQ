from typing import Any, cast

from app.core.logging import logger
from app.database.client import supabase
from app.exceptions.custom_exceptions import (
    DatabaseException,
    InterviewIQException,
    NotFoundException,
)


def create_response(
        interview_id: str,
        question_number: int,
        audio_storage_path: str | None = None,
        transcript: str | None = None,
        answer_duration_seconds: int | None = None,
) -> dict[str, Any]:
    """Create a new interview response."""

    logger.info(
        f"Creating response for interview: {interview_id}, question: {question_number}"
    )

    try:
        response = (
            supabase.table("interview_responses")
            .insert(
                {
                    "interview_id": interview_id,
                    "question_number": question_number,
                    "audio_storage_path": audio_storage_path,
                    "transcript": transcript,
                    "answer_duration_seconds": answer_duration_seconds,
                }
            )
            .execute()
        )

        if not response.data:
            raise DatabaseException("Failed to create response.")

        data = cast(list[dict[str, Any]], response.data)

        logger.info(
            f"Response created successfully: {data[0]['id']}"
        )

        return data[0]
    
    except InterviewIQException:
        raise

    except Exception as e:
        raise DatabaseException(str(e))
    

def get_response(
    response_id: str,
) -> dict[str, Any]:
    """Get an interview response."""

    logger.info(
        f"Fetching response: {response_id}"
    )

    try:
        response = (
            supabase.table("interview_responses")
            .select("*")
            .eq("id", response_id)
            .limit(1)
            .execute()
        )

        if not response.data:
            raise NotFoundException(
                "Response not found."
            )

        data = cast(
            dict[str, Any],
            response.data[0],
        )

        logger.info(
            f"Response fetched successfully: {response_id}"
        )

        return data

    except InterviewIQException:
        raise
    except Exception as error:
        logger.exception(
            f"Failed to fetch response: {response_id}"
        )

        raise DatabaseException(
            "Failed to retrieve response."
        ) from error


def get_interview_responses(
    interview_id: str,
) -> list[dict[str, Any]]:
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

        data = cast(list[dict[str, Any]], response.data)

        logger.info(
            f"Fetched {len(data)} responses."
        )

        return data

    except InterviewIQException:
        raise

    except Exception as e:
        raise DatabaseException(str(e))
    

def update_transcript(
    response_id: str,
    transcript: str,
) -> dict[str, Any]:
    """Update response transcript."""

    logger.info(
        f"Updating transcript for response: {response_id}"
    )

    try:
        response = (
            supabase.table("interview_responses")
            .update(
                {
                    "transcript": transcript,
                }
            )
            .eq("id", response_id)
            .execute()
        )

        if not response.data:
            raise NotFoundException("Response not found.")

        data = cast(list[dict[str, Any]], response.data)


        logger.info(
            f"Transcript updated successfully: {response_id}"
        )

        return data[0]

    except InterviewIQException:
        raise

    except Exception as e:
        raise DatabaseException(str(e))
    

def update_analysis(
    response_id: str,
    technical_score: float,
    communication_score: float,
    confidence_score: float,
    fluency_score: float,
    overall_score: float,
    question_feedback: str,
) -> dict[str, Any]:
    """Update AI analysis for a response."""

    logger.info(
        f"Updating AI analysis: {response_id}"
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
            raise NotFoundException("Response not found.")

        data = cast(list[dict[str, Any]], response.data)

        logger.info(
            f"AI analysis updated successfully: {response_id}"
        )

        return data[0]

    except InterviewIQException:
        raise

    except Exception as e:
        raise DatabaseException(str(e))


def delete_response(
    response_id: str,
) -> None:
    """Delete a response."""

    logger.info(
        f"Deleting response: {response_id}"
    )

    try:
        response = (
            supabase.table("interview_responses")
            .delete()
            .eq("id", response_id)
            .execute()
        )

        if not response.data:
            raise NotFoundException(
                "Response not found."
            )

        logger.info(
            f"Response deleted successfully: {response_id}"
        )

    except InterviewIQException:
        raise

    except Exception as error:
        logger.exception(
            f"Failed to delete response: {response_id}"
        )

        raise DatabaseException(
            "Failed to delete response."
        ) from error

def get_total_answer_duration(
    interview_id: str,
) -> int:
    """Return total answer duration for an interview."""

    try:
        response = (
            supabase.table("interview_responses")
            .select("answer_duration_seconds")
            .eq("interview_id", interview_id)
            .execute()
        )

        rows = cast(
            list[dict[str, object]],
            response.data or [],
        )

        total_duration = 0

        for row in rows:
            value = row.get(
                "answer_duration_seconds"
            )

            if isinstance(value, int):
                total_duration += value

        return total_duration

    except Exception as error:
        raise DatabaseException(
            "Failed to calculate interview duration."
        ) from error