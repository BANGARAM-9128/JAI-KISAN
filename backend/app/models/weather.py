from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Integer, Float, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class WeatherCache(Base):
    __tablename__ = "weather_cache"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    latitude: Mapped[float] = mapped_column(Float, index=True, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, index=True, nullable=False)
    forecast_json: Mapped[str] = mapped_column(Text, nullable=False)
    provider: Mapped[str] = mapped_column(String(50), default="open_meteo", nullable=False)
    retrieved_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    valid_until: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )
