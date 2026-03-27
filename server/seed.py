"""
Seed script — populates the database with demo data for hackathon demo.

Run:  python seed.py
"""

from datetime import datetime, timedelta

from app.db.base import engine, SessionLocal, Base
from app.models import User, Subject, Attendance, Assignment, LabSheet


def seed():
    # Create all tables (fallback if Alembic hasn't run)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Skip if already seeded
        if db.query(User).first():
            print("Database already seeded. Skipping.")
            return

        # --- Teachers ---
        t1 = User(name="Dr. Sharma", email="sharma@mca.edu", role="teacher", section="MCA")
        t2 = User(name="Prof. Gupta", email="gupta@mca.edu", role="teacher", section="MCA")
        db.add_all([t1, t2])
        db.flush()

        # --- Students ---
        students = []
        for i in range(1, 11):
            s = User(
                name=f"Student {i:02d}",
                email=f"21mca{i:03d}@mca.edu",
                role="student",
                section="MCA",
            )
            students.append(s)
        db.add_all(students)
        db.flush()

        # --- Subjects ---
        sub_python = Subject(name="Python", section="MCA")
        sub_dbms = Subject(name="DBMS", section="MCA")
        sub_ds = Subject(name="Data Structures", section="MCA")
        sub_web = Subject(name="Web Development", section="MCA")
        db.add_all([sub_python, sub_dbms, sub_ds, sub_web])
        db.flush()

        subjects = [sub_python, sub_dbms, sub_ds, sub_web]

        # --- Attendance (each student × each subject) ---
        import random
        random.seed(42)

        for student in students:
            for subject in subjects:
                total = random.randint(25, 40)
                attended = random.randint(int(total * 0.6), total)
                db.add(Attendance(
                    student_id=student.id,
                    subject_id=subject.id,
                    attended=attended,
                    total=total,
                ))

        # --- Assignments ---
        now = datetime.utcnow()
        assignments = [
            Assignment(subject_id=sub_python.id, title="Python List Comprehension Exercise", deadline=now + timedelta(days=2)),
            Assignment(subject_id=sub_python.id, title="OOP Mini Project", deadline=now + timedelta(days=10)),
            Assignment(subject_id=sub_dbms.id, title="ER Diagram Design", deadline=now + timedelta(days=1)),
            Assignment(subject_id=sub_dbms.id, title="SQL Query Optimization", deadline=now + timedelta(days=7)),
            Assignment(subject_id=sub_ds.id, title="Binary Tree Implementation", deadline=now + timedelta(days=5)),
            Assignment(subject_id=sub_web.id, title="React Todo App", deadline=now + timedelta(days=3)),
        ]
        db.add_all(assignments)

        # --- Lab Sheets ---
        lab_sheets = [
            LabSheet(subject_id=sub_python.id, title="Lab 1: File Handling", deadline=now + timedelta(days=4)),
            LabSheet(subject_id=sub_dbms.id, title="Lab 1: SQL Joins", deadline=now + timedelta(days=2)),
            LabSheet(subject_id=sub_ds.id, title="Lab 1: Linked List Operations", deadline=now + timedelta(days=6)),
            LabSheet(subject_id=sub_web.id, title="Lab 1: REST API with Express", deadline=now + timedelta(days=8)),
        ]
        db.add_all(lab_sheets)

        db.commit()
        print("✅ Database seeded successfully!")
        print(f"   → 2 teachers, 10 students, 4 subjects")
        print(f"   → 40 attendance records, 6 assignments, 4 lab sheets")

    except Exception as e:
        db.rollback()
        print(f"❌ Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
