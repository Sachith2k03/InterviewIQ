from fastapi import APIRouter, Depends

from app.dependencies import get_current_user
from app.schemas.user import ProfileResponse
from app.services.profile_service import ProfileService

router = APIRouter(
    prefix="/profile",
    tags=["Profile"],
)


@router.get(
    "",
    response_model=ProfileResponse,
)
async def get_profile(
    current_user=Depends(get_current_user),
):
    profile = ProfileService.get_profile(
        user_id=str(current_user.id),
    )

    return ProfileResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=profile.get("full_name"),
        avatar_url=profile.get("avatar_url"),
        created_at=profile.get("created_at"),
        updated_at=profile.get("updated_at"),
    )