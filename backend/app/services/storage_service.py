from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.core.constants import RESUME_BUCKET
from app.core.logging import logger
from app.database.client import supabase
from app.exceptions.custom_exceptions import (
    DatabaseException,
    InterviewIQException,
    ValidationException,
)


class StorageService:
    """Handle file uploads and deletions in Supabase Storage."""

    @staticmethod
    async def upload_resume(
        user_id: str,
        file: UploadFile,
    ) -> str:
        """Upload a resume and return its Supabase Storage path."""

        try:
            if not file.filename:
                raise ValidationException(
                    "File name is missing."
                )

            extension = (
                Path(file.filename)
                .suffix
                .lower()
                .lstrip(".")
            )

            if not extension:
                raise ValidationException(
                    "The uploaded file has no extension."
                )

            generated_file_name = (
                f"{uuid4()}.{extension}"
            )

            storage_path = (
                f"{user_id}/{generated_file_name}"
            )

            # Ensure reading starts from the beginning.
            await file.seek(0)
            file_bytes = await file.read()

            if not file_bytes:
                raise ValidationException(
                    "The uploaded file is empty."
                )

            logger.info(
                "Uploading resume "
                f"(user_id={user_id}, path={storage_path})"
            )

            supabase.storage.from_(
                RESUME_BUCKET
            ).upload(
                path=storage_path,
                file=file_bytes,
                file_options={  # type: ignore[arg-type]
                    "content-type": (
                        file.content_type
                        or "application/pdf"
                    ),
                    "upsert": "false",
                },
            )

            logger.info(
                "Resume uploaded successfully "
                f"(user_id={user_id}, path={storage_path})"
            )

            return storage_path

        except InterviewIQException:
            raise

        except Exception as error:
            logger.exception(
                "Storage upload failed "
                f"(user_id={user_id})"
            )

            raise DatabaseException(
                "Failed to upload file to storage."
            ) from error

    @staticmethod
    def delete_resume(
        storage_path: str,
    ) -> None:
        """Delete a resume from Supabase Storage."""

        if not storage_path:
            raise ValidationException(
                "Storage path is missing."
            )

        logger.info(
            "Deleting resume from storage "
            f"(bucket={RESUME_BUCKET}, path={storage_path})"
        )

        try:
            supabase.storage.from_(
                RESUME_BUCKET
            ).remove(
                [storage_path]
            )

            logger.info(
                "Resume deleted successfully from storage "
                f"(bucket={RESUME_BUCKET}, path={storage_path})"
            )

        except InterviewIQException:
            raise

        except Exception as error:
            logger.exception(
                "Storage deletion failed "
                f"(bucket={RESUME_BUCKET}, path={storage_path})"
            )

            raise DatabaseException(
                "Failed to delete file from storage."
            ) from error