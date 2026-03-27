from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.student import AttendanceResponse, DashboardResponse
from app.services.student_service import get_student_attendance, get_student_dashboard

router = APIRouter(prefix="/student", tags=["Student"])


@router.get("/attendance/{student_id}", response_model=AttendanceResponse)
def attendance(student_id: int, db: Session = Depends(get_db)):
    """Per-subject attendance with safe-to-bunk for a student."""
    return get_student_attendance(student_id, db)


@router.get("/dashboard/{student_id}", response_model=DashboardResponse)
def dashboard(student_id: int, db: Session = Depends(get_db)):
    """Full student dashboard: attendance, assignments, lab sheets, alerts."""
    return get_student_dashboard(student_id, db)
