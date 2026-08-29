from datetime import datetime, timezone
from io import BytesIO
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest
from fastapi import UploadFile

from app.core.enums import (
    InterviewDifficulty,
    InterviewStatus,
    InterviewType,
)
from app.exceptions.custom_exceptions import (
    DatabaseException,
    ValidationException,
)
from app.schemas.evaluation import EvaluationResult
from app.schemas.interview import InterviewResponse
from app.services.response_service import ResponseService


def make_interview(
    *,
    user_id: str | None = None,
    status: InterviewStatus = InterviewStatus.IN_PROGRESS,
) -> InterviewResponse:
    now = datetime.now(timezone.utc)

    return InterviewResponse(
        id=uuid4(),
        user_id=user_id or uuid4(),
        resume_id=uuid4(),
        job_role="Software Engineer",
        interview_type=InterviewType.TECHNICAL,
        difficulty=InterviewDifficulty.MEDIUM,
        question_count=5,
        status=status,
        started_at=now,
        completed_at=None,
        duration_seconds=60,
        last_resumed_at=now,
        created_at=now,
        updated_at=now,
    )


def make_response_record(
    *,
    interview_id: str,
    question_number: int = 1,
    transcript: str = "FastAPI is a Python web framework.",
    audio_storage_path: str = "user/interview/q1.webm",
) -> dict[str, object]:
    now = datetime.now(timezone.utc)

    return {
        "id": str(uuid4()),
        "interview_id": interview_id,
        "question_number": question_number,
        "audio_storage_path": audio_storage_path,
        "transcript": transcript,
        "answer_duration_seconds": 30,
        "technical_score": 90.0,
        "communication_score": 85.0,
        "confidence_score": 80.0,
        "fluency_score": 88.0,
        "overall_score": 86.0,
        "question_feedback": "Good explanation.",
        "created_at": now,
        "updated_at": now,
    }


def make_audio_file(
    content: bytes = b"fake audio bytes",
) -> UploadFile:
    return UploadFile(
        filename="answer.webm",
        file=BytesIO(content),
    )


@pytest.mark.anyio
async def test_submit_response_successfully_completes_pipeline() -> None:
    user_id = str(uuid4())
    interview_id = str(uuid4())

    interview = make_interview(
        user_id=user_id,
    )

    audio_file = make_audio_file()

    created_response = make_response_record(
        interview_id=interview_id,
    )

    final_response = {
        **created_response,
        "technical_score": 90.0,
        "communication_score": 85.0,
        "confidence_score": 80.0,
        "fluency_score": 88.0,
        "overall_score": 86.0,
        "question_feedback": "Good explanation.",
    }

    evaluation = EvaluationResult(
        technical_score=90,
        communication_score=85,
        confidence_score=80,
        fluency_score=88,
        overall_score=86,
        question_feedback="Good explanation.",
    )

    with (
        patch(
            "app.services.response_service.InterviewService.get_interview",
            return_value=interview,
        ),
        patch(
            "app.services.response_service.db_get_interview_question",
            return_value={
                "question": "What is FastAPI?",
            },
        ),
        patch(
            "app.services.response_service.AudioStorageService.upload_audio",
            new=AsyncMock(
                return_value="user/interview/q1.webm",
            ),
        ) as upload_mock,
        patch(
            "app.services.response_service.TranscriptionService.transcribe_audio",
            return_value="FastAPI is a Python web framework.",
        ) as transcribe_mock,
        patch(
            "app.services.response_service.db_create_response",
            return_value=created_response,
        ) as create_mock,
        patch(
            "app.services.response_service.EvaluationService.evaluate_response",
            return_value=evaluation,
        ) as evaluation_mock,
        patch(
            "app.services.response_service.db_update_analysis",
            return_value=final_response,
        ) as update_mock,
    ):
        result = await ResponseService.submit_response(
            user_id=user_id,
            interview_id=interview_id,
            question_number=1,
            audio_file=audio_file,
            answer_duration_seconds=30,
        )

    assert result.question_number == 1
    assert result.transcript == "FastAPI is a Python web framework."
    assert result.technical_score == 90
    assert result.overall_score == 86
    assert result.question_feedback == "Good explanation."

    upload_mock.assert_awaited_once()

    transcribe_mock.assert_called_once_with(
        b"fake audio bytes",
    )

    create_mock.assert_called_once_with(
        interview_id=interview_id,
        question_number=1,
        audio_storage_path="user/interview/q1.webm",
        transcript="FastAPI is a Python web framework.",
        answer_duration_seconds=30,
    )

    evaluation_mock.assert_called_once_with(
        question="What is FastAPI?",
        transcript="FastAPI is a Python web framework.",
        job_role="Software Engineer",
        difficulty="medium",
    )

    update_mock.assert_called_once()


