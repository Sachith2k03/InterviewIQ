from typing import Any

def success_response(
    message:str,
    data: Any = None,
) -> dict:
    
    """Create a standardized successful API response."""

    return {
        "success": True,
        "message": message,
        "data": data
    }


def error_response(
        message: str,
        error_code: str,
) -> dict:
    
    """Create a standardized error API response."""

    return {
        "success": False,
        "message": message,
        "error": {
            "code": error_code
        }
    }