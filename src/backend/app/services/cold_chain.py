"""Cold-chain monitoring and excursion detection service.

Analyzes IoT sensor readings for temperature-controlled shipments.
Detects and classifies temperature excursions by severity.

Note: Temperature thresholds used here are configurable demo assumptions
for prototype purposes, NOT regulatory-certified cold-chain standards.
"""

from __future__ import annotations

import sqlite3


def get_cold_chain_shipments(conn: sqlite3.Connection) -> list[dict]:
    """Return all cold-chain shipments with their latest sensor status."""
    shipments = conn.execute(
        "SELECT * FROM shipments WHERE is_cold_chain = 1"
    ).fetchall()

    results = []
    for s in shipments:
        readings = conn.execute(
            """SELECT * FROM sensors
               WHERE shipment_id = ?
               ORDER BY timestamp DESC""",
            (s["shipment_id"],),
        ).fetchall()

        if readings:
            latest = readings[0]
            excursion_count = sum(
                1 for r in readings if r["temperature_status"] != "Normal"
            )
            total_excursion_min = sum(
                r["excursion_duration_minutes"]
                for r in readings
                if r["temperature_status"] != "Normal"
            )

            # Overall status is the worst status in recent readings (last 3)
            recent = readings[:3]
            if any(r["temperature_status"] == "Critical" for r in recent):
                overall_status = "Critical"
            elif any(r["temperature_status"] == "Warning" for r in recent):
                overall_status = "Warning"
            else:
                overall_status = "Normal"

            results.append({
                "shipment_id": s["shipment_id"],
                "cargo_description": s["cargo_description"],
                "origin": s["origin"],
                "destination": s["destination"],
                "temperature_min": s["temperature_min"],
                "temperature_max": s["temperature_max"],
                "latest_temperature": latest["temperature"],
                "latest_humidity": latest["humidity"],
                "status": overall_status,
                "excursion_count": excursion_count,
                "total_excursion_minutes": total_excursion_min,
                "readings": [dict(r) for r in readings],
            })
        else:
            results.append({
                "shipment_id": s["shipment_id"],
                "cargo_description": s["cargo_description"],
                "origin": s["origin"],
                "destination": s["destination"],
                "temperature_min": s["temperature_min"],
                "temperature_max": s["temperature_max"],
                "latest_temperature": None,
                "latest_humidity": None,
                "status": "No Data",
                "excursion_count": 0,
                "total_excursion_minutes": 0,
                "readings": [],
            })

    return results


def get_cold_chain_for_shipment(
    shipment_id: str, conn: sqlite3.Connection
) -> dict | None:
    """Return detailed cold-chain data for a specific shipment."""
    shipment = conn.execute(
        "SELECT * FROM shipments WHERE shipment_id = ? AND is_cold_chain = 1",
        (shipment_id,),
    ).fetchone()

    if not shipment:
        return None

    readings = conn.execute(
        """SELECT * FROM sensors
           WHERE shipment_id = ?
           ORDER BY timestamp ASC""",
        (shipment_id,),
    ).fetchall()

    excursion_count = sum(
        1 for r in readings if r["temperature_status"] != "Normal"
    )
    total_excursion_min = sum(
        r["excursion_duration_minutes"]
        for r in readings
        if r["temperature_status"] != "Normal"
    )

    # Determine overall status
    recent = list(readings)[-3:] if readings else []
    if any(r["temperature_status"] == "Critical" for r in recent):
        overall_status = "Critical"
    elif any(r["temperature_status"] == "Warning" for r in recent):
        overall_status = "Warning"
    else:
        overall_status = "Normal"

    latest = readings[-1] if readings else None

    return {
        "shipment_id": shipment["shipment_id"],
        "cargo_description": shipment["cargo_description"],
        "origin": shipment["origin"],
        "destination": shipment["destination"],
        "temperature_min": shipment["temperature_min"],
        "temperature_max": shipment["temperature_max"],
        "latest_temperature": latest["temperature"] if latest else None,
        "latest_humidity": latest["humidity"] if latest else None,
        "status": overall_status,
        "excursion_count": excursion_count,
        "total_excursion_minutes": total_excursion_min,
        "readings": [dict(r) for r in readings],
    }


def get_cold_chain_alerts(conn: sqlite3.Connection) -> list[dict]:
    """Return cold-chain shipments that have active warnings or critical alerts."""
    all_cc = get_cold_chain_shipments(conn)
    return [cc for cc in all_cc if cc["status"] in ("Warning", "Critical")]
