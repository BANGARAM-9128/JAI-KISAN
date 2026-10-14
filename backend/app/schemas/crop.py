from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field


class CropRecordBase(BaseModel):
    crop_name: str = Field(min_length=2, max_length=100)
    variety: Optional[str] = Field(None, max_length=100)
    sowing_date: date
    growth_stage: str = Field(min_length=2, max_length=50)
    field_area_acres: Optional[float] = Field(None, ge=0.0)
    is_active: bool = True


class CropRecordCreate(CropRecordBase):
    pass


class CropRecordUpdate(BaseModel):
    crop_name: Optional[str] = Field(None, min_length=2, max_length=100)
    variety: Optional[str] = Field(None, max_length=100)
    sowing_date: Optional[date] = None
    growth_stage: Optional[str] = Field(None, min_length=2, max_length=50)
    field_area_acres: Optional[float] = Field(None, ge=0.0)
    is_active: Optional[bool] = None


class CropRecordOut(CropRecordBase):
    id: int
    farmer_profile_id: int
    created_at: datetime

    class Config:
        from_attributes = True
