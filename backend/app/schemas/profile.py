from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class FarmerProfileBase(BaseModel):
    display_name: str = Field(min_length=2, max_length=100)
    village: Optional[str] = Field(None, max_length=100)
    district: str = Field(min_length=2, max_length=100)
    state: str = Field(default="Andhra Pradesh", max_length=100)
    latitude: float = Field(ge=-90.0, le=90.0)
    longitude: float = Field(ge=-180.0, le=180.0)
    irrigation_type: Optional[str] = Field(None, max_length=50)
    soil_type: Optional[str] = Field(None, max_length=50)
    farm_size_acres: Optional[float] = Field(None, ge=0.0)


class FarmerProfileCreate(FarmerProfileBase):
    pass


class FarmerProfileUpdate(BaseModel):
    display_name: Optional[str] = Field(None, min_length=2, max_length=100)
    village: Optional[str] = Field(None, max_length=100)
    district: Optional[str] = Field(None, min_length=2, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    irrigation_type: Optional[str] = Field(None, max_length=50)
    soil_type: Optional[str] = Field(None, max_length=50)
    farm_size_acres: Optional[float] = Field(None, ge=0.0)


class FarmerProfileOut(FarmerProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
