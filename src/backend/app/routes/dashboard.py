"""Dashboard KPI aggregation endpoint."""

from fastapi import APIRouter, Depends
import sqlite3

from app.database.connection import get_db
from app.services.risk_engine import calculate_all_risks
from app.services.cold_chain import get_cold_chain_alerts
from app.services.disruption_engine import is_simulation_active

router = APIRouter()


@router.get("/dashboard")
def get_dashboard(conn: sqlite3.Connection = Depends(get_db)):
    """Return all KPIs needed for the overview dashboard in a single call."""
    # Shipment counts
    total = conn.execute("SELECT COUNT(*) as cnt FROM shipments").fetchone()["cnt"]
    delivered = conn.execute(
        "SELECT COUNT(*) as cnt FROM shipments WHERE status = 'Delivered'"
    ).fetchone()["cnt"]
    delayed = conn.execute(
        "SELECT COUNT(*) as cnt FROM shipments WHERE status = 'Delayed'"
    ).fetchone()["cnt"]
    in_transit = conn.execute(
        "SELECT COUNT(*) as cnt FROM shipments WHERE status = 'In Transit'"
    ).fetchone()["cnt"]

    # Risk breakdown
    risks = calculate_all_risks(conn)
    critical_shipments = [r for r in risks if r["risk_level"] == "Critical"]
    high_risk = [r for r in risks if r["risk_level"] == "High"]
    affected = [r for r in risks if r["risk_score"] > 24]

    # Disruption count
    active_disruptions = conn.execute(
        "SELECT COUNT(*) as cnt FROM disruptions WHERE status = 'Active'"
    ).fetchone()["cnt"]

    # Fleet stats
    idle_fleet = conn.execute(
        "SELECT COUNT(*) as cnt FROM fleet WHERE status = 'Idle'"
    ).fetchone()["cnt"]
    total_fleet = conn.execute(
        "SELECT COUNT(*) as cnt FROM fleet"
    ).fetchone()["cnt"]

    # Cold-chain alerts
    cc_alerts = get_cold_chain_alerts(conn)

    # Simulation status
    sim_active = is_simulation_active(conn)

    # Risk distribution for chart
    risk_dist = {"Low": 0, "Medium": 0, "High": 0, "Critical": 0}
    for r in risks:
        risk_dist[r["risk_level"]] += 1

    # Status distribution for chart
    status_dist = {
        "In Transit": in_transit,
        "Delivered": delivered,
        "Delayed": delayed,
        "At Origin": conn.execute(
            "SELECT COUNT(*) as cnt FROM shipments WHERE status = 'At Origin'"
        ).fetchone()["cnt"],
    }

    # Top critical shipments for dashboard panel
    top_critical = []
    for r in sorted(critical_shipments + high_risk, key=lambda x: -x["risk_score"])[:5]:
        ship = conn.execute(
            "SELECT shipment_id, cargo_description, origin, destination, priority, status "
            "FROM shipments WHERE shipment_id = ?",
            (r["shipment_id"],),
        ).fetchone()
        if ship:
            top_critical.append({
                **dict(ship),
                "risk_score": r["risk_score"],
                "risk_level": r["risk_level"],
            })

    # Active disruptions detail
    disruption_list = conn.execute(
        "SELECT * FROM disruptions WHERE status = 'Active' ORDER BY severity DESC"
    ).fetchall()
    active_disruption_details = []
    for d in disruption_list:
        dd = dict(d)
        aff = conn.execute(
            "SELECT COUNT(*) as cnt FROM shipments WHERE disruption_id = ?",
            (d["disruption_id"],),
        ).fetchone()
        dd["affected_shipment_count"] = aff["cnt"] if aff else 0
        active_disruption_details.append(dd)

    return {
        "kpis": {
            "total_shipments": total,
            "affected_shipments": len(affected),
            "critical_shipments": len(critical_shipments),
            "active_disruptions": active_disruptions,
            "idle_fleet_assets": idle_fleet,
            "cold_chain_alerts": len(cc_alerts),
        },
        "simulation_active": sim_active,
        "risk_distribution": risk_dist,
        "status_distribution": status_dist,
        "fleet_summary": {
            "total": total_fleet,
            "idle": idle_fleet,
            "active": total_fleet - idle_fleet,
        },
        "top_critical_shipments": top_critical,
        "active_disruptions": active_disruption_details,
        "cold_chain_alerts": cc_alerts,
    }
