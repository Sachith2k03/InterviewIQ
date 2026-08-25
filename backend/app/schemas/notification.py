from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: UUID
    user_id: UUID

    type: str

    title: str
    message: str

    is_read: bool

    related_interview_id: UUID | None = None

    created_at: datetime


class NotificationListResponse(BaseModel):
    success: bool
    message: str

    data: list[
        NotificationResponse
    ]

    unread_count: int


class NotificationDetailResponse(BaseModel):
    success: bool
    message: str

    data: NotificationResponse


class NotificationUnreadCountResponse(
    BaseModel
):
    success: bool
    unread_count: int


class NotificationActionResponse(
    BaseModel
):
    success: bool
    message: str