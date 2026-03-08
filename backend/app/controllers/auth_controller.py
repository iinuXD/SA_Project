from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import GoogleTokenRequest, TokenResponse, UserOut, SystemSettingOut, SystemSettingUpdate
from app.services.auth_service import (
    verify_google_token, check_kku_domain, get_or_create_user, create_access_token
)
from app.repositories import user_repo, notification_repo
from app.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/google", response_model=TokenResponse)
def google_login(body: GoogleTokenRequest, db: Session = Depends(get_db)):
    idinfo = verify_google_token(body.credential)
    email = idinfo.get("email", "")
    name = idinfo.get("name", email.split("@")[0])

    if not check_kku_domain(email):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only KKU email accounts (@kkumail.com or @kku.ac.th) are allowed",
        )

    user = get_or_create_user(db, email, name)
    token = create_access_token(user.userId, user.role)
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)


@router.get("/me/settings", response_model=SystemSettingOut)
def get_settings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    setting = current_user.system_setting
    if not setting:
        raise HTTPException(status_code=404, detail="Settings not found")
    return SystemSettingOut.model_validate(setting)


@router.patch("/me/settings", response_model=SystemSettingOut)
def update_settings(
    body: SystemSettingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    setting = user_repo.update_language(db, current_user.userId, body.languageCode)
    return SystemSettingOut.model_validate(setting)
