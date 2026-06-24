from app.database.profile_queries import (
    get_profile,
    create_profile,
    update_profile,
)


class ProfileService:
    """
    Handles profile-related business logic.
    """

    @staticmethod
    def get_profile(user_id: str):
        """
        Retrieve a user's profile.
        """
        return get_profile(user_id)

    @staticmethod
    def create_profile(
        user_id: str,
        full_name: str | None = None,
        avatar_url: str | None = None,
    ) -> dict:
        """
        Create a new profile.
        """
        return create_profile(user_id, full_name, avatar_url)

    @staticmethod
    def update_profile(
        user_id: str,
        full_name: str | None = None,
        avatar_url: str | None = None,
    ) -> dict:
        """
        Update an existing profile.
        """
        return update_profile(user_id, full_name, avatar_url)