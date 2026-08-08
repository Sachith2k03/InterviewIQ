from pydantic import BaseModel, Field


class EvaluationResult(BaseModel):
    technical_score: float = Field(ge=0, le=100)
    communication_score: float = Field(ge=0, le=100)
    confidence_score: float = Field(ge=0, le=100)
    fluency_score: float = Field(ge=0, le=100)
    overall_score: float = Field(ge=0, le=100)
    question_feedback: str

