from collections import defaultdict, Counter
from datetime import date, datetime, time, timedelta, timezone
from typing import Any, cast

from app.core.logging import logger
from app.database.client import supabase
from app.exceptions.custom_exceptions import DatabaseException
from app.schemas.dashboard import (
    DashboardPerformancePoint,
    DashboardRecentInterview,
    DashboardResponse,
    DashboardInterviewDistribution
)



class DashboardService:
    @staticmethod
    def _parse_datetime(value: str | None) -> datetime | None:
        """Convert Supabase timestamp strings into timezone-aware datetimes."""

        if not value:
            return None

        parsed_value = datetime.fromisoformat(
            value.replace("Z", "+00:00"),
        )

        if parsed_value.tzinfo is None:
            parsed_value = parsed_value.replace(
                tzinfo=timezone.utc,
            )

        return parsed_value

    @staticmethod
    def _calculate_current_streak(
        completion_dates: list[date],
    ) -> int:
        """
        Calculate consecutive interview-practice days.

        A streak is still active when the latest completed interview
        was today or yesterday.
        """

        if not completion_dates:
            return 0

        unique_dates = sorted(
            set(completion_dates),
            reverse=True,
        )

        today = datetime.now(timezone.utc).date()
        latest_date = unique_dates[0]

        if latest_date not in {
            today,
            today - timedelta(days=1),
        }:
            return 0

        streak = 1
        expected_date = latest_date - timedelta(days=1)

        for completion_date in unique_dates[1:]:
            if completion_date == expected_date:
                streak += 1
                expected_date -= timedelta(days=1)

            elif completion_date < expected_date:
                break

        return streak

    @staticmethod
    def _calculate_weekly_progress(
        completed_interviews: list[dict],
    ) -> float:
        """
        Compare the current seven-day average score with the
        previous seven-day average score.
        """

        now = datetime.now(timezone.utc)
        current_period_start = now - timedelta(days=7)
        previous_period_start = now - timedelta(days=14)

        current_scores: list[float] = []
        previous_scores: list[float] = []

        for interview in completed_interviews:
            completed_at = DashboardService._parse_datetime(
                interview.get("completed_at"),
            )

            overall_score = interview.get("overall_score")

            if completed_at is None or overall_score is None:
                continue

            score = float(overall_score)

            if completed_at >= current_period_start:
                current_scores.append(score)

            elif completed_at >= previous_period_start:
                previous_scores.append(score)

        if not current_scores or not previous_scores:
            return 0.0

        current_average = sum(current_scores) / len(
            current_scores,
        )

        previous_average = sum(previous_scores) / len(
            previous_scores,
        )

        if previous_average == 0:
            return 0.0

        progress = (
            (current_average - previous_average)
            / previous_average
        ) * 100

        return round(progress, 1)

    @staticmethod
    async def get_dashboard(
        user_id: str,
    ) -> DashboardResponse:
        try:
            response = (
                supabase
                .table("interview_history_view")
                .select(
                    (
                        "id,"
                        "user_id,"
                        "job_role,"
                        "interview_type,"
                        "difficulty,"
                        "status,"
                        "created_at,"
                        "completed_at,"
                        "overall_score,"
                        "pdf_path,"
                        "duration_seconds"
                    ),
                )
                .eq("user_id", str(user_id))
                .order("created_at", desc=True)
                .execute()
            )

            interviews = cast(
                list[dict[str, Any]],
                response.data or [],
            )

        except Exception as error:
            logger.exception(
                "Failed to load dashboard data for user {}",
                user_id,
            )

            raise DatabaseException(
                "Failed to load dashboard data",
            ) from error

        completed_interviews = [
            interview
            for interview in interviews
            if interview.get("status") == "completed"
        ]

        total_duration_seconds = sum(
            int(interview.get("duration_seconds") or 0)
            for interview in completed_interviews
        )

        practice_minutes = (
            total_duration_seconds // 60
        )

        distribution_counter = Counter(
            interview["interview_type"]
            for interview in completed_interviews
            if interview.get("interview_type")
        )

        interview_distribution = [
            DashboardInterviewDistribution(
                type=interview_type.replace(
                    "_", 
                    " ",
                ).title(),
                count=count,
            )
            for interview_type, count in distribution_counter.items()
        ]

        scores = [
            float(interview["overall_score"])
            for interview in completed_interviews
            if interview.get("overall_score") is not None
        ]

        interviews_completed = len(completed_interviews)

        average_score = (
            round(sum(scores) / len(scores), 1)
            if scores
            else 0.0
        )

        best_score = (
            round(max(scores), 1)
            if scores
            else 0.0
        )

        completion_dates: list[date] = []

        for interview in completed_interviews:
            completed_at = DashboardService._parse_datetime(
                interview.get("completed_at"),
            )

            if completed_at is not None:
                completion_dates.append(
                    completed_at.date(),
                )

        current_streak = (
            DashboardService._calculate_current_streak(
                completion_dates,
            )
        )

        weekly_progress = (
            DashboardService._calculate_weekly_progress(
                completed_interviews,
            )
        )

        daily_scores: dict[date, list[float]] = defaultdict(
            list,
        )

        for interview in completed_interviews:
            completed_at = DashboardService._parse_datetime(
                interview.get("completed_at"),
            )

            overall_score = interview.get("overall_score")

            if completed_at is None or overall_score is None:
                continue

            daily_scores[completed_at.date()].append(
                float(overall_score),
            )

        performance = [
            DashboardPerformancePoint(
                date=datetime.combine(
                    completion_date,
                    time.min,
                    tzinfo=timezone.utc,
                ),
                score=round(
                    sum(day_scores) / len(day_scores),
                    1,
                ),
            )
            for completion_date, day_scores in sorted(
                daily_scores.items(),
            )
        ]

        # Only return the latest 12 scored days.
        performance = performance[-12:]

        recent_interview = None

        completed_with_dates = [
            interview
            for interview in completed_interviews
            if interview.get("completed_at") is not None
        ]

        completed_with_dates.sort(
            key=lambda interview: (
                DashboardService._parse_datetime(
                    interview.get("completed_at"),
                )
                or datetime.min.replace(
                    tzinfo=timezone.utc,
                )
            ),
            reverse=True,
        )

        if completed_with_dates:
            recent = completed_with_dates[0]

            recent_interview = DashboardRecentInterview(
                id=recent["id"],
                job_role=recent["job_role"],
                interview_type=recent["interview_type"],
                difficulty=recent["difficulty"],
                status=recent["status"],
                created_at=recent["created_at"],
                completed_at=recent.get("completed_at"),
                duration_seconds=recent.get(
                    "duration_seconds",
                ),
                overall_score=recent.get(
                    "overall_score",
                ),
                pdf_path=recent.get("pdf_path"),
            )

        return DashboardResponse(
            interviews_completed=interviews_completed,
            average_score=average_score,
            best_score=best_score,
            current_streak=current_streak,
            weekly_progress=weekly_progress,
            practice_minutes=practice_minutes,
            interview_distribution=interview_distribution,
            performance=performance,
            recent_interview=recent_interview,
        )