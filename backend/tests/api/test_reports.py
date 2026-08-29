from datetime import datetime, timezone
from unittest.mock import patch
from uuid import uuid4

from fastapi.testclient import TestClient

from app.exceptions.custom_exceptions import (
    ValidationException,
)
from app.schemas.report import ReportResponse


def make_report(
    *,
    interview_id: str,
) -> ReportResponse:
    now = datetime.now(timezone.utc)

    return ReportResponse(
        id=uuid4(),
        interview_id=interview_id,
        overall_score=80,
        technical_score=85,
        communication_score=75,
        confidence_score=82,
        fluency_score=78,
        strengths=[
            "Strong technical understanding.",
        ],
        weaknesses=[
            "Communication can be more structured.",
        ],
        suggestions=[
            "Practice concise structured answers.",
        ],
        pdf_storage_path=None,
        created_at=now,
        updated_at=now,
    )


def test_generate_report_returns_201(
    client: TestClient,
) -> None:
    interview_id = str(uuid4())

    report = make_report(
        interview_id=interview_id,
    )

    with patch(
        "app.routers.v1.report.ReportService.generate_report",
        return_value=report,
    ) as generate_mock:
        response = client.post(
            f"/api/v1/reports/{interview_id}/generate",
        )

    assert response.status_code == 201

    body = response.json()

    assert body["success"] is True
    assert body["data"]["overall_score"] == 80

    generate_mock.assert_called_once()


def test_generate_report_returns_validation_error(
    client: TestClient,
) -> None:
    interview_id = str(uuid4())

    with patch(
        "app.routers.v1.report.ReportService.generate_report",
        side_effect=ValidationException(
            "The interview must be completed before generating a report.",
        ),
    ):
        response = client.post(
            f"/api/v1/reports/{interview_id}/generate",
        )

    assert response.status_code == 422

    body = response.json()

    assert body["success"] is False
    assert body["error"]["code"] == "VALIDATION_ERROR"


def test_get_report_returns_200(
    client: TestClient,
) -> None:
    interview_id = str(uuid4())

    report = make_report(
        interview_id=interview_id,
    )

    with patch(
        "app.routers.v1.report.ReportService.get_report",
        return_value=report,
    ):
        response = client.get(
            f"/api/v1/reports/{interview_id}",
        )

    assert response.status_code == 200

    body = response.json()

    assert body["success"] is True
    assert body["data"]["interview_id"] == interview_id


def test_download_report_pdf_returns_pdf(
    client: TestClient,
) -> None:
    interview_id = str(uuid4())

    pdf_bytes = b"%PDF-1.4 fake pdf"

    with patch(
        "app.routers.v1.report.ReportService.generate_pdf",
        return_value=(
            pdf_bytes,
            "user/report.pdf",
        ),
    ):
        response = client.get(
            f"/api/v1/reports/{interview_id}/pdf",
        )

    assert response.status_code == 200

    assert (
        response.headers["content-type"]
        == "application/pdf"
    )

    assert (
        f'filename="InterviewIQ_{interview_id}.pdf"'
        in response.headers["content-disposition"]
    )

    assert response.content == pdf_bytes