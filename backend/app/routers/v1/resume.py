from uuid import UUID

from fastapi import APIRouter, Depends, status
from supabase_auth.types import User

from app.dependencies import get_current_user
from app.schemas.resume import (
    ResumeDeleteResponse,
    ResumeListResponse,
)
from app.services.resume_service import ResumeService


router = APIRouter(
    prefix="/resumes",
    tags=["Resumes"],
)


@router.get(
    "",
    response_model=ResumeListResponse,
)
async def list_resumes(
    current_user: User = Depends(get_current_user),
) -> ResumeListResponse:
    resumes = ResumeService.list_user_resumes(
        user_id=str(current_user.id),
    )

    return ResumeListResponse(
        success=True,
        message="Resumes retrieved successfully.",
        data=resumes,
    )


@router.delete(
    "/{resume_id}",
    response_model=ResumeDeleteResponse,
    status_code=status.HTTP_200_OK,
)
async def remove_resume(
    resume_id: UUID,
    current_user: User = Depends(get_current_user),
) -> ResumeDeleteResponse:
    action = ResumeService.remove_resume(
        resume_id=str(resume_id),
        user_id=str(current_user.id),
    )

    message = (
        "Resume removed successfully."
        "Its interview history has been preserved."
        if action == "archived"
        else "Resume deleted successfully."
    )
    
    return ResumeDeleteResponse(
        success=True,
        message=message,
        action=action,
    )