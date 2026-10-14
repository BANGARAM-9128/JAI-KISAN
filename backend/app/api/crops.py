"""Crop record CRUD management endpoints."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.crop import CropRecord
from app.models.farmer_profile import FarmerProfile
from app.schemas.crop import CropRecordCreate, CropRecordUpdate, CropRecordOut
from app.api.deps import get_current_farmer_profile

router = APIRouter(prefix="/crops", tags=["Crop Records"])


@router.get("", response_model=List[CropRecordOut])
async def list_crops(
    active_only: bool = True,
    profile: FarmerProfile = Depends(get_current_farmer_profile),
    db: AsyncSession = Depends(get_db)
):
    """List all registered crops for the logged-in farmer."""
    stmt = select(CropRecord).where(CropRecord.farmer_profile_id == profile.id)
    if active_only:
        stmt = stmt.where(CropRecord.is_active.is_(True))
    stmt = stmt.order_by(CropRecord.created_at.desc())

    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.post("", response_model=CropRecordOut, status_code=status.HTTP_201_CREATED)
async def add_crop(
    crop_in: CropRecordCreate,
    profile: FarmerProfile = Depends(get_current_farmer_profile),
    db: AsyncSession = Depends(get_db)
):
    """Register a new crop record under the current profile."""
    crop = CropRecord(
        farmer_profile_id=profile.id,
        crop_name=crop_in.crop_name.lower().strip(),
        variety=crop_in.variety,
        sowing_date=crop_in.sowing_date,
        growth_stage=crop_in.growth_stage.lower().strip(),
        field_area_acres=crop_in.field_area_acres,
        is_active=crop_in.is_active
    )
    db.add(crop)
    await db.commit()
    await db.refresh(crop)
    return crop


@router.get("/{crop_id}", response_model=CropRecordOut)
async def get_crop(
    crop_id: int,
    profile: FarmerProfile = Depends(get_current_farmer_profile),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve details for a specific crop record."""
    stmt = select(CropRecord).where(
        and_(
            CropRecord.id == crop_id,
            CropRecord.farmer_profile_id == profile.id
        )
    )
    result = await db.execute(stmt)
    crop = result.scalars().first()
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop record not found"
        )
    return crop


@router.put("/{crop_id}", response_model=CropRecordOut)
async def update_crop(
    crop_id: int,
    crop_update: CropRecordUpdate,
    profile: FarmerProfile = Depends(get_current_farmer_profile),
    db: AsyncSession = Depends(get_db)
):
    """Update growth stage, variety or active status of a crop."""
    stmt = select(CropRecord).where(
        and_(
            CropRecord.id == crop_id,
            CropRecord.farmer_profile_id == profile.id
        )
    )
    result = await db.execute(stmt)
    crop = result.scalars().first()
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop record not found"
        )

    update_dict = crop_update.model_dump(exclude_unset=True)
    if "crop_name" in update_dict and update_dict["crop_name"]:
        update_dict["crop_name"] = update_dict["crop_name"].lower().strip()
    if "growth_stage" in update_dict and update_dict["growth_stage"]:
        update_dict["growth_stage"] = update_dict["growth_stage"].lower().strip()

    for field, val in update_dict.items():
        setattr(crop, field, val)

    await db.commit()
    await db.refresh(crop)
    return crop


@router.delete("/{crop_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_crop(
    crop_id: int,
    profile: FarmerProfile = Depends(get_current_farmer_profile),
    db: AsyncSession = Depends(get_db)
):
    """Delete a crop record."""
    stmt = select(CropRecord).where(
        and_(
            CropRecord.id == crop_id,
            CropRecord.farmer_profile_id == profile.id
        )
    )
    result = await db.execute(stmt)
    crop = result.scalars().first()
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop record not found"
        )

    await db.delete(crop)
    await db.commit()
    return None
