from datetime import datetime
from typing import Dict, Any, List
from pydantic import BaseModel


class AdminStats(BaseModel):
    total_users: int
    total_profiles: int
    total_crops: int
    total_advisories: int
    total_feedbacks: int
    feedback_satisfaction_rate: float
    crop_distribution: Dict[str, int]
    district_distribution: Dict[str, int]


class AdminHealth(BaseModel):
    status: str
    database: str
    weather_provider: str
    timestamp: datetime
    version: str
