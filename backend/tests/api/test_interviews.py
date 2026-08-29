from datetime import datetime, timezone
from unittest.mock import patch
from uuid import uuid4

from fastapi.testclient import TestClient

from app.core.enums import (
    InterviewDifficulty,
    InterviewStatus,
    InterviewType,
)
from app.exceptions.custom_exceptions import (
    NotFoundException,
)
from app.schemas.interview import InterviewResponse


def make_interview(
    *,
    user_id: str,
    interview_id: str | None = None,
) -> InterviewResponse:
    now = datetime.now(timezone.utc)

    return InterviewResponse(
        id=interview_id or uuid4(),
        user_id=user_id,
        resume_id=uuid4(),
        job_role="Software Engineer",
        interview_type=InterviewType.TECHNICAL,
        difficulty=InterviewDifficulty.MEDIUM,
        question_count=5,
        status=InterviewStatus.PENDING,
        started_at=None,
        completed_at=None,
        duration_seconds=0,
        last_resumed_at=None,
        created_at=now,
        updated_at=now,
    )


def test_create_interview_returns_201(
    client: TestClient,
    user_id: str,
) -> None:
    resume_id = str(uuid4())

    interview = make_interview(
        user_id=user_id,
    )

    with (
        patch(
            "app.routers.v1.interview.InterviewService.create_interview",
            return_value=interview,
        ) as create_mock,
        patch(
            "app.routers.v1.interview.NotificationService.create_safely",
        ) as notification_mock,
    ):
        response = client.post(
            "/api/v1/interviews/create",
            json={
                "resume_id": resume_id,
                "job_role": "Software Engineer",
                "interview_type": "technical",
                "difficulty": "medium",
                "question_count": 5,
            },
        )

    assert response.status_code == 201

    body = response.json()

    assert body["success"] is True
    assert body["message"] == "Interview created successfully."
    assert body["data"]["job_role"] == "Software Engineer"

    create_mock.assert_called_once()

    notification_mock.assert_called_once()


def test_create_interview_rejects_invalid_question_count(
    client: TestClient,
) -> None:
    response = client.post(
        "/api/v1/interviews/create",
        json={
            "resume_id": str(uuid4()),
            "job_role": "Software Engineer",
            "interview_type": "technical",
            "difficulty": "medium",
            "question_count": 0,
        },
    )

    assert response.status_code == 422


def test_get_interview_returns_200(
    client: TestClient,
    user_id: str,
) -> None:
    interview_id = str(uuid4())

    interview = make_interview(
        user_id=user_id,
        interview_id=interview_id,
    )

    with patch(
        "app.routers.v1.interview.InterviewService.get_interview",
        return_value=interview,
    ) as get_mock:
        response = client.get(
            f"/api/v1/interviews/{interview_id}",
        )

    assert response.status_code == 200

    body = response.json()

    assert body["success"] is True
    assert body["data"]["id"] == interview_id

    get_mock.assert_called_once_with(
        interview_id=interview_id,
        user_id=user_id,
    )


def test_get_interview_returns_404_when_not_found(
    client: TestClient,
) -> None:
    interview_id = str(uuid4())

    with patch(
        "app.routers.v1.interview.InterviewService.get_interview",
        side_effect=NotFoundException(
            "Interview not found.",
        ),
    ):
        response = client.get(
            f"/api/v1/interviews/{interview_id}",
        )

    assert response.status_code == 404

    body = response.json()

    assert body["success"] is False
    assert body["message"] == "Interview not found."
    assert body["error"]["code"] == "NOT_FOUND"


def test_get_interview_rejects_invalid_uuid(
    client: TestClient,
) -> None:
    response = client.get(
        "/api/v1/interviews/not-a-uuid",
    )

    assert response.status_code == 422


def test_interview_requires_authentication(
    unauthenticated_client: TestClient,
) -> None:
    response = unauthenticated_client.get(
        f"/api/v1/interviews/{uuid4()}",
    )

    assert response.status_code == 401

    body = response.json()

    assert body["success"] is False
    assert (
        body["message"]
        == "Authorization header is missing."
    )