"""Notification service for farmer alerts and system messages."""
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.notification import Notification


class NotificationService:
    """Manages farmer notifications."""

    @staticmethod
    async def create_notification(
        db: AsyncSession,
        user_id: int,
        title: str,
        message: str,
        type: str = "advisory",
        severity: str = "info",
        source: str = "system",
        expires_at: Optional[datetime] = None
    ) -> Notification:
        """Create and persist a notification."""
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=type,
            severity=severity,
            source=source,
            expires_at=expires_at,
            is_read=False
        )
        db.add(notification)
        await db.commit()
        await db.refresh(notification)
        return notification

    @staticmethod
    async def get_user_notifications(
        db: AsyncSession,
        user_id: int,
        limit: int = 50,
        unread_only: bool = False
    ) -> List[Notification]:
        """Fetch notifications for a user."""
        stmt = select(Notification).where(Notification.user_id == user_id)
        if unread_only:
            stmt = stmt.where(Notification.is_read.is_(False))
        stmt = stmt.order_by(Notification.created_at.desc()).limit(limit)

        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def mark_as_read(
        db: AsyncSession,
        notification_id: int,
        user_id: int
    ) -> Optional[Notification]:
        """Mark a specific notification as read."""
        stmt = select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == user_id
        )
        res = await db.execute(stmt)
        notification = res.scalars().first()
        if not notification:
            return None

        notification.is_read = True
        await db.commit()
        await db.refresh(notification)
        return notification

    @staticmethod
    async def mark_all_as_read(
        db: AsyncSession,
        user_id: int
    ) -> int:
        """Mark all notifications of a user as read."""
        stmt = (
            update(Notification)
            .where(Notification.user_id == user_id, Notification.is_read.is_(False))
            .values(is_read=True)
        )
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount
