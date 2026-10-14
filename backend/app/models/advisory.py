from datetime import datetime, timezone
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, DateTime, Integer, Float, Boolean, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.farmer_profile import FarmerProfile
    from app.models.crop import CropRecord
    from app.models.feedback import Feedback


class Advisory(Base):
    __tablename__ = "advisories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    farmer_profile_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("farmer_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    crop_record_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("crop_records.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )
    rule_id: Mapped[str] = mapped_column(String(100), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    title_te: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    recommendation: Mapped[str] = mapped_column(Text, nullable=False)
    recommendation_te: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    severity: Mapped[str] = mapped_column(String(50), default="moderate", nullable=False)  # info, low, moderate, high, critical
    weather_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source_reference: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    confidence: Mapped[float] = mapped_column(Float, default=0.85, nullable=False)
    alternative_action: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    farmer_profile: Mapped["FarmerProfile"] = relationship("FarmerProfile", back_populates="advisories")
    crop: Mapped[Optional["CropRecord"]] = relationship("CropRecord", back_populates="advisories")
    feedbacks: Mapped[List["Feedback"]] = relationship(
        "Feedback",
        back_populates="advisory",
        cascade="all, delete-orphan"
    )
