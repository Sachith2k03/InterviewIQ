import json

import google.generativeai as genai #type: ignore[import]

from app.core.config import settings
from app.core.logging import logger
from app.exceptions.custom_exceptions import (
    InterviewIQException,
)
from app.core.prompts import (EVALUATION_PROMPT)
from app.schemas.evaluation import EvaluationResult

genai.configure(
    api_key=settings.GEMINI_API_KEY
)

import json

import google.generativeai as genai

from app.core.logging import logger
from app.core.prompts import EVALUATION_PROMPT
from app.exceptions.custom_exceptions import InterviewIQException


class EvaluationService:

    _model = genai.GenerativeModel(
        model_name="gemini-3.5-flash",
        generation_config={
            "response_mime_type": "application/json",
        },
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
                prompt
            )

            evaluation_data = json.loads(response.text)

            evaluation = EvaluationResult.model_validate(
                evaluation_data
            )
            
            logger.info("AI evaluation completed.")

            return evaluation

        except InterviewIQException:
            raise

        except json.JSONDecodeError as e:
            logger.exception("Invalid JSON returned by Gemini.")

            raise InterviewIQException(
                "AI returned an invalid evaluation response."
            ) from e

        except Exception as e:
            logger.exception("AI evaluation failed.")

            raise InterviewIQException(
                "Failed to evaluate interview response."
            ) from e