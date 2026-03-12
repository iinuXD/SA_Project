from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import httpx
import re
import cloudinary
import cloudinary.uploader

from app.database import get_db
from app.config import settings
from app.schemas import (
    BuildingCreate, BuildingUpdate, BuildingOut, BuildingDetail,
    RoomCreate, RoomUpdate, RoomOut,
    ImageCreate, ImageOut,
)
from app.repositories import building_repo, room_repo, image_repo
from app.dependencies import get_admin_user
from app.models import User

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)

router = APIRouter(prefix="/admin", tags=["admin"])

GOOGLE_MAPS_SHORT_DOMAINS = ("maps.app.goo.gl", "goo.gl")


def resolve_short_maps_url(url: str) -> str:
    """Follow redirects on shortened Google Maps URLs to get the full URL."""
    if not url:
        return url
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        if parsed.hostname not in GOOGLE_MAPS_SHORT_DOMAINS:
            return url
        with httpx.Client(follow_redirects=True, timeout=10) as client:
            resp = client.head(url)
            return str(resp.url)
    except Exception:
        return url


# ── Buildings ─────────────────────────────────────────────────────────────────
@router.post("/buildings", response_model=BuildingOut)
def create_building(
    body: BuildingCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    data = body.model_dump()
    if data.get("buildLocation"):
        data["buildLocation"] = resolve_short_maps_url(data["buildLocation"])
    b = building_repo.create(db, data)
    return BuildingOut.model_validate(b)


@router.put("/buildings/{build_id}", response_model=BuildingOut)
def update_building(
    build_id: str,
    body: BuildingUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    data = body.model_dump(exclude_none=True)
    if data.get("buildLocation"):
        data["buildLocation"] = resolve_short_maps_url(data["buildLocation"])
    b = building_repo.update(db, build_id, data)
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


# ── Upload ────────────────────────────────────────────────────────────────────
@router.post("/upload")
def upload_image(
    file: UploadFile = File(...),
    _: User = Depends(get_admin_user),
):
    allowed_types = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP, and GIF images are allowed")

    try:
        file_bytes = file.file.read()
        if not file_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")

        result = cloudinary.uploader.upload(
            file_bytes,
            folder="wimc",
            resource_type="image",
        )
        secure_url = result.get("secure_url")
        if not secure_url:
            raise HTTPException(status_code=502, detail="Cloudinary did not return an image URL")
        return {"url": secure_url}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")


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
