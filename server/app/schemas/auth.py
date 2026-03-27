from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    section: str | None = None

    class Config:
        from_attributes = True
