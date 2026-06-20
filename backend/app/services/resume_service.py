from pathlib import Path

import fitz
from fastapi import UploadFile

from app.database.resume_queries import create_resume
from app.utils.validators import validate_resume
from app.exceptions.custom_exceptions import (
    ValidationException,
)
from app.services.storage_service import StorageService



class ResumeService:
    """Handles resume upload and parsing."""

    @staticmethod
    async def upload_resume(
        user_id:str,
        file: UploadFile,
        title: str,
    ):
        """Upload a resume, extract text, and save metadata."""

        await validate_resume(file)

        storage_path = await StorageService.upload_resume(
            user_id=user_id,
            file=file,
        )

        parsed_text = await ResumeService.extract_text(file)
        
        resume = create_resume(
            user_id=user_id,
            title=title,
            file_name=file.filename,
            file_path=storage_path,
            parsed_text=parsed_text
        )
    
        return resume[0]
    
    @staticmethod
    async def extract_text(
        file: UploadFile,
    ) -> str:
        """Extract text from PDF"""

        await file.seek(0)

        pdf_bytes = await file.read()

        document = fitz.open(
            stream=pdf_bytes,
            filetype="pdf"
        )
    
        text = "\n".join(
            page.get_text()
            for page in document
        )

        document.close()

        return text