from uuid import uuid4

from fastapi import UploadFile
from pathlib import Path
from app.database.client import supabase
from app.exceptions.custom_exceptions import (
    DatabaseException,
    InterviewIQException,
    ValidationException,
)

from app.core.constants import RESUME_BUCKET
from app.core.logging import logger
from typing import cast


class StorageService:
    """ Handles file uploads and deletions in Supabase Storage."""


    @staticmethod
    async def upload_resume(
        user_id: str,
        file: UploadFile,
    ) -> str:
        """Uploads a resume to supabase Storage and Returns the storage path of the uploaded file."""

        try:
            if file.filename is None:
                raise ValidationException("File name is missing.")

            extension = Path(file.filename).suffix.lstrip(".")

            file_name = f"{uuid4()}.{extension}"

            storage_path = f"{user_id}/{file_name}"

            file_bytes = await file.read()

            logger.info(
                f"uploading resume for user_id={user_id}"
            )

            supabase.storage.from_(RESUME_BUCKET).upload(
                path = storage_path,
                file = file_bytes,
                file_options ={ # type: ignore[arg-type]
                    "content_type": file.content_type,
                    },
                ), 
            

            logger.info(
                f"Resume uploaded successfully (user_id={user_id}, path={storage_path})"
            )

            return storage_path
        
        except InterviewIQException:
            raise

        except Exception as e:
            logger.exception(f"Storage upload failed.")
            raise DatabaseException("Failed to upload file to storage.")

        
    
    @staticmethod
    def delete_resume(storage_path: str) -> None:
        """Delete a resume from storage"""

        logger.info(
            f"Deleting file from bucket '{RESUME_BUCKET}' at path '{storage_path}'"
        )
        try:
            supabase.storage.from_(RESUME_BUCKET).remove(
                [storage_path]
            )
            logger.info(
                f"File deleted successfully from bucket '{RESUME_BUCKET}': {storage_path}"
            )
        
        except InterviewIQException:
            raise

        except Exception as e:
            logger.exception(f"Storage deletion failed.")
            raise DatabaseException("Failed to delete file from storage.")

