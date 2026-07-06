from datetime import datetime, timezone

from app.core.enums import (
    InterviewDifficulty,
    InterviewStatus,
    InterviewType,
)
from app.core.logging import logger
from app.database.interview_queries import (
    create_interview as db_create_interview,
    delete_interview as db_delete_interview,
    get_interview as db_get_interview,
    get_user_interviews as db_get_user_interviews,
    update_interview_status as db_update_interview_status,
)
from app.database.resume_queries import get_resume
from app.exceptions.custom_exceptions import (
    InterviewIQException,
    UnauthorizedException,
)
from app.schemas.interview import InterviewResponse


class InterviewService:
    """Handles interview business logic."""

# created for internal use -> not exposed as an API.This method is used to validate ownership of an interview before performing any operations.)
    @staticmethod
    def _get_owned_interview(
        interview_id: str,
        user_id: str,
    ) -> InterviewResponse:
        """
        Get an interview and validate ownership.
        """

        logger.info(
            f"Fetching interview: {interview_id} for user: {user_id}"
        )

        try:
            interview = db_get_interview(interview_id)

            if interview["user_id"] != user_id:
                logger.warning(
                    f"Unauthorized access attempt by user: {user_id} for interview: {interview_id}"
                )
                raise UnauthorizedException(
                    "You do not have permission to access this interview."
                )

            return InterviewResponse(**interview)

        except InterviewIQException:
            raise

# Create an interview
    @staticmethod
    def create_interview(
        user_id: str,
        job_role: str,
        interview_type: InterviewType,
        difficulty: InterviewDifficulty,
        question_count: int,
        resume_id: str | None = None,
    ) -> InterviewResponse:
        """
        Create a new interview.
        """

        logger.info(
            f"Interview creation started for user: {user_id}"
        )

        try:
            if resume_id is not None:
                get_resume(resume_id)

            interview = db_create_interview(
                user_id=user_id,
                resume_id=resume_id,
                job_role=job_role,
                interview_type=interview_type,
                difficulty=difficulty,
                question_count=question_count,
            )

            logger.info(
                f"Interview created successfully: {interview['id']}"
            )

            return InterviewResponse(**interview)

        except InterviewIQException:
            raise


# Get an interview
    @staticmethod
    def get_interview(
        interview_id: str,
        user_id: str,
    ) -> InterviewResponse:
        """
        Get an interview.
        """

        logger.info(
            f"Fetching interview: {interview_id}"
        )

        try:
            InterviewService._get_owned_interview(
                interview_id,
                user_id,
            )

            interview = db_get_interview(interview_id)

            logger.info(
                f"Interview fetched successfully: {interview_id}"
            )

            return InterviewResponse(**interview)

        except InterviewIQException:
            raise


# List of user interviews
    @staticmethod
    def list_user_interviews(
        user_id: str,
    ) -> list[InterviewResponse]:
        """
        Get all interviews for a user.
        """

        logger.info(
            f"Fetching interviews for user: {user_id}"
        )

        try:
            interviews = db_get_user_interviews(user_id)

            logger.info(
                f"{len(interviews)} interviews fetched for user: {user_id}"
            )

            return [
                InterviewResponse(**interview)
                for interview in interviews
            ]

        except InterviewIQException:
            raise


# Start an interview
    @staticmethod
    def start_interview(
        interview_id: str,
        user_id: str,
    ) -> InterviewResponse:
        """
        Start an interview.
        """

        logger.info(
            f"Starting interview: {interview_id}"
        )

        try:
            InterviewService._get_owned_interview(
                interview_id,
                user_id,
            )

            interview = db_update_interview_status(
                interview_id=interview_id,
                status=InterviewStatus.IN_PROGRESS,
                started_at=datetime.now(timezone.utc),
            )

            logger.info(
                f"Interview started: {interview_id}"
            )

            return InterviewResponse(**interview)

        except InterviewIQException:
            raise


# Complete an interview
    @staticmethod
    def complete_interview(
        interview_id: str,
        user_id: str,
    ) -> InterviewResponse:
        """
        Complete an interview.
        """

        logger.info(
            f"Completing interview: {interview_id}"
        )

        try:
            InterviewService._get_owned_interview(
                interview_id,
                user_id,
            )

            interview = db_update_interview_status(
                interview_id=interview_id,
                status=InterviewStatus.COMPLETED,
                completed_at=datetime.now(timezone.utc),
            )

            logger.info(
                f"Interview completed: {interview_id}"
            )

            return InterviewResponse(**interview)

        except InterviewIQException:
            raise


# Cancel an interview
    @staticmethod
    def cancel_interview(
        interview_id: str,
        user_id: str,
    ) -> InterviewResponse:
        """
        Cancel an interview.
        """

        logger.info(
            f"Cancelling interview: {interview_id}"
        )

        try:
            InterviewService._get_owned_interview(
                interview_id,
                user_id,
            )

            interview = db_update_interview_status(
                interview_id=interview_id,
                status=InterviewStatus.CANCELLED,
            )

            logger.info(
                f"Interview cancelled: {interview_id}"
            )

            return InterviewResponse(**interview)

        except InterviewIQException:
            raise


# Delete an interview
    @staticmethod
    def delete_interview(
        interview_id: str,
        user_id: str,
    ) -> None:
        """
        Delete an interview.
        """

        logger.info(
            f"Deleting interview: {interview_id}"
        )

        try:
            

            db_delete_interview(interview_id)

            logger.info(
                f"Interview deleted: {interview_id}"
            )

        except InterviewIQException:
            raise