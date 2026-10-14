from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class AdvisoryBase(BaseModel):
    rule_id: str
    title: str
    title_te: Optional[str] = None
    recommendation: str
    recommendation_te: Optional[str] = None
    severity: str = Field(default="moderate", pattern="^(info|low|moderate|high|critical)$")
    weather_summary: Optional[str] = None
    source_reference: Optional[str] = None
    confidence: float = Field(default=0.85, ge=0.0, le=1.0)
    alternative_action: Optional[str] = None
    expires_at: datetime
    is_active: bool = True


class AdvisoryCreate(AdvisoryBase):
    farmer_profile_id: int
    crop_record_id: Optional[int] = None


class AdvisoryOut(AdvisoryBase):
    id: int
    farmer_profile_id: int
    crop_record_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AdvisoryGenerateRequest(BaseModel):
    crop_id: Optional[int] = None  # If None, generate for all active crops of the profile
    force_refresh: bool = False


class AdvisoryGenerateResponse(BaseModel):
    count: int
    advisories: List[AdvisoryOut]
    message: str
