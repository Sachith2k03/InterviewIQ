from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ResumeResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    file_name: str
    storage_path: str | None = None
    is_archived: bool
    created_at: datetime
    updated_at: datetime



class ResumeUploadResponse(BaseModel):
    success: bool
    message: str
    data: ResumeResponse


class ResumeListResponse(BaseModel):
    success: bool
    message: str
    data: list[ResumeResponse]


class ResumeDeleteResponse(BaseModel):
    success: bool
    message: str
    action: str