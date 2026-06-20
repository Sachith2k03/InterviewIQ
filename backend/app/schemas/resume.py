from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ResumeResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    file_name: str
    file_path: str
    parsed_text: str | None
    created_at: datetime


class ResumeUploadResponse(BaseModel):
    success: bool
    message: str
    data: ResumeResponse
    