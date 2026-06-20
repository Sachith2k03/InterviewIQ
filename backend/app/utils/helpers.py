from typing import Any


def success_response(
    message: str,
    data: Any = None,
):
    """
    Standard API success response.
    """

    return {
        "success": True,
        "message": message,
        "data": data,
    }


def created_response(
    message: str,
    data: Any = None,
):
    """
    Standard API response for newly created resources.
    """

    return {
        "success": True,
        "message": message,
        "data": data,
    }