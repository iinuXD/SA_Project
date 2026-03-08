from sqlalchemy import Column, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class Building(Base):
    __tablename__ = "buildings"

    buildId = Column(String, primary_key=True, index=True)
    buildName = Column(String, nullable=False, index=True)
    buildDesc = Column(Text, nullable=True)
    buildLocation = Column(String, nullable=True)  # Google Place ID

    rooms = relationship("Room", back_populates="building", cascade="all, delete-orphan")
    images = relationship("Image", back_populates="building", cascade="all, delete-orphan")


class Room(Base):
    __tablename__ = "rooms"

    roomId = Column(String, primary_key=True, index=True)
    roomName = Column(String, nullable=False, index=True)
    roomDesc = Column(Text, nullable=True)
    buildId = Column(String, ForeignKey("buildings.buildId", ondelete="CASCADE"), nullable=False)

    building = relationship("Building", back_populates="rooms")
    images = relationship("Image", back_populates="room", cascade="all, delete-orphan")
    class_sessions = relationship("ClassSession", back_populates="room")


class Image(Base):
    __tablename__ = "images"

    imageId = Column(String, primary_key=True, index=True)
    imageUrl = Column(String, nullable=False)
    imageDesc = Column(Text, nullable=True)
    imageUploadDate = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    buildId = Column(String, ForeignKey("buildings.buildId", ondelete="CASCADE"), nullable=True)
    roomId = Column(String, ForeignKey("rooms.roomId", ondelete="CASCADE"), nullable=True)

    building = relationship("Building", back_populates="images")
    room = relationship("Room", back_populates="images")
