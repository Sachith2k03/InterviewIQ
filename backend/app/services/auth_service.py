from typing import Any

from app.database.user_queries import (
    create_profile,
    get_profile,
)
from app.database.client import supabase_auth
from app.exceptions.custom_exceptions import (
    NotFoundException,
    UnauthorizedException,
)


class AuthService:
    """
    Handles authentication using Supabase Auth.
    """

    @staticmethod
    def get_current_user(token: str) -> Any:
        """
        Validate a Supabase access token and ensure
        the user has a profile.
        """

        try:
            response = supabase_auth.auth.get_user(token)

            if response.user is None:
                raise UnauthorizedException(
                    "Invalid or expired token."
                )

            user = response.user

            # Automatically create a profile if it doesn't exist
            try:
                get_profile(user.id)

            except NotFoundException:
                create_profile(
                    user_id=user.id,
                    full_name=user.user_metadata.get("full_name")
                    if user.user_metadata
                    else None,
                )

            return user

        except UnauthorizedException:
            raise

        except Exception as e:
            raise UnauthorizedException(
                f"Authentication failed: {str(e)}"
            )