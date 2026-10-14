from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import DateTime, Integer, Boolean, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.advisory import Advisory


class Feedback(Base):
    __tablename__ = "feedbacks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    advisory_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("advisories.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    was_understandable: Mapped[bool] = mapped_column(Boolean, nullable=False)
    was_relevant: Mapped[bool] = mapped_column(Boolean, nullable=False)
    was_followed: Mapped[bool] = mapped_column(Boolean, nullable=False)
    was_useful: Mapped[bool] = mapped_column(Boolean, nullable=False)
    weather_accuracy_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    additional_comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="feedbacks")
    advisory: Mapped[Optional["Advisory"]] = relationship("Advisory", back_populates="feedbacks")
