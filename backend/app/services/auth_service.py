from app.schemas.user import AuthenticatedUser

from app.database.client import supabase_auth
from app.exceptions.custom_exceptions import (
    NotFoundException,
    UnauthorizedException,
)
from app.services.profile_service import ProfileService
from app.core.logging import logger


class AuthService:
    """
    Handles authentication using Supabase Auth.
    """

    @staticmethod
    def get_current_user(token: str) -> AuthenticatedUser:
        """
        Validate a Supabase access token and ensure
        the user has a profile.
        """

        logger.info("Authenticating user with Supabase JWT.")

        try:
            response = supabase_auth.auth.get_user(token)

            if response is None or response.user is None:
                raise UnauthorizedException(
                    "Invalid or expired token."
                )

            user = response.user

            logger.info(
                f"User authenticated successfully: (user_id={user.id})"
                )

            # Automatically create a profile if it doesn't exist
            try:
                ProfileService.get_profile(user.id)

            except NotFoundException:
                logger.info(
                    f"No profile found for user_id={user.id}. Creating a new profile."
                )
                ProfileService.create_profile(
                    user_id=user.id,
                    full_name=user.user_metadata.get("full_name")
                    if user.user_metadata
                    else None,
                )
                logger.info(
                    f"Profile created successfully for user_id={user.id}."
                )

            return AuthenticatedUser(
                id=user.id,
                email=user.email,
                full_name=user.user_metadata.get("full_name") if user.user_metadata else None
            )

        except UnauthorizedException:
            logger.warning(
                "Unauthorized access attempt with invalid or expired token."
            )
            raise

        except Exception as e:
            logger.exception(
                f"Authentication failed: {str(e)}"
            )
            raise UnauthorizedException(
                f"Authentication failed."
            )