from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.exceptions.custom_exceptions import UnauthorizedException
from app.services.auth_service import AuthService

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
):
    """
    Validate the Supabase JWT and return the authenticated user.
    """

    if credentials is None:
        raise UnauthorizedException("Authorization header is missing.")

    return AuthService.get_current_user(credentials.credentials)