from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List
import uuid
from datetime import datetime, timezone

from app.models import (
    User, SystemSetting, Building, Room, Image,
    ClassSchedule, ClassSession, SearchHistory, NotificationSetting
)


# ── User Repository ───────────────────────────────────────────────────────────
class UserRepo:
    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.kkuMail == email).first()

    def get_by_id(self, db: Session, user_id: str) -> Optional[User]:
        return db.query(User).filter(User.userId == user_id).first()

    def create(self, db: Session, email: str, name: str, role: str = "student") -> User:
        user = User(userId=str(uuid.uuid4()), kkuMail=email, name=name, role=role)
        db.add(user)
        db.flush()
        # Create default system setting
        setting = SystemSetting(settingId=str(uuid.uuid4()), userId=user.userId, languageCode="th")
        db.add(setting)
        # Create default notification setting
        notif = NotificationSetting(settingId=str(uuid.uuid4()), userId=user.userId)
        db.add(notif)
        db.commit()
        db.refresh(user)
        return user

    def update_language(self, db: Session, user_id: str, lang: str) -> Optional[SystemSetting]:
        setting = db.query(SystemSetting).filter(SystemSetting.userId == user_id).first()
        if setting:
            setting.languageCode = lang
            db.commit()
            db.refresh(setting)
        return setting


# ── Building Repository ───────────────────────────────────────────────────────
class BuildingRepo:
    def get_all(self, db: Session) -> List[Building]:
        return db.query(Building).all()

    def get_by_id(self, db: Session, build_id: str) -> Optional[Building]:
        return db.query(Building).filter(Building.buildId == build_id).first()

    def search(self, db: Session, keyword: str) -> List[Building]:
        return db.query(Building).filter(
            or_(
                Building.buildName.ilike(f"%{keyword}%"),
                Building.buildDesc.ilike(f"%{keyword}%"),
            )
        ).all()

    def create(self, db: Session, data: dict) -> Building:
        b = Building(**data)
        db.add(b)
        db.commit()
        db.refresh(b)
        return b

    def update(self, db: Session, build_id: str, data: dict) -> Optional[Building]:
        b = self.get_by_id(db, build_id)
        if b:
            for k, v in data.items():
                setattr(b, k, v)
            db.commit()
            db.refresh(b)
        return b

    def delete(self, db: Session, build_id: str) -> bool:
        b = self.get_by_id(db, build_id)
        if b:
            db.delete(b)
            db.commit()
            return True
        return False


# ── Room Repository ───────────────────────────────────────────────────────────
class RoomRepo:
    def get_all(self, db: Session) -> List[Room]:
        return db.query(Room).all()

    def get_by_id(self, db: Session, room_id: str) -> Optional[Room]:
        return db.query(Room).filter(Room.roomId == room_id).first()

    def get_by_building(self, db: Session, build_id: str) -> List[Room]:
        return db.query(Room).filter(Room.buildId == build_id).all()

    def get_by_name(self, db: Session, room_name: str) -> Optional[Room]:
        return db.query(Room).filter(Room.roomName.ilike(room_name)).first()

    def search(self, db: Session, keyword: str) -> List[Room]:
        return db.query(Room).filter(
            or_(
                Room.roomName.ilike(f"%{keyword}%"),
                Room.roomDesc.ilike(f"%{keyword}%"),
            )
        ).all()

    def create(self, db: Session, data: dict) -> Room:
        r = Room(roomId=str(uuid.uuid4()), **data)
        db.add(r)
        db.commit()
        db.refresh(r)
        return r

    def update(self, db: Session, room_id: str, data: dict) -> Optional[Room]:
        r = self.get_by_id(db, room_id)
        if r:
            for k, v in data.items():
                setattr(r, k, v)
            db.commit()
            db.refresh(r)
        return r

    def delete(self, db: Session, room_id: str) -> bool:
        r = self.get_by_id(db, room_id)
        if r:
            db.delete(r)
            db.commit()
            return True
        return False


