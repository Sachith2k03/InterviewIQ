from typing import Any, cast

from app.database.client import supabase
from app.exceptions.custom_exceptions import (
    DatabaseException,
    InterviewIQException,
    NotFoundException,
)


def create_report(
    interview_id: str,
    overall_score: float,
    technical_score: float,
    communication_score: float,
    confidence_score: float,
    fluency_score: float,
    strengths: list[str],
    weaknesses: list[str],
    suggestions: list[str],
    pdf_storage_path: str | None = None,
) -> dict[str, Any]:
    """Create an interview report."""

    try:
        response = (
            supabase.table("interview_reports")
            .insert(
                {
                    "interview_id": interview_id,
                    "overall_score": overall_score,
                    "technical_score": technical_score,
                    "communication_score": communication_score,
                    "confidence_score": confidence_score,
                    "fluency_score": fluency_score,
                    "strengths": strengths,
                    "weaknesses": weaknesses,
                    "suggestions": suggestions,
                    "pdf_storage_path": pdf_storage_path,
                }
            )
            .execute()
        )

        if not response.data:
            raise DatabaseException(
                "Failed to create interview report."
            )

        data = cast(
            list[dict[str, Any]],
            response.data,
        )

        return data[0]

    except InterviewIQException:
        raise

    except Exception as error:
        raise DatabaseException(
            "Failed to create interview report."
        ) from error


def get_report(
    interview_id: str,
) -> dict[str, Any]:
    """Get the report for an interview."""

    try:
        response = (
            supabase.table("interview_reports")
            .select("*")
            .eq("interview_id", interview_id)
            .limit(1)
            .execute()
        )

        if not response.data:
            raise NotFoundException(
                "Interview report not found."
            )

        return cast(
            dict[str, Any],
            response.data[0],
        )

    except InterviewIQException:
        raise

    except Exception as error:
        raise DatabaseException(
            "Failed to retrieve interview report."
        ) from error


def update_pdf_storage_path(
    interview_id: str,
    pdf_storage_path: str,
) -> dict[str, Any]:
    """Update the stored report PDF path."""

    try:
        response = (
            supabase.table("interview_reports")
            .update(
                {
                    "pdf_storage_path":
                        pdf_storage_path,
                }
            )
            .eq(
                "interview_id",
                interview_id,
            )
            .execute()
        )

        if not response.data:
            raise NotFoundException(
                "Interview report not found."
            )

        data = cast(
            list[dict[str, Any]],
            response.data,
        )

        return data[0]

    except InterviewIQException:
        raise

    except Exception as error:
        raise DatabaseException(
            "Failed to update report PDF storage path."
        ) from error