from fastapi import UploadFile

from app.core.enums import InterviewStatus
from app.core.logging import logger
from app.database.interview_question_queries import (
    get_interview_question as db_get_interview_question,
)
from app.database.response_queries import (
    create_response as db_create_response,
    delete_response as db_delete_response,
    get_interview_responses as db_get_interview_responses,
    get_response as db_get_response,
    update_analysis as db_update_analysis,
)
from app.exceptions.custom_exceptions import (
    InterviewIQException,
    UnauthorizedException,
    ValidationException,
)
from app.schemas.response import ResponseResponse
from app.services.audio_storage_service import AudioStorageService
from app.services.evaluation_service import EvaluationService
from app.services.interview_service import InterviewService
from app.services.transcription_service import TranscriptionService


class ResponseService:
    """Handles interview response business logic."""

    @staticmethod
    def _get_owned_response(
        response_id: str,
        user_id: str,
    ) -> dict[str, object]:
        """Fetch a response and verify ownership through its interview."""

        response = db_get_response(response_id)

        interview_id = str(response["interview_id"])

        InterviewService.get_interview(
            interview_id=interview_id,
            user_id=user_id,
        )

        return response

    @staticmethod
    async def submit_response(
        user_id: str,
        interview_id: str,
        question_number: int,
        audio_file: UploadFile,
        answer_duration_seconds: int | None = None,
    ) -> ResponseResponse:
        """Submit, transcribe, evaluate, and save an interview response."""

        logger.info(
            f"Submitting response "
            f"(user={user_id}, "
            f"interview={interview_id}, "
            f"question={question_number})"
        )

        audio_storage_path: str | None = None

        try:
            interview = InterviewService.get_interview(
                interview_id=interview_id,
                user_id=user_id,
            )

            if interview.status != InterviewStatus.IN_PROGRESS:
                raise ValidationException(
                    "Interview must be in progress before submitting responses."
                )

            question_record = db_get_interview_question(
                interview_id=interview_id,
                question_number=question_number,
            )

            question = str(
                question_record["question"]
            )

            audio_storage_path = (
                await AudioStorageService.upload_audio(
                    user_id=user_id,
                    interview_id=interview_id,
                    question_number=question_number,
                    file=audio_file,
                )
            )

            await audio_file.seek(0)

            audio_bytes = await audio_file.read()

            if not audio_bytes:
                raise ValidationException(
                    "Uploaded audio file is empty."
                )

            transcript = (
                TranscriptionService.transcribe_audio(
                    audio_bytes
                )
            )

            if not transcript.strip():
                raise ValidationException(
                    "Could not generate a transcript from the audio."
                )

            response_record = db_create_response(
                interview_id=interview_id,
                question_number=question_number,
                audio_storage_path=audio_storage_path,
                transcript=transcript,
                answer_duration_seconds=answer_duration_seconds,
            )

            evaluation = EvaluationService.evaluate_response(
                question=question,
                transcript=transcript,
                job_role=interview.job_role,
                difficulty=interview.difficulty.value,
            )

            response_record = db_update_analysis(
                response_id=str(response_record["id"]),
                technical_score=evaluation.technical_score,
                communication_score=evaluation.communication_score,
                confidence_score=evaluation.confidence_score,
                fluency_score=evaluation.fluency_score,
                overall_score=evaluation.overall_score,
                question_feedback=evaluation.question_feedback,
            )

            logger.info(
                f"Response submitted successfully: "
                f"{response_record['id']}"
            )

            return ResponseResponse(
                **response_record
            )

        except InterviewIQException:
            if audio_storage_path is not None:
                try:
                    AudioStorageService.delete_audio(
                        audio_storage_path
                    )
                except InterviewIQException:
                    logger.exception(
                        "Failed to clean up uploaded audio after response failure."
                    )

            raise

    @staticmethod
    def get_response(
        response_id: str,
        user_id: str,
    ) -> ResponseResponse:
        """Get one response belonging to the authenticated user."""

        logger.info(
            f"Fetching response: {response_id}"
        )

        try:
            response = ResponseService._get_owned_response(
                response_id=response_id,
                user_id=user_id,
            )

            return ResponseResponse(
                **response
            )

        except InterviewIQException:
            raise

    @staticmethod
    def list_interview_responses(
        interview_id: str,
        user_id: str,
    ) -> list[ResponseResponse]:
        """Get all responses for an owned interview."""

        logger.info(
            f"Fetching responses for interview: {interview_id}"
        )

        try:
            InterviewService.get_interview(
                interview_id=interview_id,
                user_id=user_id,
            )

            responses = db_get_interview_responses(
                interview_id
            )

            return [
                ResponseResponse(**response)
                for response in responses
            ]

        except InterviewIQException:
            raise

    @staticmethod
    def delete_response(
        response_id: str,
        user_id: str,
    ) -> None:
        """Delete an owned response and its stored audio."""

        logger.info(
            f"Deleting response: {response_id}"
        )

        try:
            response = ResponseService._get_owned_response(
                response_id=response_id,
                user_id=user_id,
            )

            audio_storage_path = response.get(
                "audio_storage_path"
            )

            if isinstance(audio_storage_path, str):
                AudioStorageService.delete_audio(
                    audio_storage_path
                )

            db_delete_response(
                response_id
            )

            logger.info(
                f"Response deleted successfully: {response_id}"
            )

        except InterviewIQException:
            raise