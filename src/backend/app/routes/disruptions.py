"""Disruption API endpoints including simulation control."""

from fastapi import APIRouter, Depends
import sqlite3

from app.database.connection import get_db
from app.services.disruption_engine import (
    activate_simulation,
    deactivate_simulation,
    is_simulation_active,
)

router = APIRouter()


@router.get("/disruptions")
def list_disruptions(
    status: str = None,
    conn: sqlite3.Connection = Depends(get_db),
):
    """List all disruptions with affected shipment counts."""
    query = "SELECT * FROM disruptions"
    params = []
    if status:
        query += " WHERE status = ?"
        params.append(status)

    query += " ORDER BY start_time DESC"
    disruptions = conn.execute(query, params).fetchall()

    results = []
    for d in disruptions:
        dd = dict(d)
        # Count affected shipments
        affected = conn.execute(
            "SELECT COUNT(*) as cnt FROM shipments WHERE disruption_id = ?",
            (d["disruption_id"],),
        ).fetchone()
        dd["affected_shipment_count"] = affected["cnt"] if affected else 0
        results.append(dd)

    return {
        "disruptions": results,
        "total": len(results),
        "simulation_active": is_simulation_active(conn),
    }


@router.get("/disruptions/{disruption_id}")
def get_disruption(disruption_id: str, conn: sqlite3.Connection = Depends(get_db)):
    """Get detailed disruption information with affected shipments."""
    disruption = conn.execute(
        "SELECT * FROM disruptions WHERE disruption_id = ?", (disruption_id,)
    ).fetchone()

    if not disruption:
        return {"error": f"Disruption {disruption_id} not found"}

    dd = dict(disruption)

    # Get affected shipments
    affected = conn.execute(
        "SELECT shipment_id, cargo_description, priority, status, route FROM shipments WHERE disruption_id = ?",
        (disruption_id,),
    ).fetchall()
    dd["affected_shipments"] = [dict(s) for s in affected]
    dd["affected_shipment_count"] = len(affected)

    return dd


@router.post("/disruptions/simulate")
def simulate_disruption(conn: sqlite3.Connection = Depends(get_db)):
    """Activate the disruption simulation scenario."""
    result = activate_simulation(conn)
    return result


@router.post("/disruptions/reset")
def reset_simulation():
    """Reset the simulation and restore initial data state.

    Note: Does not use Depends(get_db) because reset_db() manages
    its own connections during the full re-seed process.
    """
    from app.database.connection import get_db_connection
    conn = get_db_connection()
    try:
        result = deactivate_simulation(conn)
        return result
    finally:
        conn.close()
