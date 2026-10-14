"""Notification endpoints for farmer alerts."""
from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.user import User
from app.schemas.notification import NotificationOut
from app.services.notification_service import NotificationService
from app.api.deps import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=List[NotificationOut])
async def get_notifications(
    limit: int = Query(50, ge=1, le=100),
    unread_only: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve notifications for the authenticated user."""
    return await NotificationService.get_user_notifications(
        db=db,
        user_id=current_user.id,
        limit=limit,
        unread_only=unread_only
    )


@router.put("/read-all", response_model=Dict[str, int])
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark all unread notifications for the user as read."""
    count = await NotificationService.mark_all_as_read(db=db, user_id=current_user.id)
    return {"updated": count}


@router.put("/{notification_id}/read", response_model=NotificationOut)
async def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark a single notification as read."""
    updated = await NotificationService.mark_as_read(
        db=db,
        notification_id=notification_id,
        user_id=current_user.id
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    return updated
