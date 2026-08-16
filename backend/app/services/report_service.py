from statistics import mean
from typing import Any, cast

from app.core.enums import InterviewStatus
from app.core.logging import logger

from app.database.interview_question_queries import (
    get_interview_questions as db_get_interview_questions,
)
from app.database.report_queries import (
    create_report as db_create_report,
    get_report as db_get_report,
    update_pdf_storage_path as db_update_pdf_storage_path,
)
from app.database.response_queries import (
    get_interview_responses as db_get_interview_responses,
)

from app.exceptions.custom_exceptions import (
    InterviewIQException,
    NotFoundException,
    ValidationException,
)

from app.schemas.report import ReportResponse

from app.services.interview_service import InterviewService
from app.services.report_generator import ReportGenerator
from app.services.report_storage_service import ReportStorageService
from app.services.profile_service import ProfileService

class ReportService:
    """Handles interview report generation and retrieval."""

    @staticmethod
    def _average_score(
        responses: list[dict[str, Any]],
        field_name: str,
    ) -> float:
        """Calculate the average value of a score field."""

        values: list[float] = []

        for response in responses:
            value = response.get(
                field_name
            )

            if isinstance(
                value,
                (int, float),
            ):
                values.append(
                    float(value)
                )

        if not values:
            raise ValidationException(
                f"No valid {field_name} values were found."
            )

        return round(
            mean(values),
            2,
        )

    @staticmethod
    def _build_feedback(
        technical_score: float,
        communication_score: float,
        confidence_score: float,
        fluency_score: float,
    ) -> tuple[
        list[str],
        list[str],
        list[str],
    ]:
        """
        Generate deterministic report feedback
        from category-level scores.
        """

        strengths: list[str] = []
        weaknesses: list[str] = []
        suggestions: list[str] = []

        categories = [
            (
                technical_score,
                "Strong technical understanding and accurate responses.",
                "Technical depth and accuracy need improvement.",
                "Review core concepts and practice explaining technical reasoning clearly.",
            ),
            (
                communication_score,
                "Communicates ideas clearly and in a structured manner.",
                "Communication could be clearer and more structured.",
                "Practice organizing answers into a clear beginning, explanation, and conclusion.",
            ),
            (
                confidence_score,
                "Demonstrates good confidence while answering.",
                "Confidence appears inconsistent during responses.",
                "Practice answering common interview questions aloud to improve confidence and composure.",
            ),
            (
                fluency_score,
                "Answers are fluent and generally well paced.",
                "Fluency and delivery could be improved.",
                "Practice speaking continuously with fewer unnecessary pauses and filler words.",
            ),
        ]

        for (
            score,
            strength_text,
            weakness_text,
            suggestion_text,
        ) in categories:
            if score >= 80:
                strengths.append(
                    strength_text
                )

            elif score < 65:
                weaknesses.append(
                    weakness_text
                )

                suggestions.append(
                    suggestion_text
                )

        if not strengths:
            strengths.append(
                "Shows a balanced performance across the evaluated interview areas."
            )

        if not weaknesses:
            weaknesses.append(
                "No major weaknesses were identified, but continued practice can improve consistency."
            )

        if not suggestions:
            suggestions.append(
                "Continue practicing mock interviews and reviewing the detailed feedback for each response."
            )

        return (
            strengths,
            weaknesses,
            suggestions,
        )

    @staticmethod
    def generate_report(
        interview_id: str,
        user_id: str,
    ) -> ReportResponse:
        """
        Generate and save an interview-level report.
        """

        logger.info(
            f"Starting report generation "
            f"(interview={interview_id}, user={user_id})"
        )

        try:
            interview = (
                InterviewService.get_interview(
                    interview_id=interview_id,
                    user_id=user_id,
                )
            )

            if (
                interview.status
                != InterviewStatus.COMPLETED
            ):
                raise ValidationException(
                    "The interview must be completed before generating a report."
                )

            try:
                existing_report = (
                    db_get_report(
                        interview_id
                    )
                )

                logger.info(
                    f"Existing report found "
                    f"(interview={interview_id})"
                )

                return ReportResponse(
                    **existing_report
                )

            except NotFoundException:
                pass

            raw_responses = (
                db_get_interview_responses(
                    interview_id
                )
            )

            responses = cast(
                list[dict[str, Any]],
                raw_responses,
            )

            if not responses:
                raise ValidationException(
                    "No interview responses were found."
                )

            if (
                len(responses)
                != interview.question_count
            ):
                raise ValidationException(
                    "The interview does not contain responses for all questions."
                )

            technical_score = (
                ReportService._average_score(
                    responses,
                    "technical_score",
                )
            )

            communication_score = (
                ReportService._average_score(
                    responses,
                    "communication_score",
                )
            )

            confidence_score = (
                ReportService._average_score(
                    responses,
                    "confidence_score",
                )
            )

            fluency_score = (
                ReportService._average_score(
                    responses,
                    "fluency_score",
                )
            )

            overall_score = (
                ReportService._average_score(
                    responses,
                    "overall_score",
                )
            )

            (
                strengths,
                weaknesses,
                suggestions,
            ) = ReportService._build_feedback(
                technical_score=technical_score,
                communication_score=communication_score,
                confidence_score=confidence_score,
                fluency_score=fluency_score,
            )

            report = (
                db_create_report(
                    interview_id=interview_id,
                    overall_score=overall_score,
                    technical_score=technical_score,
                    communication_score=communication_score,
                    confidence_score=confidence_score,
                    fluency_score=fluency_score,
                    strengths=strengths,
                    weaknesses=weaknesses,
                    suggestions=suggestions,
                    pdf_storage_path=None,
                )
            )

            logger.info(
                f"Report generation completed "
                f"(interview={interview_id}, "
                f"overall_score={overall_score})"
            )

            return ReportResponse(
                **report
            )

        except InterviewIQException:
            raise

    @staticmethod
    def get_report(
        interview_id: str,
        user_id: str,
    ) -> ReportResponse:
        """
        Retrieve a report after validating
        interview ownership.
        """

        logger.info(
            f"Fetching report "
            f"(interview={interview_id}, user={user_id})"
        )

        try:
            InterviewService.get_interview(
                interview_id=interview_id,
                user_id=user_id,
            )

            report = db_get_report(
                interview_id
            )

            return ReportResponse(
                **report
            )

        except InterviewIQException:
            raise

    @staticmethod
    def generate_pdf(
        interview_id: str,
        user_id: str,
    ) -> tuple[
        bytes,
        str,
    ]:
        """
        Generate or retrieve the PDF report.

        If a PDF already exists in storage,
        reuse it instead of generating
        another copy.
        """

        logger.info(
            f"Starting PDF report generation "
            f"(interview={interview_id}, user={user_id})"
        )

        try:
            interview = (
                InterviewService.get_interview(
                    interview_id=interview_id,
                    user_id=user_id,
                )
            )

            if (
                interview.status
                != InterviewStatus.COMPLETED
            ):
                raise ValidationException(
                    "The interview must be completed before generating a PDF report."
                )

            report = (
                ReportService.generate_report(
                    interview_id=interview_id,
                    user_id=user_id,
                )
            )

            # Reuse existing stored PDF.
            if report.pdf_storage_path:
                logger.info(
                    f"Existing PDF report found "
                    f"(interview={interview_id}, "
                    f"path={report.pdf_storage_path})"
                )

                pdf_bytes = (
                    ReportStorageService.download_pdf(
                        report.pdf_storage_path
                    )
                )

                return (
                    pdf_bytes,
                    report.pdf_storage_path,
                )

            # Load candidate profile.
            profile = (
                ProfileService.get_profile(
                    user_id
                )
            )

            raw_questions = (
                db_get_interview_questions(
                    interview_id
                )
            )

            raw_responses = (
                db_get_interview_responses(
                    interview_id
                )
            )

            questions = cast(
                list[dict[str, Any]],
                raw_questions,
            )

            responses = cast(
                list[dict[str, Any]],
                raw_responses,
            )

            if not questions:
                raise ValidationException(
                    "No interview questions were found."
                )

            if not responses:
                raise ValidationException(
                    "No interview responses were found."
                )

            pdf_bytes = (
                ReportGenerator.generate_pdf(
                    interview=interview,
                    report=report,
                    profile=profile,
                    questions=questions,
                    responses=responses,
                )
            )

            storage_path = (
                ReportStorageService.upload_pdf(
                    user_id=user_id,
                    interview_id=interview_id,
                    pdf_bytes=pdf_bytes,
                )
            )

            db_update_pdf_storage_path(
                interview_id=interview_id,
                pdf_storage_path=storage_path,
            )

            logger.info(
                f"PDF report generated successfully "
                f"(interview={interview_id}, "
                f"path={storage_path})"
            )

            return (
                pdf_bytes,
                storage_path,
            )

        except InterviewIQException:
            raise