@pytest.mark.anyio
async def test_submit_response_rejects_non_active_interview() -> None:
    user_id = str(uuid4())
    interview_id = str(uuid4())

    interview = make_interview(
        user_id=user_id,
        status=InterviewStatus.COMPLETED,
    )

    audio_file = make_audio_file()

    with (
        patch(
            "app.services.response_service.InterviewService.get_interview",
            return_value=interview,
        ),
        patch(
            "app.services.response_service.AudioStorageService.upload_audio",
            new=AsyncMock(),
        ) as upload_mock,
    ):
        with pytest.raises(
            ValidationException,
            match=(
                "Interview must be in progress "
                "before submitting responses."
            ),
        ):
            await ResponseService.submit_response(
                user_id=user_id,
                interview_id=interview_id,
                question_number=1,
                audio_file=audio_file,
            )

    upload_mock.assert_not_awaited()


@pytest.mark.anyio
async def test_submit_response_rejects_empty_audio() -> None:
    user_id = str(uuid4())
    interview_id = str(uuid4())

    interview = make_interview(
        user_id=user_id,
    )

    audio_file = make_audio_file(b"")

    with (
        patch(
            "app.services.response_service.InterviewService.get_interview",
            return_value=interview,
        ),
        patch(
            "app.services.response_service.db_get_interview_question",
            return_value={
                "question": "What is FastAPI?",
            },
        ),
        patch(
            "app.services.response_service.AudioStorageService.upload_audio",
            new=AsyncMock(
                return_value="user/interview/q1.webm",
            ),
        ),
        patch(
            "app.services.response_service.AudioStorageService.delete_audio",
        ) as delete_audio_mock,
        patch(
            "app.services.response_service.TranscriptionService.transcribe_audio",
        ) as transcribe_mock,
    ):
        with pytest.raises(
            ValidationException,
            match="Uploaded audio file is empty.",
        ):
            await ResponseService.submit_response(
                user_id=user_id,
                interview_id=interview_id,
                question_number=1,
                audio_file=audio_file,
            )

    transcribe_mock.assert_not_called()

    delete_audio_mock.assert_called_once_with(
        "user/interview/q1.webm",
    )


@pytest.mark.anyio
async def test_submit_response_rejects_blank_transcript() -> None:
    user_id = str(uuid4())
    interview_id = str(uuid4())

    interview = make_interview(
        user_id=user_id,
    )

    audio_file = make_audio_file()

    with (
        patch(
            "app.services.response_service.InterviewService.get_interview",
            return_value=interview,
        ),
        patch(
            "app.services.response_service.db_get_interview_question",
            return_value={
                "question": "What is FastAPI?",
            },
        ),
        patch(
            "app.services.response_service.AudioStorageService.upload_audio",
            new=AsyncMock(
                return_value="user/interview/q1.webm",
            ),
        ),
        patch(
            "app.services.response_service.TranscriptionService.transcribe_audio",
            return_value="   ",
        ),
        patch(
            "app.services.response_service.AudioStorageService.delete_audio",
        ) as delete_audio_mock,
        patch(
            "app.services.response_service.db_create_response",
        ) as create_mock,
    ):
        with pytest.raises(
            ValidationException,
            match=(
                "Could not generate a transcript "
                "from the audio."
            ),
        ):
            await ResponseService.submit_response(
                user_id=user_id,
                interview_id=interview_id,
                question_number=1,
                audio_file=audio_file,
            )

    create_mock.assert_not_called()

    delete_audio_mock.assert_called_once_with(
        "user/interview/q1.webm",
    )


