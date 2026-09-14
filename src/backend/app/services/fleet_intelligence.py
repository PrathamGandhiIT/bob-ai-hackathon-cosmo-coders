"""Fleet intelligence service.

Matches available fleet assets to shipments needing rerouting or backup.
Provides recommendations based on proximity, capacity, and capability.
"""

from __future__ import annotations

import sqlite3

# Simulated distances between Indian cities (km) — for prototype demo purposes.
# In production, this would use a real geospatial / routing API.
CITY_DISTANCES: dict[tuple[str, str], int] = {
    ("Mumbai", "Pune"): 150, ("Pune", "Mumbai"): 150,
    ("Mumbai", "Ahmedabad"): 530, ("Ahmedabad", "Mumbai"): 530,
    ("Mumbai", "Nashik"): 170, ("Nashik", "Mumbai"): 170,
    ("Mumbai", "Nagpur"): 840, ("Nagpur", "Mumbai"): 840,
    ("Mumbai", "Surat"): 285, ("Surat", "Mumbai"): 285,
    ("Mumbai", "Indore"): 590, ("Indore", "Mumbai"): 590,
    ("Mumbai", "Bangalore"): 980, ("Bangalore", "Mumbai"): 980,
    ("Mumbai", "Hyderabad"): 710, ("Hyderabad", "Mumbai"): 710,
    ("Mumbai", "Delhi"): 1420, ("Delhi", "Mumbai"): 1420,
    ("Mumbai", "Chennai"): 1340, ("Chennai", "Mumbai"): 1340,
    ("Mumbai", "Kolkata"): 2050, ("Kolkata", "Mumbai"): 2050,
    ("Mumbai", "Jaipur"): 1150, ("Jaipur", "Mumbai"): 1150,
    ("Mumbai", "Lucknow"): 1370, ("Lucknow", "Mumbai"): 1370,
    ("Pune", "Bangalore"): 840, ("Bangalore", "Pune"): 840,
    ("Pune", "Hyderabad"): 560, ("Hyderabad", "Pune"): 560,
    ("Pune", "Nagpur"): 710, ("Nagpur", "Pune"): 710,
    ("Delhi", "Kolkata"): 1530, ("Kolkata", "Delhi"): 1530,
    ("Delhi", "Chennai"): 2180, ("Chennai", "Delhi"): 2180,
    ("Delhi", "Bangalore"): 2150, ("Bangalore", "Delhi"): 2150,
    ("Delhi", "Jaipur"): 280, ("Jaipur", "Delhi"): 280,
    ("Delhi", "Lucknow"): 560, ("Lucknow", "Delhi"): 560,
    ("Delhi", "Nagpur"): 1090, ("Nagpur", "Delhi"): 1090,
    ("Delhi", "Hyderabad"): 1580, ("Hyderabad", "Delhi"): 1580,
    ("Chennai", "Bangalore"): 350, ("Bangalore", "Chennai"): 350,
    ("Chennai", "Hyderabad"): 630, ("Hyderabad", "Chennai"): 630,
    ("Chennai", "Kolkata"): 1680, ("Kolkata", "Chennai"): 1680,
    ("Ahmedabad", "Jaipur"): 670, ("Jaipur", "Ahmedabad"): 670,
    ("Ahmedabad", "Delhi"): 950, ("Delhi", "Ahmedabad"): 950,
    ("Ahmedabad", "Surat"): 270, ("Surat", "Ahmedabad"): 270,
    ("Ahmedabad", "Pune"): 660, ("Pune", "Ahmedabad"): 660,
    ("Kolkata", "Nagpur"): 1110, ("Nagpur", "Kolkata"): 1110,
    ("Hyderabad", "Bangalore"): 570, ("Bangalore", "Hyderabad"): 570,
    ("Hyderabad", "Nagpur"): 500, ("Nagpur", "Hyderabad"): 500,
    ("Lucknow", "Nagpur"): 890, ("Nagpur", "Lucknow"): 890,
}

# Default distance when a pair is not in the lookup table
DEFAULT_DISTANCE = 1000


def get_distance(city_a: str, city_b: str) -> int:
    """Get simulated distance between two cities in km."""
    if city_a == city_b:
        return 0
    return CITY_DISTANCES.get((city_a, city_b), DEFAULT_DISTANCE)


