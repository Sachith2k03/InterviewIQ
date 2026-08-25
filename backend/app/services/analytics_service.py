from collections import (
    Counter,
    defaultdict,
)
from datetime import (
    date,
    datetime,
    timedelta,
    timezone,
)
from typing import Any

from app.core.logging import logger
from app.database.analytics_queries import (
    get_completed_interviews_for_analytics,
)
from app.schemas.analytics import (
    AnalyticsDifficultyPerformance,
    AnalyticsInsights,
    AnalyticsInterviewDistribution,
    AnalyticsPracticeActivity,
    AnalyticsResponse,
    AnalyticsSkillAverages,
    AnalyticsSummary,
    AnalyticsTrendPoint,
    AnalyticsTypePerformance,
)


class AnalyticsService:
    """Handles InterviewIQ analytics calculations."""

    @staticmethod
    def _parse_datetime(
        value: object,
    ) -> datetime | None:
        if not isinstance(
            value,
            str,
        ):
            return None

        if not value:
            return None

        parsed = datetime.fromisoformat(
            value.replace(
                "Z",
                "+00:00",
            )
        )

        if parsed.tzinfo is None:
            parsed = parsed.replace(
                tzinfo=timezone.utc,
            )

        return parsed

    @staticmethod
    def _numeric_score(
        value: object,
    ) -> float | None:
        if isinstance(
            value,
            (int, float),
        ):
            return float(
                value
            )

        return None

    @staticmethod
    def _average(
        values: list[float],
    ) -> float:
        if not values:
            return 0.0

        return round(
            sum(values)
            / len(values),
            1,
        )

    @staticmethod
    def _calculate_current_streak(
        completion_dates: list[date],
    ) -> int:
        if not completion_dates:
            return 0

        unique_dates = sorted(
            set(
                completion_dates
            ),
            reverse=True,
        )

        today = (
            datetime.now(
                timezone.utc
            ).date()
        )

        latest_date = (
            unique_dates[0]
        )

        if latest_date not in {
            today,
            today
            - timedelta(
                days=1
            ),
        }:
            return 0

        streak = 1

        expected_date = (
            latest_date
            - timedelta(
                days=1
            )
        )

        for completion_date in (
            unique_dates[1:]
        ):
            if (
                completion_date
                == expected_date
            ):
                streak += 1

                expected_date -= timedelta(
                    days=1
                )

            elif (
                completion_date
                < expected_date
            ):
                break

        return streak

    @staticmethod
    def _calculate_weekly_progress(
        interviews: list[
            dict[str, Any]
        ],
    ) -> float:
        now = datetime.now(
            timezone.utc
        )

        current_start = (
            now
            - timedelta(
                days=7
            )
        )

        previous_start = (
            now
            - timedelta(
                days=14
            )
        )

        current_scores: list[
            float
        ] = []

        previous_scores: list[
            float
        ] = []

        for interview in (
            interviews
        ):
            completed_at = (
                AnalyticsService
                ._parse_datetime(
                    interview.get(
                        "completed_at"
                    )
                )
            )

            score = (
                AnalyticsService
                ._numeric_score(
                    interview.get(
                        "overall_score"
                    )
                )
            )

            if (
                completed_at is None
                or score is None
            ):
                continue

            if (
                completed_at
                >= current_start
            ):
                current_scores.append(
                    score
                )

            elif (
                completed_at
                >= previous_start
            ):
                previous_scores.append(
                    score
                )

        if (
            not current_scores
            or not previous_scores
        ):
            return 0.0

        current_average = (
            AnalyticsService
            ._average(
                current_scores
            )
        )

        previous_average = (
            AnalyticsService
            ._average(
                previous_scores
            )
        )

        if previous_average == 0:
            return 0.0

        return round(
            (
                (
                    current_average
                    - previous_average
                )
                / previous_average
            )
            * 100,
            1,
        )

    @staticmethod
    def _calculate_improvement(
        interviews: list[
            dict[str, Any]
        ],
    ) -> float:
        scored_interviews: list[
            float
        ] = []

        for interview in (
            interviews
        ):
            score = (
                AnalyticsService
                ._numeric_score(
                    interview.get(
                        "overall_score"
                    )
                )
            )

            if score is not None:
                scored_interviews.append(
                    score
                )

        if (
            len(
                scored_interviews
            )
            < 2
        ):
            return 0.0

        window_size = min(
            3,
            max(
                1,
                len(
                    scored_interviews
                )
                // 2,
            ),
        )

        earlier_scores = (
            scored_interviews[
                :window_size
            ]
        )

        latest_scores = (
            scored_interviews[
                -window_size:
            ]
        )

        earlier_average = (
            AnalyticsService
            ._average(
                earlier_scores
            )
        )

        latest_average = (
            AnalyticsService
            ._average(
                latest_scores
            )
        )

        if earlier_average == 0:
            return 0.0

        improvement = (
            (
                latest_average
                - earlier_average
            )
            / earlier_average
        ) * 100

        return round(
            improvement,
            1,
        )

    @staticmethod
    def get_analytics(
        user_id: str,
    ) -> AnalyticsResponse:
        logger.info(
            f"Generating analytics for user: "
            f"{user_id}"
        )

        interviews = (
            get_completed_interviews_for_analytics(
                user_id
            )
        )

        overall_scores: list[
            float
        ] = []

        technical_scores: list[
            float
        ] = []

        communication_scores: list[
            float
        ] = []

        confidence_scores: list[
            float
        ] = []

        fluency_scores: list[
            float
        ] = []

        completion_dates: list[
            date
        ] = []

        total_duration_seconds = 0

        trend_points: list[
            AnalyticsTrendPoint
        ] = []

        difficulty_scores: dict[
            str,
            list[float],
        ] = defaultdict(
            list
        )

        type_scores: dict[
            str,
            list[float],
        ] = defaultdict(
            list
        )

        type_counter: Counter[
            str
        ] = Counter()

        for interview in interviews:
            overall = (
                AnalyticsService
                ._numeric_score(
                    interview.get(
                        "overall_score"
                    )
                )
            )

            technical = (
                AnalyticsService
                ._numeric_score(
                    interview.get(
                        "technical_score"
                    )
                )
            )

            communication = (
                AnalyticsService
                ._numeric_score(
                    interview.get(
                        "communication_score"
                    )
                )
            )

            confidence = (
                AnalyticsService
                ._numeric_score(
                    interview.get(
                        "confidence_score"
                    )
                )
            )

            fluency = (
                AnalyticsService
                ._numeric_score(
                    interview.get(
                        "fluency_score"
                    )
                )
            )

            completed_at = (
                AnalyticsService
                ._parse_datetime(
                    interview.get(
                        "completed_at"
                    )
                )
            )

            if overall is not None:
                overall_scores.append(
                    overall
                )

            if technical is not None:
                technical_scores.append(
                    technical
                )

            if communication is not None:
                communication_scores.append(
                    communication
                )

            if confidence is not None:
                confidence_scores.append(
                    confidence
                )

            if fluency is not None:
                fluency_scores.append(
                    fluency
                )

            duration = (
                interview.get(
                    "duration_seconds"
                )
            )

            if isinstance(
                duration,
                int,
            ):
                total_duration_seconds += (
                    duration
                )

            interview_type = (
                interview.get(
                    "interview_type"
                )
            )

            difficulty = (
                interview.get(
                    "difficulty"
                )
            )

            if isinstance(
                interview_type,
                str,
            ):
                type_counter[
                    interview_type
                ] += 1

                if overall is not None:
                    type_scores[
                        interview_type
                    ].append(
                        overall
                    )

            if (
                isinstance(
                    difficulty,
                    str,
                )
                and overall
                is not None
            ):
                difficulty_scores[
                    difficulty
                ].append(
                    overall
                )

            if completed_at is not None:
                completion_dates.append(
                    completed_at.date()
                )

            if (
                completed_at is not None
                and overall is not None
                and technical
                is not None
                and communication
                is not None
                and confidence
                is not None
                and fluency
                is not None
            ):
                trend_points.append(
                    AnalyticsTrendPoint(
                        interview_id=(
                            interview[
                                "id"
                            ]
                        ),
                        job_role=str(
                            interview.get(
                                "job_role",
                                "",
                            )
                        ),
                        completed_at=completed_at,
                        overall_score=overall,
                        technical_score=technical,
                        communication_score=communication,
                        confidence_score=confidence,
                        fluency_score=fluency,
                    )
                )

        skill_averages = (
            AnalyticsSkillAverages(
                technical=(
                    AnalyticsService
                    ._average(
                        technical_scores
                    )
                ),
                communication=(
                    AnalyticsService
                    ._average(
                        communication_scores
                    )
                ),
                confidence=(
                    AnalyticsService
                    ._average(
                        confidence_scores
                    )
                ),
                fluency=(
                    AnalyticsService
                    ._average(
                        fluency_scores
                    )
                ),
            )
        )

        skills = {
            "Technical":
                skill_averages.technical,
            "Communication":
                skill_averages.communication,
            "Confidence":
                skill_averages.confidence,
            "Fluency":
                skill_averages.fluency,
        }

        if overall_scores:
            strongest_skill = max(
                skills,
                key=lambda skill: skills[
                    skill
                ],
            )

            weakest_skill = min(
                skills,
                key=lambda skill: skills[
                    skill
                ],
            )

            strongest_score = (
                skills[
                    strongest_skill
                ]
            )

            weakest_score = (
                skills[
                    weakest_skill
                ]
            )

        else:
            strongest_skill = None
            weakest_skill = None
            strongest_score = 0.0
            weakest_score = 0.0

        difficulty_performance = [
            AnalyticsDifficultyPerformance(
                difficulty=(
                    difficulty
                    .replace(
                        "_",
                        " ",
                    )
                    .title()
                ),
                interview_count=len(
                    scores
                ),
                average_score=(
                    AnalyticsService
                    ._average(
                        scores
                    )
                ),
            )
            for (
                difficulty,
                scores,
            ) in sorted(
                difficulty_scores.items()
            )
        ]

        type_performance = [
            AnalyticsTypePerformance(
                interview_type=(
                    interview_type
                    .replace(
                        "_",
                        " ",
                    )
                    .title()
                ),
                interview_count=len(
                    scores
                ),
                average_score=(
                    AnalyticsService
                    ._average(
                        scores
                    )
                ),
            )
            for (
                interview_type,
                scores,
            ) in sorted(
                type_scores.items()
            )
        ]

        interview_distribution = [
            AnalyticsInterviewDistribution(
                interview_type=(
                    interview_type
                    .replace(
                        "_",
                        " ",
                    )
                    .title()
                ),
                count=count,
            )
            for (
                interview_type,
                count,
            ) in sorted(
                type_counter.items()
            )
        ]

        today = datetime.now(
            timezone.utc
        ).date()

        this_week_start = (
            today
            - timedelta(
                days=today.weekday()
            )
        )

        last_week_start = (
            this_week_start
            - timedelta(
                days=7
            )
        )

        this_month_start = date(
            today.year,
            today.month,
            1,
        )

        this_week_count = sum(
            1
            for completion_date
            in completion_dates
            if completion_date
            >= this_week_start
        )

        last_week_count = sum(
            1
            for completion_date
            in completion_dates
            if (
                last_week_start
                <= completion_date
                < this_week_start
            )
        )

        this_month_count = sum(
            1
            for completion_date
            in completion_dates
            if completion_date
            >= this_month_start
        )

        summary = AnalyticsSummary(
            completed_interviews=len(
                interviews
            ),
            average_score=(
                AnalyticsService
                ._average(
                    overall_scores
                )
            ),
            best_score=(
                round(
                    max(
                        overall_scores
                    ),
                    1,
                )
                if overall_scores
                else 0.0
            ),
            current_streak=(
                AnalyticsService
                ._calculate_current_streak(
                    completion_dates
                )
            ),
            practice_minutes=(
                total_duration_seconds
                // 60
            ),
            weekly_progress=(
                AnalyticsService
                ._calculate_weekly_progress(
                    interviews
                )
            ),
        )

        insights = AnalyticsInsights(
            strongest_skill=(
                strongest_skill
            ),
            strongest_skill_score=(
                strongest_score
            ),
            weakest_skill=(
                weakest_skill
            ),
            weakest_skill_score=(
                weakest_score
            ),
            improvement_percentage=(
                AnalyticsService
                ._calculate_improvement(
                    interviews
                )
            ),
        )

        return AnalyticsResponse(
            summary=summary,
            skill_averages=skill_averages,
            performance_trend=(
                trend_points[
                    -12:
                ]
            ),
            difficulty_performance=(
                difficulty_performance
            ),
            type_performance=(
                type_performance
            ),
            interview_distribution=(
                interview_distribution
            ),
            practice_activity=(
                AnalyticsPracticeActivity(
                    this_week=(
                        this_week_count
                    ),
                    last_week=(
                        last_week_count
                    ),
                    this_month=(
                        this_month_count
                    ),
                )
            ),
            insights=insights,
        )