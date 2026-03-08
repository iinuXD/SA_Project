from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.schemas import BuildingOut, BuildingDetail, RoomOut, RoomDetail, SearchResult, SearchHistoryOut
from app.repositories import building_repo, room_repo, search_history_repo
from app.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/map", tags=["map"])


@router.get("/buildings", response_model=List[BuildingOut])
def list_buildings(db: Session = Depends(get_db)):
    return [BuildingOut.model_validate(b) for b in building_repo.get_all(db)]


@router.get("/buildings/{build_id}", response_model=BuildingDetail)
def get_building(build_id: str, db: Session = Depends(get_db)):
    b = building_repo.get_by_id(db, build_id)
    if not b:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Building not found")
    return BuildingDetail.model_validate(b)


@router.get("/buildings/{build_id}/rooms", response_model=List[RoomOut])
def get_rooms_by_building(build_id: str, db: Session = Depends(get_db)):
    return [RoomOut.model_validate(r) for r in room_repo.get_by_building(db, build_id)]


@router.get("/rooms/{room_id}", response_model=RoomDetail)
def get_room(room_id: str, db: Session = Depends(get_db)):
    r = room_repo.get_by_id(db, room_id)
    if not r:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Room not found")
    return RoomDetail.model_validate(r)


@router.get("/search", response_model=SearchResult)
def search(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    buildings = [BuildingOut.model_validate(b) for b in building_repo.search(db, q)]
    rooms = [RoomOut.model_validate(r) for r in room_repo.search(db, q)]

    # Save to search history
    search_history_repo.add(db, current_user.userId, q)

    return SearchResult(buildings=buildings, rooms=rooms)


@router.get("/search/history", response_model=List[SearchHistoryOut])
def get_search_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return [
        SearchHistoryOut.model_validate(h)
        for h in search_history_repo.get_by_user(db, current_user.userId)
    ]
