"""Pydantic schemas for API request/response models."""

from __future__ import annotations

from typing import Optional
from pydantic import BaseModel


# ── Shipment ──────────────────────────────────────────────────────────────────

class Shipment(BaseModel):
    shipment_id: str
    origin: str
    destination: str
    cargo_type: str
    cargo_description: str
    priority: str
    status: str
    carrier: str
    eta: str
    route: str
    is_cold_chain: bool
    temperature_min: Optional[float] = None
    temperature_max: Optional[float] = None
    weight_kg: float
    value_usd: float
    disruption_id: Optional[str] = None
    risk_score: Optional[int] = None
    risk_level: Optional[str] = None
    risk_reasons: Optional[list[str]] = None
    recommended_actions: Optional[list[str]] = None


class ShipmentSummary(BaseModel):
    total: int
    in_transit: int
    delivered: int
    delayed: int
    at_risk: int
    critical: int


# ── Disruption ────────────────────────────────────────────────────────────────

class Disruption(BaseModel):
    disruption_id: str
    type: str
    location: str
    severity: str
    start_time: str
    expected_duration_hours: int
    status: str
    description: str
    affected_region: str
    affected_shipment_count: Optional[int] = 0


# ── Fleet ─────────────────────────────────────────────────────────────────────

class FleetVehicle(BaseModel):
    vehicle_id: str
    type: str
    location: str
    status: str
    capacity_tons: float
    utilization_pct: float
    is_refrigerated: bool
    current_destination: Optional[str] = None
    driver_name: str
    last_maintenance: str


class FleetRecommendation(BaseModel):
    vehicle_id: str
    vehicle_type: str
    location: str
    utilization_pct: float
    capacity_tons: float
    is_refrigerated: bool
    distance_km: int
    suitability_score: float
    reason: str


# ── Cold Chain / Sensors ──────────────────────────────────────────────────────

class SensorReading(BaseModel):
    id: Optional[int] = None
    shipment_id: str
    timestamp: str
    temperature: float
    humidity: float
    temperature_status: str  # Normal, Warning, Critical
    excursion_duration_minutes: Optional[int] = 0


class ColdChainSummary(BaseModel):
    shipment_id: str
    cargo_description: str
    temperature_min: float
    temperature_max: float
    latest_temperature: float
    latest_humidity: float
    status: str  # Normal, Warning, Critical
    excursion_count: int
    total_excursion_minutes: int
    readings: list[SensorReading]


# ── Risk ──────────────────────────────────────────────────────────────────────

class RiskAssessment(BaseModel):
    shipment_id: str
    risk_score: int
    risk_level: str  # Low, Medium, High, Critical
    reasons: list[str]
    recommended_actions: list[str]


class RiskSummary(BaseModel):
    total_shipments: int
    low_risk: int
    medium_risk: int
    high_risk: int
    critical_risk: int
    average_score: float


# ── AI ────────────────────────────────────────────────────────────────────────

class AIRequest(BaseModel):
    query: str
    context: Optional[dict] = None


class AIResponse(BaseModel):
    response: str
    provider: str
    structured_actions: Optional[list[str]] = None
    confidence: Optional[str] = None


# ── Simulation ────────────────────────────────────────────────────────────────

class SimulationStatus(BaseModel):
    is_active: bool
    disruption_id: Optional[str] = None
    affected_shipments: int = 0
    message: str


# ── Dashboard KPIs ────────────────────────────────────────────────────────────

class DashboardKPIs(BaseModel):
    total_shipments: int
    affected_shipments: int
    critical_shipments: int
    active_disruptions: int
    idle_fleet_assets: int
    cold_chain_alerts: int
    simulation_active: bool
