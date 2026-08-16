from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ReportResponse(BaseModel):
    id: UUID
    interview_id: UUID

    overall_score: float
    technical_score: float
    communication_score: float
    confidence_score: float
    fluency_score: float

    strengths: list[str]
    weaknesses: list[str]
    suggestions: list[str]

    pdf_storage_path: str | None = None

    created_at: datetime
    updated_at: datetime | None = None


class ReportDetailResponse(BaseModel):
    success: bool
    message: str
    data: ReportResponse