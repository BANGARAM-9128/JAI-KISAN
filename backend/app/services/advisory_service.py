"""Advisory service orchestrating risk engine and database persistence."""
import logging
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import select, and_, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.farmer_profile import FarmerProfile
from app.models.crop import CropRecord
from app.models.advisory import Advisory
from app.advisory_engine.advisory_generator import AdvisoryGenerator
from app.services.weather_service import WeatherService
from app.services.notification_service import NotificationService

logger = logging.getLogger(__name__)


class AdvisoryService:
    """Orchestrates weather retrieval, advisory generation and persistence."""

    def __init__(
        self,
        weather_service: Optional[WeatherService] = None,
        generator: Optional[AdvisoryGenerator] = None
    ):
        self.weather_service = weather_service or WeatherService()
        self.generator = generator or AdvisoryGenerator()

    async def get_advisories_for_profile(
        self,
        db: AsyncSession,
        farmer_profile_id: int,
        crop_id: Optional[int] = None,
        active_only: bool = True
    ) -> List[Advisory]:
        """Fetch advisories for a farmer profile."""
        now = datetime.now(timezone.utc)
        stmt = select(Advisory).where(Advisory.farmer_profile_id == farmer_profile_id)

        if crop_id is not None:
            stmt = stmt.where(Advisory.crop_record_id == crop_id)

        if active_only:
            stmt = stmt.where(
                and_(
                    Advisory.is_active.is_(True),
                    Advisory.expires_at > now
                )
            )

        stmt = stmt.order_by(Advisory.created_at.desc())
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_advisory_by_id(
        self,
        db: AsyncSession,
        advisory_id: int
    ) -> Optional[Advisory]:
        """Fetch single advisory by ID."""
        stmt = select(Advisory).where(Advisory.id == advisory_id)
        result = await db.execute(stmt)
        return result.scalars().first()

    async def generate_advisories_for_farmer(
        self,
        db: AsyncSession,
        farmer_profile: FarmerProfile,
        crop_id: Optional[int] = None,
        force_refresh_weather: bool = False
    ) -> List[Advisory]:
        """
        Evaluate weather conditions and generate new advisories for active crops.
        Creates notifications for high/critical advisories.
        """
        # 1. Fetch weather forecast for farmer location
        weather_resp = await self.weather_service.get_forecast(
            db=db,
            latitude=farmer_profile.latitude,
            longitude=farmer_profile.longitude,
            force_refresh=force_refresh_weather
        )

        weather_dict = {
            "current": weather_resp.current.model_dump(),
            "hourly": weather_resp.hourly.model_dump(),
            "daily": weather_resp.daily.model_dump(),
            "latitude": weather_resp.latitude,
            "longitude": weather_resp.longitude,
        }

        # 2. Identify target crops
        stmt = select(CropRecord).where(
            and_(
                CropRecord.farmer_profile_id == farmer_profile.id,
                CropRecord.is_active.is_(True)
            )
        )
        if crop_id:
            stmt = stmt.where(CropRecord.id == crop_id)

        crop_res = await db.execute(stmt)
        crops = list(crop_res.scalars().all())

        generated_items = []

        # If crops are registered, generate crop-specific advisories
        if crops:
            for crop in crops:
                advisory_dicts = self.generator.generate_for_crop(
                    weather_data=weather_dict,
                    farmer_profile_id=farmer_profile.id,
                    crop_name=crop.crop_name,
                    growth_stage=crop.growth_stage,
                    crop_record_id=crop.id,
                    soil_type=farmer_profile.soil_type,
                    irrigation_type=farmer_profile.irrigation_type
                )
                generated_items.extend(advisory_dicts)
        else:
            # Generate general field advisories
            general_dicts = self.generator.generate_general_advisories(
                weather_data=weather_dict,
                farmer_profile_id=farmer_profile.id
            )
            generated_items.extend(general_dicts)

        # 3. Save advisories to DB and create notifications
        saved_advisories: List[Advisory] = []
        now = datetime.now(timezone.utc)

        for item in generated_items:
            # Deactivate previous active advisories of same rule for this crop
            deact_stmt = (
                update(Advisory)
                .where(
                    and_(
                        Advisory.farmer_profile_id == farmer_profile.id,
                        Advisory.crop_record_id == item["crop_record_id"],
                        Advisory.rule_id == item["rule_id"],
                        Advisory.is_active.is_(True)
                    )
                )
                .values(is_active=False)
            )
            await db.execute(deact_stmt)

            advisory = Advisory(
                farmer_profile_id=item["farmer_profile_id"],
                crop_record_id=item["crop_record_id"],
                rule_id=item["rule_id"],
                title=item["title"],
                title_te=item.get("title_te"),
                recommendation=item["recommendation"],
                recommendation_te=item.get("recommendation_te"),
                severity=item["severity"],
                weather_summary=item.get("weather_summary"),
                source_reference=item.get("source_reference"),
                confidence=item["confidence"],
                alternative_action=item.get("alternative_action"),
                expires_at=item["expires_at"],
                is_active=True
            )
            db.add(advisory)
            saved_advisories.append(advisory)

        await db.commit()

        # Refresh all saved advisories and send notifications for high/critical
        for adv in saved_advisories:
            await db.refresh(adv)
            if adv.severity in ["high", "critical"]:
                await NotificationService.create_notification(
                    db=db,
                    user_id=farmer_profile.user_id,
                    title=f"Urgent Advisory: {adv.title}",
                    message=adv.recommendation,
                    type="advisory",
                    severity=adv.severity,
                    source="Jai Kisan Risk Engine",
                    expires_at=adv.expires_at
                )

        return saved_advisories
