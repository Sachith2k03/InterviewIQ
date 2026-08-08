from fastapi import APIRouter, Depends
from supabase_auth.types import User

from app.dependencies import get_current_user
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard_service import DashboardService


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get(
    "",
    response_model=DashboardResponse,
)
async def get_dashboard(
    current_user: User = Depends(get_current_user),
) -> DashboardResponse:
    return await DashboardService.get_dashboard(
        user_id=current_user.id,
    )