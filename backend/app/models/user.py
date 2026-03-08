from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class UserRole(str, enum.Enum):
    student = "student"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    userId = Column(String, primary_key=True, index=True)
    kkuMail = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.student, nullable=False)

    # Relationships
    system_setting = relationship("SystemSetting", back_populates="user", uselist=False, cascade="all, delete-orphan")
    search_histories = relationship("SearchHistory", back_populates="user", cascade="all, delete-orphan")
    notification_setting = relationship("NotificationSetting", back_populates="user", uselist=False, cascade="all, delete-orphan")
    schedules = relationship("ClassSchedule", back_populates="user", cascade="all, delete-orphan")


class SystemSetting(Base):
    __tablename__ = "system_settings"

    settingId = Column(String, primary_key=True, index=True)
    userId = Column(String, ForeignKey("users.userId", ondelete="CASCADE"), unique=True, nullable=False)
    languageCode = Column(String, default="th", nullable=False)

    user = relationship("User", back_populates="system_setting")
