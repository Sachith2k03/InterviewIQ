from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.core.enums import (
    InterviewDifficulty,
    InterviewStatus,
    InterviewType,
)


class InterviewBase(BaseModel):
    """Common interview fields."""

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

    resume_id: UUID


class UpdateInterviewStatusRequest(BaseModel):
    """Request model for updating interview status."""

    status: InterviewStatus


class InterviewResponse(InterviewBase):
    """Interview response model."""

    model_config = ConfigDict(
        from_attributes=True,
    )

    id: UUID
    user_id: UUID
    resume_id: UUID | None

    status: InterviewStatus

    started_at: datetime | None
    completed_at: datetime | None
    duration_seconds: int | None
    last_resumed_at: datetime | None

    created_at: datetime
    updated_at: datetime


class InterviewHistoryItem(BaseModel):
    """Interview item returned by the interview history view."""

    id: UUID
    user_id: UUID

    job_role: str
    interview_type: InterviewType
    difficulty: InterviewDifficulty
    question_count: int
    status: InterviewStatus

    created_at: datetime
    started_at: datetime | None = None
    completed_at: datetime | None = None
    duration_seconds: int | None = None

    resume_title: str | None = None

    overall_score: float | None = None
    technical_score: float | None = None
    communication_score: float | None = None
    confidence_score: float | None = None
    fluency_score: float | None = None

    pdf_path: str | None = None

class PaginationMeta(BaseModel):
    """Pagination metadata."""

    page: int = Field(
        ge=1,
    )

    page_size: int = Field(
        ge=1,
    )

    total_items: int = Field(
        ge=0,
    )

    total_pages: int = Field(
        ge=0,
    )

    has_next: bool
    has_previous: bool
class InterviewListResponse(BaseModel):
    """Response model for listing paginated interviews."""

    success: bool
    message: str
    data: list[InterviewHistoryItem]
    pagination: PaginationMeta


class InterviewCreateResponse(BaseModel):
    """Response model for creating an interview."""

    success: bool
    message: str
    data: InterviewResponse


class InterviewDetailResponse(BaseModel):
    """Response model for interview details."""

    success: bool
    message: str
    data: InterviewResponse

