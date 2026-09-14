"""Fleet API endpoints."""

from fastapi import APIRouter, Depends
import sqlite3

from app.database.connection import get_db
from app.services.fleet_intelligence import get_fleet_summary, recommend_fleet_for_shipment

router = APIRouter()


@router.get("/fleet")
def list_fleet(
    status: str = None,
    conn: sqlite3.Connection = Depends(get_db),
):
    """List all fleet vehicles with optional status filter."""
    query = "SELECT * FROM fleet"
    params = []
    if status:
        query += " WHERE status = ?"
        params.append(status)

    query += " ORDER BY vehicle_id"
    vehicles = conn.execute(query, params).fetchall()

    results = []
    for v in vehicles:
        vd = dict(v)
        vd["is_refrigerated"] = bool(vd["is_refrigerated"])
        results.append(vd)

    summary = get_fleet_summary(conn)

    return {
        "vehicles": results,
        "total": len(results),
        "summary": summary,
    }


@router.get("/fleet/recommendations/{shipment_id}")
def get_fleet_recommendations(
    shipment_id: str,
    conn: sqlite3.Connection = Depends(get_db),
):
    """Get fleet recommendations for a specific shipment."""
    recommendations = recommend_fleet_for_shipment(shipment_id, conn)
    return {
        "shipment_id": shipment_id,
        "recommendations": recommendations,
        "total": len(recommendations),
    }
