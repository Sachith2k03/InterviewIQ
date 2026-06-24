from fastapi import APIRouter, File, Form, UploadFile, Depends

from app.services.resume_service import ResumeService
from app.utils.helpers import success_response
from app.dependencies import get_current_user
from app.core.constants import MSG_RESUME_UPLOADED

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
        message=MSG_RESUME_UPLOADED,
        data=resume,
    )
