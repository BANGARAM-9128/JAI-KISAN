"""Tests for Open-Meteo provider client and WeatherService caching."""
import pytest
import httpx
from unittest.mock import AsyncMock, patch
from app.providers.open_meteo import OpenMeteoClient, OpenMeteoError
from app.services.weather_service import WeatherService
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_open_meteo_client_success(mock_open_meteo_payload):
    """Test successful OpenMeteoClient fetch with mocked HTTP response."""
    mock_response = httpx.Response(
        status_code=200,
        json=mock_open_meteo_payload,
        request=httpx.Request("GET", "https://api.open-meteo.com/v1/forecast")
    )

    mock_http_client = AsyncMock(spec=httpx.AsyncClient)
    mock_http_client.get = AsyncMock(return_value=mock_response)

    client = OpenMeteoClient(http_client=mock_http_client)
    data = await client.fetch_forecast(latitude=15.82, longitude=78.03)

    assert data["latitude"] == 15.82
    assert "current" in data
    assert "hourly" in data
    assert "daily" in data
    assert data["current"]["temperature_2m"] == 31.5


@pytest.mark.asyncio
async def test_open_meteo_client_timeout():
    """Test OpenMeteoClient timeout exception handling."""
    mock_http_client = AsyncMock(spec=httpx.AsyncClient)
    mock_http_client.get = AsyncMock(side_effect=httpx.TimeoutException("Connection timed out"))

    client = OpenMeteoClient(http_client=mock_http_client)
    with pytest.raises(OpenMeteoError) as exc_info:
        await client.fetch_forecast(latitude=15.82, longitude=78.03)

    assert "timed out" in str(exc_info.value).lower()


@pytest.mark.asyncio
async def test_open_meteo_client_http_error():
    """Test OpenMeteoClient handling of HTTP 500 status."""
    mock_response = httpx.Response(
        status_code=500,
        text="Internal Server Error",
        request=httpx.Request("GET", "https://api.open-meteo.com/v1/forecast")
    )
    mock_http_client = AsyncMock(spec=httpx.AsyncClient)
    mock_http_client.get = AsyncMock(return_value=mock_response)

    client = OpenMeteoClient(http_client=mock_http_client)
    with pytest.raises(OpenMeteoError) as exc_info:
        await client.fetch_forecast(latitude=15.82, longitude=78.03)

    assert "500" in str(exc_info.value)


@pytest.mark.asyncio
async def test_weather_service_caching(db_session: AsyncSession, mock_open_meteo_payload):
    """Test that WeatherService caches results in SQLite and respects force_refresh."""
    mock_client = AsyncMock(spec=OpenMeteoClient)
    mock_client.fetch_forecast = AsyncMock(return_value=mock_open_meteo_payload)

    service = WeatherService(client=mock_client)

    # 1. First fetch -> calls provider
    res1 = await service.get_forecast(db=db_session, latitude=15.82, longitude=78.03)
    assert res1.is_cached is False
    assert mock_client.fetch_forecast.call_count == 1
    assert "Open-Meteo" in res1.attribution

    # 2. Second fetch at same coords -> served from cache
    res2 = await service.get_forecast(db=db_session, latitude=15.82, longitude=78.03)
    assert res2.is_cached is True
    assert mock_client.fetch_forecast.call_count == 1  # Not called again

    # 3. Third fetch with force_refresh -> calls provider again
    res3 = await service.get_forecast(db=db_session, latitude=15.82, longitude=78.03, force_refresh=True)
    assert res3.is_cached is False
    assert mock_client.fetch_forecast.call_count == 2


@pytest.mark.asyncio
async def test_weather_service_alerts_derivation(db_session: AsyncSession):
    """Test derivation of extreme weather alerts from forecast metrics."""
    extreme_payload = {
        "latitude": 16.5,
        "longitude": 80.6,
        "timezone": "Asia/Kolkata",
        "current": {
            "time": "2026-10-14T12:00",
            "temperature_2m": 39.0,
            "relative_humidity_2m": 50.0,
            "precipitation": 10.0,
            "wind_speed_10m": 35.0,
            "wind_direction_10m": 120.0,
            "apparent_temperature": 42.0,
            "weather_code": 95
        },
        "hourly": {
            "time": ["2026-10-14T12:00"],
            "temperature_2m": [39.0],
            "relative_humidity_2m": [50.0],
            "precipitation_probability": [90.0],
            "precipitation": [25.0],
            "wind_speed_10m": [35.0],
            "wind_direction_10m": [120.0],
            "apparent_temperature": [42.0],
        },
        "daily": {
            "time": ["2026-10-14", "2026-10-15"],
            "temperature_2m_max": [40.0, 41.0],
            "temperature_2m_min": [28.0, 27.0],
            "precipitation_sum": [45.0, 15.0],
            "precipitation_probability_max": [95.0, 70.0],
            "wind_speed_10m_max": [38.0, 32.0],
        }
    }

    mock_client = AsyncMock(spec=OpenMeteoClient)
    mock_client.fetch_forecast = AsyncMock(return_value=extreme_payload)

    service = WeatherService(client=mock_client)
    alerts = await service.get_weather_alerts(db=db_session, latitude=16.5, longitude=80.6)

    assert len(alerts) >= 2
    categories = [a.category for a in alerts]
    assert "heavy_rain" in categories
    assert "heatwave" in categories
    assert "strong_winds" in categories