def get_fleet_summary(conn: sqlite3.Connection) -> dict:
    """Return fleet utilization summary."""
    vehicles = conn.execute("SELECT * FROM fleet").fetchall()
    total = len(vehicles)
    active = sum(1 for v in vehicles if v["status"] == "Active")
    idle = sum(1 for v in vehicles if v["status"] == "Idle")
    maintenance = sum(1 for v in vehicles if v["status"] == "Maintenance")
    refrigerated = sum(1 for v in vehicles if v["is_refrigerated"])
    idle_refrigerated = sum(1 for v in vehicles if v["status"] == "Idle" and v["is_refrigerated"])
    avg_util = round(sum(v["utilization_pct"] for v in vehicles) / total, 1) if total else 0

    return {
        "total_vehicles": total,
        "active": active,
        "idle": idle,
        "maintenance": maintenance,
        "en_route": total - active - idle - maintenance,
        "refrigerated_total": refrigerated,
        "refrigerated_idle": idle_refrigerated,
        "average_utilization": avg_util,
    }


def recommend_fleet_for_shipment(
    shipment_id: str, conn: sqlite3.Connection
) -> list[dict]:
    """Find the best available fleet assets for a given shipment.

    Ranks vehicles by suitability (proximity, capacity, refrigeration match).
    Returns up to 3 recommendations.
    """
    shipment = conn.execute(
        "SELECT * FROM shipments WHERE shipment_id = ?", (shipment_id,)
    ).fetchone()

    if not shipment:
        return []

    # Get idle or underutilized vehicles
    vehicles = conn.execute(
        "SELECT * FROM fleet WHERE status = 'Idle' OR utilization_pct < 40"
    ).fetchall()

    if not vehicles:
        return []

    needs_reefer = bool(shipment["is_cold_chain"])

    # Determine the shipment's nearest relevant city
    # Use destination as the target for fleet positioning
    ship_dest = shipment["destination"]
    ship_origin = shipment["origin"]

    scored_vehicles = []
    for v in vehicles:
        distance = get_distance(v["location"], ship_origin)

        # Base suitability score (higher is better, 0-100)
        suitability = 100

        # Distance penalty (closer is better)
        if distance <= 200:
            suitability -= 5
        elif distance <= 500:
            suitability -= 15
        elif distance <= 1000:
            suitability -= 30
        else:
            suitability -= 50

        # Refrigeration match bonus
        if needs_reefer and v["is_refrigerated"]:
            suitability += 20
        elif needs_reefer and not v["is_refrigerated"]:
            suitability -= 40  # Major penalty — cannot handle cold chain

        # Capacity check
        if v["capacity_tons"] >= shipment["weight_kg"] / 1000:
            suitability += 10
        else:
            suitability -= 20

        # Idle bonus
        if v["status"] == "Idle":
            suitability += 15

        suitability = max(0, min(100, suitability))

        # Build reason string
        reason_parts = []
        if v["is_refrigerated"] and needs_reefer:
            reason_parts.append("Refrigeration-capable")
        if v["status"] == "Idle":
            reason_parts.append("Currently idle")
        if distance <= 200:
            reason_parts.append(f"Nearby ({distance} km)")
        elif distance <= 500:
            reason_parts.append(f"Moderate distance ({distance} km)")
        if v["capacity_tons"] >= shipment["weight_kg"] / 1000:
            reason_parts.append(f"Sufficient capacity ({v['capacity_tons']}t)")

        reason = ". ".join(reason_parts) if reason_parts else "Available for redeployment"

        scored_vehicles.append({
            "vehicle_id": v["vehicle_id"],
            "vehicle_type": v["type"],
            "location": v["location"],
            "utilization_pct": v["utilization_pct"],
            "capacity_tons": v["capacity_tons"],
            "is_refrigerated": bool(v["is_refrigerated"]),
            "distance_km": distance,
            "suitability_score": round(suitability, 1),
            "reason": reason,
        })

    # Sort by suitability (descending), then distance (ascending)
    scored_vehicles.sort(key=lambda x: (-x["suitability_score"], x["distance_km"]))
    return scored_vehicles[:3]
