from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Integer
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class SearchHistory(Base):
    __tablename__ = "search_histories"

    historyId = Column(String, primary_key=True, index=True)
    userId = Column(String, ForeignKey("users.userId", ondelete="CASCADE"), nullable=False)
    searchKeyword = Column(String, nullable=False)
    searchTime = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="search_histories")


class NotificationSetting(Base):
    __tablename__ = "notification_settings"

    settingId = Column(String, primary_key=True, index=True)
    userId = Column(String, ForeignKey("users.userId", ondelete="CASCADE"), unique=True, nullable=False)
    isClassAlertEnabled = Column(Boolean, default=True, nullable=False)
    minutesBeforeAlert = Column(Integer, default=15, nullable=False)

    user = relationship("User", back_populates="notification_setting")
