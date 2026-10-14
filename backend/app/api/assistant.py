"""AI Assistant API endpoints."""
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.user import User
from app.models.farmer_profile import FarmerProfile
from app.models.crop import CropRecord
from app.schemas.assistant import ChatRequest, ChatResponse
from app.services.assistant_service import AssistantService
from app.api.deps import get_optional_current_user

router = APIRouter(prefix="/assistant", tags=["Assistant"])
assistant_service = AssistantService()


@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(
    request: ChatRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Conversational assistant for agricultural advisory, weather interpretation,
    and pest management grounded in regional knowledge base documents.
    """
    profile = None
    if current_user:
        stmt = select(FarmerProfile).where(FarmerProfile.user_id == current_user.id)
        res = await db.execute(stmt)
        profile = res.scalars().first()
    crop = None

    if request.crop_id and profile:
        stmt = select(CropRecord).where(
            CropRecord.id == request.crop_id,
            CropRecord.farmer_profile_id == profile.id
        )
        res = await db.execute(stmt)
        crop = res.scalars().first()

    return await assistant_service.get_response(
        db=db,
        request=request,
        profile=profile,
        crop=crop
    )
