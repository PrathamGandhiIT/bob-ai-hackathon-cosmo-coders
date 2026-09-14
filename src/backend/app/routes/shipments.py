"""Shipment API endpoints."""

from fastapi import APIRouter, Depends, HTTPException
import sqlite3

from app.database.connection import get_db
from app.services.risk_engine import calculate_risk
from app.services.fleet_intelligence import recommend_fleet_for_shipment
from app.services.cold_chain import get_cold_chain_for_shipment
from app.services.rerouting_engine import get_reroute_recommendations

router = APIRouter()


@router.get("/shipments")
def list_shipments(
    status: str = None,
    priority: str = None,
    risk_level: str = None,
    conn: sqlite3.Connection = Depends(get_db),
):
    """List all shipments with computed risk scores."""
    query = "SELECT * FROM shipments"
    params = []
    conditions = []

    if status:
        conditions.append("status = ?")
        params.append(status)
    if priority:
        conditions.append("priority = ?")
        params.append(priority)

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    query += " ORDER BY shipment_id"
    shipments = conn.execute(query, params).fetchall()

    results = []
    for s in shipments:
        ship = dict(s)
        risk = calculate_risk(ship, conn)
        ship["risk_score"] = risk["risk_score"]
        ship["risk_level"] = risk["risk_level"]
        ship["risk_reasons"] = risk["reasons"]
        ship["recommended_actions"] = risk["recommended_actions"]
        ship["is_cold_chain"] = bool(ship["is_cold_chain"])
        val_usd = float(ship.get("value_usd", 0))
        val_inr = int(val_usd * 83)
        ship["value_inr"] = val_inr
        val_lakh = val_inr / 100000
        ship["value_inr_display"] = f"₹{val_lakh:.1f} Lakh" if val_lakh < 100 else f"₹{(val_lakh/100):.2f} Cr"
        results.append(ship)

    # Optional client-side risk filter
    if risk_level:
        results = [r for r in results if r["risk_level"] == risk_level]

    return {"shipments": results, "total": len(results)}


@router.get("/shipments/{shipment_id}")
def get_shipment(shipment_id: str, conn: sqlite3.Connection = Depends(get_db)):
    """Get detailed information for a single shipment."""
    shipment = conn.execute(
        "SELECT * FROM shipments WHERE shipment_id = ?", (shipment_id,)
    ).fetchone()

    if not shipment:
        raise HTTPException(status_code=404, detail=f"Shipment {shipment_id} not found")

    ship = dict(shipment)
    ship["is_cold_chain"] = bool(ship["is_cold_chain"])
    val_usd = float(ship.get("value_usd", 0))
    val_inr = int(val_usd * 83)
    ship["value_inr"] = val_inr
    val_lakh = val_inr / 100000
    ship["value_inr_display"] = f"₹{val_lakh:.1f} Lakh" if val_lakh < 100 else f"₹{(val_lakh/100):.2f} Cr"

    # Compute risk
    risk = calculate_risk(ship, conn)
    ship["risk_score"] = risk["risk_score"]
    ship["risk_level"] = risk["risk_level"]
    ship["risk_reasons"] = risk["reasons"]
    ship["recommended_actions"] = risk["recommended_actions"]

    # Get disruption details if affected
    if ship.get("disruption_id"):
        disruption = conn.execute(
            "SELECT * FROM disruptions WHERE disruption_id = ?",
            (ship["disruption_id"],),
        ).fetchone()
        ship["disruption"] = dict(disruption) if disruption else None

    # Get fleet recommendations
    ship["fleet_recommendations"] = recommend_fleet_for_shipment(shipment_id, conn)

    # Get multi-objective reroute alternatives with trade-offs
    reroute_data = get_reroute_recommendations(shipment_id, conn)
    ship["reroute_alternatives"] = reroute_data.get("alternatives", [])
    ship["recommended_reroute"] = reroute_data.get("recommended_option")

    # Get cold-chain data
    if ship["is_cold_chain"]:
        ship["cold_chain"] = get_cold_chain_for_shipment(shipment_id, conn)

    return ship


@router.get("/shipments/{shipment_id}/recommendations")
@router.get("/shipments/{shipment_id}/reroute-options")
def get_shipment_reroute_options(shipment_id: str, conn: sqlite3.Connection = Depends(get_db)):
    """Get Pareto-optimal rerouting recommendations and trade-offs for a shipment."""
    return get_reroute_recommendations(shipment_id, conn)
