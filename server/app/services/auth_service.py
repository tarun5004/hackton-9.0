from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.user import User


def login_user(email: str, db: Session) -> User:
    """Look up user by email. No password check — hackathon MVP."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
