# 🌾 Jai Kisan — జై కిసాన్

### Agricultural Weather Advisory System

Jai Kisan transforms weather forecasts into actionable, crop-specific recommendations for farmers in Andhra Pradesh, India. Available in Telugu and English.

---

## ✨ Features

- **🌤️ Weather Dashboard** — Real-time forecasts from Open-Meteo with hourly and 7-day views
- **🌱 Crop-Specific Advisories** — Weather-informed recommendations for sowing, irrigation, spraying, and harvesting
- **⚠️ Weather Risk Alerts** — Heavy rain, extreme heat, strong wind, and crop disease risk notifications
- **🤖 AI Assistant** — Conversational agricultural guidance grounded in verified knowledge
- **🗣️ Telugu Language** — Full Telugu interface with voice input support
- **📊 Farmer Feedback** — Track advisory usefulness and improve recommendations
- **🔧 Admin Dashboard** — Manage rules, review feedback, monitor system health

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm 9+

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
cp ../.env.example .env

# Initialize database with seed data
python -c "from app.core.init_db import init_database; import asyncio; asyncio.run(init_database())"

# Start the server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Access
- **App**: http://localhost:5173
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🧪 Testing

```bash
# Backend tests
cd backend && python -m pytest tests/ -v

# Frontend type check & build
cd frontend && npm run build
```

## 🏗️ Architecture

```
jai-kisan/
├── frontend/          # React + TypeScript + Vite
│   └── src/
│       ├── pages/     # All application pages
│       ├── components/# Reusable UI components
│       ├── i18n/      # Telugu & English translations
│       └── services/  # API client
├── backend/           # Python + FastAPI
│   └── app/
│       ├── api/       # REST endpoints
│       ├── models/    # SQLAlchemy models
│       ├── services/  # Business logic
│       ├── providers/ # External API adapters
│       └── advisory_engine/  # Rule-based recommendations
├── docs/              # Architecture & source documentation
└── .env.example       # Configuration template
```

See [Architecture Documentation](docs/architecture.md) for details.

## 🌾 Supported Crops

| Crop | Telugu | Seasons |
|------|--------|---------|
| Rice | వరి | Kharif, Rabi |
| Cotton | పత్తి | Kharif |
| Maize | మొక్కజొన్న | Kharif, Rabi |
| Groundnut | వేరుశనగ | Kharif, Rabi |
| Chilli | మిర్చి | Kharif, Rabi |
| Bengal Gram | శనగ | Rabi |

## 📡 Data Sources

| Source | Status | Purpose |
|--------|--------|---------|
| [Open-Meteo](https://open-meteo.com) | ✅ Active | Weather forecasts |
| IMD | 🔶 Interface ready | Official weather warnings |
| ICAR/ANGRAU | 📚 Referenced | Agricultural guidance |
| LLM (Gemini/OpenAI) | 🔶 Demo mode | AI explanations |

## ⚙️ Configuration

Copy `.env.example` to `backend/.env` and configure:

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | JWT signing key (change in production!) |
| `LLM_PROVIDER` | `demo` / `gemini` / `openai` |
| `LLM_API_KEY` | API key for AI assistant |

See [Deployment Guide](docs/deployment.md) for full configuration reference.

## 📖 Documentation

- [Architecture](docs/architecture.md) — System design and data flows
- [Database Schema](docs/database.md) — Complete data model
- [Agricultural Sources](docs/agricultural_sources.md) — Data sources and crop knowledge
- [API Integrations](docs/api_integrations.md) — External service setup
- [Deployment](docs/deployment.md) — Setup and deployment guide

## ⚠️ Disclaimers

- Weather forecasts are inherently uncertain — this is not a guarantee
- Agricultural recommendations are general guidance, not field-specific prescriptions
- Always consult local agricultural extension officers for chemical application advice
- Demo mode data is clearly labeled and should not be used for real farming decisions

## 📄 License

This project is developed for educational and research purposes.

---

*జై కిసాన్ — Jai Kisan — Victory to the Farmer* 🌾
