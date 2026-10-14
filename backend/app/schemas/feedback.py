from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class FeedbackBase(BaseModel):
    advisory_id: Optional[int] = None
    was_understandable: bool
    was_relevant: bool
    was_followed: bool
    was_useful: bool
    weather_accuracy_note: Optional[str] = None
    additional_comment: Optional[str] = None


class FeedbackCreate(FeedbackBase):
    pass


class FeedbackOut(FeedbackBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
