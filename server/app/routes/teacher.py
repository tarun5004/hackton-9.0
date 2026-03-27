from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.teacher import (
    BulkAttendanceRequest,
    BulkAttendanceResponse,
    CSVUploadResponse,
    StudentOut,
    AssignmentCreate,
    AssignmentResponse,
    LabSheetCreate,
    LabSheetResponse,
)
from app.services.teacher_service import (
    get_all_students,
    update_attendance_bulk,
    upload_csv,
    create_assignment,
    create_labsheet,
)

router = APIRouter(prefix="/teacher", tags=["Teacher"])


@router.get("/students", response_model=list[StudentOut])
def students(db: Session = Depends(get_db)):
    """List all students in MCA section."""
    return get_all_students(db)


@router.post("/attendance/bulk", response_model=BulkAttendanceResponse)
def attendance_bulk(body: BulkAttendanceRequest, db: Session = Depends(get_db)):
    """Bulk upsert attendance for a subject."""
    count = update_attendance_bulk(body.subject_id, body.records, db)
    return {"updated": count}


@router.post("/upload-csv", response_model=CSVUploadResponse)
async def csv_upload(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload CSV with columns: email, subject_name, attended, total."""
    result = await upload_csv(file, db)
    return result


@router.post("/assignment", response_model=AssignmentResponse)
def add_assignment(body: AssignmentCreate, db: Session = Depends(get_db)):
    """Create a new assignment."""
    return create_assignment(body.subject_id, body.title, body.deadline, db)


@router.post("/labsheet", response_model=LabSheetResponse)
def add_labsheet(body: LabSheetCreate, db: Session = Depends(get_db)):
    """Create a new lab sheet."""
    return create_labsheet(body.subject_id, body.title, body.deadline, db)
