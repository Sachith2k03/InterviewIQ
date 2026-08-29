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
    NotFoundException,
    ValidationException,
)
from app.schemas.interview import InterviewResponse
from app.services.report_service import ReportService


def make_interview(
    *,
    user_id: str | None = None,
    status: InterviewStatus = InterviewStatus.COMPLETED,
    question_count: int = 2,
) -> InterviewResponse:
    now = datetime.now(timezone.utc)

    return InterviewResponse(
        id=uuid4(),
        user_id=user_id or uuid4(),
        resume_id=uuid4(),
        job_role="Software Engineer",
        interview_type=InterviewType.TECHNICAL,
        difficulty=InterviewDifficulty.MEDIUM,
        question_count=question_count,
        status=status,
        started_at=now,
        completed_at=now if status == InterviewStatus.COMPLETED else None,
        duration_seconds=300,
        last_resumed_at=None,
        created_at=now,
        updated_at=now,
    )


def make_response(
    *,
    technical_score: float,
    communication_score: float,
    confidence_score: float,
    fluency_score: float,
    overall_score: float,
) -> dict[str, object]:
    return {
        "technical_score": technical_score,
        "communication_score": communication_score,
        "confidence_score": confidence_score,
        "fluency_score": fluency_score,
        "overall_score": overall_score,
    }


def make_report(
    *,
    interview_id: str,
    technical_score: float = 80,
    communication_score: float = 80,
    confidence_score: float = 80,
    fluency_score: float = 80,
    overall_score: float = 80,
) -> dict[str, object]:
    now = datetime.now(timezone.utc)

    return {
        "id": str(uuid4()),
        "interview_id": interview_id,
        "overall_score": overall_score,
        "technical_score": technical_score,
        "communication_score": communication_score,
        "confidence_score": confidence_score,
        "fluency_score": fluency_score,
        "strengths": [
            "Strong technical understanding and accurate responses.",
        ],
        "weaknesses": [
            "No major weaknesses were identified, but continued practice can improve consistency.",
        ],
        "suggestions": [
            "Continue practicing mock interviews and reviewing the detailed feedback for each response.",
        ],
        "pdf_storage_path": None,
        "created_at": now,
        "updated_at": now,
    }


def test_average_score_calculates_mean() -> None:
    responses = [
        {"technical_score": 80},
        {"technical_score": 90},
        {"technical_score": 100},
    ]

    result = ReportService._average_score(
        responses,
        "technical_score",
    )

    assert result == 90.0


def test_average_score_ignores_invalid_values() -> None:
    responses = [
        {"technical_score": 80},
        {"technical_score": None},
        {"technical_score": "invalid"},
        {"technical_score": 100},
    ]

    result = ReportService._average_score(
        responses,
        "technical_score",
    )

    assert result == 90.0


def test_average_score_rejects_when_no_valid_scores() -> None:
    responses = [
        {"technical_score": None},
        {"technical_score": "invalid"},
    ]

    with pytest.raises(
        ValidationException,
        match="No valid technical_score values were found.",
    ):
        ReportService._average_score(
            responses,
            "technical_score",
        )


def test_build_feedback_identifies_strengths_and_weaknesses() -> None:
    (
        strengths,
        weaknesses,
        suggestions,
    ) = ReportService._build_feedback(
        technical_score=90,
        communication_score=55,
        confidence_score=85,
        fluency_score=60,
    )

    assert (
        "Strong technical understanding and accurate responses."
        in strengths
    )

    assert (
        "Demonstrates good confidence while answering."
        in strengths
    )

    assert (
        "Communication could be clearer and more structured."
        in weaknesses
    )

    assert (
        "Fluency and delivery could be improved."
        in weaknesses
    )

    assert len(suggestions) == 2


def test_generate_report_rejects_incomplete_interview() -> None:
    user_id = str(uuid4())
    interview_id = str(uuid4())

    interview = make_interview(
        user_id=user_id,
        status=InterviewStatus.IN_PROGRESS,
    )

    with patch(
        "app.services.report_service.InterviewService.get_interview",
        return_value=interview,
    ):
        with pytest.raises(
            ValidationException,
            match=(
                "The interview must be completed "
                "before generating a report."
            ),
        ):
            ReportService.generate_report(
                interview_id=interview_id,
                user_id=user_id,
            )


def test_generate_report_returns_existing_report() -> None:
    user_id = str(uuid4())
    interview_id = str(uuid4())

    interview = make_interview(
        user_id=user_id,
    )

    existing_report = make_report(
        interview_id=interview_id,
    )

    with (
        patch(
            "app.services.report_service.InterviewService.get_interview",
            return_value=interview,
        ),
        patch(
            "app.services.report_service.db_get_report",
            return_value=existing_report,
        ),
        patch(
            "app.services.report_service.db_get_interview_responses",
        ) as responses_mock,
        patch(
            "app.services.report_service.db_create_report",
        ) as create_mock,
    ):
        result = ReportService.generate_report(
            interview_id=interview_id,
            user_id=user_id,
        )

    assert str(result.interview_id) == interview_id
    assert result.overall_score == 80

    responses_mock.assert_not_called()
    create_mock.assert_not_called()


