"""Feedback API endpoints for advisory evaluation and system improvement."""
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.user import User
from app.models.feedback import Feedback
from app.schemas.feedback import FeedbackCreate, FeedbackOut
from app.api.deps import get_current_user, get_current_admin

router = APIRouter(prefix="/feedback", tags=["Feedback"])


@router.post("", response_model=FeedbackOut, status_code=status.HTTP_201_CREATED)
async def submit_feedback(
    feedback_in: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Farmer submits feedback on the clarity, accuracy, and utility of an advisory."""
    feedback = Feedback(
        user_id=current_user.id,
        advisory_id=feedback_in.advisory_id,
        was_understandable=feedback_in.was_understandable,
        was_relevant=feedback_in.was_relevant,
        was_followed=feedback_in.was_followed,
        was_useful=feedback_in.was_useful,
        weather_accuracy_note=feedback_in.weather_accuracy_note,
        additional_comment=feedback_in.additional_comment
    )
    db.add(feedback)
    await db.commit()
    await db.refresh(feedback)
    return feedback


@router.get("", response_model=List[FeedbackOut])
async def list_feedback_admin(
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Administrative retrieval of farmer feedback submissions."""
    stmt = select(Feedback).order_by(Feedback.created_at.desc())
    res = await db.execute(stmt)
    return list(res.scalars().all())
