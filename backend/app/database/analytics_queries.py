from typing import Any, cast

from app.core.logging import logger
from app.database.client import supabase
from app.exceptions.custom_exceptions import (
    DatabaseException,
)


def get_completed_interviews_for_analytics(
    user_id: str,
) -> list[dict[str, Any]]:
    """
    Retrieve completed interviews with score
    data required for analytics.
    """

    logger.info(
        f"Fetching analytics data for user: "
        f"{user_id}"
    )

    try:
        response = (
            supabase
            .table(
                "interview_history_view"
            )
            .select(
                (
                    "id,"
                    "user_id,"
                    "job_role,"
                    "interview_type,"
                    "difficulty,"
                    "status,"
                    "completed_at,"
                    "duration_seconds,"
                    "overall_score,"
                    "technical_score,"
                    "communication_score,"
                    "confidence_score,"
                    "fluency_score"
                )
            )
            .eq(
                "user_id",
                user_id,
            )
            .eq(
                "status",
                "completed",
            )
            .order(
                "completed_at",
                desc=False,
            )
            .execute()
        )

        interviews = cast(
            list[dict[str, Any]],
            response.data or [],
        )

        logger.info(
            f"Fetched {len(interviews)} "
            f"completed interviews for analytics."
        )

        return interviews

    except Exception as error:
        logger.exception(
            "Failed to retrieve analytics data."
        )

        raise DatabaseException(
            "Failed to retrieve analytics data."
        ) from error