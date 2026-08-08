from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class DashboardInterviewDistribution(BaseModel):
    type: str
    count: int = Field(
        ge=0,
    )


class DashboardPerformancePoint(BaseModel):
    date: datetime
    score: float = Field(
        ge=0,
        le=100,
    )


class DashboardRecentInterview(BaseModel):
    id: UUID
    job_role: str
    interview_type: str
    difficulty: str
    status: str
    created_at: datetime
    completed_at: datetime | None = None
    duration_seconds: int | None = Field(
        default=None,
        ge=0,
    )
    overall_score: float | None = Field(
        default=None,
        ge=0,
        le=100,
    )
    pdf_path: str | None = None


class DashboardResponse(BaseModel):
    interviews_completed: int = Field(
        ge=0,
    )

    average_score: float = Field(
        ge=0,
        le=100,
    )

    best_score: float = Field(
        ge=0,
        le=100,
    )

    current_streak: int = Field(
        ge=0,
    )

    weekly_progress: float

    practice_minutes: int = Field(
        ge=0,
    )

    performance: list[DashboardPerformancePoint]

    interview_distribution: list[DashboardInterviewDistribution]

    recent_interview: DashboardRecentInterview | None