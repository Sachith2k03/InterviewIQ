from uuid import uuid4

from fastapi import UploadFile

from app.core.constants import (
    ALLOWED_AVATAR_MIME_TYPES,
    AVATAR_BUCKET,
    MAX_AVATAR_SIZE,
)
from app.core.logging import logger
from app.database.client import supabase
from app.exceptions.custom_exceptions import (
    DatabaseException,
    InterviewIQException,
    ValidationException,
)


class AvatarStorageService:
    """Handle profile avatar storage."""

    @staticmethod
    async def upload_avatar(
        user_id: str,
        file: UploadFile,
    ) -> str:
        """
        Upload or replace the user's avatar
        and return a public URL.
        """

        try:
            if (
                file.content_type
                not in ALLOWED_AVATAR_MIME_TYPES
            ):
                raise ValidationException(
                    "Profile picture must be JPEG, PNG, or WebP."
                )

            await file.seek(0)

            file_bytes = await file.read(
                MAX_AVATAR_SIZE + 1
            )

            if not file_bytes:
                raise ValidationException(
                    "The uploaded image is empty."
                )

            if (
                len(file_bytes)
                > MAX_AVATAR_SIZE
            ):
                raise ValidationException(
                    "Profile picture must be 2 MB or smaller."
                )

            # Stable object path means uploading
            # a new avatar replaces the previous one.
            storage_path = (
                f"{user_id}/avatar"
            )

            logger.info(
                "Uploading profile avatar "
                f"(user_id={user_id}, path={storage_path})"
            )

            supabase.storage.from_(
                AVATAR_BUCKET
            ).upload(
                path=storage_path,
                file=file_bytes,
                file_options={  # type: ignore[arg-type]
                    "content-type": (
                        file.content_type
                        or "image/jpeg"
                    ),
                    "upsert": "true",
                },
            )

            public_url = (
                supabase.storage
                .from_(
                    AVATAR_BUCKET
                )
                .get_public_url(
                    storage_path
                )
            )

            # Cache-busting query so the browser
            # immediately displays a replaced avatar.
            separator = (
                "&"
                if "?" in public_url
                else "?"
            )

            avatar_url = (
                f"{public_url}"
                f"{separator}"
                f"v={uuid4().hex}"
            )

            logger.info(
                "Profile avatar uploaded successfully "
                f"(user_id={user_id})"
            )

            return avatar_url

        except InterviewIQException:
            raise

        except Exception as error:
            logger.exception(
                "Profile avatar upload failed "
                f"(user_id={user_id})"
            )

            raise DatabaseException(
                "Failed to upload profile picture."
            ) from error

    @staticmethod
    def delete_avatar(
        user_id: str,
    ) -> None:
        """Delete the user's avatar object."""

        storage_path = (
            f"{user_id}/avatar"
        )

        try:
            supabase.storage.from_(
                AVATAR_BUCKET
            ).remove(
                [
                    storage_path
                ]
            )

        except Exception as error:
            logger.exception(
                "Failed to delete profile avatar "
                f"(user_id={user_id})"
            )

            raise DatabaseException(
                "Failed to delete profile picture."
            ) from error