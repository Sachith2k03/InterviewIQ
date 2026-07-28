from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field



class ResponseBase(BaseModel):
    """Base response model for all API responses."""

    question_number: int = Field(
        ge=1,
    )

    question : str = Field(
        min_length=1,
    )


class CreateResponseRequest(ResponseBase):
    """Request model for creating an interview responses."""

    interview_id: UUID

    audio_path: str | None = None

    transcript: str | None = None

    answer_duration_seconds: int | None = Field(
        default=None,
        ge=0,
    )


class UpdateTranscriptRequest(BaseModel):
    """Update transcript."""

    transcript: str 


class UpdateAnalysisRequest(BaseModel):
    """Save AI analysis results."""

    technical_score: float = Field(
        ge=0,
        le=100,
    )

    communication_score: float = Field(
        ge=0,
        le=100,
    )

    confidence_score: float = Field(
        ge=0,
        le=100,
    )

    fluency_score: float = Field(
        ge=0,
        le=100,
    )

    overall_score: float = Field(
        ge=0,
        le=100,
    )

    question_feedback: str


class ResponseResponse(ResponseBase):
    """Interview response."""

    model_config = ConfigDict(
        from_attributes=True,
    )

    id: UUID

    interview_id: UUID

    audio_path: str | None

    transcript: str | None

    answer_duration_seconds: int | None

    technical_score: float | None

    communication_score: float | None

    confidence_score: float | None

    fluency_score: float | None

    overall_score: float | None

    question_feedback: str | None

    created_at: datetime

    updated_at: datetime


class ResponseDetailResponse(BaseModel):
    """Single Response"""

    success: bool

    message: str

    data: ResponseResponse


class ResponseListResponse(BaseModel):
    """List of Responses"""

    success: bool

    message: str

    data: list[ResponseResponse]


