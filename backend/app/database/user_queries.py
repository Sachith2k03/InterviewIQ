from app.database.client import supabase
from app.exceptions.custom_exceptions import (
    DatabaseException,
    InterviewIQException,
    NotFoundException,
)


def create_profile(
    user_id: str,
    full_name: str | None = None,
):
    """Create a new user profile."""

    try:
        response = (
            supabase.table("profiles")
            .insert(
                {
                    "id": user_id,
                    "full_name": full_name,
                }
            )
            .execute()
        )

        return response.data

    except InterviewIQException:
        raise

    except Exception as e:
        raise DatabaseException(str(e))


def get_profile(user_id: str):
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

        return response.data

    except InterviewIQException:
        raise

    except Exception as e:
        message = str(e)

        if "0 rows" in message.lower():
            raise NotFoundException("Profile not found.")

        raise DatabaseException(message)
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

        return response.data

    except InterviewIQException:
        raise

    except Exception as e:
        raise DatabaseException(str(e))


def update_profile(
    user_id: str,
    full_name: str | None = None,
    avatar_url: str | None = None,
):
    """Update a user profile."""

    update_data = {}

    if full_name is not None:
        update_data["full_name"] = full_name

    if avatar_url is not None:
        update_data["avatar_url"] = avatar_url

    try:
        response = (
            supabase.table("profiles")
            .update(update_data)
            .eq("id", user_id)
            .execute()
        )

        return response.data

    except InterviewIQException:
        raise

    except Exception as e:
        raise DatabaseException(str(e))