# Jai Kisan — Deployment Guide

## Development Setup (Local)

### Prerequisites
- Python 3.11+ (tested with 3.14.6)
- Node.js 18+ (tested with 24.19)
- npm 9+ (tested with 12.0.2)
- Git

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd jai-kisan
```

2. **Set up the backend**
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
cp ../.env.example .env
# Edit .env as needed

# Initialize database
python -c "from app.core.init_db import init_database; import asyncio; asyncio.run(init_database())"

# Start the backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

3. **Set up the frontend**
```bash
cd frontend
npm install
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

### Running Tests

```bash
# Backend tests
cd backend
python -m pytest tests/ -v

# Frontend build check
cd frontend
npm run build
```

## Production Deployment (Docker)

### Prerequisites
- Docker and Docker Compose
- Domain name (optional)

### Steps

1. **Configure environment**
```bash
cp .env.example .env
# Edit .env with production values:
# - Set a strong SECRET_KEY
# - Configure DATABASE_URL for PostgreSQL
# - Set CORS_ORIGINS to your domain
# - Configure LLM_PROVIDER if using AI features
# - Set APP_ENV=production
# - Set DEBUG=false
```

2. **Build and start**
```bash
docker-compose up -d --build
```

3. **Run migrations**
```bash
docker-compose exec backend alembic upgrade head
```

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | Yes | sqlite+aiosqlite:///./jai_kisan.db | Database connection string |
| SECRET_KEY | Yes | (none) | JWT signing key — must be changed |
| JWT_ALGORITHM | No | HS256 | JWT algorithm |
| ACCESS_TOKEN_EXPIRE_MINUTES | No | 1440 | Token expiry (24h default) |
| WEATHER_PROVIDER | No | open_meteo | Weather data provider |
| LLM_PROVIDER | No | demo | LLM provider (demo/gemini/openai) |
| LLM_API_KEY | When LLM configured | (none) | LLM API key |
| CORS_ORIGINS | No | http://localhost:5173 | Allowed CORS origins |
| APP_ENV | No | development | Environment name |
| DEBUG | No | true | Enable debug mode |
| LOG_LEVEL | No | INFO | Logging level |

## Security Checklist for Production

- [ ] Change SECRET_KEY to a random 32+ character string
- [ ] Set DEBUG=false
- [ ] Configure proper CORS_ORIGINS
- [ ] Use PostgreSQL instead of SQLite
- [ ] Enable HTTPS
- [ ] Review rate limiting
- [ ] Audit admin accounts
- [ ] Configure log aggregation
- [ ] Set up database backups
- [ ] Review all .env values
