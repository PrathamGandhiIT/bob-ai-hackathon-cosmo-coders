"""Supply Chain Control Tower — FastAPI Application.

AI-powered logistics operations dashboard for the IBM Bob AI Innovation Hackathon.
Team: Cosmo Coders | Problem: L2 — Supply Chain Disruption & Fleet Optimization
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.connection import init_db, is_db_seeded
from app.database.seed import seed_database

# Import route modules
from app.routes import health, shipments, disruptions, fleet, cold_chain, risk, ai, dashboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — initialize database on startup."""
    print(f"[START] {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"   Environment: {settings.APP_ENV}")
    print(f"   AI Provider: {settings.AI_PROVIDER}")

    # Initialize database schema
    init_db()

    # Seed data if the database is empty
    if not is_db_seeded():
        print("[SEED] Seeding database with initial data...")
        seed_database()
    else:
        print("[OK] Database already seeded.")

    yield

    print("[STOP] Shutting down.")


# ── Create application ────────────────────────────────────────────────────────

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "AI-powered supply chain control tower for monitoring disruptions, "
        "managing fleet assets, tracking cold-chain integrity, and generating "
        "operational recommendations."
    ),
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routes ───────────────────────────────────────────────────────────

app.include_router(health.router,      prefix="/api", tags=["Health"])
app.include_router(dashboard.router,   prefix="/api", tags=["Dashboard"])
app.include_router(shipments.router,   prefix="/api", tags=["Shipments"])
app.include_router(disruptions.router, prefix="/api", tags=["Disruptions"])
app.include_router(fleet.router,       prefix="/api", tags=["Fleet"])
app.include_router(cold_chain.router,  prefix="/api", tags=["Cold Chain"])
app.include_router(risk.router,        prefix="/api", tags=["Risk"])
app.include_router(ai.router,          prefix="/api", tags=["AI Copilot"])


# ── Root redirect ─────────────────────────────────────────────────────────────

@app.get("/")
def root():
    """API root — returns service information."""
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/api/health",
    }
