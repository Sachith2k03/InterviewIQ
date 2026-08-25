from fastapi import UploadFile

from app.database.profile_queries import (
    create_profile,
    get_profile,
    update_profile,
)
from app.services.avatar_storage_service import (
    AvatarStorageService,
)


class ProfileService:
    """
    Handles profile-related business logic.
    """

    @staticmethod
    def get_profile(
        user_id: str,
    ) -> dict[str, object]:
        return get_profile(
            user_id
        )

    @staticmethod
    def create_profile(
        user_id: str,
        full_name: str | None = None,
        avatar_url: str | None = None,
    ) -> dict[str, object]:
        return create_profile(
            user_id,
            full_name,
            avatar_url,
        )

    @staticmethod
    def update_profile(
        user_id: str,
        full_name: str | None = None,
        avatar_url: str | None = None,
    ) -> dict[str, object]:
        return update_profile(
            user_id,
            full_name,
            avatar_url,
        )

    @staticmethod
    async def update_avatar(
        user_id: str,
        file: UploadFile,
    ) -> dict[str, object]:
        """
        Upload an avatar and save its
        public URL to the profile.
        """

        avatar_url = (
            await AvatarStorageService
            .upload_avatar(
                user_id=user_id,
                file=file,
            )
        )

        return update_profile(
            user_id=user_id,
            avatar_url=avatar_url,
        )