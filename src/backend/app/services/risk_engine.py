"""Risk scoring engine for shipment risk assessment.

This is a prototype operational risk scoring model for demonstration purposes.
It is NOT a regulatory or safety-certified risk standard.
Scores are computed deterministically from observable shipment and disruption data.

Score Range: 0–100
Levels:
    0–24  = Low
    25–49 = Medium
    50–74 = High
    75–100 = Critical
"""

from __future__ import annotations

import sqlite3
from typing import Optional


def get_risk_level(score: int) -> str:
    """Map a numeric risk score to a human-readable level."""
    if score >= 75:
        return "Critical"
    elif score >= 50:
        return "High"
    elif score >= 25:
        return "Medium"
    return "Low"


def calculate_risk(shipment: dict, conn: sqlite3.Connection) -> dict:
    """Calculate the risk score for a single shipment.

    Returns a dict with: risk_score, risk_level, reasons, recommended_actions.
    """
    score = 0
    reasons: list[str] = []
    actions: list[str] = []

    # ── Factor 1: Active disruption affecting the route (0–35 pts) ────────
    disruptions = conn.execute(
        "SELECT * FROM disruptions WHERE status = 'Active'"
    ).fetchall()

    affected_disruption = None
    for d in disruptions:
        # Check if the disruption region overlaps the shipment route
        if _route_affected(shipment["route"], d["location"], d["affected_region"]):
            severity_scores = {"Low": 10, "Medium": 20, "High": 30, "Critical": 35}
            s = severity_scores.get(d["severity"], 10)
            score += s
            affected_disruption = d
            reasons.append(
                f"Route affected by {d['severity'].lower()}-severity disruption: {d['type']} at {d['location']}"
            )
            actions.append(f"Consider rerouting to avoid {d['location']}")
            break  # Use the most impactful disruption

    # ── Factor 2: Shipment priority amplifier (0–15 pts) ──────────────────
    if affected_disruption:
        priority_scores = {"Low": 0, "Standard": 5, "High": 10, "Critical": 15}
        p = priority_scores.get(shipment["priority"], 0)
        if p > 0:
            score += p
            if shipment["priority"] in ("High", "Critical"):
                reasons.append(
                    f"{shipment['priority']}-priority shipment with time-sensitive delivery requirements"
                )
                actions.append("Escalate to logistics manager for priority handling")

    # ── Factor 3: Cold-chain sensitivity (0–20 pts) ───────────────────────
    if shipment["is_cold_chain"] and affected_disruption:
        score += 15
        reasons.append("Temperature-sensitive cargo at risk during transit delay")
        actions.append("Monitor cold-chain temperature readings every 15 minutes")

        # Check for existing excursions
        excursions = conn.execute(
            "SELECT COUNT(*) as cnt FROM sensors WHERE shipment_id = ? AND temperature_status != 'Normal'",
            (shipment["shipment_id"],),
        ).fetchone()
        if excursions and excursions["cnt"] > 0:
            score += 5
            reasons.append("Active temperature excursion detected in sensor readings")
            actions.append("Dispatch nearest refrigerated vehicle immediately")

    # ── Factor 4: Estimated delay impact (0–15 pts) ───────────────────────
    if affected_disruption:
        duration = affected_disruption["expected_duration_hours"]
        if duration >= 48:
            score += 15
            reasons.append(
                f"Estimated delay of {duration}h significantly exceeds operational threshold"
            )
            actions.append("Activate contingency plan and notify customer of revised ETA")
        elif duration >= 24:
            score += 10
            reasons.append(f"Substantial estimated delay of {duration}h")
            actions.append("Notify customer of potential delay and revised ETA")
        elif duration >= 12:
            score += 5
            reasons.append(f"Moderate estimated delay of {duration}h")

    # ── Factor 5: Fleet availability (0–10 pts) ──────────────────────────
    if affected_disruption:
        idle_fleet = conn.execute(
            "SELECT COUNT(*) as cnt FROM fleet WHERE status = 'Idle'"
        ).fetchone()
        if idle_fleet and idle_fleet["cnt"] < 3:
            score += 10
            reasons.append("Limited idle fleet availability for rerouting")
        elif shipment["is_cold_chain"]:
            idle_reefer = conn.execute(
                "SELECT COUNT(*) as cnt FROM fleet WHERE status = 'Idle' AND is_refrigerated = 1"
            ).fetchone()
            if idle_reefer and idle_reefer["cnt"] < 2:
                score += 7
                reasons.append("Limited nearby refrigerated fleet availability")
                actions.append("Pre-book refrigerated backup vehicle")

    # ── Factor 6: Cargo value (0–5 pts) ──────────────────────────────────
    if shipment["value_usd"] > 500000:
        score += 5
        reasons.append("High-value cargo (>₹40 Lakh) requiring priority handling")
    elif shipment["value_usd"] > 100000 and affected_disruption:
        score += 3
        reasons.append("Valuable cargo (>₹10 Lakh) requiring careful handling during disruption")

    # Clamp score
    score = min(score, 100)
    level = get_risk_level(score)

    # Default for unaffected shipments
    if not reasons:
        reasons.append("No active disruptions affecting this shipment's route")
    if not actions:
        actions.append("Continue monitoring — no immediate action required")

    return {
        "risk_score": score,
        "risk_level": level,
        "reasons": reasons,
        "recommended_actions": actions,
    }


def calculate_all_risks(conn: sqlite3.Connection) -> list[dict]:
    """Calculate risk assessments for all non-delivered shipments."""
    shipments = conn.execute(
        "SELECT * FROM shipments WHERE status != 'Delivered'"
    ).fetchall()
    results = []
    for s in shipments:
        risk = calculate_risk(dict(s), conn)
        results.append({"shipment_id": s["shipment_id"], **risk})
    return results


def get_risk_summary(conn: sqlite3.Connection) -> dict:
    """Return aggregate risk statistics."""
    risks = calculate_all_risks(conn)
    total = len(risks)
    if total == 0:
        return {
            "total_shipments": 0,
            "low_risk": 0,
            "medium_risk": 0,
            "high_risk": 0,
            "critical_risk": 0,
            "average_score": 0.0,
        }
    counts = {"Low": 0, "Medium": 0, "High": 0, "Critical": 0}
    total_score = 0
    for r in risks:
        counts[r["risk_level"]] += 1
        total_score += r["risk_score"]
    return {
        "total_shipments": total,
        "low_risk": counts["Low"],
        "medium_risk": counts["Medium"],
        "high_risk": counts["High"],
        "critical_risk": counts["Critical"],
        "average_score": round(total_score / total, 1),
    }


def _route_affected(route: str, disruption_location: str, affected_region: str) -> bool:
    """Check if a shipment route passes through a disrupted area.

    Uses substring matching on route, location, and region names.
    In production, this would use geospatial queries.
    """
    route_lower = route.lower()
    location_parts = disruption_location.lower().replace(",", " ").split()
    region_parts = affected_region.lower().replace(",", " ").replace("-", " ").split()

    # Check if any significant keyword from disruption location appears in route
    skip_words = {"near", "at", "the", "of", "and", "in", "on", "nh", "bay", "east", "west", "north", "south", "coast", "india"}
    for word in location_parts:
        if word not in skip_words and len(word) > 2 and word in route_lower:
            return True

    for word in region_parts:
        if word not in skip_words and len(word) > 2 and word in route_lower:
            return True

    return False
