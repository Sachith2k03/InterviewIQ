from fastapi import (
    APIRouter,
    Depends,
    File,
    UploadFile,
)

from app.dependencies import (
    get_current_user,
)
from app.schemas.user import (
    ProfileResponse,
    ProfileUpdateRequest,
)
from app.services.profile_service import (
    ProfileService,
)


router = APIRouter(
    prefix="/profile",
    tags=["Profile"],
)


def _build_profile_response(
    current_user,
    profile: dict[str, object],
) -> ProfileResponse:
    return ProfileResponse(
        id=str(
            current_user.id
        ),
        email=current_user.email,
        full_name=profile.get(
            "full_name"
        ),
        avatar_url=profile.get(
            "avatar_url"
        ),
        created_at=profile.get(
            "created_at"
        ),
        updated_at=profile.get(
            "updated_at"
        ),
    )


@router.get(
    "",
    response_model=ProfileResponse,
)
async def get_profile(
    current_user=Depends(
        get_current_user
    ),
):
    profile = (
        ProfileService
        .get_profile(
            user_id=str(
                current_user.id
            ),
        )
    )

    return _build_profile_response(
        current_user,
        profile,
    )


@router.patch(
    "",
    response_model=ProfileResponse,
)
async def update_profile(
    request: ProfileUpdateRequest,
    current_user=Depends(
        get_current_user
    ),
):
    profile = (
        ProfileService
        .update_profile(
            user_id=str(
                current_user.id
            ),
            full_name=(
                request.full_name.strip()
            ),
        )
    )

    return _build_profile_response(
        current_user,
        profile,
    )


@router.post(
    "/avatar",
    response_model=ProfileResponse,
)
async def upload_profile_avatar(
    avatar: UploadFile = File(...),
    current_user=Depends(
        get_current_user
    ),
):
    profile = (
        await ProfileService
        .update_avatar(
            user_id=str(
                current_user.id
            ),
            file=avatar,
        )
    )

    return _build_profile_response(
        current_user,
        profile,
    )