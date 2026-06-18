#Custom exception for InterviewIQ.


class InterviewIQException(Exception):
    """Base exception for the application."""

    def __init__(
        self,
        message: str,
        status_code: int = 400,
        error_code: str = "APPLICATION_ERROR",
    ):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        super().__init__(message)


class NotFoundException(InterviewIQException):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(
            message=message,
            status_code=404,
            error_code="NOT_FOUND",
        )


class UnauthorizedException(InterviewIQException):
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(
            message=message,
            status_code=401,
            error_code="UNAUTHORIZED",
        )


class ForbiddenException(InterviewIQException):
    def __init__(self, message: str = "Forbidden"):
        super().__init__(
            message=message,
            status_code=403,
            error_code="FORBIDDEN",
        )


class ValidationException(InterviewIQException):
    def __init__(self, message: str = "Validation error"):
        super().__init__(
            message=message,
            status_code=422,
            error_code="VALIDATION_ERROR",
        )


class DatabaseException(InterviewIQException):
    def __init__(self, message: str = "Database operation failed"):
        super().__init__(
            message=message,
            status_code=500,
            error_code="DATABASE_ERROR",
        )


class AIServiceException(InterviewIQException):
    def __init__(self, message: str = "AI service failed"):
        super().__init__(
            message=message,
            status_code=500,
            error_code="AI_SERVICE_ERROR",
        )


class StorageException(InterviewIQException):
    def __init__(self, message: str = "Storage operation failed"):
        super().__init__(
            message=message,
            status_code=500,
            error_code="STORAGE_ERROR",
        )