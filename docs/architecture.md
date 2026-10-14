# Jai Kisan — Architecture Documentation

## System Overview

Jai Kisan is a weather-to-agricultural-decision platform designed for small and marginal farmers in Andhra Pradesh, India. It transforms weather forecasts into actionable, crop-specific recommendations in Telugu and English.

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TS)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐│
│  │ Dashboard │ │Advisories│ │Assistant │ │  Admin Dashboard  ││
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────────┬─────────┘│
│       │             │            │                 │          │
│  ┌────┴─────────────┴────────────┴─────────────────┴────┐    │
│  │              API Client (Axios + TanStack Query)      │    │
│  └───────────────────────┬──────────────────────────────┘    │
└──────────────────────────┼───────────────────────────────────┘
                           │ HTTP/REST
┌──────────────────────────┼───────────────────────────────────┐
│                    BACKEND (FastAPI)                          │
│  ┌───────────────────────┴──────────────────────────────┐    │
│  │                   API Layer (Routers)                  │    │
│  └──┬────────┬────────┬────────┬────────┬───────────────┘    │
│     │        │        │        │        │                     │
│  ┌──┴──┐ ┌──┴──┐ ┌──┴────┐ ┌┴─────┐ ┌┴────────┐           │
│  │Auth │ │Prof.│ │Weather│ │Advis.│ │Assistant│            │
│  │Svc  │ │Svc  │ │Svc    │ │Svc   │ │Svc      │            │
│  └─────┘ └─────┘ └──┬────┘ └┬─────┘ └┬────────┘           │
│                      │       │        │                      │
│  ┌───────────────────┴───────┴────────┴──────────────┐      │
│  │              Advisory Engine (Separate Module)      │      │
│  │  ┌──────────┐ ┌──────────┐ ┌────────────────────┐ │      │
│  │  │Risk Rules│ │Evaluator │ │Advisory Generator  │ │      │
│  │  └──────────┘ └──────────┘ └────────────────────┘ │      │
│  └───────────────────────────────────────────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              Provider Layer (Adapters)                │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │    │
│  │  │Open-Meteo│ │LLM Adapt.│ │Notif.    │             │    │
│  │  └──────────┘ └──────────┘ └──────────┘             │    │
│  └──────────────────────────────────────────────────────┘    │
│                           │                                   │
│  ┌────────────────────────┴─────────────────────────────┐    │
│  │              Database (SQLite dev / PostgreSQL prod)   │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘

                    EXTERNAL SERVICES
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│Open-Meteo│ │ LLM API  │ │ Firebase │ │ Bhashini │
│(Weather) │ │(Optional)│ │(Optional)│ │(Optional)│
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

## Key Design Principles

### 1. Separation of Concerns
- **Advisory Engine** is a standalone Python module with no HTTP or database dependencies
- **Provider Adapters** abstract external services behind clean interfaces
- **API Layer** handles HTTP concerns only (validation, auth, serialization)
- **Service Layer** orchestrates business logic

### 2. Data Integrity
- All weather data carries source attribution and timestamps
- Forecasts are distinguished from observations
- Demo data is explicitly labeled
- Stale data triggers warnings, not silent serving

### 3. Agricultural Safety
- Rules reference authoritative sources (ICAR, KVK, SAU publications)
- No pesticide dosages without verified guidance
- Uncertainty is communicated, not hidden
- LLM responses are grounded in retrieved knowledge

### 4. Accessibility
- Telugu-first interface with English fallback
- Large touch targets for mobile use
- Voice input via Web Speech API
- Works on low-cost Android devices
- Graceful degradation when features aren't supported

## Data Flow: Advisory Generation

```
1. Farmer selects crop + location
           │
2. Weather Service fetches forecast (Open-Meteo)
           │
3. Risk Evaluator checks rules against weather
           │
4. Advisory Generator creates crop-specific advice
           │
5. Knowledge Service retrieves supporting documents
           │
6. Advisory stored with source + confidence
           │
7. Notification created if severity warrants it
           │
8. Farmer views advisory with full context
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19, TypeScript, Vite | UI framework |
| Styling | Tailwind CSS | Utility-first CSS |
| State | TanStack Query | Server state management |
| Charts | Recharts | Weather & crop visualizations |
| Backend | Python 3.14, FastAPI | API server |
| ORM | SQLAlchemy (async) | Database access |
| Auth | JWT (PyJWT) | Authentication |
| HTTP Client | HTTPX | External API calls |
| Database (dev) | SQLite + aiosqlite | Development database |
| Database (prod) | PostgreSQL | Production database |
| Weather | Open-Meteo API | Free weather data |
| LLM | Provider adapter | Configurable AI backend |

## Security Model

- JWT tokens for authentication
- Role-based access (farmer, expert, admin)
- API keys never in frontend code
- Input validation via Pydantic schemas
- CORS restricted to known origins
- Audit logging for admin actions
