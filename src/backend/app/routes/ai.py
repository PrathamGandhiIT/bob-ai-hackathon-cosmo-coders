"""AI Copilot API endpoints."""

from fastapi import APIRouter, Depends
import sqlite3

from app.database.connection import get_db
from app.models.schemas import AIRequest
from app.services.ai_provider import get_ai_response

router = APIRouter()


@router.post("/ai/copilot")
def ai_copilot(request: AIRequest, conn: sqlite3.Connection = Depends(get_db)):
    """Process an AI copilot query against current operational data."""
    result = get_ai_response(request.query, conn, request.context)
    return result
