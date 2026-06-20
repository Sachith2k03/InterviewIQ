from fastapi import UploadFile

from app.core.constants import (
    ALLOWED_RESUME_TYPES,
    MAX_RESUME_SIZE,
)
from app.exceptions.custom_exceptions import ValidationException


async def validate_resume(file: UploadFile):
    """
    Validate uploaded resume.
    """

    if file.content_type not in ALLOWED_RESUME_TYPES:
        raise ValidationException(
            "Only PDF resumes are allowed."
        )

    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > MAX_RESUME_SIZE:
        raise ValidationException(
            "Resume size cannot exceed 5 MB."
        )