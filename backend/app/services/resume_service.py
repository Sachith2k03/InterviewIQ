


import fitz
from fastapi import UploadFile

from app.database.resume_queries import create_resume
from app.utils.validators import validate_resume

from app.services.storage_service import StorageService
from app.core.logging import logger
from app.exceptions.custom_exceptions import ValidationException



class ResumeService:
    """Handles resume upload and parsing."""

    @staticmethod
    async def upload_resume(
        user_id:str,
        file: UploadFile,
        title: str,
    ) -> dict[str, object]:
        """Upload a resume, extract text, and save metadata."""

        logger.info(
            f"Resume upload started (user_id={user_id})"
        )

        await validate_resume(file)

        logger.info(
            f"Resume validated (file={file.filename})"
        )


        storage_path = await StorageService.upload_resume(
            user_id=user_id,
            file=file,
        )


        logger.info(
            f"Resume stored successfully (path={storage_path})"
        )



        try:
            parsed_text = await ResumeService.extract_text(file)

        except Exception:
            logger.exception(
                f"Failed to extract text from resume: {file.filename}"
            )

            raise ValidationException("Unable to process the uploaded PDF.")



        if file.filename is None:
            raise ValidationException("File name is missing.")
        
        file_name = file.filename

        resume = create_resume(
            user_id=user_id,
            title=title,
            file_name=file_name,
            file_path=storage_path,
            parsed_text=parsed_text
        )

        logger.info(
            f"Resume record created: {resume['id']}"
        )
    
        logger.info(
            f"Resume upload completed (user_id={user_id})"
        )
        return resume
    
        

    @staticmethod
    async def extract_text(
        file: UploadFile,
    ) -> str:
        """Extract text from PDF"""

        logger.info(
            f"Extracting text from resume: {file.filename}"
        )

        await file.seek(0)

        pdf_bytes = await file.read()

        document = fitz.open(
            stream=pdf_bytes,
            filetype="pdf"
        )
        try:
            text = "\n".join(
                document.load_page(i).get_text()
                for i in range(document.page_count)
            )
        finally:
            document.close()

            
        logger.info(
            f"Text extracted from resume: {file.filename}"
        )

        document.close()

        return text