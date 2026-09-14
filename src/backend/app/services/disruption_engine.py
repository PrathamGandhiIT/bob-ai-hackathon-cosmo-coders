"""Disruption simulation engine.

Handles the controlled injection and removal of a high-severity disruption
scenario for hackathon demo purposes.
"""

from __future__ import annotations

import sqlite3
import random
from datetime import datetime, timedelta

from app.core.config import settings


# ── Simulation disruption template ────────────────────────────────────────────

SIMULATION_DISRUPTION = {
    "disruption_id": settings.SIMULATION_DISRUPTION_ID,
    "type": "Port Congestion",
    "location": "JNPT Mumbai Port",
    "severity": "Critical",
    "start_time": datetime.now().replace(hour=6, minute=0, second=0).isoformat(timespec="seconds"),
    "expected_duration_hours": 72,
    "status": "Active",
    "description": (
        "Critical port congestion at JNPT Mumbai (Jawaharlal Nehru Port Trust) "
        "due to severe vessel bunching and ongoing labor action. All container "
        "movements through the port are experiencing 48–72 hour delays. "
        "Cargo inspection backlogs are growing rapidly. Road access to port "
        "terminals is severely restricted."
    ),
    "affected_region": "Western India - Mumbai Metropolitan Region",
}


def is_simulation_active(conn: sqlite3.Connection) -> bool:
    """Check whether the disruption simulation is currently active."""
    row = conn.execute("SELECT is_active FROM simulation_state WHERE id = 1").fetchone()
    return bool(row and row["is_active"])


def activate_simulation(conn: sqlite3.Connection) -> dict:
    """Inject the simulation disruption and update affected shipments.

    Returns a summary of the changes made.
    """
    if is_simulation_active(conn):
        return {
            "is_active": True,
            "disruption_id": settings.SIMULATION_DISRUPTION_ID,
            "affected_shipments": _count_affected(conn),
            "message": "Simulation is already active.",
        }

    # 1. Insert the critical disruption
    d = SIMULATION_DISRUPTION
    conn.execute(
        """INSERT OR REPLACE INTO disruptions
           (disruption_id, type, location, severity, start_time,
            expected_duration_hours, status, description, affected_region)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            d["disruption_id"], d["type"], d["location"], d["severity"],
            d["start_time"], d["expected_duration_hours"], d["status"],
            d["description"], d["affected_region"],
        ),
    )

    # 2. Update affected shipments — those with "Mumbai" in their route
    affected_ids = _get_affected_shipment_ids(conn)
    for sid in affected_ids:
        conn.execute(
            """UPDATE shipments
               SET status = 'Delayed', disruption_id = ?
               WHERE shipment_id = ? AND status NOT IN ('Delivered')""",
            (settings.SIMULATION_DISRUPTION_ID, sid),
        )

    # 3. Add temperature excursion readings for affected cold-chain shipments
    _inject_cold_chain_excursions(conn, affected_ids)

    # 4. Set simulation flag
    conn.execute("UPDATE simulation_state SET is_active = 1 WHERE id = 1")
    conn.commit()

    affected_count = _count_affected(conn)
    return {
        "is_active": True,
        "disruption_id": settings.SIMULATION_DISRUPTION_ID,
        "affected_shipments": affected_count,
        "message": (
            f"⚠️ Critical disruption activated: JNPT Mumbai Port Congestion. "
            f"{affected_count} shipments affected. Risk scores updated."
        ),
    }


def deactivate_simulation(conn: sqlite3.Connection) -> dict:
    """Remove simulation effects and restore initial data state.

    Re-seeds the database from CSV files to guarantee a clean reset.
    """
    from app.database.connection import reset_db
    from app.database.seed import seed_database

    # Full reset: drop and re-seed
    reset_db()
    seed_database()

    return {
        "is_active": False,
        "disruption_id": None,
        "affected_shipments": 0,
        "message": "✅ Simulation reset. All data restored to initial state.",
    }


def _get_affected_shipment_ids(conn: sqlite3.Connection) -> list[str]:
    """Return shipment IDs whose routes pass through Mumbai."""
    rows = conn.execute(
        "SELECT shipment_id, route FROM shipments WHERE status != 'Delivered'"
    ).fetchall()
    return [
        r["shipment_id"]
        for r in rows
        if "mumbai" in r["route"].lower()
    ]


def _count_affected(conn: sqlite3.Connection) -> int:
    """Count currently affected (disrupted) shipments."""
    row = conn.execute(
        "SELECT COUNT(*) as cnt FROM shipments WHERE disruption_id IS NOT NULL AND status != 'Delivered'"
    ).fetchone()
    return row["cnt"] if row else 0


def _inject_cold_chain_excursions(conn: sqlite3.Connection, affected_ids: list[str]):
    """Add temperature excursion sensor readings for affected cold-chain shipments."""
    cold_chain = conn.execute(
        """SELECT shipment_id, temperature_min, temperature_max
           FROM shipments
           WHERE shipment_id IN ({})
           AND is_cold_chain = 1""".format(",".join("?" * len(affected_ids))),
        affected_ids,
    ).fetchall()

    random.seed(100)  # Deterministic
    now = datetime.now()

    for ship in cold_chain:
        t_max = ship["temperature_max"]
        t_min = ship["temperature_min"]

        # Add 3 excursion readings in the last 2 hours
        for i in range(3):
            ts = now - timedelta(minutes=90 - i * 40 + random.randint(0, 10))

            if i == 0:
                temp = round(t_max + random.uniform(1.5, 3.0), 1)
                status = "Warning"
                excursion_min = 20
            elif i == 1:
                temp = round(t_max + random.uniform(3.0, 6.0), 1)
                status = "Critical"
                excursion_min = 45
            else:
                temp = round(t_max + random.uniform(2.0, 4.5), 1)
                status = "Critical"
                excursion_min = 70

            humidity = round(random.uniform(55, 80), 1)

            conn.execute(
                """INSERT INTO sensors
                   (shipment_id, timestamp, temperature, humidity,
                    temperature_status, excursion_duration_minutes)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (
                    ship["shipment_id"],
                    ts.isoformat(timespec="seconds"),
                    temp,
                    humidity,
                    status,
                    excursion_min,
                ),
            )
