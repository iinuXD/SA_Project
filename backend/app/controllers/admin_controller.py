from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas import (
    BuildingCreate, BuildingUpdate, BuildingOut, BuildingDetail,
    RoomCreate, RoomUpdate, RoomOut,
    ImageCreate, ImageOut,
)
from app.repositories import building_repo, room_repo, image_repo
from app.dependencies import get_admin_user
from app.models import User

router = APIRouter(prefix="/admin", tags=["admin"])


# ── Buildings ─────────────────────────────────────────────────────────────────
@router.post("/buildings", response_model=BuildingOut)
def create_building(
    body: BuildingCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    b = building_repo.create(db, body.model_dump())
    return BuildingOut.model_validate(b)


@router.put("/buildings/{build_id}", response_model=BuildingOut)
def update_building(
    build_id: str,
    body: BuildingUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    b = building_repo.update(db, build_id, body.model_dump(exclude_none=True))
    if not b:
        raise HTTPException(status_code=404, detail="Building not found")
    return BuildingOut.model_validate(b)


@router.delete("/buildings/{build_id}")
def delete_building(
    build_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    if not building_repo.delete(db, build_id):
        raise HTTPException(status_code=404, detail="Building not found")
    return {"message": "Deleted successfully"}


# ── Rooms ─────────────────────────────────────────────────────────────────────
@router.post("/rooms", response_model=RoomOut)
def create_room(
    body: RoomCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    r = room_repo.create(db, body.model_dump())
    return RoomOut.model_validate(r)


@router.put("/rooms/{room_id}", response_model=RoomOut)
def update_room(
    room_id: str,
    body: RoomUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    r = room_repo.update(db, room_id, body.model_dump(exclude_none=True))
    if not r:
        raise HTTPException(status_code=404, detail="Room not found")
    return RoomOut.model_validate(r)


@router.delete("/rooms/{room_id}")
def delete_room(
    room_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    if not room_repo.delete(db, room_id):
        raise HTTPException(status_code=404, detail="Room not found")
    return {"message": "Deleted successfully"}


# ── Images ────────────────────────────────────────────────────────────────────
@router.post("/images", response_model=ImageOut)
def create_image(
    body: ImageCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    img = image_repo.create(db, body.model_dump())
    return ImageOut.model_validate(img)


@router.put("/images/{image_id}", response_model=ImageOut)
def update_image(
    image_id: str,
    body: ImageCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    img = image_repo.update(db, image_id, body.model_dump(exclude_none=True))
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")
    return ImageOut.model_validate(img)


@router.delete("/images/{image_id}")
def delete_image(
    image_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    if not image_repo.delete(db, image_id):
        raise HTTPException(status_code=404, detail="Image not found")
    return {"message": "Deleted successfully"}
