from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class NotificationBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    message: str
    type: str = Field(default="advisory", pattern="^(advisory|weather_alert|system|reminder)$")
    severity: str = Field(default="info", pattern="^(info|low|moderate|high|critical)$")
    source: str = Field(default="system", max_length=100)
    expires_at: Optional[datetime] = None


class NotificationCreate(NotificationBase):
    user_id: int


class NotificationOut(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
