"""Risk assessment API endpoints."""

from fastapi import APIRouter, Depends
import sqlite3

from app.database.connection import get_db
from app.services.risk_engine import get_risk_summary, calculate_all_risks

router = APIRouter()


@router.get("/risk/summary")
def risk_summary(conn: sqlite3.Connection = Depends(get_db)):
    """Return aggregate risk statistics across all shipments."""
    summary = get_risk_summary(conn)
    return summary


@router.get("/risk/assessments")
def risk_assessments(conn: sqlite3.Connection = Depends(get_db)):
    """Return risk assessments for all active shipments."""
    assessments = calculate_all_risks(conn)
    return {"assessments": assessments, "total": len(assessments)}
