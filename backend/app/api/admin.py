"""Administrative endpoints for platform metrics, rule configuration, and system health."""
from datetime import datetime, timezone
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.user import User
from app.models.farmer_profile import FarmerProfile
from app.models.crop import CropRecord
from app.models.advisory import Advisory
from app.models.feedback import Feedback
from app.schemas.admin import AdminStats, AdminHealth
from app.schemas.feedback import FeedbackOut
from app.advisory_engine.rules import ADVISORY_RULES
from app.api.deps import get_current_admin
from app.core.config import settings

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats", response_model=AdminStats)
async def get_admin_stats(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve platform usage statistics and aggregation metrics."""
    # Count totals
    total_users = (await db.execute(select(func.count(User.id)))).scalar_one()
    total_profiles = (await db.execute(select(func.count(FarmerProfile.id)))).scalar_one()
    total_crops = (await db.execute(select(func.count(CropRecord.id)))).scalar_one()
    total_advisories = (await db.execute(select(func.count(Advisory.id)))).scalar_one()
    total_feedbacks = (await db.execute(select(func.count(Feedback.id)))).scalar_one()

    # Satisfaction rate (was_useful == True)
    if total_feedbacks > 0:
        useful_feedbacks = (
            await db.execute(select(func.count(Feedback.id)).where(Feedback.was_useful.is_(True)))
        ).scalar_one()
        satisfaction_rate = round((useful_feedbacks / total_feedbacks) * 100.0, 1)
    else:
        satisfaction_rate = 100.0

    # Crop distribution
    crop_stmt = select(CropRecord.crop_name, func.count(CropRecord.id)).group_by(CropRecord.crop_name)
    crop_counts = (await db.execute(crop_stmt)).all()
    crop_dist = {row[0]: row[1] for row in crop_counts}

    # District distribution
    district_stmt = select(FarmerProfile.district, func.count(FarmerProfile.id)).group_by(FarmerProfile.district)
    district_counts = (await db.execute(district_stmt)).all()
    district_dist = {row[0]: row[1] for row in district_counts}

    return AdminStats(
        total_users=total_users,
        total_profiles=total_profiles,
        total_crops=total_crops,
        total_advisories=total_advisories,
        total_feedbacks=total_feedbacks,
        feedback_satisfaction_rate=satisfaction_rate,
        crop_distribution=crop_dist,
        district_distribution=district_dist
    )


@router.get("/feedback", response_model=List[FeedbackOut])
async def get_admin_feedback(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """List farmer feedback submissions for quality review."""
    stmt = select(Feedback).order_by(Feedback.created_at.desc())
    res = await db.execute(stmt)
    return list(res.scalars().all())


@router.get("/rules", response_model=List[Dict[str, Any]])
async def get_admin_rules(
    admin: User = Depends(get_current_admin)
):
    """Inspect all active advisory rules and thresholds in the risk engine."""
    return [
        {
            "rule_id": r.rule_id,
            "name": r.name,
            "crops": r.crops,
            "stages": r.stages,
            "severity": r.severity,
            "title_en": r.title_en,
            "title_te": r.title_te,
            "recommendation_en": r.recommendation_en,
            "recommendation_te": r.recommendation_te,
            "source_reference": r.source_reference,
            "validity_hours": r.validity_hours
        }
        for r in ADVISORY_RULES
    ]


@router.get("/health", response_model=AdminHealth)
async def get_admin_health(
    db: AsyncSession = Depends(get_db)
):
    """System health check endpoint."""
    db_status = "healthy"
    try:
        await db.execute(select(1))
    except Exception:
        db_status = "unhealthy"

    return AdminHealth(
        status="healthy" if db_status == "healthy" else "degraded",
        database=db_status,
        weather_provider=settings.WEATHER_PROVIDER,
        timestamp=datetime.now(timezone.utc),
        version="1.0.0"
    )
