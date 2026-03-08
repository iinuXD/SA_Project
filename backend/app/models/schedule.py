from sqlalchemy import Column, String, DateTime, ForeignKey, Time
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class ClassSchedule(Base):
    __tablename__ = "class_schedules"

    scheduleId = Column(String, primary_key=True, index=True)
    userId = Column(String, ForeignKey("users.userId", ondelete="CASCADE"), nullable=False)
    semester = Column(String, nullable=True)
    academicYear = Column(String, nullable=True)
    lastUpdated = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="schedules")
    sessions = relationship("ClassSession", back_populates="schedule", cascade="all, delete-orphan")


class ClassSession(Base):
    __tablename__ = "class_sessions"

    subjectId = Column(String, primary_key=True, index=True)
    scheduleId = Column(String, ForeignKey("class_schedules.scheduleId", ondelete="CASCADE"), nullable=False)
    subjectName = Column(String, nullable=False)
    startTime = Column(String, nullable=False)   # "HH:MM"
    endTime = Column(String, nullable=False)     # "HH:MM"
    dayOfWeek = Column(String, nullable=False)   # "MO","TU","WE","TH","FR","SA","SU"
    roomId = Column(String, ForeignKey("rooms.roomId", ondelete="SET NULL"), nullable=True)
    roomOverride = Column(String, nullable=True)  # manual override room name (make-up/moved)

    schedule = relationship("ClassSchedule", back_populates="sessions")
    room = relationship("Room", back_populates="class_sessions")
