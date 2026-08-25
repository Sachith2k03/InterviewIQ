from typing import Any, cast

from app.core.logging import logger
from app.database.client import supabase
from app.exceptions.custom_exceptions import (
    DatabaseException,
)


def get_account_storage_paths(
    user_id: str,
) -> dict[str, list[str]]:
    """
    Collect all storage objects belonging
    to a user before account deletion.
    """

    logger.info(
        f"Collecting storage paths for user: {user_id}"
    )

    try:
        resume_response = (
            supabase
            .table("resumes")
            .select("storage_path")
            .eq("user_id", user_id)
            .execute()
        )

        resume_rows = cast(
            list[dict[str, Any]],
            resume_response.data or [],
        )

        resume_paths = [
            path
            for row in resume_rows
            if isinstance(
                (
                    path := row.get(
                        "storage_path"
                    )
                ),
                str,
            )
            and path
        ]

        interview_response = (
            supabase
            .table("interviews")
            .select("id")
            .eq("user_id", user_id)
            .execute()
        )

        interview_rows = cast(
            list[dict[str, Any]],
            interview_response.data or [],
        )

        interview_ids = [
            interview_id
            for row in interview_rows
            if isinstance(
                (
                    interview_id :=
                    row.get("id")
                ),
                str,
            )
            and interview_id
        ]

        audio_paths: list[str] = []
        report_paths: list[str] = []

        if interview_ids:
            response_result = (
                supabase
                .table(
                    "interview_responses"
                )
                .select(
                    "audio_storage_path"
                )
                .in_(
                    "interview_id",
                    interview_ids,
                )
                .execute()
            )

            response_rows = cast(
                list[dict[str, Any]],
                response_result.data or [],
            )

            audio_paths = [
                path
                for row in response_rows
                if isinstance(
                    (
                        path := row.get(
                            "audio_storage_path"
                        )
                    ),
                    str,
                )
                and path
            ]

            report_result = (
                supabase
                .table(
                    "interview_reports"
                )
                .select(
                    "pdf_storage_path"
                )
                .in_(
                    "interview_id",
                    interview_ids,
                )
                .execute()
            )

            report_rows = cast(
                list[dict[str, Any]],
                report_result.data or [],
            )

            report_paths = [
                path
                for row in report_rows
                if isinstance(
                    (
                        path := row.get(
                            "pdf_storage_path"
                        )
                    ),
                    str,
                )
                and path
            ]

        return {
            "resume_paths":
                resume_paths,
            "audio_paths":
                audio_paths,
            "report_paths":
                report_paths,
        }

    except Exception as error:
        logger.exception(
            "Failed to collect account storage paths."
        )

        raise DatabaseException(
            "Failed to prepare account deletion."
        ) from error


def delete_auth_user(
    user_id: str,
) -> None:
    """Delete a user from Supabase Auth."""

    logger.info(
        f"Deleting auth user: {user_id}"
    )

    try:
        supabase.auth.admin.delete_user(
            user_id
        )

        logger.info(
            f"Auth user deleted successfully: {user_id}"
        )

    except Exception as error:
        logger.exception(
            f"Failed to delete auth user: {user_id}"
        )

        raise DatabaseException(
            "Failed to delete user account."
        ) from error