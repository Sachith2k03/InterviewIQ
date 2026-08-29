from unittest.mock import MagicMock, patch
from uuid import uuid4

import pytest

from app.core.constants import (
    AUDIO_BUCKET,
    REPORT_BUCKET,
    RESUME_BUCKET,
)
from app.exceptions.custom_exceptions import (
    DatabaseException,
)
from app.services.account_service import AccountService


def test_delete_storage_files_does_nothing_for_empty_paths() -> None:
    with patch(
        "app.services.account_service.supabase",
    ) as supabase_mock:
        AccountService._delete_storage_files(
            bucket=RESUME_BUCKET,
            paths=[],
        )

    supabase_mock.storage.from_.assert_not_called()


def test_delete_storage_files_removes_given_paths() -> None:
    storage_bucket = MagicMock()

    with patch(
        "app.services.account_service.supabase",
    ) as supabase_mock:
        supabase_mock.storage.from_.return_value = storage_bucket

        AccountService._delete_storage_files(
            bucket=RESUME_BUCKET,
            paths=[
                "user/resume1.pdf",
                "user/resume2.pdf",
            ],
        )

    supabase_mock.storage.from_.assert_called_once_with(
        RESUME_BUCKET,
    )

    storage_bucket.remove.assert_called_once_with(
        [
            "user/resume1.pdf",
            "user/resume2.pdf",
        ],
    )


def test_delete_storage_files_wraps_storage_failure() -> None:
    storage_bucket = MagicMock()

    storage_bucket.remove.side_effect = RuntimeError(
        "Storage unavailable",
    )

    with patch(
        "app.services.account_service.supabase",
    ) as supabase_mock:
        supabase_mock.storage.from_.return_value = storage_bucket

        with pytest.raises(
            DatabaseException,
            match="Failed to remove user files.",
        ):
            AccountService._delete_storage_files(
                bucket=AUDIO_BUCKET,
                paths=["user/audio.webm"],
            )


def test_delete_account_cleans_all_storage_before_auth_user() -> None:
    user_id = str(uuid4())

    storage_paths = {
        "resume_paths": [
            f"{user_id}/resume.pdf",
        ],
        "audio_paths": [
            f"{user_id}/interview/q1.webm",
            f"{user_id}/interview/q2.webm",
        ],
        "report_paths": [
            f"{user_id}/report.pdf",
        ],
    }

    with (
        patch(
            "app.services.account_service.get_account_storage_paths",
            return_value=storage_paths,
        ) as paths_mock,
        patch.object(
            AccountService,
            "_delete_storage_files",
        ) as storage_delete_mock,
        patch(
            "app.services.account_service.AvatarStorageService.delete_avatar",
        ) as avatar_mock,
        patch(
            "app.services.account_service.delete_auth_user",
        ) as auth_delete_mock,
    ):
        AccountService.delete_account(
            user_id,
        )

    paths_mock.assert_called_once_with(
        user_id,
    )

    assert storage_delete_mock.call_count == 3

    storage_delete_mock.assert_any_call(
        bucket=RESUME_BUCKET,
        paths=storage_paths["resume_paths"],
    )

    storage_delete_mock.assert_any_call(
        bucket=AUDIO_BUCKET,
        paths=storage_paths["audio_paths"],
    )

    storage_delete_mock.assert_any_call(
        bucket=REPORT_BUCKET,
        paths=storage_paths["report_paths"],
    )

    avatar_mock.assert_called_once_with(
        user_id=user_id,
    )

    auth_delete_mock.assert_called_once_with(
        user_id,
    )


def test_delete_account_handles_user_with_no_storage_files() -> None:
    user_id = str(uuid4())

    storage_paths = {
        "resume_paths": [],
        "audio_paths": [],
        "report_paths": [],
    }

    with (
        patch(
            "app.services.account_service.get_account_storage_paths",
            return_value=storage_paths,
        ),
        patch.object(
            AccountService,
            "_delete_storage_files",
        ) as storage_delete_mock,
        patch(
            "app.services.account_service.AvatarStorageService.delete_avatar",
        ) as avatar_mock,
        patch(
            "app.services.account_service.delete_auth_user",
        ) as auth_delete_mock,
    ):
        AccountService.delete_account(
            user_id,
        )

    assert storage_delete_mock.call_count == 3

    avatar_mock.assert_called_once_with(
        user_id=user_id,
    )

    auth_delete_mock.assert_called_once_with(
        user_id,
    )


def test_delete_account_does_not_delete_auth_when_storage_cleanup_fails() -> None:
    user_id = str(uuid4())

    storage_paths = {
        "resume_paths": [
            f"{user_id}/resume.pdf",
        ],
        "audio_paths": [],
        "report_paths": [],
    }

    with (
        patch(
            "app.services.account_service.get_account_storage_paths",
            return_value=storage_paths,
        ),
        patch.object(
            AccountService,
            "_delete_storage_files",
            side_effect=DatabaseException(
                "Failed to remove user files.",
            ),
        ),
        patch(
            "app.services.account_service.AvatarStorageService.delete_avatar",
        ) as avatar_mock,
        patch(
            "app.services.account_service.delete_auth_user",
        ) as auth_delete_mock,
    ):
        with pytest.raises(
            DatabaseException,
            match="Failed to remove user files.",
        ):
            AccountService.delete_account(
                user_id,
            )

    avatar_mock.assert_not_called()
    auth_delete_mock.assert_not_called()


def test_delete_account_does_not_delete_auth_when_avatar_cleanup_fails() -> None:
    user_id = str(uuid4())

    storage_paths = {
        "resume_paths": [],
        "audio_paths": [],
        "report_paths": [],
    }

    with (
        patch(
            "app.services.account_service.get_account_storage_paths",
            return_value=storage_paths,
        ),
        patch.object(
            AccountService,
            "_delete_storage_files",
        ),
        patch(
            "app.services.account_service.AvatarStorageService.delete_avatar",
            side_effect=DatabaseException(
                "Avatar deletion failed.",
            ),
        ),
        patch(
            "app.services.account_service.delete_auth_user",
        ) as auth_delete_mock,
    ):
        with pytest.raises(
            DatabaseException,
        ):
            AccountService.delete_account(
                user_id,
            )

    auth_delete_mock.assert_not_called()