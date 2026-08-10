from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler  # type: ignore
from slowapi.errors import RateLimitExceeded  # type: ignore
import os

from app.config import settings
from app.database.mongodb import connect_to_mongo, close_mongo_connection
from app.middleware.error_handler import ErrorHandlerMiddleware
from app.middleware.rate_limit import limiter
from app.ai.chromadb_client import chromadb_client
from app.ai.rag import seed_career_knowledge

from app.routers.auth import router as auth_router
from app.routers.profile import router as profile_router
from app.routers.resume import router as resume_router
from app.routers.career import router as career_router
from app.routers.skillgap import router as skillgap_router
from app.routers.roadmap import router as roadmap_router
from app.routers.chat import router as chat_router
from app.routers.analytics import router as analytics_router
from app.routers.settings import router as settings_router
from app.routers.subscription import router as subscription_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage startup and shutdown lifecycle."""
    # Startup
    await connect_to_mongo()

    # Initialize ChromaDB
    try:
        chromadb_client.connect()
        await seed_career_knowledge()
        print("ChromaDB initialized with career knowledge base")
    except Exception as e:
        print(f"ChromaDB initialization warning: {e}")
        print("AI features will work without vector search enhancement")

    yield

    # Shutdown
    await close_mongo_connection()


app = FastAPI(
    title="AI Pathway API",
    description="AI-powered Career Guidance Platform API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

# Rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Error handler
app.add_middleware(ErrorHandlerMiddleware)

# Static files (uploads)
os.makedirs(settings.upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

# Register routers
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(resume_router)
app.include_router(career_router)
app.include_router(skillgap_router)
app.include_router(roadmap_router)
app.include_router(chat_router)
app.include_router(analytics_router)
app.include_router(settings_router)
app.include_router(subscription_router)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "name": settings.app_name,
        "version": "1.0.0",
        "status": "running",
        "docs": "/api/docs",
    }


@app.get("/api/health")
async def health_check():
    """Health check with service status."""
    from app.database.mongodb import client as mongo_client

    status = {"api": "healthy", "mongodb": "unknown", "chromadb": "unknown"}

    try:
        await mongo_client.admin.command("ping")
        status["mongodb"] = "healthy"
    except Exception:
        status["mongodb"] = "unhealthy"

    try:
        chromadb_client._client.heartbeat()
        status["chromadb"] = "healthy"
    except Exception:
        status["chromadb"] = "unavailable"

    return status
