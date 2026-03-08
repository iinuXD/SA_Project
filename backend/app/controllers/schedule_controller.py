from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas import ClassScheduleOut, ClassSessionOut, ClassSessionUpdate, NotificationSettingOut, NotificationSettingUpdate
from app.services.schedule_service import parse_ics
from app.repositories import schedule_repo, room_repo, notification_repo
from app.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/schedule", tags=["schedule"])


@router.post("/import", response_model=ClassScheduleOut)
async def import_ics(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.filename.endswith(".ics"):
        raise HTTPException(status_code=400, detail="Only .ics files are supported")

    content = await file.read()
    semester, academic_year, sessions_data = parse_ics(content)

    schedule = schedule_repo.create_schedule(db, current_user.userId, semester, academic_year)

    for s in sessions_data:
        room_name = s.pop("roomName", "")
        # Try to match room in DB
        room_id = None
        if room_name:
            matched_room = room_repo.get_by_name(db, room_name)
            if matched_room:
                room_id = matched_room.roomId
        s["roomId"] = room_id
        s["roomOverride"] = room_name if not room_id and room_name else None
        schedule_repo.add_session(db, schedule.scheduleId, s)

    schedule_repo.commit(db)
    db.refresh(schedule)
    return ClassScheduleOut.model_validate(schedule)


@router.get("/me", response_model=ClassScheduleOut)
def get_my_schedule(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    schedule = schedule_repo.get_by_user(db, current_user.userId)
    if not schedule:
        raise HTTPException(status_code=404, detail="No schedule found. Please import a .ics file.")
    return ClassScheduleOut.model_validate(schedule)


@router.patch("/session/{subject_id}", response_model=ClassSessionOut)
def update_session(
    subject_id: str,
    body: ClassSessionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = schedule_repo.get_session(db, subject_id)
    if not session or session.schedule.userId != current_user.userId:
        raise HTTPException(status_code=404, detail="Session not found")
    update_data = body.model_dump(exclude_none=True)
    updated = schedule_repo.update_session(db, subject_id, update_data)
    return ClassSessionOut.model_validate(updated)


@router.get("/notifications", response_model=NotificationSettingOut)
def get_notification_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    n = notification_repo.get_by_user(db, current_user.userId)
    if not n:
        raise HTTPException(status_code=404, detail="Notification settings not found")
    return NotificationSettingOut.model_validate(n)


@router.patch("/notifications", response_model=NotificationSettingOut)
def update_notification_settings(
    body: NotificationSettingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    n = notification_repo.update(db, current_user.userId, body.model_dump(exclude_none=True))
    return NotificationSettingOut.model_validate(n)
