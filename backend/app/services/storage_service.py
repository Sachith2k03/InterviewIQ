from uuid import uuid4

from fastapi import UploadFile

from app.database.client import supabase
from app.exceptions.custom_exceptions import (
    DatabaseException,
    InterviewIQException,
)

from app.core.constants import RESUME_BUCKET




class StorageService:
    """ Handles file uploads and deletions in Supabase Storage."""


    @staticmethod
    async def upload_resume(
        user_id: str,
        file: UploadFile,
    ) -> str:
        """Uploads a resume to supabase Storage and Returns the storage path of the uploaded file."""

        try:
            extention = file.filename.split(".")[-1]

            file_name = f"{uuid4()}.{extention}"

            storage_path = f"{user_id}/{file_name}"

            file_bytes = await file.read()

            supabase.storage.from_(RESUME_BUCKET).upload(
                path = storage_path,
                file = file_bytes,
                file_options = {
                    "content_type": file.content_type,
                },
            )

            return storage_path
        
        except InterviewIQException:
            raise

        except Exception as e:
            raise DatabaseException(str(e))
        
    
    @staticmethod
    def delete_resume(storage_path: str):
        """Delete a resume from storage"""

        try:
            supabase.storage.from_(RESUME_BUCKET).remove(
                [storage_path]
            )
        
        except InterviewIQException:
            raise

        except Exception as e:
            raise DatabaseException(str(e))
