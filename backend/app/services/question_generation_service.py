import json

import google.generativeai as genai  # type: ignore[import-untyped]
from pydantic import ValidationError as PydanticValidationError

from app.core.config import settings
from app.core.logging import logger
from app.core.prompts import QUESTION_GENERATION_PROMPT
from app.database.interview_question_queries import (
    create_interview_questions as db_create_interview_questions,
    get_interview_questions as db_get_interview_questions,
)
from app.database.resume_queries import get_resume
from app.exceptions.custom_exceptions import (
    InterviewIQException,
    ValidationException,
)
from app.schemas.question_generation import GeneratedQuestions
from app.services.interview_service import InterviewService


genai.configure(
    api_key=settings.GEMINI_API_KEY,
)


class QuestionGenerationService:
    """Handles AI generation of interview questions."""

    _model = genai.GenerativeModel(
        model_name="gemini-3.5-flash",
        generation_config={
            "response_mime_type": "application/json",
            "response_schema": {
                "type": "object",
                "properties": {
                    "questions": {
                        "type": "array",
                        "items": {
                            "type": "string",
                        },
                    },
                },
                "required": [
                    "questions",
                ],
            },
        },
    )

    @staticmethod
    def _build_prompt(
        job_role: str,
        interview_type: str,
        difficulty: str,
        question_count: int,
        resume_text: str,
    ) -> str:
        """Build the interview question generation prompt."""

        return QUESTION_GENERATION_PROMPT.format(
            job_role=job_role,
            interview_type=interview_type,
            difficulty=difficulty,
            question_count=question_count,
            resume_text=resume_text,
        )

    @staticmethod
    def _validate_questions(
        questions: list[str],
        expected_count: int,
    ) -> list[str]:
        """Validate and normalize generated questions."""

        cleaned_questions = [
            question.strip()
            for question in questions
            if question.strip()
        ]

        if len(cleaned_questions) != expected_count:
            raise ValidationException(
                "AI did not generate the required number of questions."
            )

        normalized_questions = {
            question.casefold()
            for question in cleaned_questions
        }

        if len(normalized_questions) != expected_count:
            raise ValidationException(
                "AI generated duplicate interview questions."
            )

        return cleaned_questions

    @staticmethod
    def generate_questions(
        interview_id: str,
        user_id: str,
    ) -> list[dict[str, object]]:
        """
        Generate and save questions for an interview.
        """

        logger.info(
            f"Starting question generation "
            f"(interview={interview_id}, user={user_id})"
        )

        try:
            interview = InterviewService.get_interview(
                interview_id=interview_id,
                user_id=user_id,
            )

            existing_questions = db_get_interview_questions(
                interview_id
            )

            if existing_questions:
                raise ValidationException(
                    "Questions have already been generated for this interview."
                )

            if interview.resume_id is None:
                raise ValidationException(
                    "A resume is required to generate interview questions."
                )

            resume = get_resume(
                str(interview.resume_id)
            )

            if str(resume["user_id"]) != user_id:
                raise ValidationException(
                    "The selected resume does not belong to this user."
                )

            raw_resume_text = resume.get(
                "parsed_text"
            )

            resume_text = (
                raw_resume_text
                if isinstance(raw_resume_text, str)
                else ""
            )

            if not resume_text.strip():
                raise ValidationException(
                    "The selected resume does not contain readable text."
                )

            prompt = QuestionGenerationService._build_prompt(
                job_role=interview.job_role,
                interview_type=interview.interview_type.value,
                difficulty=interview.difficulty.value,
                question_count=interview.question_count,
                resume_text=resume_text,
            )

            generated: GeneratedQuestions | None = None

            for attempt in range(2):
                logger.info(
                    f"Generating interview questions "
                    f"(attempt={attempt + 1}, "
                    f"interview={interview_id})"
                )

                response = (
                    QuestionGenerationService
                    ._model
                    .generate_content(
                        prompt
                    )
                )

                try:
                    response_text = response.text.strip()

                    generation_data = json.loads(
                        response_text
                    )

                    generated = (
                        GeneratedQuestions.model_validate(
                            generation_data
                        )
                    )

                    logger.info(
                        f"Valid question generation response received "
                        f"(attempt={attempt + 1}, "
                        f"interview={interview_id})"
                    )

                    break

                except (
                    json.JSONDecodeError,
                    PydanticValidationError,
                ) as error:
                    logger.warning(
                        f"Invalid AI question generation response "
                        f"(attempt={attempt + 1}, "
                        f"interview={interview_id}, "
                        f"error={type(error).__name__})"
                    )

                    if attempt == 1:
                        raise ValidationException(
                            "AI returned an invalid question generation response."
                        ) from error

            if generated is None:
                raise ValidationException(
                    "AI returned an invalid question generation response."
                )

            questions = (
                QuestionGenerationService._validate_questions(
                    questions=generated.questions,
                    expected_count=interview.question_count,
                )
            )

            saved_questions = (
                db_create_interview_questions(
                    interview_id=interview_id,
                    questions=questions,
                )
            )

            logger.info(
                f"Question generation completed "
                f"(interview={interview_id}, "
                f"questions={len(saved_questions)})"
            )

            return saved_questions

        except InterviewIQException:
            raise

        except Exception as error:
            logger.exception(
                "Interview question generation failed."
            )

            raise InterviewIQException(
                "Failed to generate interview questions."
            ) from error