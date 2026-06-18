from fastapi import APIRouter

from app.core.config import settings
from app.database.client import supabase

#temp
from app.exceptions.custom_exceptions import NotFoundException

router = APIRouter(
    prefix = "/health",
    tags = ["Health"],
)

@router.get("/")
async def health_check():
    return {
        "status": "healthy",
        "application": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "debug": settings.DEBUG,
    }

@router.get("/supabase")
async def supabase_health_check():
    return {
        "connected": supabase is not None,
    }

#temp
@router.get("/error")
async def error_check():
    raise NotFoundException("This is a test exception")
