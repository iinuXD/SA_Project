from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models.user import UserRole


# ── Auth ──────────────────────────────────────────────────────────────────────
class GoogleTokenRequest(BaseModel):
    credential: str  # Google ID token from frontend


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


# ── User ──────────────────────────────────────────────────────────────────────
class UserOut(BaseModel):
    userId: str
    kkuMail: str
    name: str
    role: UserRole

    model_config = {"from_attributes": True}


class SystemSettingOut(BaseModel):
    settingId: str
    userId: str
    languageCode: str

    model_config = {"from_attributes": True}


class SystemSettingUpdate(BaseModel):
    languageCode: str


# ── Building ──────────────────────────────────────────────────────────────────
class BuildingBase(BaseModel):
    buildName: str
    buildDesc: Optional[str] = None
    buildLocation: Optional[str] = None  # Google Place ID


class BuildingCreate(BuildingBase):
    pass


class BuildingUpdate(BuildingBase):
    buildName: Optional[str] = None


class BuildingOut(BuildingBase):
    buildId: str

    model_config = {"from_attributes": True}


class BuildingDetail(BuildingOut):
    rooms: List["RoomOut"] = []
    images: List["ImageOut"] = []


# ── Room ──────────────────────────────────────────────────────────────────────
class RoomBase(BaseModel):
    roomName: str
    roomDesc: Optional[str] = None
    buildId: str


class RoomCreate(RoomBase):
    pass


class RoomUpdate(BaseModel):
    roomName: Optional[str] = None
    roomDesc: Optional[str] = None
    buildId: Optional[str] = None


class RoomOut(BaseModel):
    roomId: str
    roomName: str
    roomDesc: Optional[str] = None
    buildId: str

    model_config = {"from_attributes": True}


class RoomDetail(RoomOut):
    building: Optional[BuildingOut] = None
    images: List["ImageOut"] = []


# ── Image ─────────────────────────────────────────────────────────────────────
class ImageCreate(BaseModel):
    imageUrl: str
    imageDesc: Optional[str] = None
    buildId: Optional[str] = None
    roomId: Optional[str] = None


class ImageOut(BaseModel):
    imageId: str
    imageUrl: str
    imageDesc: Optional[str] = None
    imageUploadDate: datetime
    buildId: Optional[str] = None
    roomId: Optional[str] = None

    model_config = {"from_attributes": True}


# ── Schedule ──────────────────────────────────────────────────────────────────
class ClassSessionOut(BaseModel):
    subjectId: str
    scheduleId: str
    subjectName: str
    startTime: str
    endTime: str
    dayOfWeek: str
    roomId: Optional[str] = None
    roomOverride: Optional[str] = None
    room: Optional[RoomOut] = None

    model_config = {"from_attributes": True}


class ClassSessionUpdate(BaseModel):
    roomId: Optional[str] = None
    roomOverride: Optional[str] = None
    subjectName: Optional[str] = None
    startTime: Optional[str] = None
    endTime: Optional[str] = None


class ClassScheduleOut(BaseModel):
    scheduleId: str
    userId: str
    semester: Optional[str] = None
    academicYear: Optional[str] = None
    lastUpdated: datetime
    sessions: List[ClassSessionOut] = []

    model_config = {"from_attributes": True}


# ── Search History ────────────────────────────────────────────────────────────
class SearchHistoryOut(BaseModel):
    historyId: str
    userId: str
    searchKeyword: str
    searchTime: datetime

    model_config = {"from_attributes": True}


# ── Notification ──────────────────────────────────────────────────────────────
class NotificationSettingOut(BaseModel):
    settingId: str
    userId: str
    isClassAlertEnabled: bool
    minutesBeforeAlert: int

    model_config = {"from_attributes": True}


class NotificationSettingUpdate(BaseModel):
    isClassAlertEnabled: Optional[bool] = None
    minutesBeforeAlert: Optional[int] = None


# ── Search ────────────────────────────────────────────────────────────────────
class SearchResult(BaseModel):
    buildings: List[BuildingOut] = []
    rooms: List[RoomOut] = []


# Update forward refs
BuildingDetail.model_rebuild()
RoomDetail.model_rebuild()
TokenResponse.model_rebuild()
