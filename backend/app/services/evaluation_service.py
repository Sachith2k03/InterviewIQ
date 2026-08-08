import json

import google.generativeai as genai  # type: ignore[import]

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
        "models/gemini-3.5-flash"
    )

    @staticmethod
    def _build_prompt(
        question: str,
        transcript: str,
        job_role: str,
        difficulty: str,
    ) -> str:
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
        logger.info("Starting AI evaluation.")

        try:
            prompt = EvaluationService._build_prompt(
                question=question,
                transcript=transcript,
                job_role=job_role,
                difficulty=difficulty,
            )

            response = EvaluationService._model.generate_content(
                prompt,
                generation_config={
                    "response_mime_type": "application/json",
                },
            )

            logger.info("AI evaluation completed.")

            data = json.loads(response.text)

            return EvaluationResult(**data)

        except InterviewIQException:
            raise

        except Exception as error:
            logger.exception("AI evaluation failed.")

            raise DatabaseException(
                "Failed to evaluate interview response."
            ) from error