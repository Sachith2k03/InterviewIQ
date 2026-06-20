from fastapi import APIRouter, Depends

from app.dependencies import get_current_user
from app.schemas.auth import (
    AuthResponse,
    UserResponse,
)
from app.utils.helpers import success_response

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.get(
    "/me",
    response_model=AuthResponse,
)
async def get_me(
    current_user=Depends(get_current_user),
):
    """
    Return the authenticated user's information.
    """

    return success_response(
        message="Authenticated user retrieved successfully.",
        data=UserResponse(
            id=str(current_user.id),
            email=current_user.email,
        ),
    )