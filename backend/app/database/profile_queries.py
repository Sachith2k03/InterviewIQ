from typing import cast

from app.database.client import supabase
from app.exceptions.custom_exceptions import (
    DatabaseException,
    InterviewIQException,
    NotFoundException,
)


def create_profile(
    user_id: str,
    full_name: str | None = None,
    avatar_url: str | None = None,
) -> dict[str, object]:
    """Create a new user profile."""

    try:
        response = (
            supabase.table("profiles")
            .insert(
                {
                    "id": user_id,
                    "full_name": full_name,
                    "avatar_url": avatar_url,
                }
            )
            .execute()
        )

        return cast(
            dict[str, object], 
            response.data[0] 
        )

    except InterviewIQException:
        raise

    except Exception as e:
        raise DatabaseException(str(e))


def get_profile(user_id: str) -> dict[str, object]:
    """Get a user profile."""

    try:
        response = (
            supabase.table("profiles")
            .select("*")
            .eq("id", user_id)
            .single()
            .execute()
        )

        if not response.data:
            raise NotFoundException("Profile not found.")

        return cast(
            dict[str, object],
            response.data
        )

    except InterviewIQException:
        raise

    except Exception as e:
        message = str(e)

        if "0 rows" in message.lower():
            raise NotFoundException("Profile not found.")

        raise DatabaseException(message)
    


def update_profile(
    user_id: str,
    full_name: str | None = None,
    avatar_url: str | None = None,
) -> dict[str, object]:
    """Update a user profile."""

    update_data = {}

    if full_name is not None:
        update_data["full_name"] = full_name

    if avatar_url is not None:
        update_data["avatar_url"] = avatar_url

    if not update_data:
        raise DatabaseException("No profile fields provided for update.")

    try:
        response = (
            supabase.table("profiles")
            .update(update_data)
            .eq("id", user_id)
            .select()
            .single()
            .execute()
        )

        return cast(
            dict[str, object], 
            response.data
        )

    except InterviewIQException:
        raise

    except Exception as e:
        raise DatabaseException(str(e))