from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID  

class GeneratedQuestions(BaseModel):
    """Structured AI output for generated interview questions."""

    questions: list[str] = Field(
        min_length=1,
    )

class InterviewQuestionResponse(BaseModel):
    id: UUID
    interview_id: UUID
    question_number: int
    question: str
    created_at: datetime


class InterviewQuestionListResponse(BaseModel):
    success: bool
    message: str
    data: list[InterviewQuestionResponse]