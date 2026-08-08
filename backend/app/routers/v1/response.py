from uuid import UUID

from fastapi import (
    APIRouter, 
    Depends,
    File,
    Form,
    UploadFile,
    status,
)

from app.dependencies import get_current_user
from app.schemas.response import (
    ResponseDetailResponse,
    ResponseListResponse,
)
from app.services.response_service import ResponseService


router = APIRouter(
    prefix="/responses",
    tags=["responses"],
)


@router.post(
    "/submit",
    response_model=ResponseDetailResponse,
    status_code=status.HTTP_201_CREATED,
)
async def submit_response(
    interview_id: UUID = Form(...),
    question_number: int = Form(...),
    answer_duration_seconds: int | None = Form(
        default=None,
        ge=0,
    ),
    audio_file: UploadFile = File(...),
    user=Depends(get_current_user),
):
    """Submit an audio answer for an interview question."""

    response = await ResponseService.submit_response(
        user_id=str(user.id),
        interview_id=str(interview_id),
        question_number=question_number,
        audio_file=audio_file,
        answer_duration_seconds=answer_duration_seconds,
    )

    return {
        "success": True,
        "message": "Interview response submitted successfully.",
        "data": response,
    }

@router.get(
    "/{response_id}",
    response_model=ResponseDetailResponse,
)
async def get_response(
    response_id: UUID,
    user=Depends(get_current_user),
):
    """Get a single interview response"""

    response = ResponseService.get_response(
        response_id=str(response_id),
        user_id=str(user.id),
    )

    return {
        "success": True,
        "message": "Interview response retrieved successfully.",
        "data": response,
    }

@router.get(
    "/interview/{interview_id}",
    response_model=ResponseListResponse,
)

async def list_interview_responses(
    interview_id: UUID,
    user=Depends(get_current_user),
):
    """Get all responses belonging to an interview"""

    responses = ResponseService.list_interview_responses(
        interview_id=str(interview_id),
        user_id=str(user.id),
    )

    return {
        "success": True,
        "message": "Interview responses retrieved successfully.",
        "data": responses,
    }


@router.delete(
    "/{response_id}",
    status_code=status.HTTP_200_OK,
)
async def delete_response(
    response_id: UUID,
    user=Depends(get_current_user),
):
    """Delete an interview response."""

    ResponseService.delete_response(
        response_id=str(response_id),
        user_id=str(user.id),
    )

    return {
        "success": True,
        "message": "Interview response deleted successfully.",
    }