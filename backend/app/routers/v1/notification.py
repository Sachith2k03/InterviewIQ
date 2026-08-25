from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    Query,
    status,
)
from supabase_auth.types import User

from app.dependencies import (
    get_current_user,
)
from app.schemas.notification import (
    NotificationActionResponse,
    NotificationDetailResponse,
    NotificationListResponse,
    NotificationUnreadCountResponse,
)
from app.services.notification_service import (
    NotificationService,
)


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


@router.get(
    "",
    response_model=NotificationListResponse,
)
async def list_notifications(
    limit: int = Query(
        default=20,
        ge=1,
        le=50,
    ),
    current_user: User = Depends(
        get_current_user
    ),
) -> NotificationListResponse:
    (
        notifications,
        unread_count,
    ) = NotificationService.list_notifications(
        user_id=str(
            current_user.id
        ),
        limit=limit,
    )

    return NotificationListResponse(
        success=True,
        message=(
            "Notifications retrieved successfully."
        ),
        data=notifications,
        unread_count=unread_count,
    )


@router.get(
    "/unread-count",
    response_model=(
        NotificationUnreadCountResponse
    ),
)
async def get_unread_count(
    current_user: User = Depends(
        get_current_user
    ),
) -> NotificationUnreadCountResponse:
    unread_count = (
        NotificationService.unread_count(
            user_id=str(
                current_user.id
            )
        )
    )

    return NotificationUnreadCountResponse(
        success=True,
        unread_count=unread_count,
    )


@router.patch(
    "/read-all",
    response_model=(
        NotificationActionResponse
    ),
)
async def mark_all_as_read(
    current_user: User = Depends(
        get_current_user
    ),
) -> NotificationActionResponse:
    NotificationService.mark_all_as_read(
        user_id=str(
            current_user.id
        )
    )

    return NotificationActionResponse(
        success=True,
        message=(
            "All notifications marked as read."
        ),
    )


@router.patch(
    "/{notification_id}/read",
    response_model=(
        NotificationDetailResponse
    ),
)
async def mark_as_read(
    notification_id: UUID,
    current_user: User = Depends(
        get_current_user
    ),
) -> NotificationDetailResponse:
    notification = (
        NotificationService.mark_as_read(
            notification_id=str(
                notification_id
            ),
            user_id=str(
                current_user.id
            ),
        )
    )

    return NotificationDetailResponse(
        success=True,
        message=(
            "Notification marked as read."
        ),
        data=notification,
    )


@router.delete(
    "/{notification_id}",
    response_model=(
        NotificationActionResponse
    ),
    status_code=status.HTTP_200_OK,
)
async def remove_notification(
    notification_id: UUID,
    current_user: User = Depends(
        get_current_user
    ),
) -> NotificationActionResponse:
    NotificationService.delete(
        notification_id=str(
            notification_id
        ),
        user_id=str(
            current_user.id
        ),
    )

    return NotificationActionResponse(
        success=True,
        message=(
            "Notification deleted successfully."
        ),
    )