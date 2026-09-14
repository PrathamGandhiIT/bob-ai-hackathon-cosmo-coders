"""Core configuration module."""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""

    APP_NAME: str = "SupplyGuard AI — Autonomous Control Tower"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = os.getenv("APP_ENV", "development")
    APP_PORT: int = int(os.getenv("APP_PORT", "8000"))

    # Database
    DB_PATH: str = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "supply_chain.db",
    )

    # Seed data directory
    SEED_DATA_DIR: str = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "seed_data",
    )

    # AI Provider
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "fallback")
    WATSONX_API_KEY: str = os.getenv("WATSONX_API_KEY") or os.getenv("WATSONX_APIKEY") or ""
    WATSONX_PROJECT_ID: str = os.getenv("WATSONX_PROJECT_ID", "")
    WATSONX_URL: str = os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")

    # CORS
    CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]

    # Simulation disruption template
    SIMULATION_DISRUPTION_ID: str = "DIS-100"


settings = Settings()