# ── Image Repository ──────────────────────────────────────────────────────────
class ImageRepo:
    def get_by_building(self, db: Session, build_id: str) -> List[Image]:
        return db.query(Image).filter(Image.buildId == build_id).all()

    def get_by_room(self, db: Session, room_id: str) -> List[Image]:
        return db.query(Image).filter(Image.roomId == room_id).all()

    def get_by_id(self, db: Session, image_id: str) -> Optional[Image]:
        return db.query(Image).filter(Image.imageId == image_id).first()

    def create(self, db: Session, data: dict) -> Image:
        img = Image(imageId=str(uuid.uuid4()), **data)
        db.add(img)
        db.commit()
        db.refresh(img)
        return img

    def update(self, db: Session, image_id: str, data: dict) -> Optional[Image]:
        img = self.get_by_id(db, image_id)
        if img:
            for k, v in data.items():
                setattr(img, k, v)
            db.commit()
            db.refresh(img)
        return img

    def delete(self, db: Session, image_id: str) -> bool:
        img = self.get_by_id(db, image_id)
        if img:
            db.delete(img)
            db.commit()
            return True
        return False


# ── Schedule Repository ───────────────────────────────────────────────────────
class ScheduleRepo:
    def get_by_user(self, db: Session, user_id: str) -> Optional[ClassSchedule]:
        return db.query(ClassSchedule).filter(ClassSchedule.userId == user_id).first()

    def create_schedule(self, db: Session, user_id: str, semester: str, academic_year: str) -> ClassSchedule:
        # Delete existing schedule first
        existing = self.get_by_user(db, user_id)
        if existing:
            db.delete(existing)
            db.flush()
        schedule = ClassSchedule(
            scheduleId=str(uuid.uuid4()),
            userId=user_id,
            semester=semester,
            academicYear=academic_year,
            lastUpdated=datetime.now(timezone.utc),
        )
        db.add(schedule)
        db.flush()
        return schedule

    def add_session(self, db: Session, schedule_id: str, session_data: dict) -> ClassSession:
        session = ClassSession(subjectId=str(uuid.uuid4()), scheduleId=schedule_id, **session_data)
        db.add(session)
        return session

    def commit(self, db: Session):
        db.commit()

    def get_session(self, db: Session, subject_id: str) -> Optional[ClassSession]:
        return db.query(ClassSession).filter(ClassSession.subjectId == subject_id).first()

    def update_session(self, db: Session, subject_id: str, data: dict) -> Optional[ClassSession]:
        s = self.get_session(db, subject_id)
        if s:
            for k, v in data.items():
                setattr(s, k, v)
            db.commit()
            db.refresh(s)
        return s


# ── Search History Repository ─────────────────────────────────────────────────
class SearchHistoryRepo:
    def get_by_user(self, db: Session, user_id: str, limit: int = 10) -> List[SearchHistory]:
        return (
            db.query(SearchHistory)
            .filter(SearchHistory.userId == user_id)
            .order_by(SearchHistory.searchTime.desc())
            .limit(limit)
            .all()
        )

    def add(self, db: Session, user_id: str, keyword: str) -> SearchHistory:
        # Keep only latest 10 per user
        existing = self.get_by_user(db, user_id, limit=100)
        if len(existing) >= 10:
            db.delete(existing[-1])
        h = SearchHistory(
            historyId=str(uuid.uuid4()),
            userId=user_id,
            searchKeyword=keyword,
            searchTime=datetime.now(timezone.utc),
        )
        db.add(h)
        db.commit()
        db.refresh(h)
        return h


# ── Notification Repository ───────────────────────────────────────────────────
class NotificationRepo:
    def get_by_user(self, db: Session, user_id: str) -> Optional[NotificationSetting]:
        return db.query(NotificationSetting).filter(NotificationSetting.userId == user_id).first()

    def update(self, db: Session, user_id: str, data: dict) -> Optional[NotificationSetting]:
        n = self.get_by_user(db, user_id)
        if n:
            for k, v in data.items():
                if v is not None:
                    setattr(n, k, v)
            db.commit()
            db.refresh(n)
        return n


# Singleton instances
user_repo = UserRepo()
building_repo = BuildingRepo()
room_repo = RoomRepo()
image_repo = ImageRepo()
schedule_repo = ScheduleRepo()
search_history_repo = SearchHistoryRepo()
notification_repo = NotificationRepo()
