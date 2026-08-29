from datetime import datetime, timezone
from unittest.mock import patch
from uuid import uuid4

import pytest

from app.core.enums import (
    InterviewDifficulty,
    InterviewStatus,
    InterviewType,
)
from app.exceptions.custom_exceptions import (
    UnauthorizedException,
)
from app.services.interview_service import (
    InterviewService,
)


def make_interview(
    *,
    user_id: str | None = None,
    resume_id: str | None = None,
    status: InterviewStatus = InterviewStatus.PENDING,
    duration_seconds: int = 0,
    last_resumed_at: datetime | None = None,
) -> dict[str, object]:
    now = datetime.now(timezone.utc)

    return {
        "id": str(uuid4()),
        "user_id": user_id or str(uuid4()),
        "resume_id": resume_id or str(uuid4()),
        "job_role": "Software Engineer",
        "interview_type": InterviewType.TECHNICAL,
        "difficulty": InterviewDifficulty.MEDIUM,
        "question_count": 5,
        "status": status,
        "started_at": None,
        "completed_at": None,
        "duration_seconds": duration_seconds,
        "last_resumed_at": last_resumed_at,
        "created_at": now,
        "updated_at": now,
    }


def test_get_owned_interview_returns_owned_interview() -> None:
    user_id = str(uuid4())

    interview_data = make_interview(
        user_id=user_id,
    )

    with patch(
        "app.services.interview_service.db_get_interview",
        return_value=interview_data,
    ):
        result = InterviewService._get_owned_interview(
            str(interview_data["id"]),
            user_id,
        )

    assert str(result.id) == interview_data["id"]
    assert str(result.user_id) == user_id
    assert result.job_role == "Software Engineer"


def test_get_owned_interview_rejects_other_user() -> None:
    owner_id = str(uuid4())
    other_user_id = str(uuid4())

    interview_data = make_interview(
        user_id=owner_id,
    )

    with patch(
        "app.services.interview_service.db_get_interview",
        return_value=interview_data,
    ):
        with pytest.raises(
            UnauthorizedException,
            match=(
                "You do not have permission "
                "to access this interview."
            ),
        ):
            InterviewService._get_owned_interview(
                str(interview_data["id"]),
                other_user_id,
            )


def test_create_interview_with_owned_resume() -> None:
    user_id = str(uuid4())
    resume_id = str(uuid4())

    resume_data = {
        "id": resume_id,
        "user_id": user_id,
    }

    interview_data = make_interview(
        user_id=user_id,
        resume_id=resume_id,
    )

    with (
        patch(
            "app.services.interview_service.get_resume",
            return_value=resume_data,
        ),
        patch(
            "app.services.interview_service.db_create_interview",
            return_value=interview_data,
        ) as create_mock,
    ):
        result = InterviewService.create_interview(
            user_id=user_id,
            job_role="Software Engineer",
            interview_type=InterviewType.TECHNICAL,
            difficulty=InterviewDifficulty.MEDIUM,
            question_count=5,
            resume_id=resume_id,
        )

    assert str(result.user_id) == user_id
    assert str(result.resume_id) == resume_id
    assert result.job_role == "Software Engineer"

    create_mock.assert_called_once_with(
        user_id=user_id,
        resume_id=resume_id,
        job_role="Software Engineer",
        interview_type=InterviewType.TECHNICAL,
        difficulty=InterviewDifficulty.MEDIUM,
        question_count=5,
    )


def test_create_interview_rejects_resume_owned_by_other_user() -> None:
    user_id = str(uuid4())
    resume_owner_id = str(uuid4())
    resume_id = str(uuid4())

    resume_data = {
        "id": resume_id,
        "user_id": resume_owner_id,
    }

    with (
        patch(
            "app.services.interview_service.get_resume",
            return_value=resume_data,
        ),
        patch(
            "app.services.interview_service.db_create_interview",
        ) as create_mock,
    ):
        with pytest.raises(
            UnauthorizedException,
            match=(
                "You do not have permission "
                "to use this resume."
            ),
        ):
            InterviewService.create_interview(
                user_id=user_id,
                job_role="Software Engineer",
                interview_type=InterviewType.TECHNICAL,
                difficulty=InterviewDifficulty.MEDIUM,
                question_count=5,
                resume_id=resume_id,
            )

    create_mock.assert_not_called()


