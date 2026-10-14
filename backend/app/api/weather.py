"""Weather API endpoints for forecasts and alerts."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.weather import WeatherResponse, WeatherAlert
from app.services.weather_service import WeatherService
from app.providers.open_meteo import OpenMeteoError
from app.api.deps import get_optional_current_user
from app.models.user import User

router = APIRouter(prefix="/weather", tags=["Weather"])
weather_service = WeatherService()


@router.get("", response_model=WeatherResponse)
async def get_weather(
    lat: Optional[float] = Query(None, ge=-90.0, le=90.0, description="Latitude"),
    lon: Optional[float] = Query(None, ge=-180.0, le=180.0, description="Longitude"),
    force_refresh: bool = Query(False, description="Bypass cache and fetch fresh data"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get 7-day weather forecast with hourly and daily agronomic metrics.
    Caches data locally and includes complete source attribution and timestamps.
    """
    target_lat = lat
    target_lon = lon

    # Fallback to user's saved profile coordinates if not specified
    if target_lat is None or target_lon is None:
        if current_user and current_user.profile:
            target_lat = current_user.profile.latitude
            target_lon = current_user.profile.longitude
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Coordinates 'lat' and 'lon' query parameters are required"
            )

    try:
        forecast = await weather_service.get_forecast(
            db=db,
            latitude=target_lat,
            longitude=target_lon,
            force_refresh=force_refresh
        )
        return forecast
    except OpenMeteoError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc)
        )


@router.get("/alerts", response_model=List[WeatherAlert])
async def get_weather_alerts(
    lat: Optional[float] = Query(None, ge=-90.0, le=90.0),
    lon: Optional[float] = Query(None, ge=-180.0, le=180.0),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Evaluate upcoming weather for severe risks (heavy rain, heatwaves, damaging winds).
    """
    target_lat = lat
    target_lon = lon

    if target_lat is None or target_lon is None:
        if current_user and current_user.profile:
            target_lat = current_user.profile.latitude
            target_lon = current_user.profile.longitude
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Coordinates 'lat' and 'lon' query parameters are required"
            )

    try:
        alerts = await weather_service.get_weather_alerts(
            db=db,
            latitude=target_lat,
            longitude=target_lon
        )
        return alerts
    except OpenMeteoError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc)
        )
