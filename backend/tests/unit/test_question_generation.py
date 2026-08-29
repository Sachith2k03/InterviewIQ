import pytest

from app.exceptions.custom_exceptions import (
    ValidationException,
)
from app.services.question_generation_service import (
    QuestionGenerationService,
)


def test_validate_questions_accepts_valid_questions() -> None:
    questions = [
        "Tell me about your FastAPI experience.",
        "How would you optimize a slow database query?",
        "Describe a difficult technical problem you solved.",
    ]

    result = (
        QuestionGenerationService
        ._validate_questions(
            questions=questions,
            expected_count=3,
        )
    )

    assert result == questions


def test_validate_questions_strips_whitespace() -> None:
    questions = [
        "  What is dependency injection?  ",
        "\nExplain REST API design.\n",
    ]

    result = (
        QuestionGenerationService
        ._validate_questions(
            questions=questions,
            expected_count=2,
        )
    )

    assert result == [
        "What is dependency injection?",
        "Explain REST API design.",
    ]


def test_validate_questions_removes_blank_questions() -> None:
    questions = [
        "Explain database indexing.",
        "",
        "   ",
    ]

    with pytest.raises(
        ValidationException,
        match=(
            "AI did not generate the required "
            "number of questions."
        ),
    ):
        (
            QuestionGenerationService
            ._validate_questions(
                questions=questions,
                expected_count=3,
            )
        )


def test_validate_questions_rejects_wrong_count() -> None:
    questions = [
        "Question one?",
        "Question two?",
    ]

    with pytest.raises(
        ValidationException,
        match=(
            "AI did not generate the required "
            "number of questions."
        ),
    ):
        (
            QuestionGenerationService
            ._validate_questions(
                questions=questions,
                expected_count=3,
            )
        )


def test_validate_questions_rejects_exact_duplicates() -> None:
    questions = [
        "Explain REST APIs.",
        "Explain REST APIs.",
    ]

    with pytest.raises(
        ValidationException,
        match=(
            "AI generated duplicate "
            "interview questions."
        ),
    ):
        (
            QuestionGenerationService
            ._validate_questions(
                questions=questions,
                expected_count=2,
            )
        )


def test_validate_questions_rejects_case_insensitive_duplicates() -> None:
    questions = [
        "Explain REST APIs.",
        "explain rest apis.",
    ]

    with pytest.raises(
        ValidationException,
        match=(
            "AI generated duplicate "
            "interview questions."
        ),
    ):
        (
            QuestionGenerationService
            ._validate_questions(
                questions=questions,
                expected_count=2,
            )
        )


def test_validate_questions_accepts_unique_case_variations() -> None:
    questions = [
        "Explain FastAPI dependency injection.",
        "Explain FastAPI middleware.",
    ]

    result = (
        QuestionGenerationService
        ._validate_questions(
            questions=questions,
            expected_count=2,
        )
    )

    assert len(result) == 2