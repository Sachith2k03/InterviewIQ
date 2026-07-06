from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.dependencies import get_current_user
from app.schemas.interview import (
    CreateInterviewRequest,
    InterviewDetailResponse,
    InterviewListResponse,
)
from app.services.interview_service import InterviewService

router = APIRouter(
    prefix="/interviews",
    tags=["Interviews"],
)

# Create an interview api
@router.post(
    "/create",
    status_code=status.HTTP_201_CREATED,
)
async def create_interview(
    request: CreateInterviewRequest,
    user=Depends(get_current_user),
):
    interview = InterviewService.create_interview(
        user_id=str(user.id),
        resume_id=str(request.resume_id)
        if request.resume_id
        else None,
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


@router.get(
    "",
    response_model=InterviewListResponse,
)
async def list_interviews(
    user=Depends(get_current_user),
):
    interviews = InterviewService.list_user_interviews(
        user_id=str(user.id),
    )

    return {
        "success": True,
        "message": "Interviews retrieved successfully.",
        "data": interviews,
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