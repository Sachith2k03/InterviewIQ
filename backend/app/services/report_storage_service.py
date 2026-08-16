from app.core.constants import REPORT_BUCKET
from app.core.logging import logger
from app.database.client import supabase
from app.exceptions.custom_exceptions import (
    DatabaseException,
    InterviewIQException,
)


class ReportStorageService:
    """Handles PDF report files in Supabase Storage."""

    @staticmethod
    def upload_pdf(
        user_id: str,
        interview_id: str,
        pdf_bytes: bytes,
    ) -> str:
        """Upload a generated report PDF."""

        storage_path = (
            f"{user_id}/"
            f"{interview_id}/"
            "interview_report.pdf"
        )

        logger.info(
            f"Uploading report PDF "
            f"(interview={interview_id}, "
            f"path={storage_path})"
        )

        try:
            supabase.storage.from_(
                REPORT_BUCKET
            ).upload(
                path=storage_path,
                file=pdf_bytes,
                file_options={  # type: ignore[arg-type]
                    "content-type": "application/pdf",
                    "upsert": "true",
                },
            )

            logger.info(
                f"Report PDF uploaded successfully "
                f"(interview={interview_id})"
            )

            return storage_path

        except InterviewIQException:
            raise

        except Exception as error:
            logger.exception(
                "Report PDF upload failed."
            )

            raise DatabaseException(
                "Failed to upload report PDF."
            ) from error

    @staticmethod
    def download_pdf(
        storage_path: str,
    ) -> bytes:
        """Download an existing report PDF."""

        logger.info(
            f"Downloading report PDF "
            f"(path={storage_path})"
        )

        try:
            file_bytes = (
                supabase.storage
                .from_(REPORT_BUCKET)
                .download(storage_path)
            )

            return bytes(file_bytes)

        except InterviewIQException:
            raise

        except Exception as error:
            logger.exception(
                "Report PDF download failed."
            )

            raise DatabaseException(
                "Failed to download report PDF."
            ) from error