def test_get_interview_returns_owned_interview() -> None:
    user_id = str(uuid4())

    interview_data = make_interview(
        user_id=user_id,
    )

    with patch(
        "app.services.interview_service.db_get_interview",
        return_value=interview_data,
    ):
        result = InterviewService.get_interview(
            str(interview_data["id"]),
            user_id,
        )

    assert str(result.id) == interview_data["id"]
    assert str(result.user_id) == user_id


def test_resume_interview_returns_completed_interview_without_update() -> None:
    user_id = str(uuid4())

    interview_data = make_interview(
        user_id=user_id,
        status=InterviewStatus.COMPLETED,
    )

    with (
        patch(
            "app.services.interview_service.db_get_interview",
            return_value=interview_data,
        ),
        patch(
            "app.services.interview_service.db_resume_interview_timer",
        ) as resume_mock,
    ):
        result = InterviewService.resume_interview(
            str(interview_data["id"]),
            user_id,
        )

    assert result.status == InterviewStatus.COMPLETED
    resume_mock.assert_not_called()


def test_resume_interview_does_not_resume_already_active_timer() -> None:
    user_id = str(uuid4())

    interview_data = make_interview(
        user_id=user_id,
        status=InterviewStatus.IN_PROGRESS,
        last_resumed_at=datetime.now(timezone.utc),
    )

    with (
        patch(
            "app.services.interview_service.db_get_interview",
            return_value=interview_data,
        ),
        patch(
            "app.services.interview_service.db_resume_interview_timer",
        ) as resume_mock,
    ):
        result = InterviewService.resume_interview(
            str(interview_data["id"]),
            user_id,
        )

    assert result.last_resumed_at is not None
    resume_mock.assert_not_called()


def test_pause_interview_returns_completed_interview_without_update() -> None:
    user_id = str(uuid4())

    interview_data = make_interview(
        user_id=user_id,
        status=InterviewStatus.COMPLETED,
    )

    with (
        patch(
            "app.services.interview_service.db_get_interview",
            return_value=interview_data,
        ),
        patch(
            "app.services.interview_service.db_pause_interview_timer",
        ) as pause_mock,
    ):
        result = InterviewService.pause_interview(
            str(interview_data["id"]),
            user_id,
        )

    assert result.status == InterviewStatus.COMPLETED
    pause_mock.assert_not_called()


def test_pause_interview_does_nothing_when_timer_already_paused() -> None:
    user_id = str(uuid4())

    interview_data = make_interview(
        user_id=user_id,
        status=InterviewStatus.IN_PROGRESS,
        duration_seconds=120,
        last_resumed_at=None,
    )

    with (
        patch(
            "app.services.interview_service.db_get_interview",
            return_value=interview_data,
        ),
        patch(
            "app.services.interview_service.db_pause_interview_timer",
        ) as pause_mock,
    ):
        result = InterviewService.pause_interview(
            str(interview_data["id"]),
            user_id,
        )

    assert result.duration_seconds == 120
    pause_mock.assert_not_called()


def test_delete_interview_validates_ownership_before_delete() -> None:
    user_id = str(uuid4())

    interview_data = make_interview(
        user_id=user_id,
    )

    with (
        patch(
            "app.services.interview_service.db_get_interview",
            return_value=interview_data,
        ),
        patch(
            "app.services.interview_service.db_delete_interview",
        ) as delete_mock,
    ):
        InterviewService.delete_interview(
            str(interview_data["id"]),
            user_id,
        )

    delete_mock.assert_called_once_with(
        str(interview_data["id"]),
    )


def test_delete_interview_rejects_other_user() -> None:
    owner_id = str(uuid4())
    other_user_id = str(uuid4())

    interview_data = make_interview(
        user_id=owner_id,
    )

    with (
        patch(
            "app.services.interview_service.db_get_interview",
            return_value=interview_data,
        ),
        patch(
            "app.services.interview_service.db_delete_interview",
        ) as delete_mock,
    ):
        with pytest.raises(UnauthorizedException):
            InterviewService.delete_interview(
                str(interview_data["id"]),
                other_user_id,
            )

    delete_mock.assert_not_called()