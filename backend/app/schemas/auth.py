from pydantic import BaseModel

class UserResponse(BaseModel):
    id: str
    email: str


class AuthResponse(BaseModel):
    success: bool
    message: str
    data: UserResponse