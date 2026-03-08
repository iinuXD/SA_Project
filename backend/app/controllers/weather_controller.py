from fastapi import APIRouter, HTTPException
from app.services.weather_service import get_kku_weather

router = APIRouter(prefix="/weather", tags=["weather"])


@router.get("/kku")
async def kku_weather():
    try:
        return await get_kku_weather()
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Weather service unavailable: {str(e)}")
