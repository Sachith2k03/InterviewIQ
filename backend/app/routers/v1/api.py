from fastapi import APIRouter

from app.routers.v1.health import router as health_router
from app.routers.v1.auth import router as auth_router
from app.routers.v1.upload import router as upload_router
from app.routers.v1.interview import router as interview_router
from app.routers.v1.profile import router as profile_router
from app.routers.v1.dashboard import router as dashboard_router
from app.routers.v1.resume import router as resume_router
from app.routers.v1.response import router as response_router
from app.routers.v1.report import router as report_router
from app.routers.v1.analytics import router as analytics_router
from app.routers.v1.notification import router as notification_router

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(upload_router)   
api_router.include_router(interview_router)
api_router.include_router(profile_router)
api_router.include_router(dashboard_router)
api_router.include_router(resume_router)
api_router.include_router(response_router)
api_router.include_router(report_router)
api_router.include_router(analytics_router)
api_router.include_router(notification_router)
