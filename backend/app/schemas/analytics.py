from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class AnalyticsSummary(BaseModel):
    completed_interviews: int = Field(
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

    practice_minutes: int = Field(
        ge=0,
    )

    weekly_progress: float


class AnalyticsSkillAverages(BaseModel):
    technical: float = Field(
        ge=0,
        le=100,
    )

    communication: float = Field(
        ge=0,
        le=100,
    )

    confidence: float = Field(
        ge=0,
        le=100,
    )

    fluency: float = Field(
        ge=0,
        le=100,
    )


class AnalyticsTrendPoint(BaseModel):
    interview_id: UUID

    job_role: str

    completed_at: datetime

    overall_score: float = Field(
        ge=0,
        le=100,
    )

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


class AnalyticsDifficultyPerformance(BaseModel):
    difficulty: str

    interview_count: int = Field(
        ge=0,
    )

    average_score: float = Field(
        ge=0,
        le=100,
    )


class AnalyticsTypePerformance(BaseModel):
    interview_type: str

    interview_count: int = Field(
        ge=0,
    )

    average_score: float = Field(
        ge=0,
        le=100,
    )


class AnalyticsInterviewDistribution(BaseModel):
    interview_type: str

    count: int = Field(
        ge=0,
    )


class AnalyticsPracticeActivity(BaseModel):
    this_week: int = Field(
        ge=0,
    )

    last_week: int = Field(
        ge=0,
    )

    this_month: int = Field(
        ge=0,
    )


class AnalyticsInsights(BaseModel):
    strongest_skill: str | None

    strongest_skill_score: float = Field(
        ge=0,
        le=100,
    )

    weakest_skill: str | None

    weakest_skill_score: float = Field(
        ge=0,
        le=100,
    )

    improvement_percentage: float


class AnalyticsResponse(BaseModel):
    summary: AnalyticsSummary

    skill_averages: AnalyticsSkillAverages

    performance_trend: list[
        AnalyticsTrendPoint
    ]

    difficulty_performance: list[
        AnalyticsDifficultyPerformance
    ]

    type_performance: list[
        AnalyticsTypePerformance
    ]

    interview_distribution: list[
        AnalyticsInterviewDistribution
    ]

    practice_activity: AnalyticsPracticeActivity

    insights: AnalyticsInsights