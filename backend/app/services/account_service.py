from app.core.constants import (
    AUDIO_BUCKET,
    REPORT_BUCKET,
    RESUME_BUCKET,
)
from app.core.logging import logger
from app.database.account_queries import (
    delete_auth_user,
    get_account_storage_paths,
)
from app.database.client import supabase
from app.exceptions.custom_exceptions import (
    DatabaseException,
    InterviewIQException,
)
from app.services.avatar_storage_service import (
    AvatarStorageService,
)


class AccountService:
    """Handle complete user account deletion."""

    @staticmethod
    def _delete_storage_files(
        bucket: str,
        paths: list[str],
    ) -> None:
        """Delete storage objects in one batch."""

        if not paths:
            return

        try:
            logger.info(
                f"Deleting {len(paths)} files "
                f"from bucket: {bucket}"
            )

            supabase.storage.from_(
                bucket
            ).remove(
                paths
            )

        except Exception as error:
            logger.exception(
                f"Failed to clean bucket: {bucket}"
            )

            raise DatabaseException(
                "Failed to remove user files."
            ) from error

    @staticmethod
    def delete_account(
        user_id: str,
    ) -> None:
        """
        Permanently remove a user and
        all InterviewIQ data.
        """

        logger.info(
            f"Starting account deletion: {user_id}"
        )

        try:
            storage_paths = (
                get_account_storage_paths(
                    user_id
                )
            )

            # Delete uploaded resumes.
            AccountService._delete_storage_files(
                bucket=RESUME_BUCKET,
                paths=storage_paths[
                    "resume_paths"
                ],
            )

            # Delete interview recordings.
            AccountService._delete_storage_files(
                bucket=AUDIO_BUCKET,
                paths=storage_paths[
                    "audio_paths"
                ],
            )

            # Delete generated PDF reports.
            AccountService._delete_storage_files(
                bucket=REPORT_BUCKET,
                paths=storage_paths[
                    "report_paths"
                ],
            )

            # Delete profile avatar.
            AvatarStorageService.delete_avatar(
                user_id=user_id
            )

            # Deleting the Supabase Auth user should
            # trigger the configured database cascades.
            delete_auth_user(
                user_id
            )

            logger.info(
                f"Account deleted successfully: {user_id}"
            )

        except InterviewIQException:
            raise