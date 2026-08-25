from fastapi import (
    APIRouter,
    Depends,
)
from supabase_auth.types import User

from app.dependencies import (
    get_current_user,
)
from app.schemas.analytics import (
    AnalyticsResponse,
)
from app.services.analytics_service import (
    AnalyticsService,
)


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@router.get(
    "",
    response_model=AnalyticsResponse,
)
async def get_analytics(
    current_user: User = Depends(
        get_current_user
    ),
) -> AnalyticsResponse:
    """
    Get detailed analytics for
    the authenticated user.
    """

    return (
        AnalyticsService
        .get_analytics(
            user_id=str(
                current_user.id
            )
        )
    )