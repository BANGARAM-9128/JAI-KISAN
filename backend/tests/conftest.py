"""Pytest test configuration and fixtures with in-memory SQLite and mock services."""
import asyncio
import pytest
import pytest_asyncio
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.core.database import Base, get_db
from app.core.security import create_access_token, get_password_hash
from app.main import app
from app.models.user import User
from app.models.farmer_profile import FarmerProfile
from app.models.crop import CropRecord
from datetime import date, timedelta

# In-memory SQLite database URL for tests
TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DB_URL,
    echo=False,
    connect_args={"check_same_thread": False}
)

TestSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provide a fresh in-memory database session for each test function."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestSessionLocal() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Provide an HTTP async test client with overridden database dependency."""
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_farmer_user(db_session: AsyncSession) -> User:
    """Create a verified test farmer user in DB."""
    user = User(
        email="test_farmer@jaikisan.in",
        password_hash=get_password_hash("Secret@123"),
        role="farmer",
        language_pref="te"
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    profile = FarmerProfile(
        user_id=user.id,
        display_name="Test Farmer",
        village="Kallur",
        district="Kurnool",
        state="Andhra Pradesh",
        latitude=15.82,
        longitude=78.03,
        irrigation_type="borewell",
        soil_type="black_cotton",
        farm_size_acres=5.0
    )
    db_session.add(profile)
    await db_session.commit()
    await db_session.refresh(profile)

    crop = CropRecord(
        farmer_profile_id=profile.id,
        crop_name="cotton",
        variety="Bollgard II",
        sowing_date=date.today() - timedelta(days=60),
        growth_stage="flowering",
        field_area_acres=3.0,
        is_active=True
    )
    db_session.add(crop)
    await db_session.commit()

    return user


@pytest_asyncio.fixture
async def test_admin_user(db_session: AsyncSession) -> User:
    """Create a verified test admin user in DB."""
    admin = User(
        email="test_admin@jaikisan.in",
        password_hash=get_password_hash("AdminSecret@123"),
        role="admin",
        language_pref="en"
    )
    db_session.add(admin)
    await db_session.commit()
    await db_session.refresh(admin)
    return admin


@pytest.fixture
def farmer_auth_headers(test_farmer_user: User) -> dict:
    """Generate authorization headers for test farmer."""
    token = create_access_token(
        subject=test_farmer_user.id,
        extra_claims={"email": test_farmer_user.email, "role": test_farmer_user.role}
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_auth_headers(test_admin_user: User) -> dict:
    """Generate authorization headers for test admin."""
    token = create_access_token(
        subject=test_admin_user.id,
        extra_claims={"email": test_admin_user.email, "role": test_admin_user.role}
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def mock_open_meteo_payload() -> dict:
    """Rich Open-Meteo response structure for testing."""
    times_hourly = [f"2026-10-14T{h:02d}:00" for h in range(48)]
    times_daily = [f"2026-10-{14+d:02d}" for d in range(7)]

    return {
        "latitude": 15.82,
        "longitude": 78.03,
        "timezone": "Asia/Kolkata",
        "elevation": 280.0,
        "current": {
            "time": "2026-10-14T12:00",
            "temperature_2m": 31.5,
            "relative_humidity_2m": 68.0,
            "precipitation": 0.0,
            "wind_speed_10m": 12.4,
            "wind_direction_10m": 190.0,
            "apparent_temperature": 34.0,
            "weather_code": 1
        },
        "hourly": {
            "time": times_hourly,
            "temperature_2m": [30.0 + (i % 5) for i in range(48)],
            "relative_humidity_2m": [70.0 + (i % 20) for i in range(48)],
            "precipitation_probability": [10.0 + (i % 30) for i in range(48)],
            "precipitation": [0.0 if i % 6 != 0 else 2.5 for i in range(48)],
            "wind_speed_10m": [10.0 + (i % 10) for i in range(48)],
            "wind_direction_10m": [180.0 for _ in range(48)],
            "apparent_temperature": [32.0 + (i % 5) for i in range(48)],
        },
        "daily": {
            "time": times_daily,
            "temperature_2m_max": [34.0, 35.0, 33.5, 32.0, 31.0, 33.0, 34.0],
            "temperature_2m_min": [22.0, 23.0, 22.5, 21.0, 20.5, 22.0, 22.0],
            "precipitation_sum": [5.0, 8.0, 15.0, 2.0, 0.0, 0.0, 0.0],
            "precipitation_probability_max": [45.0, 60.0, 75.0, 20.0, 10.0, 5.0, 5.0],
            "wind_speed_10m_max": [18.0, 22.0, 25.0, 15.0, 12.0, 10.0, 11.0],
            "sunrise": [f"2026-10-{14+d:02d}T06:05" for d in range(7)],
            "sunset": [f"2026-10-{14+d:02d}T17:55" for d in range(7)],
        }
    }
