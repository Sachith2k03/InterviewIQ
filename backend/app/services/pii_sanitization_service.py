import re


class PIISanitizationService:
    """Remove personally identifiable information from resume text."""

    EMAIL_PATTERN = re.compile(
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"
    )

    PHONE_PATTERN = re.compile(
        r"(?<!\w)(?:\+?\d{1,3}[\s.-]?)?"
        r"(?:\(?\d{2,4}\)?[\s.-]?)?"
        r"\d{3}[\s.-]?\d{3,4}(?!\w)"
    )

    LINKEDIN_PATTERN = re.compile(
        r"(?:https?://)?(?:www\.)?linkedin\.com/[^\s]+",
        re.IGNORECASE,
    )

    DOB_PATTERN = re.compile(
        r"""
        (?:
            date\s+of\s+birth
            |
            dob
            |
            birthday
        )
        \s*[:\-]?\s*
        [^\n]+
        """,
        re.IGNORECASE | re.VERBOSE,
    )

    ID_PATTERN = re.compile(
        r"""
        (?:
            nic
            |
            national\s+id
            |
            national\s+identity
            |
            passport(?:\s+number)?
            |
            identity\s+number
            |
            id\s+number
        )
        \s*[:\-]?\s*
        [A-Za-z0-9\-]+
        """,
        re.IGNORECASE | re.VERBOSE,
    )

    ADDRESS_PATTERN = re.compile(
        r"""
        (?:
            residential\s+address
            |
            home\s+address
            |
            address
        )
        \s*[:\-]?\s*
        [^\n]+
        """,
        re.IGNORECASE | re.VERBOSE,
    )

    @classmethod
    def sanitize(cls, text: str) -> str:
        """Return resume text with common PII removed."""

        if not text:
            return ""

        sanitized = text

        sanitized = cls.EMAIL_PATTERN.sub(
            "[EMAIL]",
            sanitized,
        )

        sanitized = cls.LINKEDIN_PATTERN.sub(
            "[LINKEDIN_URL]",
            sanitized,
        )

        sanitized = cls.DOB_PATTERN.sub(
            "Date of Birth: [DATE_OF_BIRTH]",
            sanitized,
        )

        sanitized = cls.ID_PATTERN.sub(
            "[ID_NUMBER]",
            sanitized,
        )

        sanitized = cls.ADDRESS_PATTERN.sub(
            "Address: [ADDRESS]",
            sanitized,
        )

        sanitized = cls.PHONE_PATTERN.sub(
            "[PHONE]",
            sanitized,
        )

        sanitized = cls._sanitize_candidate_name(
            sanitized
        )

        return sanitized.strip()

    @staticmethod
    def _sanitize_candidate_name(text: str) -> str:
        """
        Replace a likely candidate name appearing near the
        beginning of the resume.
        """

        lines = text.splitlines()

        excluded_terms = {
            "software engineer",
            "software developer",
            "web developer",
            "data scientist",
            "data engineer",
            "data analyst",
            "project manager",
            "business analyst",
            "computer science",
            "curriculum vitae",
            "resume",
        }

        # Check only the beginning of the resume.
        for index, line in enumerate(lines[:8]):
            cleaned = line.strip()

            if not cleaned:
                continue

            # Ignore already-sanitized contact information.
            if any(
                placeholder in cleaned
                for placeholder in (
                    "[ADDRESS]",
                    "[EMAIL]",
                    "[PHONE]",
                    "[LINKEDIN_URL]",
                    "[DATE_OF_BIRTH]",
                    "[ID_NUMBER]",
                )
            ):
                continue

            words = cleaned.split()

            # Candidate names are normally around 2-4 words.
            if not 2 <= len(words) <= 4:
                continue

            # A name should mostly consist of alphabetic words.
            if not all(
                word.replace("-", "")
                .replace("'", "")
                .replace(".", "")
                .isalpha()
                for word in words
            ):
                continue

            # Avoid removing common resume headings/job titles.
            if cleaned.casefold() in excluded_terms:
                continue

            # Resume headings written in uppercase should not
            # automatically be considered names.
            resume_headings = {
                "education",
                "skills",
                "work experience",
                "professional experience",
                "special achievements",
                "projects",
                "certifications",
                "summary",
                "profile",
                "objective",
            }

            if cleaned.casefold() in resume_headings:
                continue

            lines[index] = "[CANDIDATE_NAME]"
            break

        return "\n".join(lines)