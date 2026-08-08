from uuid import UUID

from app.schemas.question_generation import (
    InterviewQuestionListResponse
)
from fastapi import APIRouter, Depends, status, Query

from app.dependencies import get_current_user
from app.schemas.interview import (
    CreateInterviewRequest,
    InterviewDetailResponse,
    InterviewListResponse,
)
from app.services.interview_service import InterviewService
from app.database.interview_question_queries import (
    get_interview_questions 
)
from app.services.question_generation_service import (
    QuestionGenerationService,
)


router = APIRouter(
    prefix="/interviews",
    tags=["Interviews"],
)

# Create an interview api
@router.post(
    "/create",
    response_model=InterviewDetailResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_interview(
    request: CreateInterviewRequest,
    user=Depends(get_current_user),
):
    interview = InterviewService.create_interview(
        user_id=str(user.id),
        resume_id=str(request.resume_id),
        job_role=request.job_role,
        interview_type=request.interview_type,
        difficulty=request.difficulty,
        question_count=request.question_count,
    )

    return {
        "success": True,
        "message": "Interview created successfully.",
        "data": interview,
    }

# Get an interview api
@router.get(
    "/{interview_id}",
    response_model=InterviewDetailResponse,
)
async def get_interview(
    interview_id: UUID,
    user=Depends(get_current_user),
):
    interview = InterviewService.get_interview(
        interview_id=str(interview_id),
        user_id=str(user.id),
    )

    return {
        "success": True,
        "message": "Interview retrieved successfully.",
        "data": interview,
    }

# Get all interviews api
@router.get(
    "",
    response_model=InterviewListResponse,
)
async def list_interviews(
    page: int = Query(
        default=1,
        ge=1,
    ),
    page_size: int = Query(
        default=10,
        ge=1,
        le=50,
    ),
    user=Depends(get_current_user),
):
    result = InterviewService.list_user_interviews(
        user_id=str(user.id),
        page=page,
        page_size=page_size,
    )

    return {
        "success": True,
        "message": "Interviews retrieved successfully.",
        "data": result["items"],
        "pagination": result["pagination"],
    }



@router.patch(
    "/{interview_id}/start",
    response_model=InterviewDetailResponse,
)
async def start_interview(
    interview_id: UUID,
    user=Depends(get_current_user),
):
    interview = InterviewService.start_interview(
        interview_id=str(interview_id),
        user_id=str(user.id),
    )

    return {
        "success": True,
        "message": "Interview started successfully.",
        "data": interview,
    }


@router.patch(
    "/{interview_id}/complete",
    response_model=InterviewDetailResponse,
)
async def complete_interview(
    interview_id: UUID,
    user=Depends(get_current_user),
):
    interview = InterviewService.complete_interview(
        interview_id=str(interview_id),
        user_id=str(user.id),
    )

    return {
        "success": True,
        "message": "Interview completed successfully.",
        "data": interview,
    }


@router.patch(
    "/{interview_id}/cancel",
    response_model=InterviewDetailResponse,
)
async def cancel_interview(
    interview_id: UUID,
    user=Depends(get_current_user),
):
    interview = InterviewService.cancel_interview(
        interview_id=str(interview_id),
        user_id=str(user.id),
    )

    return {
        "success": True,
        "message": "Interview cancelled successfully.",
        "data": interview,
    }


@router.delete(
    "/{interview_id}",
    status_code=status.HTTP_200_OK,
)
async def delete_interview(
    interview_id: UUID,
    user=Depends(get_current_user),
):
    InterviewService.delete_interview(
        interview_id=str(interview_id),
        user_id=str(user.id),
    )

    return {
        "success": True,
        "message": "Interview deleted successfully.",
    }



@router.post(
    "/{interview_id}/questions/generate",
    response_model=InterviewQuestionListResponse,
)
async def generate_interview_questions(
    interview_id: UUID,
    user=Depends(get_current_user),
):
    questions = QuestionGenerationService.generate_questions(
        interview_id=str(interview_id),
        user_id=str(user.id),
    )

    return {
        "success": True,
        "message": "Interview questions generated successfully.",
        "data": questions,
    }


@router.get(
    "/{interview_id}/questions",
    response_model=InterviewQuestionListResponse,
)
async def list_interview_questions(
    interview_id: UUID,
    user=Depends(get_current_user),
):
    InterviewService.get_interview(
        interview_id=str(interview_id),
        user_id=str(user.id),
    )

    questions = get_interview_questions(
        str(interview_id)
    )

    return {
        "success": True,
        "message": "Interview questions retrieved successfully.",
        "data": questions,
    }