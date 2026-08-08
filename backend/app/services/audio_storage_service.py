from fastapi import UploadFile

from app.database.client import supabase
from app.exceptions.custom_exceptions import (
    DatabaseException,
    InterviewIQException,
    ValidationException,
)

from app.core.constants import AUDIO_BUCKET
from app.core.logging import logger



class AudioStorageService:
    """HAndles interview audio uploads and deletions in supabase storage."""

    @staticmethod
    async def upload_audio(
        user_id: str,
        interview_id: str,
        question_number: int,
        file: UploadFile,
    ) -> str:
        """upload interview audio and return its storage path."""

        try:
            from app.core.constants import (
                ALLOWED_AUDIO_MIME_TYPES,
                MAX_AUDIO_SIZE,
            )

            if file.filename is None:
                raise ValidationException(
                    "File name is missing."
                )

            if file.content_type not in ALLOWED_AUDIO_MIME_TYPES:
                raise ValidationException(
                    "Unsupported audio content type."
                )

            file.file.seek(0, 2)
            file_size = file.file.tell()
            file.file.seek(0)

            if file_size > MAX_AUDIO_SIZE:
                raise ValidationException(
                    "Audio size cannot exceed 50 MB."
                )

            storage_path = (
                f"{user_id}/"
                f"{interview_id}/"
                f"question_{question_number}.webm"
            )

            file_bytes = await file.read()

            logger.info(
                f"Uploading interview audio "
                f"(user={user_id},"
                f"interview={interview_id},"
                f"question={question_number})"
            )

            supabase.storage.from_(
                AUDIO_BUCKET
            ).upload(
                path=storage_path,
                file=file_bytes,
                file_options={  # type: ignore[arg-type]
                    "content_type": file.content_type,
                },
            )

            logger.info(
                f"Interview audio uploaded successfully "
                f"(path={storage_path})"
            )

            return storage_path
        
        except InterviewIQException:
            raise

        except Exception:
            logger.exception(
                "Interview audio upload failed."
            )
            raise DatabaseException(
                "Failed to upload interview audio."
            )
        
    @staticmethod
    def delete_audio(
        storage_path: str,
    ) -> None:
        """Delete interview audio from storage."""

        logger.info(
            f"Deleting interview audio "
            f" from '{storage_path}'"
        )

        try:
            supabase.storage.from_(
                AUDIO_BUCKET
            ).remove(
                [storage_path]
            )


            logger.info(
                f"Interview audio deleted:"
                f"{storage_path}"
            )

        except InterviewIQException:
            raise

        except Exception:
            logger.exception(
                "Interview audio deletion failed."
            )
            raise DatabaseException(
                "Failed to delete interview audio."
            )
        
