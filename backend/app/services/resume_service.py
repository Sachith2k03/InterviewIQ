import fitz
from fastapi import UploadFile

from app.core.logging import logger
from app.database.resume_queries import (
    archive_resume,
    count_active_user_resumes,
    create_resume,
    delete_resume,
    get_resume,
    get_user_resumes,
    is_resume_used_by_interviews,
)
from app.exceptions.custom_exceptions import (
    ForbiddenException,
    ValidationException,
)
from app.services.storage_service import StorageService
from app.utils.validators import validate_resume


class ResumeService:
    """Handles resume upload, parsing, listing, and removal."""

    MAX_ACTIVE_RESUMES = 5

    @staticmethod
    async def upload_resume(
        user_id: str,
        file: UploadFile,
        title: str,
    ) -> dict[str, object]:
        """Upload a resume, extract its text, and save metadata."""

        logger.info(
            f"Resume upload started (user_id={user_id})"
        )

        if file.filename is None:
            raise ValidationException(
                "File name is missing."
            )

        await validate_resume(file)

        logger.info(
            f"Resume validated (file={file.filename})"
        )

        active_resume_count = count_active_user_resumes(
            user_id
        )

        if active_resume_count >= ResumeService.MAX_ACTIVE_RESUMES:
            raise ValidationException(
                "You can have a maximum of 5 active resumes. "
                "Remove one before uploading another."
            )

        try:
            parsed_text = await ResumeService.extract_text(
                file
            )

        except ValidationException:
            raise

        except Exception as error:
            logger.exception(
                f"Failed to extract text from resume: {file.filename}"
            )

            raise ValidationException(
                "Unable to process the uploaded PDF."
            ) from error

        if not parsed_text.strip():
            raise ValidationException(
                "No readable text was found in the uploaded PDF."
            )

        # extract_text reads the file, so reset it before uploading.
        await file.seek(0)

        storage_path = await StorageService.upload_resume(
            user_id=user_id,
            file=file,
        )

        logger.info(
            f"Resume stored successfully (path={storage_path})"
        )

        try:
            resume = create_resume(
                user_id=user_id,
                title=title,
                file_name=file.filename,
                file_path=storage_path,
                parsed_text=parsed_text,
            )

        except Exception:
            logger.exception(
                "Failed to create the resume database record. "
                "Removing uploaded file."
            )

            # Avoid leaving an orphaned PDF in Storage.
            StorageService.delete_resume(
                storage_path=storage_path,
            )

            raise

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
        """Extract text from a PDF resume."""

        logger.info(
            f"Extracting text from resume: {file.filename}"
        )

        await file.seek(0)
        pdf_bytes = await file.read()

        try:
            document = fitz.open(
                stream=pdf_bytes,
                filetype="pdf",
            )

        except Exception as error:
            raise ValidationException(
                "The uploaded file is not a readable PDF."
            ) from error

        try:
            text = "\n".join(
                document.load_page(page_number).get_text()
                for page_number in range(document.page_count)
            )

        finally:
            document.close()

        logger.info(
            f"Text extracted from resume: {file.filename}"
        )

        return text

    @staticmethod
    def list_user_resumes(
        user_id: str,
    ) -> list[dict[str, object]]:
        """Return active resumes owned by the user."""

        return get_user_resumes(user_id)

    @staticmethod
    def remove_resume(
        resume_id: str,
        user_id: str,
    ) -> str:
        """
        Remove a resume.

        An unused resume is permanently deleted.
        A used resume is archived to preserve interview history.
        """

        resume = get_resume(resume_id)

        if str(resume.get("user_id")) != user_id:
            raise ForbiddenException(
                "You do not have permission to remove this resume."
            )

        if resume.get("is_archived"):
            raise ValidationException(
                "This resume has already been removed."
            )

        storage_path = resume.get("storage_path")

        if storage_path:
            StorageService.delete_resume(
                storage_path=str(storage_path),
            )

        if is_resume_used_by_interviews(resume_id):
            archive_resume(resume_id)

            logger.info(
                f"Resume archived (resume_id={resume_id})"
            )

            return "archived"

        delete_resume(resume_id)

        logger.info(
            f"Resume permanently deleted (resume_id={resume_id})"
        )

        return "deleted"