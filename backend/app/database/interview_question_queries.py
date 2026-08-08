from operator import index
from typing import Any, cast

from app.core.logging import logger
from app.database.client import supabase
from app.exceptions.custom_exceptions import (
    DatabaseException,
    InterviewIQException,
    NotFoundException,
)


def create_interview_questions(
        interview_id: str,
        questions: list[str],
) -> list[dict[str, Any]]:
    """Save generated questions for an interview."""

    logger.info(
        f"Saving {len(questions)} generated questions "
        f"for interview: {interview_id}"
    )

    if not questions:
        raise DatabaseException(
            "No interview questions were provided."
        )

    try:
        question_rows: list[dict[str, Any]] = [
            {
                "interview_id": interview_id,
                "question_number": index,
                "question": question,
            }
            for index, question in enumerate(
                questions,
                start=1
            )
        ]

        response = (
            supabase.table("interview_questions")
            .insert(question_rows)
            .execute()
        )

        data = cast(
            list[dict[str, Any]],
            response.data or [],
        )

        if len(data) != len(questions):
            raise DatabaseException(
                "Failed to save all generated interview questions."
            )

        logger.info(
            f"Saved {len(data)} questions successfully "
            f"for interview: {interview_id}"
        )

        return data

    except InterviewIQException:
        raise

    except Exception as error:
        logger.exception(
            "Failed to save generated interview questions."
        )

        raise DatabaseException(
            "Failed to save interview questions."
        ) from error


def get_interview_question(
        interview_id: str,
        question_number: int,
) -> dict[str, Any]:
    """Get a specific question for an interview"""

    logger.info(
        f"Fetching question {question_number}"
        f"for interview: {interview_id}"
    )

    try:
        response =(
            supabase.table("interview_questions")
            .select("id, interview_id, question_number, question, created_at")
            .eq("interview_id", interview_id)
            .eq("question_number", question_number)
            .limit(1)
            .execute()
        )

        if not response.data:
            raise NotFoundException(
                "Interview question not found."
            )

        question = cast(
            dict[str, Any],
            response.data[0],
        )

        logger.info(
            f"Interview question fetched successfully"
        )

        return question

    except InterviewIQException as error:
        raise

    except Exception as error:
        logger.exception(
            "Failed to fetch interview question."
        )
        raise DatabaseException(
            "Failed to retrieve interview question."
        ) from error


def get_interview_questions(
        interview_id: str,
) -> list[dict[str, Any]]:
    """Get all questions for an interview"""

    logger.info(
        f"Fetching all questions for interview: {interview_id}"
    )

    try:
        response = (
            supabase.table("interview_questions")
            .select(
                "id, interview_id, question_number, question, created_at"
            )
            .eq("interview_id", interview_id)
            .order("question_number")
            .execute()
        )

        questions = cast(
            list[dict[str, Any]],
            response.data or [],
        )

        logger.info(
            f"Fetched {len(questions)} questions "
            f"for interview: {interview_id}"
        ) 

        return questions

    except InterviewIQException:
        raise

    except Exception as error:
        logger.exception(
            "Failed to fetch interview questions."
        )
        raise DatabaseException(
            "Failed to retrieve interview questions."
        ) from error