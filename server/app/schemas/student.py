from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SubjectAttendance(BaseModel):
    subject_id: int
    subject_name: str
    attended: int
    total: int
    percentage: float
    safe_to_bunk: int


class AttendanceResponse(BaseModel):
    overall_percentage: float
    subjects: list[SubjectAttendance]


class AssignmentOut(BaseModel):
    id: int
    title: str
    subject_name: str
    deadline: Optional[str] = None

    class Config:
        from_attributes = True


class LabSheetOut(BaseModel):
    id: int
    title: str
    subject_name: str
    deadline: Optional[str] = None

    class Config:
        from_attributes = True


class AlertOut(BaseModel):
    type: str  # "attendance" or "deadline"
    message: str


class DashboardResponse(BaseModel):
    attendance: float
    safe_to_bunk: int
    subjects: list[SubjectAttendance]
    assignments: list[AssignmentOut]
    labsheets: list[LabSheetOut]
    alerts: list[AlertOut]
