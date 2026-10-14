"""Open-Meteo API integration provider."""
import logging
from typing import Dict, Any, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)


class OpenMeteoError(Exception):
    """Base exception for Open-Meteo API errors."""
    pass


class OpenMeteoClient:
    """Client for interacting with Open-Meteo Weather API."""

    def __init__(
        self,
        base_url: Optional[str] = None,
        timeout: float = 10.0,
        http_client: Optional[httpx.AsyncClient] = None
    ):
        self.base_url = (base_url or settings.OPEN_METEO_BASE_URL).rstrip("/")
        self.timeout = timeout
        self._external_client = http_client

    async def fetch_forecast(self, latitude: float, longitude: float) -> Dict[str, Any]:
        """
        Fetch 7-day weather forecast from Open-Meteo API with current, hourly, and daily metrics.
        """
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": [
                "temperature_2m",
                "relative_humidity_2m",
                "precipitation",
                "wind_speed_10m",
                "wind_direction_10m",
                "apparent_temperature",
                "weather_code",
            ],
            "hourly": [
                "temperature_2m",
                "relative_humidity_2m",
                "precipitation_probability",
                "precipitation",
                "wind_speed_10m",
                "wind_direction_10m",
                "apparent_temperature",
            ],
            "daily": [
                "temperature_2m_max",
                "temperature_2m_min",
                "precipitation_sum",
                "precipitation_probability_max",
                "wind_speed_10m_max",
                "sunrise",
                "sunset",
            ],
            "timezone": "auto",
            "forecast_days": 7,
        }

        url = f"{self.base_url}/forecast"

        try:
            if self._external_client:
                response = await self._external_client.get(url, params=params, timeout=self.timeout)
            else:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.get(url, params=params)

            if response.status_code != 200:
                logger.error(f"Open-Meteo API returned {response.status_code}: {response.text}")
                raise OpenMeteoError(f"Open-Meteo API error: HTTP {response.status_code}")

            data = response.json()
            if not isinstance(data, dict) or "current" not in data:
                logger.error(f"Invalid response payload from Open-Meteo: {data}")
                raise OpenMeteoError("Invalid payload structure returned by weather provider")

            return data

        except httpx.TimeoutException as exc:
            logger.error(f"Timeout connecting to Open-Meteo: {exc}")
            raise OpenMeteoError("Open-Meteo weather service timed out after 10 seconds") from exc
        except httpx.RequestError as exc:
            logger.error(f"Network error querying Open-Meteo: {exc}")
            raise OpenMeteoError(f"Network error communicating with weather provider: {str(exc)}") from exc
        except Exception as exc:
            if isinstance(exc, OpenMeteoError):
                raise
            logger.exception("Unexpected error in OpenMeteoClient")
            raise OpenMeteoError(f"Unexpected weather provider error: {str(exc)}") from exc
