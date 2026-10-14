from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class WeatherCurrent(BaseModel):
    time: str
    temperature_2m: float
    relative_humidity_2m: float
    precipitation: float
    wind_speed_10m: float
    wind_direction_10m: float
    apparent_temperature: float
    weather_code: int


class WeatherHourly(BaseModel):
    time: List[str]
    temperature_2m: List[float]
    relative_humidity_2m: List[float]
    precipitation_probability: List[float]
    precipitation: List[float]
    wind_speed_10m: List[float]
    wind_direction_10m: List[float]
    apparent_temperature: List[float]


class WeatherDaily(BaseModel):
    time: List[str]
    temperature_2m_max: List[float]
    temperature_2m_min: List[float]
    precipitation_sum: List[float]
    precipitation_probability_max: List[float]
    wind_speed_10m_max: List[float]
    sunrise: Optional[List[str]] = None
    sunset: Optional[List[str]] = None


class WeatherResponse(BaseModel):
    latitude: float
    longitude: float
    timezone: str
    elevation: Optional[float] = None
    current: WeatherCurrent
    hourly: WeatherHourly
    daily: WeatherDaily
    provider: str = "open_meteo"
    attribution: str = "Weather data provided by Open-Meteo.com (CC BY 4.0)"
    retrieved_at: datetime
    valid_until: datetime
    is_cached: bool = False


class WeatherAlert(BaseModel):
    id: str
    title: str
    severity: str  # info, moderate, high, critical
    headline: str
    description: str
    instruction: Optional[str] = None
    category: str  # heavy_rain, heatwave, strong_winds, pest_risk
    effective_from: datetime
    effective_to: datetime
    source: str = "Open-Meteo & Jai Kisan Risk Engine"