def test_generate_report_rejects_when_no_responses_exist() -> None:
    user_id = str(uuid4())
    interview_id = str(uuid4())

    interview = make_interview(
        user_id=user_id,
        question_count=2,
    )

    with (
        patch(
            "app.services.report_service.InterviewService.get_interview",
            return_value=interview,
        ),
        patch(
            "app.services.report_service.db_get_report",
            side_effect=NotFoundException(
                "Interview report not found.",
            ),
        ),
        patch(
            "app.services.report_service.db_get_interview_responses",
            return_value=[],
        ),
    ):
        with pytest.raises(
            ValidationException,
            match="No interview responses were found.",
        ):
            ReportService.generate_report(
                interview_id=interview_id,
                user_id=user_id,
            )


def test_generate_report_requires_response_for_every_question() -> None:
    user_id = str(uuid4())
    interview_id = str(uuid4())

    interview = make_interview(
        user_id=user_id,
        question_count=3,
    )

    responses = [
        make_response(
            technical_score=80,
            communication_score=80,
            confidence_score=80,
            fluency_score=80,
            overall_score=80,
        ),
        make_response(
            technical_score=90,
            communication_score=90,
            confidence_score=90,
            fluency_score=90,
            overall_score=90,
        ),
    ]

    with (
        patch(
            "app.services.report_service.InterviewService.get_interview",
            return_value=interview,
        ),
        patch(
            "app.services.report_service.db_get_report",
            side_effect=NotFoundException(
                "Interview report not found.",
            ),
        ),
        patch(
            "app.services.report_service.db_get_interview_responses",
            return_value=responses,
        ),
        patch(
            "app.services.report_service.db_create_report",
        ) as create_mock,
    ):
        with pytest.raises(
            ValidationException,
            match=(
                "The interview does not contain "
                "responses for all questions."
            ),
        ):
            ReportService.generate_report(
                interview_id=interview_id,
                user_id=user_id,
            )

    create_mock.assert_not_called()


def test_generate_report_calculates_and_persists_averages() -> None:
    user_id = str(uuid4())
    interview_id = str(uuid4())

    interview = make_interview(
        user_id=user_id,
        question_count=2,
    )

    responses = [
        make_response(
            technical_score=90,
            communication_score=70,
            confidence_score=80,
            fluency_score=60,
            overall_score=75,
        ),
        make_response(
            technical_score=80,
            communication_score=60,
            confidence_score=90,
            fluency_score=50,
            overall_score=85,
        ),
    ]

    saved_report = make_report(
        interview_id=interview_id,
        technical_score=85,
        communication_score=65,
        confidence_score=85,
        fluency_score=55,
        overall_score=80,
    )

    with (
        patch(
            "app.services.report_service.InterviewService.get_interview",
            return_value=interview,
        ),
        patch(
            "app.services.report_service.db_get_report",
            side_effect=NotFoundException(
                "Interview report not found.",
            ),
        ),
        patch(
            "app.services.report_service.db_get_interview_responses",
            return_value=responses,
        ),
        patch(
            "app.services.report_service.db_create_report",
            return_value=saved_report,
        ) as create_mock,
    ):
        result = ReportService.generate_report(
            interview_id=interview_id,
            user_id=user_id,
        )

    assert result.technical_score == 85
    assert result.communication_score == 65
    assert result.confidence_score == 85
    assert result.fluency_score == 55
    assert result.overall_score == 80

    create_mock.assert_called_once()

    call_kwargs = create_mock.call_args.kwargs

    assert call_kwargs["technical_score"] == 85
    assert call_kwargs["communication_score"] == 65
    assert call_kwargs["confidence_score"] == 85
    assert call_kwargs["fluency_score"] == 55
    assert call_kwargs["overall_score"] == 80
    assert call_kwargs["pdf_storage_path"] is None


def test_get_report_validates_interview_ownership_first() -> None:
    user_id = str(uuid4())
    interview_id = str(uuid4())

    report = make_report(
        interview_id=interview_id,
    )

    with (
        patch(
            "app.services.report_service.InterviewService.get_interview",
        ) as interview_mock,
        patch(
            "app.services.report_service.db_get_report",
            return_value=report,
        ),
    ):
        result = ReportService.get_report(
            interview_id=interview_id,
            user_id=user_id,
        )

    interview_mock.assert_called_once_with(
        interview_id=interview_id,
        user_id=user_id,
    )

    assert str(result.interview_id) == interview_id