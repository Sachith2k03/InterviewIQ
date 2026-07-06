from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.logging import logger
from app.routers.v1 import api_router
from app.routers.v1.auth import router as auth_router
from app.routers.v1.upload import router as upload_router
from app.routers.v1.interview import router as interview_router
from app.core.constants import API_V1_PREFIX
from app.exceptions.handlers import register_exception_handlers



@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("InterviewIQ API started")
    yield
    logger.info("InterviewIQ API stopped")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

register_exception_handlers(app)

@app.get("/", tags=["Root"])
async def root():
    logger.info("Root endpoint accessed")

    return {
        "message": "Welcome to InterviewIQ API",
        "version": settings.APP_VERSION,
    }

app.include_router(auth_router)
app.include_router(upload_router)
app.include_router(interview_router)

app.include_router(
    api_router,
    prefix=API_V1_PREFIX,
)

