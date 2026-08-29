from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch
from uuid import uuid4

from fastapi.testclient import TestClient

from app.schemas.response import ResponseResponse


def make_response(
    *,
    interview_id: str,
    response_id: str | None = None,
) -> ResponseResponse:
    now = datetime.now(timezone.utc)

    return ResponseResponse(
        id=response_id or uuid4(),
        interview_id=interview_id,
        question_number=1,
        audio_storage_path="user/interview/q1.webm",
        transcript="FastAPI is a Python web framework.",
        answer_duration_seconds=30,
        technical_score=90,
        communication_score=85,
        confidence_score=80,
        fluency_score=88,
        overall_score=86,
        question_feedback="Good explanation.",
        created_at=now,
        updated_at=now,
    )


def test_submit_response_returns_201(
    client: TestClient,
) -> None:
    interview_id = str(uuid4())

    response_data = make_response(
        interview_id=interview_id,
    )

    with patch(
        "app.routers.v1.response.ResponseService.submit_response",
        new=AsyncMock(
            return_value=response_data,
        ),
    ) as submit_mock:
        response = client.post(
            "/api/v1/responses/submit",
            data={
                "interview_id": interview_id,
                "question_number": "1",
                "answer_duration_seconds": "30",
            },
            files={
                "audio_file": (
                    "answer.webm",
                    b"fake audio data",
                    "audio/webm",
                ),
            },
        )

    assert response.status_code == 201

    body = response.json()

    assert body["success"] is True
    assert body["data"]["question_number"] == 1
    assert body["data"]["overall_score"] == 86

    submit_mock.assert_awaited_once()


def test_submit_response_requires_audio(
    client: TestClient,
) -> None:
    response = client.post(
        "/api/v1/responses/submit",
        data={
            "interview_id": str(uuid4()),
            "question_number": "1",
        },
    )

    assert response.status_code == 422


def test_submit_response_rejects_negative_duration(
    client: TestClient,
) -> None:
    response = client.post(
        "/api/v1/responses/submit",
        data={
            "interview_id": str(uuid4()),
            "question_number": "1",
            "answer_duration_seconds": "-1",
        },
        files={
            "audio_file": (
                "answer.webm",
                b"fake audio data",
                "audio/webm",
            ),
        },
    )

    assert response.status_code == 422


def test_get_response_returns_200(
    client: TestClient,
) -> None:
    interview_id = str(uuid4())
    response_id = str(uuid4())

    response_data = make_response(
        interview_id=interview_id,
        response_id=response_id,
    )

    with patch(
        "app.routers.v1.response.ResponseService.get_response",
        return_value=response_data,
    ):
        response = client.get(
            f"/api/v1/responses/{response_id}",
        )

    assert response.status_code == 200

    body = response.json()

    assert body["success"] is True
    assert body["data"]["id"] == response_id


def test_list_interview_responses_returns_list(
    client: TestClient,
) -> None:
    interview_id = str(uuid4())

    responses = [
        make_response(
            interview_id=interview_id,
        ),
        make_response(
            interview_id=interview_id,
        ),
    ]

    with patch(
        "app.routers.v1.response.ResponseService.list_interview_responses",
        return_value=responses,
    ):
        response = client.get(
            f"/api/v1/responses/interview/{interview_id}",
        )

    assert response.status_code == 200

    body = response.json()

    assert body["success"] is True
    assert len(body["data"]) == 2


def test_delete_response_returns_200(
    client: TestClient,
) -> None:
    response_id = str(uuid4())

    with patch(
        "app.routers.v1.response.ResponseService.delete_response",
    ) as delete_mock:
        response = client.delete(
            f"/api/v1/responses/{response_id}",
        )

    assert response.status_code == 200

    assert response.json() == {
        "success": True,
        "message": "Interview response deleted successfully.",
    }

    delete_mock.assert_called_once()