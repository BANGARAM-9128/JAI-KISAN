"""Weather service: caching, provider integration, attribution and alert generation."""
import json
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.weather import WeatherCache
from app.providers.open_meteo import OpenMeteoClient, OpenMeteoError
from app.schemas.weather import (
    WeatherResponse,
    WeatherCurrent,
    WeatherHourly,
    WeatherDaily,
    WeatherAlert
)
from app.advisory_engine.risk_evaluator import RiskEvaluator

logger = logging.getLogger(__name__)


class WeatherService:
    """Manages weather data retrieval, caching, and risk alert derivation."""

    def __init__(self, client: Optional[OpenMeteoClient] = None):
        self.client = client or OpenMeteoClient()
        self.evaluator = RiskEvaluator()

    async def get_forecast(
        self,
        db: AsyncSession,
        latitude: float,
        longitude: float,
        force_refresh: bool = False
    ) -> WeatherResponse:
        """
        Get weather forecast for coordinates with SQLite caching.
        Returns data with clear source attribution and timestamp metadata.
        """
        now = datetime.now(timezone.utc)
        rounded_lat = round(latitude, 2)
        rounded_lon = round(longitude, 2)

        # 1. Check cache if not forcing refresh
        if not force_refresh:
            stmt = select(WeatherCache).where(
                and_(
                    WeatherCache.latitude >= rounded_lat - 0.02,
                    WeatherCache.latitude <= rounded_lat + 0.02,
                    WeatherCache.longitude >= rounded_lon - 0.02,
                    WeatherCache.longitude <= rounded_lon + 0.02,
                    WeatherCache.valid_until > now
                )
            ).order_by(WeatherCache.retrieved_at.desc())

            res = await db.execute(stmt)
            cached_entry = res.scalars().first()

            if cached_entry:
                try:
                    payload = json.loads(cached_entry.forecast_json)
                    return self._build_response(
                        raw_data=payload,
                        lat=latitude,
                        lon=longitude,
                        retrieved_at=cached_entry.retrieved_at,
                        valid_until=cached_entry.valid_until,
                        is_cached=True
                    )
                except Exception as exc:
                    logger.warning(f"Failed parsing cached forecast JSON: {exc}. Refetching.")

        # 2. Fetch fresh forecast from Open-Meteo
        raw_forecast = await self.client.fetch_forecast(latitude, longitude)
        retrieved_at = now
        valid_until = now + timedelta(minutes=settings.WEATHER_CACHE_MINUTES)

        # 3. Store in cache
        try:
            cache_record = WeatherCache(
                latitude=latitude,
                longitude=longitude,
                forecast_json=json.dumps(raw_forecast),
                provider=settings.WEATHER_PROVIDER,
                retrieved_at=retrieved_at,
                valid_until=valid_until
            )
            db.add(cache_record)
            await db.commit()
        except Exception as exc:
            logger.warning(f"Failed storing weather cache record: {exc}")
            await db.rollback()

        return self._build_response(
            raw_data=raw_forecast,
            lat=latitude,
            lon=longitude,
            retrieved_at=retrieved_at,
            valid_until=valid_until,
            is_cached=False
        )

    def _build_response(
        self,
        raw_data: Dict[str, Any],
        lat: float,
        lon: float,
        retrieved_at: datetime,
        valid_until: datetime,
        is_cached: bool
    ) -> WeatherResponse:
        """Construct validated WeatherResponse model."""
        curr = raw_data.get("current", {})
        hourly = raw_data.get("hourly", {})
        daily = raw_data.get("daily", {})

        current_obj = WeatherCurrent(
            time=str(curr.get("time", "")),
            temperature_2m=float(curr.get("temperature_2m", 0.0)),
            relative_humidity_2m=float(curr.get("relative_humidity_2m", 0.0)),
            precipitation=float(curr.get("precipitation", 0.0)),
            wind_speed_10m=float(curr.get("wind_speed_10m", 0.0)),
            wind_direction_10m=float(curr.get("wind_direction_10m", 0.0)),
            apparent_temperature=float(curr.get("apparent_temperature", curr.get("temperature_2m", 0.0))),
            weather_code=int(curr.get("weather_code", 0)),
        )

        hourly_obj = WeatherHourly(
            time=[str(t) for t in hourly.get("time", [])],
            temperature_2m=[float(v) for v in hourly.get("temperature_2m", [])],
            relative_humidity_2m=[float(v) for v in hourly.get("relative_humidity_2m", [])],
            precipitation_probability=[float(v) for v in hourly.get("precipitation_probability", [])],
            precipitation=[float(v) for v in hourly.get("precipitation", [])],
            wind_speed_10m=[float(v) for v in hourly.get("wind_speed_10m", [])],
            wind_direction_10m=[float(v) for v in hourly.get("wind_direction_10m", [])],
            apparent_temperature=[float(v) for v in hourly.get("apparent_temperature", [])],
        )

        daily_obj = WeatherDaily(
            time=[str(t) for t in daily.get("time", [])],
            temperature_2m_max=[float(v) for v in daily.get("temperature_2m_max", [])],
            temperature_2m_min=[float(v) for v in daily.get("temperature_2m_min", [])],
            precipitation_sum=[float(v) for v in daily.get("precipitation_sum", [])],
            precipitation_probability_max=[float(v) for v in daily.get("precipitation_probability_max", [])],
            wind_speed_10m_max=[float(v) for v in daily.get("wind_speed_10m_max", [])],
            sunrise=[str(s) for s in daily.get("sunrise", [])] if "sunrise" in daily else None,
            sunset=[str(s) for s in daily.get("sunset", [])] if "sunset" in daily else None,
        )

        return WeatherResponse(
            latitude=lat,
            longitude=lon,
            timezone=raw_data.get("timezone", "Asia/Kolkata"),
            elevation=raw_data.get("elevation"),
            current=current_obj,
            hourly=hourly_obj,
            daily=daily_obj,
            provider="open_meteo",
            attribution="Weather data provided by Open-Meteo.com (CC BY 4.0)",
            retrieved_at=retrieved_at,
            valid_until=valid_until,
            is_cached=is_cached
        )

    async def get_weather_alerts(
        self,
        db: AsyncSession,
        latitude: float,
        longitude: float
    ) -> List[WeatherAlert]:
        """Derive urgent weather alerts for heavy rain, heat waves, or destructive winds."""
        forecast = await self.get_forecast(db, latitude, longitude)
        raw_dict = forecast.model_dump()
        raw_dict["current"] = forecast.current.model_dump()
        raw_dict["hourly"] = forecast.hourly.model_dump()
        raw_dict["daily"] = forecast.daily.model_dump()

        now = datetime.now(timezone.utc)
        alerts: List[WeatherAlert] = []

        # 1. Rain alert check
        precip_48h = sum(forecast.daily.precipitation_sum[:2]) if forecast.daily.precipitation_sum else 0.0
        if precip_48h >= 35.0:
            alerts.append(WeatherAlert(
                id=f"alert-rain-{int(now.timestamp())}",
                title="Heavy Rainfall Warning",
                severity="high" if precip_48h < 65.0 else "critical",
                headline=f"{precip_48h:.1f} mm rain expected in next 48 hours",
                description="Heavy precipitation forecast across the region. High risk of waterlogging in low-lying crop fields and root damage.",
                instruction="Open field drainage channels immediately. Do not apply fertilizer or foliar spray.",
                category="heavy_rain",
                effective_from=now,
                effective_to=now + timedelta(hours=48),
                source="Open-Meteo & Jai Kisan Risk Engine"
            ))

        # 2. High temperature alert check
        max_temp = max(forecast.daily.temperature_2m_max[:2]) if forecast.daily.temperature_2m_max else 0.0
        if max_temp >= 38.0:
            alerts.append(WeatherAlert(
                id=f"alert-heat-{int(now.timestamp())}",
                title="Heatwave Alert",
                severity="high",
                headline=f"Maximum temperatures reaching {max_temp:.1f}°C",
                description="Elevated temperature conditions will lead to high crop evapotranspiration and flower desiccation.",
                instruction="Schedule light irrigations during evening hours. Mulch soil to conserve moisture.",
                category="heatwave",
                effective_from=now,
                effective_to=now + timedelta(hours=48),
                source="Open-Meteo & Jai Kisan Risk Engine"
            ))

        # 3. Strong wind alert
        max_wind = max(forecast.daily.wind_speed_10m_max[:2]) if forecast.daily.wind_speed_10m_max else 0.0
        if max_wind >= 30.0:
            alerts.append(WeatherAlert(
                id=f"alert-wind-{int(now.timestamp())}",
                title="Strong Winds & Gusts Warning",
                severity="moderate" if max_wind < 45.0 else "high",
                headline=f"Wind gusts reaching {max_wind:.1f} km/h",
                description="High winds may cause crop lodging in tall crops (maize, paddy, cotton) and pesticide drift.",
                instruction="Postpone chemical spraying. Provide mechanical support or earthing up to vulnerable plants.",
                category="strong_winds",
                effective_from=now,
                effective_to=now + timedelta(hours=36),
                source="Open-Meteo & Jai Kisan Risk Engine"
            ))

        return alerts
