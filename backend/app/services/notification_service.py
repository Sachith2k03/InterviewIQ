from app.core.logging import logger
from app.database.notification_queries import (
    count_unread_notifications,
    create_notification,
    delete_notification,
    get_user_notifications,
    mark_all_notifications_as_read,
    mark_notification_as_read,
)
from app.exceptions.custom_exceptions import (
    InterviewIQException,
)
from app.schemas.notification import (
    NotificationResponse,
)


class NotificationService:
    """Handle in-app notifications."""

    @staticmethod
    def create(
        user_id: str,
        notification_type: str,
        title: str,
        message: str,
        related_interview_id: str | None = None,
    ) -> NotificationResponse:
        notification = (
            create_notification(
                user_id=user_id,
                notification_type=(
                    notification_type
                ),
                title=title,
                message=message,
                related_interview_id=(
                    related_interview_id
                ),
            )
        )

        return NotificationResponse(
            **notification
        )

    @staticmethod
    def create_safely(
        user_id: str,
        notification_type: str,
        title: str,
        message: str,
        related_interview_id: str | None = None,
    ) -> None:
        """
        Best-effort notification creation.

        Notification failures must not break
        core actions such as interview creation.
        """

        try:
            NotificationService.create(
                user_id=user_id,
                notification_type=(
                    notification_type
                ),
                title=title,
                message=message,
                related_interview_id=(
                    related_interview_id
                ),
            )

        except InterviewIQException:
            logger.exception(
                "Failed to create notification "
                f"(user_id={user_id}, "
                f"type={notification_type})"
            )

    @staticmethod
    def list_notifications(
        user_id: str,
        limit: int = 20,
    ) -> tuple[
        list[NotificationResponse],
        int,
    ]:
        rows = (
            get_user_notifications(
                user_id=user_id,
                limit=limit,
            )
        )

        notifications = [
            NotificationResponse(
                **row
            )
            for row in rows
        ]

        unread_count = (
            count_unread_notifications(
                user_id
            )
        )

        return (
            notifications,
            unread_count,
        )

    @staticmethod
    def unread_count(
        user_id: str,
    ) -> int:
        return (
            count_unread_notifications(
                user_id
            )
        )

    @staticmethod
    def mark_as_read(
        notification_id: str,
        user_id: str,
    ) -> NotificationResponse:
        notification = (
            mark_notification_as_read(
                notification_id=(
                    notification_id
                ),
                user_id=user_id,
            )
        )

        return NotificationResponse(
            **notification
        )

    @staticmethod
    def mark_all_as_read(
        user_id: str,
    ) -> None:
        mark_all_notifications_as_read(
            user_id
        )

    @staticmethod
    def delete(
        notification_id: str,
        user_id: str,
    ) -> None:
        delete_notification(
            notification_id=(
                notification_id
            ),
            user_id=user_id,
        )