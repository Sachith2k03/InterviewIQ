from uuid import uuid4

from fastapi import UploadFile

from app.database.client import supabase
from app.exceptions.custom_exceptions import (
    DatabaseException,
    InterviewIQException,
    ValidationException,
)

from app.core.constants import RESUME_BUCKET
from app.core.logging import logger


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

            extension = file.filename.split(".")[-1]

            file_name = f"{uuid4()}.{extension}"

            storage_path = f"{user_id}/{file_name}"

            file_bytes = await file.read()

            logger.info(
                f"uploading file to bucket '{RESUME_BUCKET}'"
            )

            supabase.storage.from_(RESUME_BUCKET).upload(
                path = storage_path,
                file = file_bytes,
                file_options = {
                    "content_type": file.content_type,
                },
            )

            logger.info(
                f"File uploaded successfully to bucket '{RESUME_BUCKET}': {storage_path}"
            )

            return storage_path
        
        except InterviewIQException:
            raise

        except Exception as e:
            logger.error(f"Storage upload failed: {str(e)}")
            raise DatabaseException("Failed to upload file to storage.")

        
    
    @staticmethod
    def delete_resume(storage_path: str):
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
            logger.error(f"Storage deletion failed: {str(e)}")
            raise DatabaseException("Failed to delete file from storage.")
