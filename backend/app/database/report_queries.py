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
    pdf_path: str | None = None,
):
    """
    Create a report for an interview.
    """

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
                    "pdf_path": pdf_path,
                }
            )
            .execute()
        )

        return response.data

    except InterviewIQException:
        raise

    except Exception as e:
        raise DatabaseException(str(e))


def get_report(interview_id: str):
    """
    Get the report for an interview.
    """

    try:
        response = (
            supabase.table("interview_reports")
            .select("*")
            .eq("interview_id", interview_id)
            .single()
            .execute()
        )

        if not response.data:
            raise NotFoundException("Interview report not found.")

        return response.data

    except InterviewIQException:
        raise

    except Exception as e:
        raise DatabaseException(str(e))


def update_pdf_path(
    interview_id: str,
    pdf_path: str,
):
    """
    Update the PDF path for an interview report.
    """

    try:
        response = (
            supabase.table("interview_reports")
            .update(
                {
                    "pdf_path": pdf_path,
                }
            )
            .eq("interview_id", interview_id)
            .execute()
        )

        return response.data

    except InterviewIQException:
        raise

    except Exception as e:
        raise DatabaseException(str(e))