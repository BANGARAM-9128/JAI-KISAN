"""Advisory API endpoints for farmers to query and generate risk advisories."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.farmer_profile import FarmerProfile
from app.schemas.advisory import AdvisoryOut, AdvisoryGenerateRequest, AdvisoryGenerateResponse
from app.services.advisory_service import AdvisoryService
from app.api.deps import get_current_farmer_profile
from app.providers.open_meteo import OpenMeteoError

router = APIRouter(prefix="/advisories", tags=["Advisories"])
advisory_service = AdvisoryService()


@router.get("", response_model=List[AdvisoryOut])
async def list_advisories(
    crop_id: Optional[int] = Query(None, description="Filter by crop record ID"),
    active_only: bool = Query(True, description="Return only active and unexpired advisories"),
    profile: FarmerProfile = Depends(get_current_farmer_profile),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve actionable advisories for the current farmer's crops."""
    advisories = await advisory_service.get_advisories_for_profile(
        db=db,
        farmer_profile_id=profile.id,
        crop_id=crop_id,
        active_only=active_only
    )
    return advisories


@router.get("/{advisory_id}", response_model=AdvisoryOut)
async def get_advisory(
    advisory_id: int,
    profile: FarmerProfile = Depends(get_current_farmer_profile),
    db: AsyncSession = Depends(get_db)
):
    """Get single advisory detail by ID."""
    advisory = await advisory_service.get_advisory_by_id(db=db, advisory_id=advisory_id)
    if not advisory or advisory.farmer_profile_id != profile.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Advisory not found"
        )
    return advisory


@router.post("/generate", response_model=AdvisoryGenerateResponse)
async def generate_advisories(
    req: AdvisoryGenerateRequest = AdvisoryGenerateRequest(),
    profile: FarmerProfile = Depends(get_current_farmer_profile),
    db: AsyncSession = Depends(get_db)
):
    """
    Trigger risk evaluation against the latest weather forecast to generate new crop advisories.
    Automatically generates critical notifications when high severity risks are found.
    """
    try:
        new_advisories = await advisory_service.generate_advisories_for_farmer(
            db=db,
            farmer_profile=profile,
            crop_id=req.crop_id,
            force_refresh_weather=req.force_refresh
        )
        return AdvisoryGenerateResponse(
            count=len(new_advisories),
            advisories=[AdvisoryOut.model_validate(a) for a in new_advisories],
            message=f"Successfully generated {len(new_advisories)} agricultural advisories"
        )
    except OpenMeteoError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Weather service unavailable for advisory generation: {str(exc)}"
        )
