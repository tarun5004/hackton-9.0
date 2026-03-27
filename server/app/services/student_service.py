import math
from datetime import datetime, timedelta

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.attendance import Attendance
from app.models.assignment import Assignment
from app.models.lab_sheet import LabSheet


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def calc_percentage(attended: int, total: int) -> float:
    """Return attendance percentage, 0 if total is 0."""
    if total == 0:
        return 0.0
    return round((attended / total) * 100, 1)


def calc_safe_to_bunk(attended: int, total: int) -> int:
    """How many more classes can be skipped while staying ≥ 75%."""
    if total == 0:
        return 0
    required = math.ceil(0.75 * total)
    return max(0, attended - required)


# ---------------------------------------------------------------------------
# Public functions
# ---------------------------------------------------------------------------

def get_student_attendance(student_id: int, db: Session):
    """Per-subject attendance with safe-to-bunk for a student."""
    # Verify student exists
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    records = (
        db.query(Attendance)
        .filter(Attendance.student_id == student_id)
        .all()
    )

    subjects = []
    total_attended = 0
    total_classes = 0

    for rec in records:
        pct = calc_percentage(rec.attended, rec.total)
        stb = calc_safe_to_bunk(rec.attended, rec.total)
        subjects.append({
            "subject_id": rec.subject_id,
            "subject_name": rec.subject.name,
            "attended": rec.attended,
            "total": rec.total,
            "percentage": pct,
            "safe_to_bunk": stb,
        })
        total_attended += rec.attended
        total_classes += rec.total

    overall = calc_percentage(total_attended, total_classes)

    return {"overall_percentage": overall, "subjects": subjects}


def get_student_dashboard(student_id: int, db: Session):
    """Full dashboard: attendance + assignments + labsheets + alerts."""
    # Attendance
    att_data = get_student_attendance(student_id, db)
    overall_pct = att_data["overall_percentage"]

    # Overall safe-to-bunk (sum across all subjects)
    total_attended = sum(s["attended"] for s in att_data["subjects"])
    total_classes = sum(s["total"] for s in att_data["subjects"])
    overall_stb = calc_safe_to_bunk(total_attended, total_classes)

    # Assignments — all assignments (student sees everything in their section)
    assignments_raw = db.query(Assignment).all()
    assignments = [
        {
            "id": a.id,
            "title": a.title,
            "subject_name": a.subject.name,
            "deadline": a.deadline,
        }
        for a in assignments_raw
    ]

    # Lab sheets
    labsheets_raw = db.query(LabSheet).all()
    labsheets = [
        {
            "id": ls.id,
            "title": ls.title,
            "subject_name": ls.subject.name,
            "deadline": ls.deadline,
        }
        for ls in labsheets_raw
    ]

    # Alerts
    alerts = []

    # 1. Attendance alerts — any subject < 75%
    for s in att_data["subjects"]:
        if s["percentage"] < 75:
            alerts.append({
                "type": "attendance",
                "message": f"Low attendance in {s['subject_name']}: {s['percentage']}%",
            })

    # 2. Deadline alerts — assignments/labsheets due within 3 days
    now = datetime.utcnow()
    threshold = now + timedelta(days=3)

    for a in assignments_raw:
        if now <= a.deadline <= threshold:
            days_left = (a.deadline - now).days
            alerts.append({
                "type": "deadline",
                "message": f"Assignment '{a.title}' due in {days_left} day(s)",
            })

    for ls in labsheets_raw:
        if now <= ls.deadline <= threshold:
            days_left = (ls.deadline - now).days
            alerts.append({
                "type": "deadline",
                "message": f"Lab sheet '{ls.title}' due in {days_left} day(s)",
            })

    return {
        "attendance": overall_pct,
        "safe_to_bunk": overall_stb,
        "assignments": assignments,
        "labsheets": labsheets,
        "alerts": alerts,
    }
