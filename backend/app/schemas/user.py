from typing import Optional
from pydantic import BaseModel

class AuthenticatedUser(BaseModel):
    """
    Represents an authenticated user with their details.
    """

    id: str
    email: str
    full_name: Optional[str] = None