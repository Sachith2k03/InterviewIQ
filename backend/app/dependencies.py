from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.exceptions.custom_exceptions import UnauthorizedException
from app.services.auth_service import AuthService
from app.core.constants import BEARER_PREFIX

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
):
    """
    Validate the Supabase JWT and return the authenticated user.

    HTTPBearer validates the Authorization header and returns only the
    token value (without the "Bearer " prefix).
    """

    if credentials is None:
        raise UnauthorizedException("Authorization header is missing.")

    # credentials.credentials already contains only the JWT token.
    return AuthService.get_current_user(credentials.credentials)

