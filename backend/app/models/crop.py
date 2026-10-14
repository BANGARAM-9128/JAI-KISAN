from datetime import datetime, date, timezone
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, DateTime, Date, Integer, Float, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.farmer_profile import FarmerProfile
    from app.models.advisory import Advisory


class CropRecord(Base):
    __tablename__ = "crop_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    farmer_profile_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("farmer_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    crop_name: Mapped[str] = mapped_column(String(100), nullable=False)  # rice, cotton, maize, groundnut, chilli
    variety: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    sowing_date: Mapped[date] = mapped_column(Date, nullable=False)
    growth_stage: Mapped[str] = mapped_column(String(50), nullable=False)  # sowing, vegetative, flowering, grain_filling, maturity, harvesting
    field_area_acres: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    farmer_profile: Mapped["FarmerProfile"] = relationship("FarmerProfile", back_populates="crops")
    advisories: Mapped[List["Advisory"]] = relationship(
        "Advisory",
        back_populates="crop",
        cascade="all, delete-orphan"
    )
