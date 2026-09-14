"""Database seeding from CSV files and synthetic sensor data generation."""

import csv
import os
import random
from datetime import datetime, timedelta

from app.core.config import settings
from app.database.connection import get_db_connection


def seed_database():
    """Load seed data from CSV files and generate sensor readings."""
    conn = get_db_connection()
    try:
        _seed_shipments(conn)
        _seed_disruptions(conn)
        _seed_fleet(conn)
        _seed_sensors(conn)
        conn.commit()
        print("[OK] Database seeded successfully.")
    except Exception as e:
        conn.rollback()
        print(f"[ERROR] Seeding failed: {e}")
        raise
    finally:
        conn.close()


def _seed_shipments(conn):
    """Load shipments from CSV."""
    csv_path = os.path.join(settings.SEED_DATA_DIR, "shipments.csv")
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            conn.execute(
                """INSERT OR IGNORE INTO shipments
                   (shipment_id, origin, destination, cargo_type, cargo_description,
                    priority, status, carrier, eta, route, is_cold_chain,
                    temperature_min, temperature_max, weight_kg, value_usd)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    row["shipment_id"],
                    row["origin"],
                    row["destination"],
                    row["cargo_type"],
                    row["cargo_description"],
                    row["priority"],
                    row["status"],
                    row["carrier"],
                    row["eta"],
                    row["route"],
                    1 if row["is_cold_chain"].lower() == "true" else 0,
                    float(row["temperature_min"]) if row["temperature_min"] else None,
                    float(row["temperature_max"]) if row["temperature_max"] else None,
                    float(row["weight_kg"]),
                    float(row["value_usd"]),
                ),
            )


def _seed_disruptions(conn):
    """Load disruptions from CSV."""
    csv_path = os.path.join(settings.SEED_DATA_DIR, "disruptions.csv")
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            conn.execute(
                """INSERT OR IGNORE INTO disruptions
                   (disruption_id, type, location, severity, start_time,
                    expected_duration_hours, status, description, affected_region)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    row["disruption_id"],
                    row["type"],
                    row["location"],
                    row["severity"],
                    row["start_time"],
                    int(row["expected_duration_hours"]),
                    row["status"],
                    row["description"],
                    row["affected_region"],
                ),
            )


def _seed_fleet(conn):
    """Load fleet vehicles from CSV."""
    csv_path = os.path.join(settings.SEED_DATA_DIR, "fleet.csv")
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            conn.execute(
                """INSERT OR IGNORE INTO fleet
                   (vehicle_id, type, location, status, capacity_tons,
                    utilization_pct, is_refrigerated, current_destination,
                    driver_name, last_maintenance)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    row["vehicle_id"],
                    row["type"],
                    row["location"],
                    row["status"],
                    float(row["capacity_tons"]),
                    float(row["utilization_pct"]),
                    1 if row["is_refrigerated"].lower() == "true" else 0,
                    row["current_destination"] if row["current_destination"] else None,
                    row["driver_name"],
                    row["last_maintenance"],
                ),
            )


def _seed_sensors(conn):
    """Generate synthetic IoT sensor readings for cold-chain shipments."""
    # Fetch cold-chain shipments
    cursor = conn.execute(
        "SELECT shipment_id, temperature_min, temperature_max FROM shipments WHERE is_cold_chain = 1"
    )
    cold_chain_shipments = cursor.fetchall()

    random.seed(42)  # Deterministic for reproducibility
    now = datetime.now()

    for ship in cold_chain_shipments:
        sid = ship["shipment_id"]
        t_min = ship["temperature_min"]
        t_max = ship["temperature_max"]
        t_mid = (t_min + t_max) / 2
        t_range = t_max - t_min

        # Generate 12 readings over the past 12 hours
        for i in range(12):
            ts = now - timedelta(hours=11 - i, minutes=random.randint(0, 15))

            # Most readings are normal; occasional fluctuations
            if sid == "SHP-106" and i >= 9:
                # Dairy shipment has a pre-existing excursion (warning → critical)
                if i == 9:
                    temp = t_max + 1.2  # Warning
                    status = "Warning"
                    excursion_min = 15
                elif i == 10:
                    temp = t_max + 2.8  # Critical
                    status = "Critical"
                    excursion_min = 30
                else:
                    temp = t_max + 0.5  # Still warm
                    status = "Warning"
                    excursion_min = 45
            else:
                # Normal readings with slight random variation
                temp = round(t_mid + random.uniform(-t_range * 0.3, t_range * 0.3), 1)
                temp = max(t_min - 0.5, min(t_max + 0.5, temp))

                if temp > t_max:
                    status = "Warning"
                    excursion_min = random.randint(5, 15)
                elif temp < t_min:
                    status = "Warning"
                    excursion_min = random.randint(5, 10)
                else:
                    status = "Normal"
                    excursion_min = 0

            humidity = round(random.uniform(35, 65), 1)

            conn.execute(
                """INSERT INTO sensors
                   (shipment_id, timestamp, temperature, humidity,
                    temperature_status, excursion_duration_minutes)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (
                    sid,
                    ts.isoformat(timespec="seconds"),
                    round(temp, 1),
                    humidity,
                    status,
                    excursion_min,
                ),
            )
