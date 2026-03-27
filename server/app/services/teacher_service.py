import csv
import io
from typing import List

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session, joinedload

from app.models.user import User
from app.models.subject import Subject
from app.models.attendance import Attendance
from app.models.assignment import Assignment
from app.models.lab_sheet import LabSheet
from app.schemas.teacher import AttendanceRecord


# ---------------------------------------------------------------------------
# Students
# ---------------------------------------------------------------------------

def get_all_students(db: Session) -> List[User]:
    """Return all users with role='student'."""
    return db.query(User).filter(User.role == "student").all()


# ---------------------------------------------------------------------------
# Subjects
# ---------------------------------------------------------------------------

def get_all_subjects(db: Session) -> List[Subject]:
    """Return all subjects."""
    return db.query(Subject).all()


# ---------------------------------------------------------------------------
# Attendance — Bulk
# ---------------------------------------------------------------------------

def update_attendance_bulk(
    subject_id: int,
    records: List[AttendanceRecord],
    db: Session,
) -> int:
    """Upsert attendance rows: UPDATE if exists, INSERT if new."""
    # Verify subject exists
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    updated = 0
    for rec in records:
        existing = (
            db.query(Attendance)
            .filter(
                Attendance.student_id == rec.student_id,
                Attendance.subject_id == subject_id,
            )
            .first()
        )
        if existing:
            existing.attended = rec.attended
            existing.total = rec.total
        else:
            db.add(Attendance(
                student_id=rec.student_id,
                subject_id=subject_id,
                attended=rec.attended,
                total=rec.total,
            ))
            db.flush()
        updated += 1

    db.commit()
    return updated


# ---------------------------------------------------------------------------
# Attendance — CSV Upload
# ---------------------------------------------------------------------------

async def upload_csv(file: UploadFile, db: Session) -> dict:
    """
    Parse CSV and upsert attendance rows.
    Expected CSV columns: email, subject_name, attended, total
    """
    content = await file.read()
    try:
        text = content.decode("utf-8")
        reader = list(csv.DictReader(io.StringIO(text)))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid CSV file format")

    imported = 0
    errors = []

    for row_num, row in enumerate(reader, start=2):  # row 1 is header
        try:
            email = row["email"].strip()
            subject_name = row["subject_name"].strip()
            attended = int(row["attended"].strip())
            total = int(row["total"].strip())
        except (KeyError, ValueError) as e:
            errors.append({"row": row_num, "error": f"Invalid data: {str(e)}"})
            continue

        # Look up user
        user = db.query(User).filter(User.email == email, User.role == "student").first()
        if not user:
            errors.append({"row": row_num, "error": f"User not found: {email}"})
            continue

        # Look up subject
        subject = db.query(Subject).filter(Subject.name == subject_name).first()
        if not subject:
            errors.append({"row": row_num, "error": f"Subject not found: {subject_name}"})
            continue

        # Upsert
        existing = (
            db.query(Attendance)
            .filter(
                Attendance.student_id == user.id,
                Attendance.subject_id == subject.id,
            )
            .first()
        )
        if existing:
            existing.attended = attended
            existing.total = total
        else:
            db.add(Attendance(
                student_id=user.id,
                subject_id=subject.id,
                attended=attended,
                total=total,
            ))
            db.flush()
        imported += 1

    db.commit()
    return {"imported": imported, "errors": errors}


# ---------------------------------------------------------------------------
# Assignments
# ---------------------------------------------------------------------------

def create_assignment(subject_id: int, title: str, deadline, db: Session) -> dict:
    """Create a new assignment."""
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    assignment = Assignment(subject_id=subject_id, title=title, deadline=deadline)
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return {
        "id": assignment.id,
        "title": assignment.title,
        "subject_name": subject.name,
        "deadline": assignment.deadline.isoformat() if assignment.deadline else None,
    }


# ---------------------------------------------------------------------------
# Lab Sheets
# ---------------------------------------------------------------------------

def create_labsheet(subject_id: int, title: str, deadline, db: Session) -> dict:
    """Create a new lab sheet."""
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    lab_sheet = LabSheet(subject_id=subject_id, title=title, deadline=deadline)
    db.add(lab_sheet)
    db.commit()
    db.refresh(lab_sheet)
    return {
        "id": lab_sheet.id,
        "title": lab_sheet.title,
        "subject_name": subject.name,
        "deadline": lab_sheet.deadline.isoformat() if lab_sheet.deadline else None,
    }
