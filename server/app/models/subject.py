from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.base import Base


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    section = Column(String, default="MCA")

    # Relationships
    attendances = relationship("Attendance", back_populates="subject")
    assignments = relationship("Assignment", back_populates="subject")
    lab_sheets = relationship("LabSheet", back_populates="subject")
