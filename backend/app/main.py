"""Main FastAPI application for Jai Kisan agricultural advisory system."""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.core.init_db import init_db
from app.api import api_router

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("jai_kisan")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle event handler for DB creation and seeding on startup."""
    logger.info("Initializing database tables and seed knowledge base...")
    try:
        await init_db()
        logger.info("Database initialized successfully.")
    except Exception as exc:
        logger.error(f"Database initialization error: {exc}")
    yield
    logger.info("Shutting down Jai Kisan application...")


app = FastAPI(
    title=settings.APP_NAME,
    description="Real-time agricultural weather advisory and crop protection system for Indian farmers.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
origins = settings.CORS_ORIGINS
if "*" in origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


# Exception Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Return user-friendly validation error messages."""
    logger.warning(f"Validation error on {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": exc.errors(),
            "message": "Invalid input data provided",
        }
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all for unhandled exceptions."""
    logger.exception(f"Unhandled server error on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred. Please try again later.",
            "error_type": exc.__class__.__name__
        }
    )


# Root Health check endpoints
@app.get("/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
async def health_check():
    """Health check endpoint to verify service availability."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "weather_provider": settings.WEATHER_PROVIDER,
        "version": "1.0.0"
    }


@app.get("/", tags=["Root"])
async def root():
    """Welcome endpoint."""
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "docs": "/docs",
        "health": "/health",
        "version": "1.0.0"
    }


# Include API routers at both root and /api/v1 prefixes for maximum compatibility
app.include_router(api_router)
app.include_router(api_router, prefix=settings.API_V1_STR)
