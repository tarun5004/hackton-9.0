from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class LabSheet(Base):
    __tablename__ = "lab_sheets"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    title = Column(String, nullable=False)
    deadline = Column(DateTime, nullable=False)

    # Relationships
    subject = relationship("Subject", back_populates="lab_sheets")
