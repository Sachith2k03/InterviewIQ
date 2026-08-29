from app.services.pii_sanitization_service import (
    PIISanitizationService,
)


def test_sanitize_empty_text() -> None:
    result = PIISanitizationService.sanitize("")

    assert result == ""


def test_sanitize_email() -> None:
    text = (
        "Software Engineer\n"
        "Email: testemail@example.com"
    )

    result = PIISanitizationService.sanitize(text)

    assert "testemail@example.com" not in result
    assert "[EMAIL]" in result


def test_sanitize_linkedin_url() -> None:
    text = (
        "Software Engineer\n"
        "https://www.linkedin.com/in/example-user"
    )

    result = PIISanitizationService.sanitize(
        text
    )

    assert "linkedin.com" not in result
    assert "[LINKEDIN_URL]" in result


def test_sanitize_date_of_birth() -> None:
    text = (
        "Software Engineer\n"
        "Date of Birth: 10 January 2002"
    )

    result = PIISanitizationService.sanitize(
        text
    )

    assert "10 January 2002" not in result
    assert "[DATE_OF_BIRTH]" in result


def test_sanitize_nic_number() -> None:
    text = (
        "Software Engineer\n"
        "NIC: 200012345678"
    )

    result = PIISanitizationService.sanitize(
        text
    )

    assert "200012345678" not in result
    assert "[ID_NUMBER]" in result


def test_sanitize_address() -> None:
    text = (
        "Software Engineer\n"
        "Address: 123 Main Street, Colombo"
    )

    result = PIISanitizationService.sanitize(
        text
    )

    assert "123 Main Street" not in result
    assert "[ADDRESS]" in result


def test_sanitize_phone_number() -> None:
    text = (
        "Software Engineer\n"
        "Phone: +94 77 123 4567"
    )

    result = PIISanitizationService.sanitize(
        text
    )

    assert "77 123 4567" not in result
    assert "[PHONE]" in result


def test_sanitize_candidate_name_near_start() -> None:
    text = (
        "Sachith Liyanage\n"
        "Software Engineer\n"
        "Python Java FastAPI"
    )

    result = PIISanitizationService.sanitize(
        text
    )

    assert "Sachith Liyanage" not in result
    assert "[CANDIDATE_NAME]" in result


def test_does_not_replace_resume_heading_as_name() -> None:
    text = (
        "WORK EXPERIENCE\n"
        "Software Engineer\n"
        "Developed REST APIs"
    )

    result = PIISanitizationService.sanitize(
        text
    )

    assert "WORK EXPERIENCE" in result


def test_does_not_replace_common_job_title_as_name() -> None:
    text = (
        "Software Engineer\n"
        "Python FastAPI PostgreSQL"
    )

    result = PIISanitizationService.sanitize(
        text
    )

    assert "Software Engineer" in result


def test_sanitize_multiple_pii_values() -> None:
    text = (
        "Sachith Liyanage\n"
        "Email: sachith@example.com\n"
        "Phone: +94 77 123 4567\n"
        "Address: 123 Main Street, Colombo\n"
        "LinkedIn: "
        "https://linkedin.com/in/example-user"
    )

    result = PIISanitizationService.sanitize(
        text
    )

    assert "[CANDIDATE_NAME]" in result
    assert "[EMAIL]" in result
    assert "[PHONE]" in result
    assert "[ADDRESS]" in result
    assert "[LINKEDIN_URL]" in result

    assert "testemail@example.com" not in result
    assert "123 Main Street" not in result
    assert "linkedin.com/in/example-user" not in result