@pytest.mark.anyio
async def test_submit_response_cleans_audio_when_evaluation_fails() -> None:
    user_id = str(uuid4())
    interview_id = str(uuid4())

    interview = make_interview(
        user_id=user_id,
    )

    audio_file = make_audio_file()

    created_response = make_response_record(
        interview_id=interview_id,
    )

    with (
        patch(
            "app.services.response_service.InterviewService.get_interview",
            return_value=interview,
        ),
        patch(
            "app.services.response_service.db_get_interview_question",
            return_value={
                "question": "What is FastAPI?",
            },
        ),
        patch(
            "app.services.response_service.AudioStorageService.upload_audio",
            new=AsyncMock(
                return_value="user/interview/q1.webm",
            ),
        ),
        patch(
            "app.services.response_service.TranscriptionService.transcribe_audio",
            return_value="FastAPI is a Python framework.",
        ),
        patch(
            "app.services.response_service.db_create_response",
            return_value=created_response,
        ),
        patch(
            "app.services.response_service.EvaluationService.evaluate_response",
            side_effect=DatabaseException(
                "AI evaluation failed.",
            ),
        ),
        patch(
            "app.services.response_service.AudioStorageService.delete_audio",
        ) as delete_audio_mock,
        patch(
            "app.services.response_service.db_update_analysis",
        ) as update_mock,
        patch(
            "app.services.response_service.db_delete_response",
        ) as delete_response_mock,
    ):
        with pytest.raises(
            DatabaseException,
            match="AI evaluation failed.",
        ):
            await ResponseService.submit_response(
                user_id=user_id,
                interview_id=interview_id,
                question_number=1,
                audio_file=audio_file,
            )

    update_mock.assert_not_called()

    delete_audio_mock.assert_called_once_with(
        "user/interview/q1.webm",
    )
    delete_response_mock.assert_called_once_with(
        str(created_response["id"]),
    )


def test_get_response_verifies_interview_ownership() -> None:
    user_id = str(uuid4())
    interview_id = str(uuid4())

    response_record = make_response_record(
        interview_id=interview_id,
    )

    with (
        patch(
            "app.services.response_service.db_get_response",
            return_value=response_record,
        ),
        patch(
            "app.services.response_service.InterviewService.get_interview",
        ) as interview_mock,
    ):
        result = ResponseService.get_response(
            response_id=str(
                response_record["id"],
            ),
            user_id=user_id,
        )

    interview_mock.assert_called_once_with(
        interview_id=interview_id,
        user_id=user_id,
    )

    assert str(result.id) == response_record["id"]


def test_list_interview_responses_checks_ownership() -> None:
    user_id = str(uuid4())
    interview_id = str(uuid4())

    responses = [
        make_response_record(
            interview_id=interview_id,
            question_number=1,
        ),
        make_response_record(
            interview_id=interview_id,
            question_number=2,
        ),
    ]

    with (
        patch(
            "app.services.response_service.InterviewService.get_interview",
        ) as interview_mock,
        patch(
            "app.services.response_service.db_get_interview_responses",
            return_value=responses,
        ) as list_mock,
    ):
        result = ResponseService.list_interview_responses(
            interview_id=interview_id,
            user_id=user_id,
        )

    interview_mock.assert_called_once_with(
        interview_id=interview_id,
        user_id=user_id,
    )

    list_mock.assert_called_once_with(
        interview_id,
    )

    assert len(result) == 2
    assert result[0].question_number == 1
    assert result[1].question_number == 2


