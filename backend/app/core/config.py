from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    PROJECT_NAME: str = "Jai Kisan"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "change-this-to-a-random-secret-key-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    DATABASE_URL: str = "sqlite+aiosqlite:///./jai_kisan.db"

    # Weather Provider
    WEATHER_PROVIDER: str = "open_meteo"
    OPEN_METEO_BASE_URL: str = "https://api.open-meteo.com/v1"
    WEATHER_CACHE_MINUTES: int = 60

    # LLM Provider
    LLM_PROVIDER: str = "demo"
    LLM_API_KEY: str | None = None
    LLM_MODEL: str = "gemini-pro"

    # Notification & Voice
    NOTIFICATION_PROVIDER: str = "in_app"
    VOICE_PROVIDER: str = "browser"

    # Application
    APP_NAME: str = "Jai Kisan"
    APP_ENV: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

    @field_validator("CORS_ORIGINS", mode="after")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return list(v)


settings = Settings()
