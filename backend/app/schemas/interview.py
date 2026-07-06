from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict

from app.core.enums import (
    InterviewDifficulty,
    InterviewStatus,
    InterviewType,
)

class InterviewBase(BaseModel):
    job_role: str = Field(
        min_length=2,
        max_length=100,
    )
    interview_type: InterviewType
    difficulty: InterviewDifficulty
    question_count: int = Field(
        default=10,
        ge=1,
        le=50,
    )


class CreateInterviewRequest(InterviewBase):
    """Request model for creating a new interview."""
    resume_id: UUID | None = None


class UpdateInterviewStatusRequest(BaseModel):
    """Request model for updating interview status."""

    status: InterviewStatus


class InterviewResponse(InterviewBase):
    """Interview response model."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    resume_id: UUID | None

    status: InterviewStatus

    started_at: datetime | None
    completed_at: datetime | None
    duration_seconds: int | None

    created_at: datetime
    updated_at: datetime

class InterviewListResponse(BaseModel):
    """Response model for listing interviews."""

    success: bool
    message: str
    data: list[InterviewResponse]

class InterviewCreateResponse(BaseModel):
    """Response model for creating an interview."""

    success: bool
    message: str
    data: InterviewResponse

class InterviewDetailResponse(BaseModel):
    """Response model for interview detail."""

    success: bool
    message: str
    data: InterviewResponse