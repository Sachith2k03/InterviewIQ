from fastapi import APIRouter, File, Form, UploadFile, Depends

from app.schemas.resume import ResumeUploadResponse
from app.services.resume_service import ResumeService
from app.utils.helpers import success_response
from app.dependencies import get_current_user

router = APIRouter(
    prefix="/upload",
    tags=["upload"],
)

@router.post(
    "/resume",
)


async def upload_resume(
    title: str = Form(...),
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
):
    
    """upload a resume"""

    resume = await ResumeService.upload_resume(
        user_id=str(current_user.id),
        file=file,
        title=title,
    )

    return success_response(
        message="Resume uploaded successfully",
        data=resume,
    )
