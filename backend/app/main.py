from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import engine, Base
from app.config import settings
from app.controllers.auth_controller import router as auth_router
from app.controllers.map_controller import router as map_router
from app.controllers.schedule_controller import router as schedule_router
from app.controllers.admin_controller import router as admin_router
from app.controllers.weather_controller import router as weather_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    Base.metadata.create_all(bind=engine)
    # Run seed
    from app.seed import seed
    seed()
    yield


app = FastAPI(
    title="Where is My Classroom API",
    description="KKU Campus Map & Classroom Finder — มหาวิทยาลัยขอนแก่น",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:4173",
        "https://sa-wimc-frontend.onrender.com",
        "https://wimc-frontend.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(map_router, prefix="/api")
app.include_router(schedule_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(weather_router, prefix="/api")


@app.get("/")
def root():
    return {"message": "Where is My Classroom API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
