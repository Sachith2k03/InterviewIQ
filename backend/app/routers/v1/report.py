from uuid import UUID
from io import BytesIO

from fastapi import (
    APIRouter,
    Depends,
    status,
)
from fastapi.responses import StreamingResponse

from app.dependencies import get_current_user
from app.schemas.report import ReportDetailResponse
from app.services.report_service import ReportService


router = APIRouter(
    prefix="/reports",
    tags=["reports"],
)


@router.post(
    "/{interview_id}/generate",
    response_model=ReportDetailResponse,
    status_code=status.HTTP_201_CREATED,
)
async def generate_report(
    interview_id: UUID,
    user=Depends(get_current_user),
):
    """Generate an interview report."""

    report = ReportService.generate_report(
        interview_id=str(interview_id),
        user_id=str(user.id),
    )

    return {
        "success": True,
        "message": "Interview report generated successfully.",
        "data": report,
    }


@router.get(
    "/{interview_id}",
    response_model=ReportDetailResponse,
)
async def get_report(
    interview_id: UUID,
    user=Depends(get_current_user),
):
    """Get an interview report."""

    report = ReportService.get_report(
        interview_id=str(interview_id),
        user_id=str(user.id),
    )

    return {
        "success": True,
        "message": "Interview report retrieved successfully.",
        "data": report,
    }

@router.get(
    "/{interview_id}/pdf",
)
async def download_report_pdf(
    interview_id: UUID,
    user=Depends(get_current_user),
):
    """Generate/download an interview report PDF."""

    pdf_bytes, _storage_path = (
        ReportService.generate_pdf(
            interview_id=str(interview_id),
            user_id=str(user.id),
        )
    )

    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                "attachment; "
                f'filename="InterviewIQ_'
                f'{interview_id}.pdf"'
            ),
        },
    )