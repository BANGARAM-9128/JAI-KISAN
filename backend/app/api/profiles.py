"""Farmer profile management endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.user import User
from app.models.farmer_profile import FarmerProfile
from app.schemas.profile import FarmerProfileCreate, FarmerProfileUpdate, FarmerProfileOut
from app.api.deps import get_current_user, get_current_farmer_profile

router = APIRouter(prefix="/profile", tags=["Farmer Profile"])


@router.get("", response_model=FarmerProfileOut)
async def get_profile(
    profile: FarmerProfile = Depends(get_current_farmer_profile)
):
    """Retrieve the farmer profile for the logged in user."""
    return profile


@router.post("/setup", response_model=FarmerProfileOut, status_code=status.HTTP_201_CREATED)
async def setup_profile(
    profile_in: FarmerProfileCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Initial farmer onboarding profile setup."""
    stmt = select(FarmerProfile).where(FarmerProfile.user_id == current_user.id)
    res = await db.execute(stmt)
    existing = res.scalars().first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Farmer profile is already configured for this user. Use PUT /profile to update."
        )

    profile = FarmerProfile(
        user_id=current_user.id,
        display_name=profile_in.display_name,
        village=profile_in.village,
        district=profile_in.district,
        state=profile_in.state,
        latitude=profile_in.latitude,
        longitude=profile_in.longitude,
        irrigation_type=profile_in.irrigation_type,
        soil_type=profile_in.soil_type,
        farm_size_acres=profile_in.farm_size_acres,
    )
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


@router.put("", response_model=FarmerProfileOut)
async def update_profile(
    profile_update: FarmerProfileUpdate,
    profile: FarmerProfile = Depends(get_current_farmer_profile),
    db: AsyncSession = Depends(get_db)
):
    """Update existing farmer profile details."""
    update_data = profile_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)
    return profile