def test_delete_response_deletes_audio_and_database_record() -> None:
    user_id = str(uuid4())
    interview_id = str(uuid4())

    response_record = make_response_record(
        interview_id=interview_id,
    )

    response_id = str(
        response_record["id"],
    )

    with (
        patch(
            "app.services.response_service.db_get_response",
            return_value=response_record,
        ),
        patch(
            "app.services.response_service.InterviewService.get_interview",
        ),
        patch(
            "app.services.response_service.AudioStorageService.delete_audio",
        ) as delete_audio_mock,
        patch(
            "app.services.response_service.db_delete_response",
        ) as delete_response_mock,
    ):
        ResponseService.delete_response(
            response_id=response_id,
            user_id=user_id,
        )

    delete_audio_mock.assert_called_once_with(
        "user/interview/q1.webm",
    )

    delete_response_mock.assert_called_once_with(
        response_id,
    )


def test_delete_response_without_audio_still_deletes_database_record() -> None:
    user_id = str(uuid4())
    interview_id = str(uuid4())

    response_record = make_response_record(
        interview_id=interview_id,
    )

    response_record["audio_storage_path"] = None

    response_id = str(
        response_record["id"],
    )

    with (
        patch(
            "app.services.response_service.db_get_response",
            return_value=response_record,
        ),
        patch(
            "app.services.response_service.InterviewService.get_interview",
        ),
        patch(
            "app.services.response_service.AudioStorageService.delete_audio",
        ) as delete_audio_mock,
        patch(
            "app.services.response_service.db_delete_response",
        ) as delete_response_mock,
    ):
        ResponseService.delete_response(
            response_id=response_id,
            user_id=user_id,
        )

    delete_audio_mock.assert_not_called()

    delete_response_mock.assert_called_once_with(
        response_id,
    )


@pytest.mark.anyio
async def test_submit_response_rolls_back_when_analysis_update_fails() -> None:
    user_id = str(uuid4())
    interview_id = str(uuid4())

    interview = make_interview(
        user_id=user_id,
    )

    audio_file = make_audio_file()

    created_response = make_response_record(
        interview_id=interview_id,
    )

    evaluation = EvaluationResult(
        technical_score=90,
        communication_score=85,
        confidence_score=80,
        fluency_score=88,
        overall_score=86,
        question_feedback="Good explanation.",
    )

    with (
        patch(
            "app.services.response_service.InterviewService.get_interview",
            return_value=interview,
        ),
        patch(
            "app.services.response_service.db_get_interview_question",
            return_value={
                "question": "What is FastAPI?",
            },
        ),
        patch(
            "app.services.response_service.AudioStorageService.upload_audio",
            new=AsyncMock(
                return_value="user/interview/q1.webm",
            ),
        ),
        patch(
            "app.services.response_service.TranscriptionService.transcribe_audio",
            return_value="FastAPI is a Python framework.",
        ),
        patch(
            "app.services.response_service.db_create_response",
            return_value=created_response,
        ),
        patch(
            "app.services.response_service.EvaluationService.evaluate_response",
            return_value=evaluation,
        ),
        patch(
            "app.services.response_service.db_update_analysis",
            side_effect=DatabaseException(
                "Failed to save evaluation.",
            ),
        ),
        patch(
            "app.services.response_service.db_delete_response",
        ) as delete_response_mock,
        patch(
            "app.services.response_service.AudioStorageService.delete_audio",
        ) as delete_audio_mock,
    ):
        with pytest.raises(
            DatabaseException,
            match="Failed to save evaluation.",
        ):
            await ResponseService.submit_response(
                user_id=user_id,
                interview_id=interview_id,
                question_number=1,
                audio_file=audio_file,
            )

    delete_response_mock.assert_called_once_with(
        str(created_response["id"]),
    )

    delete_audio_mock.assert_called_once_with(
        "user/interview/q1.webm",
    )