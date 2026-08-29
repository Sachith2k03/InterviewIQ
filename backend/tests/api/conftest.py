from types import SimpleNamespace
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from app.dependencies import get_current_user
from app.main import app


@pytest.fixture
def user_id() -> str:
    return str(uuid4())


@pytest.fixture
def authenticated_user(user_id: str):
    return SimpleNamespace(
        id=user_id,
    )


@pytest.fixture
def client(authenticated_user):
    async def override_get_current_user():
        return authenticated_user

    app.dependency_overrides[
        get_current_user
    ] = override_get_current_user

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def unauthenticated_client():
    app.dependency_overrides.clear()

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()