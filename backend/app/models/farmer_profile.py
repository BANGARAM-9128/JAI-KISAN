from datetime import datetime, timezone
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, DateTime, Integer, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.crop import CropRecord
    from app.models.advisory import Advisory


class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    village: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    district: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), default="Andhra Pradesh", nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    irrigation_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # rainfed, borewell, canal, drip
    soil_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # black_cotton, red_sandy, alluvial, clay_loam
    farm_size_acres: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="profile")
    crops: Mapped[List["CropRecord"]] = relationship(
        "CropRecord",
        back_populates="farmer_profile",
        cascade="all, delete-orphan"
    )
    advisories: Mapped[List["Advisory"]] = relationship(
        "Advisory",
        back_populates="farmer_profile",
        cascade="all, delete-orphan"
    )
