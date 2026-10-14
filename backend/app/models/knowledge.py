from datetime import datetime, date, timezone
from typing import Optional
from sqlalchemy import String, DateTime, Date, Integer, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    source_org: Mapped[str] = mapped_column(String(100), nullable=False)  # ANGRAU, ICAR, CRIDA, IMD
    source_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    document_type: Mapped[str] = mapped_column(String(50), default="guideline", nullable=False)  # pest_management, irrigation, weather_resilience, fertilizer
    crop_tags: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)  # comma separated: rice,cotton
    region_tags: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)  # Andhra Pradesh, Rayalaseema, etc.
    publication_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    review_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
