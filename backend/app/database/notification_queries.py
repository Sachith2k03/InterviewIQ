from typing import Any, cast

from postgrest.types import CountMethod, JSON

from app.database.client import supabase
from app.exceptions.custom_exceptions import (
    DatabaseException,
    InterviewIQException,
    NotFoundException,
)


def create_notification(
    user_id: str,
    notification_type: str,
    title: str,
    message: str,
    related_interview_id: str | None = None,
) -> dict[str, Any]:
    """Create a notification."""

    try:
        payload: dict[str, JSON] = {
            "user_id": user_id,
            "type": notification_type,
            "title": title,
            "message": message,
            "is_read": False,
        }

        if related_interview_id is not None:
            payload["related_interview_id"] = (
                related_interview_id
            )

        response = (
            supabase
            .table("notifications")
            .insert(payload)
            .execute()
        )

        if not response.data:
            raise DatabaseException(
                "Failed to create notification."
            )

        return cast(
            dict[str, Any],
            response.data[0],
        )

    except InterviewIQException:
        raise

    except Exception as error:
        raise DatabaseException(
            "Failed to create notification."
        ) from error

def get_user_notifications(
    user_id: str,
    limit: int = 20,
) -> list[dict[str, Any]]:
    """Get latest notifications."""

    try:
        response = (
            supabase
            .table(
                "notifications"
            )
            .select(
                (
                    "id,"
                    "user_id,"
                    "type,"
                    "title,"
                    "message,"
                    "is_read,"
                    "related_interview_id,"
                    "created_at"
                )
            )
            .eq(
                "user_id",
                user_id,
            )
            .order(
                "created_at",
                desc=True,
            )
            .limit(
                limit
            )
            .execute()
        )

        return cast(
            list[dict[str, Any]],
            response.data or [],
        )

    except InterviewIQException:
        raise

    except Exception as error:
        raise DatabaseException(
            "Failed to retrieve notifications."
        ) from error


def count_unread_notifications(
    user_id: str,
) -> int:
    """Count unread notifications."""

    try:
        response = (
            supabase
            .table(
                "notifications"
            )
            .select(
                "id",
                count=CountMethod.exact,
            )
            .eq(
                "user_id",
                user_id,
            )
            .eq(
                "is_read",
                False,
            )
            .execute()
        )

        return (
            response.count
            or 0
        )

    except InterviewIQException:
        raise

    except Exception as error:
        raise DatabaseException(
            "Failed to count unread notifications."
        ) from error


def mark_notification_as_read(
    notification_id: str,
    user_id: str,
) -> dict[str, Any]:
    """
    Mark one notification as read.

    Ownership is enforced by user_id.
    """

    try:
        response = (
            supabase
            .table(
                "notifications"
            )
            .update(
                {
                    "is_read": True,
                }
            )
            .eq(
                "id",
                notification_id,
            )
            .eq(
                "user_id",
                user_id,
            )
            .execute()
        )

        if not response.data:
            raise NotFoundException(
                "Notification not found."
            )

        return cast(
            dict[str, Any],
            response.data[0],
        )

    except InterviewIQException:
        raise

    except Exception as error:
        raise DatabaseException(
            "Failed to update notification."
        ) from error


def mark_all_notifications_as_read(
    user_id: str,
) -> None:
    """Mark all unread notifications as read."""

    try:
        (
            supabase
            .table(
                "notifications"
            )
            .update(
                {
                    "is_read": True,
                }
            )
            .eq(
                "user_id",
                user_id,
            )
            .eq(
                "is_read",
                False,
            )
            .execute()
        )

    except InterviewIQException:
        raise

    except Exception as error:
        raise DatabaseException(
            "Failed to update notifications."
        ) from error


def delete_notification(
    notification_id: str,
    user_id: str,
) -> None:
    """Delete one owned notification."""

    try:
        response = (
            supabase
            .table(
                "notifications"
            )
            .delete()
            .eq(
                "id",
                notification_id,
            )
            .eq(
                "user_id",
                user_id,
            )
            .execute()
        )

        if not response.data:
            raise NotFoundException(
                "Notification not found."
            )

    except InterviewIQException:
        raise

    except Exception as error:
        raise DatabaseException(
            "Failed to delete notification."
        ) from error