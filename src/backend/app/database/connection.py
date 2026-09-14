"""SQLite database connection and initialization."""

import sqlite3
import os
from app.core.config import settings


SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS shipments (
    shipment_id TEXT PRIMARY KEY,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    cargo_type TEXT NOT NULL,
    cargo_description TEXT NOT NULL,
    priority TEXT NOT NULL,
    status TEXT NOT NULL,
    carrier TEXT NOT NULL,
    eta TEXT NOT NULL,
    route TEXT NOT NULL,
    is_cold_chain INTEGER NOT NULL DEFAULT 0,
    temperature_min REAL,
    temperature_max REAL,
    weight_kg REAL NOT NULL,
    value_usd REAL NOT NULL,
    disruption_id TEXT
);

CREATE TABLE IF NOT EXISTS disruptions (
    disruption_id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    location TEXT NOT NULL,
    severity TEXT NOT NULL,
    start_time TEXT NOT NULL,
    expected_duration_hours INTEGER NOT NULL,
    status TEXT NOT NULL,
    description TEXT NOT NULL,
    affected_region TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS fleet (
    vehicle_id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT NOT NULL,
    capacity_tons REAL NOT NULL,
    utilization_pct REAL NOT NULL,
    is_refrigerated INTEGER NOT NULL DEFAULT 0,
    current_destination TEXT,
    driver_name TEXT NOT NULL,
    last_maintenance TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sensors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shipment_id TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    temperature REAL NOT NULL,
    humidity REAL NOT NULL,
    temperature_status TEXT NOT NULL DEFAULT 'Normal',
    excursion_duration_minutes INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (shipment_id) REFERENCES shipments (shipment_id)
);

CREATE TABLE IF NOT EXISTS simulation_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    is_active INTEGER NOT NULL DEFAULT 0
);
"""


def get_db_connection() -> sqlite3.Connection:
    """Get a database connection with Row factory enabled."""
    conn = sqlite3.connect(settings.DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def get_db():
    """FastAPI dependency that yields a database connection."""
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()


def init_db():
    """Create tables if they do not exist."""
    conn = get_db_connection()
    conn.executescript(SCHEMA_SQL)
    # Ensure simulation_state row exists
    conn.execute(
        "INSERT OR IGNORE INTO simulation_state (id, is_active) VALUES (1, 0)"
    )
    conn.commit()
    conn.close()


def reset_db():
    """Drop all tables and re-create them. Used by simulation reset."""
    conn = get_db_connection()
    conn.executescript("""
        DROP TABLE IF EXISTS sensors;
        DROP TABLE IF EXISTS fleet;
        DROP TABLE IF EXISTS disruptions;
        DROP TABLE IF EXISTS shipments;
        DROP TABLE IF EXISTS simulation_state;
    """)
    conn.commit()
    conn.close()
    init_db()


def is_db_seeded() -> bool:
    """Check whether the database has been seeded with data."""
    conn = get_db_connection()
    cursor = conn.execute("SELECT COUNT(*) FROM shipments")
    count = cursor.fetchone()[0]
    conn.close()
    return count > 0
