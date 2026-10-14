"""API router aggregation."""
from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.profiles import router as profiles_router
from app.api.crops import router as crops_router
from app.api.weather import router as weather_router
from app.api.advisories import router as advisories_router
from app.api.notifications import router as notifications_router
from app.api.feedback import router as feedback_router
from app.api.assistant import router as assistant_router
from app.api.admin import router as admin_router
from app.api.knowledge import router as knowledge_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(profiles_router)
api_router.include_router(crops_router)
api_router.include_router(weather_router)
api_router.include_router(advisories_router)
api_router.include_router(notifications_router)
api_router.include_router(feedback_router)
api_router.include_router(assistant_router)
api_router.include_router(admin_router)
api_router.include_router(knowledge_router)
