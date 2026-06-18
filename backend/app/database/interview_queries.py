from app.database.client import supabase
from app.exceptions.custom_exceptions import (
    DatabaseException,
    InterviewIQException,
    NotFoundException,
)


def create_interview(
    user_id: str,
    resume_id: str | None,
    job_role: str,
    interview_type: str,
    difficulty: str,
    question_count: int = 10,
):
    """Create a new interview."""

    try:
        response = (
            supabase.table("interviews")
            .insert(
                {
                    "user_id": user_id,
                    "resume_id": resume_id,
                    "job_role": job_role,
                    "interview_type": interview_type,
                    "difficulty": difficulty,
                    "question_count": question_count,
                }
            )
            .execute()
        )

        return response.data

    except InterviewIQException:
        raise

    except Exception as e:
        raise DatabaseException(str(e))


def get_interview(interview_id: str):
    """Get an interview."""

    try:
        response = (
            supabase.table("interviews")
            .select("*")
            .eq("id", interview_id)
            .single()
            .execute()
        )

        if not response.data:
            raise NotFoundException("Interview not found.")

        return response.data

    except InterviewIQException:
        raise

    except Exception as e:
        raise DatabaseException(str(e))


def get_user_interviews(user_id: str):
    """Get all interviews for a user."""

    try:
        response = (
            supabase.table("interviews")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )

        return response.data

    except InterviewIQException:
        raise

    except Exception as e:
        raise DatabaseException(str(e))


def update_interview_status(
    interview_id: str,
    status: str,
):
    """Update interview status."""

    try:
        response = (
            supabase.table("interviews")
            .update(
                {
                    "status": status,
                }
            )
            .eq("id", interview_id)
            .execute()
        )

        return response.data

    except InterviewIQException:
        raise

    except Exception as e:
        raise DatabaseException(str(e))


def save_response(
    interview_id: str,
    question_number: int,
    question: str,
    audio_path: str | None = None,
    transcript: str | None = None,
):
    """Save a user's interview response."""

    try:
        response = (
            supabase.table("interview_responses")
            .insert(
                {
                    "interview_id": interview_id,
                    "question_number": question_number,
                    "question": question,
                    "audio_path": audio_path,
                    "transcript": transcript,
                }
            )
            .execute()
        )

        return response.data

    except InterviewIQException:
        raise

    except Exception as e:
        raise DatabaseException(str(e))


def update_response_analysis(
    response_id: str,
    technical_score: float,
    communication_score: float,
    confidence_score: float,
    fluency_score: float,
    overall_score: float,
    feedback: str,
):
    """Update AI analysis for a response."""

    try:
        response = (
            supabase.table("interview_responses")
            .update(
                {
                    "technical_score": technical_score,
                    "communication_score": communication_score,
                    "confidence_score": confidence_score,
                    "fluency_score": fluency_score,
                    "overall_score": overall_score,
                    "feedback": feedback,
                }
            )
            .eq("id", response_id)
            .execute()
        )

        return response.data

    except InterviewIQException:
        raise

    except Exception as e:
        raise DatabaseException(str(e))


def get_interview_responses(interview_id: str):
    """Get all responses for an interview."""

    try:
        response = (
            supabase.table("interview_responses")
            .select("*")
            .eq("interview_id", interview_id)
            .order("question_number")
            .execute()
        )

        return response.data

    except InterviewIQException:
        raise

    except Exception as e:
        raise DatabaseException(str(e))