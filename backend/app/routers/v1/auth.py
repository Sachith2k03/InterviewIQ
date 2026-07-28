from fastapi import APIRouter, Depends


from app.dependencies import get_current_user
from app.schemas.auth import (
    AuthResponse,
    UserResponse,
)
from app.utils.helpers import success_response
from app.core.constants import MSG_AUTH_SUCCESS

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
        message=MSG_AUTH_SUCCESS,
        data=UserResponse(
            id=str(current_user.id),
            full_name=current_user.full_name,
            email=current_user.email,
        ),
    )

