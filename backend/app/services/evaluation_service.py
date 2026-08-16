import json

import google.generativeai as genai  # type: ignore[import]
from pydantic import ValidationError as PydanticValidationError

from app.core.config import settings
from app.core.logging import logger
from app.core.prompts import EVALUATION_PROMPT
from app.exceptions.custom_exceptions import (
    DatabaseException,
    InterviewIQException,
)
from app.schemas.evaluation import EvaluationResult


genai.configure(
    api_key=settings.GEMINI_API_KEY,
)


class EvaluationService:
    """Handles AI evaluation of interview responses."""

    _model = genai.GenerativeModel(
        model_name="models/gemini-3.5-flash",
        generation_config={
            "response_mime_type": "application/json",
            "response_schema": {
                "type": "object",
                "properties": {
                    "technical_score": {
                        "type": "integer",
                    },
                    "communication_score": {
                        "type": "integer",
                    },
                    "confidence_score": {
                        "type": "integer",
                    },
                    "fluency_score": {
                        "type": "integer",
                    },
                    "overall_score": {
                        "type": "integer",
                    },
                    "question_feedback": {
                        "type": "string",
                    },
                },
                "required": [
                    "technical_score",
                    "communication_score",
                    "confidence_score",
                    "fluency_score",
                    "overall_score",
                    "question_feedback",
                ],
            },
        },
    )

    @staticmethod
    def _build_prompt(
        question: str,
        transcript: str,
        job_role: str,
        difficulty: str,
    ) -> str:
        """Build the interview evaluation prompt."""

        return EVALUATION_PROMPT.format(
            question=question,
            transcript=transcript,
            job_role=job_role,
            difficulty=difficulty,
        )

    @staticmethod
    def evaluate_response(
        question: str,
        transcript: str,
        job_role: str,
        difficulty: str,
    ) -> EvaluationResult:
        """Evaluate an interview response using Gemini."""

        logger.info(
            "Starting AI evaluation."
        )

        try:
            prompt = (
                EvaluationService._build_prompt(
                    question=question,
                    transcript=transcript,
                    job_role=job_role,
                    difficulty=difficulty,
                )
            )

            evaluation: EvaluationResult | None = None

            for attempt in range(2):
                logger.info(
                    f"Generating AI evaluation "
                    f"(attempt={attempt + 1})"
                )

                response = (
                    EvaluationService
                    ._model
                    .generate_content(
                        prompt
                    )
                )

                try:
                    response_text = (
                        response.text.strip()
                    )

                    data = json.loads(
                        response_text
                    )

                    evaluation = (
                        EvaluationResult.model_validate(
                            data
                        )
                    )

                    logger.info(
                        f"Valid AI evaluation received "
                        f"(attempt={attempt + 1})"
                    )

                    break

                except (
                    json.JSONDecodeError,
                    PydanticValidationError,
                ) as error:
                    logger.warning(
                        f"Invalid AI evaluation response "
                        f"(attempt={attempt + 1}, "
                        f"error={type(error).__name__})"
                    )

                    if attempt == 1:
                        raise DatabaseException(
                            "AI returned an invalid evaluation response."
                        ) from error

            if evaluation is None:
                raise DatabaseException(
                    "AI returned an invalid evaluation response."
                )

            logger.info(
                "AI evaluation completed successfully."
            )

            return evaluation

        except InterviewIQException:
            raise

        except Exception as error:
            logger.exception(
                "AI evaluation failed."
            )

            raise DatabaseException(
                "Failed to evaluate interview response."
            ) from error