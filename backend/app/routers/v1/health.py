from fastapi import APIRouter

from app.core.config import settings
from app.database.client import supabase
from app.utils.helpers import success_response

router = APIRouter(
    prefix = "/health",
    tags = ["Health"],
)

@router.get("/")
async def health_check():
    return success_response(
        message="Health check passed.",
        data={
            "status": "healthy",
            "application": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "debug": settings.DEBUG,
        }
    )


@router.get("/supabase")
async def supabase_health_check():
    return success_response(
        message="Supabase health check passed.",
        data={
            "connected": supabase is not None,
        }
    )


