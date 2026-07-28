import json

import google.generativeai as genai #type: ignore[import]

from app.core.config import settings
from app.core.logging import logger
from app.exceptions.custom_exceptions import (
    DatabaseException,
    InterviewIQException,
)

genai.configure(
    api_key=settings.GEMINI_API_KEY
)

class EvaluationService:

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
       
       return f"""
You are an expert interview evaluator.
Evaluate the following interview answer.

Job Role: 
{job_role}
Difficulty Level: 
{difficulty}
Question: 
{question}
Candidate's Answer: 
{transcript}

Evaluate the candidate using the following criteria:

1. Technical Accuracy: Assess the correctness and depth of the candidate's answer. Provide a score from 1 to 100, where 1 is poor and 100 is excellent.
2. Communication: Evaluate the clarity, coherence, and effectiveness of the candidate's communication. Provide a score from 1 to 100.
3. Confidence: Assess the candidate's confidence and composure during the answer. Provide a score from 1 to 100.
4. Fluency: Evaluate the candidate's ability to articulate their thoughts smoothly and without hesitation. Provide a score from 1 to 100.
5. Overall Performance: Provide an overall score from 1 to 100, considering all the above criteria.

Each Score must be between 1 and 100. 

Return ONLY a JSON object with the following structure:

{{
    "technical_score": 0,
    "communication_score": 0,
    "confidence_score": 0,
    "fluency_score": 0,
    "overall_score": 0,
    "question_feedback": ""
}}

Do not return markdown, explanations, or any text outside the JSON object. The feedback should be concise and constructive, highlighting strengths and areas for improvement.
Do not explain anything.
Return JSON only. 
"""
    
    @staticmethod
    def evaluate_response(
        question: str,
        transcript: str,
        job_role: str,
        difficulty: str,
    ) -> dict[str, object]:
        
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

            logger.info("AI evaluation completed.")

            evaluation = json.loads(response.text)

            return evaluation
            
        
        except InterviewIQException:
            raise

        except Exception as e:
            logger.exception("AI evaluation failed.")

            raise DatabaseException(
                "Failed to evaluate interview response."
            ) from e