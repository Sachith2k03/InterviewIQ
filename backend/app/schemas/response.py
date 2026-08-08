from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ResponseBase(BaseModel):
    """Base model for an interview response."""

    question_number: int = Field(
        ge=1,
    )


class CreateResponseRequest(ResponseBase):
    """Request model for submitting an interview response."""

    interview_id: UUID

    answer_duration_seconds: int | None = Field(
        default=None,
        ge=0,
    )


class UpdateTranscriptRequest(BaseModel):
    """Request model for updating a transcript."""

    transcript: str = Field(
        min_length=1,
    )


class UpdateAnalysisRequest(BaseModel):
    """Request model for saving AI analysis."""

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

    question_feedback: str = Field(
        min_length=1,
    )


class ResponseResponse(ResponseBase):
    """Interview response model."""

    model_config = ConfigDict(
        from_attributes=True,
    )

    id: UUID
    interview_id: UUID

    audio_storage_path: str | None
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
    """API response containing one interview response."""

    success: bool
    message: str
    data: ResponseResponse


class ResponseListResponse(BaseModel):
    """API response containing multiple interview responses."""

    success: bool
    message: str
    data: list[ResponseResponse]