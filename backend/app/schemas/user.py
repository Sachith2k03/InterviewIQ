from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr

class AuthenticatedUser(BaseModel):
    """
    Represents an authenticated user with their details.
    """

    id: str
    email: str
    full_name: Optional[str] = None



class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: EmailStr
    full_name: str | None = None
    avatar_url: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


