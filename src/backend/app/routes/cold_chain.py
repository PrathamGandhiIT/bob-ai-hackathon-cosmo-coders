"""Cold-chain monitoring API endpoints."""

from fastapi import APIRouter, Depends
import sqlite3

from app.database.connection import get_db
from app.services.cold_chain import (
    get_cold_chain_shipments,
    get_cold_chain_for_shipment,
    get_cold_chain_alerts,
)

router = APIRouter()


@router.get("/cold-chain")
def list_cold_chain(conn: sqlite3.Connection = Depends(get_db)):
    """List all cold-chain shipments with sensor status."""
    shipments = get_cold_chain_shipments(conn)
    alerts = get_cold_chain_alerts(conn)

    return {
        "shipments": shipments,
        "total": len(shipments),
        "alert_count": len(alerts),
        "alerts": alerts,
    }


@router.get("/cold-chain/{shipment_id}")
def get_cold_chain_detail(
    shipment_id: str,
    conn: sqlite3.Connection = Depends(get_db),
):
    """Get detailed cold-chain data for a specific shipment."""
    data = get_cold_chain_for_shipment(shipment_id, conn)
    if not data:
        return {"error": f"No cold-chain data for shipment {shipment_id}"}
    return data
