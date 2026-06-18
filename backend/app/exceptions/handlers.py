from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.core.logging import logger
from app.exceptions.custom_exceptions import InterviewIQException


async def interview_iq_exception_handler(
        request: Request,
        exc: InterviewIQException,
):
    logger.error(f"{exc.error_code}: {exc.message}")

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.message,
            "error": {
                "code": exc.error_code,
            },
        },
    )


def register_exception_handlers(app: FastAPI):
    app.add_exception_handler(
        InterviewIQException,
        interview_iq_exception_handler,
    )
    