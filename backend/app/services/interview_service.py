from datetime import datetime, timezone
from typing import Any, cast

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
    pause_interview_timer as db_pause_interview_timer,
    resume_interview_timer as db_resume_interview_timer
)
from app.database.resume_queries import get_resume
from app.exceptions.custom_exceptions import (
    InterviewIQException,
    UnauthorizedException,
)
from app.schemas.interview import (
    InterviewResponse,
    InterviewHistoryItem
)

from app.database.response_queries import (
    get_total_answer_duration,
)

from math import ceil

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
        resume_id: str,
    ) -> InterviewResponse:
        """
        Create a new interview.
        """

        logger.info(
            f"Interview creation started for user: {user_id}"
        )

        try:
            resume = get_resume(resume_id)

            if resume["user_id"] != user_id:
                raise UnauthorizedException(
                    "You do not have permission to use this resume."
                )

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
            interview = InterviewService._get_owned_interview(
                interview_id,
                user_id,
            )
 
            logger.info(
                f"Interview fetched successfully: {interview_id}"
            )

            return interview

        except InterviewIQException:
            raise


    # List of user interviews
    @staticmethod
    def list_user_interviews(
        user_id: str,
        page: int = 1,
        page_size: int = 10,
    ) -> dict[str, object]:
        """Get paginated interviews for a user."""

        logger.info(
            f"Fetching interviews for user: {user_id}, "
            f"page: {page}, page_size: {page_size}"
        )

        try:
            result = db_get_user_interviews(
                user_id=user_id,
                page=page,
                page_size=page_size,
            )

            raw_interviews = cast(
                list[dict[str, Any]],
                result["items"],
            )

            total_items = cast(
                int,
                result["total_items"],
            )

            interviews = [
                InterviewHistoryItem(**interview)
                for interview in raw_interviews
            ]

            total_pages = (
                ceil(total_items / page_size)
                if total_items > 0
                else 0
            )

            return {
                "items": interviews,
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total_items": total_items,
                    "total_pages": total_pages,
                    "has_next": page < total_pages,
                    "has_previous": page > 1,
                },
            }

        except InterviewIQException:
            raise

    # Start an interview
    @staticmethod
    def start_interview(
        interview_id: str,
        user_id: str,
    ) -> InterviewResponse:
        """
        Start a new interview and begin its active timer.
        """

        logger.info(
            f"Starting interview: {interview_id}"
        )

        try:
            interview = (
                InterviewService._get_owned_interview(
                    interview_id,
                    user_id,
                )
            )

            now = datetime.now(timezone.utc)

            if interview.status == InterviewStatus.COMPLETED:
                return interview

            if interview.started_at is None:
                interview_data = (
                    db_update_interview_status(
                        interview_id=interview_id,
                        status=InterviewStatus.IN_PROGRESS,
                        started_at=now,
                        duration_seconds=0,
                    )
                )

            else:
                interview_data = interview.model_dump()

            updated_interview = (
                db_resume_interview_timer(
                    interview_id=interview_id,
                    resumed_at=now,
                )
            )

            logger.info(
                f"Interview timer started: {interview_id}"
            )

            return InterviewResponse(
                **updated_interview
            )

        except InterviewIQException:
            raise


    # Complete an interview
    @staticmethod
    def complete_interview(
        interview_id: str,
        user_id: str,
    ) -> InterviewResponse:
        """
        Complete an interview and save its
        total accumulated active duration.
        """

        logger.info(
            f"Completing interview: {interview_id}"
        )

        try:
            interview = (
                InterviewService._get_owned_interview(
                    interview_id,
                    user_id,
                )
            )

            if interview.status == InterviewStatus.COMPLETED:
                return interview

            completed_at = datetime.now(
                timezone.utc
            )

            duration_seconds = (
                interview.duration_seconds or 0
            )

            if interview.last_resumed_at is not None:
                active_segment = max(
                    int(
                        (
                            completed_at -
                            interview.last_resumed_at
                        ).total_seconds()
                    ),
                    0,
                )

                duration_seconds += (
                    active_segment
                )

            updated_interview = (
                db_update_interview_status(
                    interview_id=interview_id,
                    status=InterviewStatus.COMPLETED,
                    completed_at=completed_at,
                    duration_seconds=duration_seconds,
                )
            )

            updated_interview = (
                db_pause_interview_timer(
                    interview_id=interview_id,
                    duration_seconds=duration_seconds,
                )
            )

            logger.info(
                f"Interview completed: "
                f"{interview_id} "
                f"(active_duration="
                f"{duration_seconds}s)"
            )

            return InterviewResponse(
                **updated_interview
            )

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
            
            InterviewService._get_owned_interview(
                interview_id,
                user_id,
            )
            db_delete_interview(interview_id)

            logger.info(
                f"Interview deleted: {interview_id}"
            )

        except InterviewIQException:
            raise


    # Resume an interview
    @staticmethod
    def resume_interview(
        interview_id: str,
        user_id: str,
    ) -> InterviewResponse:
        """
        Resume an existing interview timer.
        """

        logger.info(
            f"Resuming interview: {interview_id}"
        )

        try:
            interview = (
                InterviewService._get_owned_interview(
                    interview_id,
                    user_id,
                )
            )

            if interview.status == InterviewStatus.COMPLETED:
                return interview

            if interview.last_resumed_at is not None:
                return interview

            now = datetime.now(timezone.utc)

            updated_interview = (
                db_resume_interview_timer(
                    interview_id=interview_id,
                    resumed_at=now,
                )
            )

            logger.info(
                f"Interview resumed: {interview_id}"
            )

            return InterviewResponse(
                **updated_interview
            )

        except InterviewIQException:
            raise


    # Pause an interview
    @staticmethod
    def pause_interview(
        interview_id: str,
        user_id: str,
    ) -> InterviewResponse:
        """
        Pause an interview and save accumulated active time.
        """

        logger.info(
            f"Pausing interview: {interview_id}"
        )

        try:
            interview = (
                InterviewService._get_owned_interview(
                    interview_id,
                    user_id,
                )
            )

            if interview.status == InterviewStatus.COMPLETED:
                return interview

            if interview.last_resumed_at is None:
                return interview

            now = datetime.now(timezone.utc)

            current_duration = (
                interview.duration_seconds or 0
            )

            active_segment = max(
                int(
                    (
                        now -
                        interview.last_resumed_at
                    ).total_seconds()
                ),
                0,
            )

            duration_seconds = (
                current_duration +
                active_segment
            )

            updated_interview = (
                db_pause_interview_timer(
                    interview_id=interview_id,
                    duration_seconds=duration_seconds,
                )
            )

            logger.info(
                f"Interview paused: {interview_id} "
                f"(duration={duration_seconds}s)"
            )

            return InterviewResponse(
                **updated_interview
            )

        except InterviewIQException:
            raise





