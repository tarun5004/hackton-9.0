from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# --- Attendance ---

class AttendanceRecord(BaseModel):
    student_id: int
    attended: int
    total: int


class BulkAttendanceRequest(BaseModel):
    subject_id: int
    records: list[AttendanceRecord]


class BulkAttendanceResponse(BaseModel):
    updated: int


class CSVUploadError(BaseModel):
    row: int
    error: str


class CSVUploadResponse(BaseModel):
    imported: int
    errors: list[CSVUploadError]


# --- Students ---

class StudentOut(BaseModel):
    id: int
    name: str
    email: str
    section: str | None = None

    class Config:
        from_attributes = True


# --- Subjects ---

class SubjectOut(BaseModel):
    id: int
    name: str
    section: str | None = None

    class Config:
        from_attributes = True


# --- Assignment ---

class AssignmentCreate(BaseModel):
    subject_id: int
    title: str
    deadline: datetime


class AssignmentResponse(BaseModel):
    id: int
    title: str
    subject_name: str
    deadline: Optional[str] = None

    class Config:
        from_attributes = True


# --- LabSheet ---

class LabSheetCreate(BaseModel):
    subject_id: int
    title: str
    deadline: datetime


class LabSheetResponse(BaseModel):
    id: int
    title: str
    subject_name: str
    deadline: Optional[str] = None

    class Config:
        from_attributes = True
