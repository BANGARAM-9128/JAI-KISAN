# Jai Kisan — Backend API

An agricultural weather advisory and crop protection system designed for Indian farmers, specifically calibrated for Andhra Pradesh agro-climatic zones and major crops (Rice, Cotton, Maize, Groundnut, and Chilli).

## Technology Stack
- **Framework**: FastAPI (async Python)
- **Database**: SQLite with `aiosqlite` and SQLAlchemy 2.0 ORM (schema portable to PostgreSQL)
- **Authentication**: JWT (JSON Web Tokens) with `bcrypt` password hashing
- **Weather Provider**: Open-Meteo API with localized SQLite caching and source attribution
- **Advisory Engine**: Rule-based agronomic risk evaluator and bilingual (Telugu + English) advisory generator
- **Knowledge Base**: Curated recommendations and packages of practices from ANGRAU, ICAR-CRIDA, and Dr. YSRHU

## Project Architecture
```
backend/
├── app/
│   ├── main.py                     # FastAPI application setup, CORS, lifespan, exception handlers
│   ├── core/
│   │   ├── config.py               # Pydantic Settings from .env
│   │   ├── security.py             # JWT & bcrypt authentication utilities
│   │   ├── database.py             # SQLAlchemy async engine & session maker
│   │   └── init_db.py              # Schema creation and initial data seeder
│   ├── models/                     # SQLAlchemy ORM Models
│   │   ├── user.py                 # User (email, role, language_pref)
│   │   ├── farmer_profile.py       # FarmerProfile (location, irrigation, soil)
│   │   ├── crop.py                 # CropRecord (crop name, variety, stage, area)
│   │   ├── weather.py              # WeatherCache (coordinates, forecast payload, validity)
│   │   ├── advisory.py             # Advisory (rule, recommendation, severity, Telugu translations)
│   │   ├── notification.py         # Notification (in-app alerts)
│   │   ├── feedback.py             # Feedback (usefulness, accuracy feedback)
│   │   ├── knowledge.py            # KnowledgeDocument (verified agricultural practices)
│   │   └── audit_log.py            # AuditLog
│   ├── schemas/                    # Pydantic Request & Response Schemas
│   ├── api/                        # API Routers
│   │   ├── deps.py                 # Auth & database dependency injection
│   │   ├── auth.py                 # /auth/register, /auth/login, /auth/me
│   │   ├── profiles.py             # /profile, /profile/setup
│   │   ├── crops.py                # CRUD /crops
│   │   ├── weather.py              # /weather, /weather/alerts
│   │   ├── advisories.py           # /advisories, /advisories/generate
│   │   ├── notifications.py        # /notifications, /notifications/{id}/read
│   │   ├── feedback.py             # /feedback
│   │   ├── assistant.py            # /assistant/chat
│   │   ├── admin.py                # /admin/stats, /admin/rules, /admin/health
│   │   └── knowledge.py            # /knowledge/search
│   ├── services/                   # Business Logic Layer
│   │   ├── weather_service.py      # Weather fetching, caching, alert derivation
│   │   ├── advisory_service.py     # Advisory orchestration & notification dispatch
│   │   ├── notification_service.py # In-app notifications
│   │   ├── knowledge_service.py    # Knowledge search
│   │   └── assistant_service.py    # Bilingual conversational agronomy assistant
│   ├── providers/                  # External Service Adapters
│   │   └── open_meteo.py           # Open-Meteo HTTP client
│   └── advisory_engine/            # Independent Advisory Module
│       ├── crop_data.py            # Andhra Pradesh crop growth stages and requirements
│       ├── rules.py                # Agronomic risk rules and thresholds
│       ├── risk_evaluator.py       # Weather risk evaluator (normal, boundary, missing data)
│       └── advisory_generator.py   # Bilingual advisory constructor
├── tests/                          # Automated Pytest Suite
│   ├── conftest.py                 # In-memory SQLite fixtures and test clients
│   ├── test_advisory_engine.py     # Rule and risk engine unit tests
│   ├── test_weather_provider.py    # Open-Meteo client & cache tests
│   ├── test_auth.py                # Authentication endpoint tests
│   └── test_api.py                 # Full integration test suite
├── requirements.txt
├── pytest.ini
└── .env
```

## Running the Application
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Initialize database with tables and seed data
python -m app.core.init_db

# 3. Start development server
uvicorn app.main:app --reload --port 8000
```
API Documentation will be available at `http://localhost:8000/docs`.

## Running Tests
```bash
python -m pytest tests/ -v
```

## Seed Credentials
- **Admin**: `admin@jaikisan.in` / `Admin@123456`
- **Demo Farmer**: `farmer@jaikisan.in` / `Farmer@123456`
