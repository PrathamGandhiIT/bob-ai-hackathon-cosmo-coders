import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    """Verify system health endpoint returns operational status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


def test_dashboard_kpis():
    """Verify overview dashboard returns aggregated supply chain KPIs and distributions."""
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    kpis = data["kpis"]
    assert "total_shipments" in kpis
    assert "active_disruptions" in kpis
    assert "idle_fleet_assets" in kpis
    assert "cold_chain_alerts" in kpis
    assert "risk_distribution" in data
    assert "fleet_summary" in data


def test_list_shipments():
    """Verify shipments list returns valid records with computed risks."""
    response = client.get("/api/shipments")
    assert response.status_code == 200
    data = response.json()
    assert "shipments" in data
    shipments = data["shipments"]
    assert len(shipments) > 0
    first = shipments[0]
    assert "shipment_id" in first
    assert "origin" in first
    assert "destination" in first
    assert "risk_level" in first


def test_get_single_shipment_with_recommendations():
    """Verify single shipment lookup returns details and fleet/reroute recommendations."""
    response = client.get("/api/shipments/SHP-101")
    assert response.status_code == 200
    data = response.json()
    assert data["shipment_id"] == "SHP-101"
    assert "origin" in data
    assert "fleet_recommendations" in data


def test_list_disruptions():
    """Verify active disruptions retrieval."""
    response = client.get("/api/disruptions")
    assert response.status_code == 200
    data = response.json()
    assert "disruptions" in data
    disruptions = data["disruptions"]
    assert len(disruptions) > 0
    assert any("severity" in d for d in disruptions)


def test_fleet_recommendations_for_shipment():
    """Verify fleet recommendations for an affected shipment."""
    response = client.get("/api/fleet/recommendations/SHP-104")
    assert response.status_code == 200
    data = response.json()
    assert "shipment_id" in data
    assert "recommendations" in data
    assert isinstance(data["recommendations"], list)


def test_fleet_status_and_summary():
    """Verify fleet status and asset metrics."""
    response = client.get("/api/fleet")
    assert response.status_code == 200
    data = response.json()
    assert "vehicles" in data
    assert "summary" in data
    summary = data["summary"]
    assert summary["total_vehicles"] > 0
    assert "idle" in summary


def test_cold_chain_telemetry():
    """Verify cold chain shipments and sensor compliance."""
    response = client.get("/api/cold-chain")
    assert response.status_code == 200
    data = response.json()
    assert "shipments" in data
    assert "alert_count" in data
    assert len(data["shipments"]) > 0


def test_copilot_assistant_query():
    """Verify AI Copilot responds with structured recommendations."""
    payload = {"query": "What should I do about shipment SHP-104?"}
    response = client.post("/api/ai/copilot", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert "provider" in data
    assert len(data["response"]) > 0


def test_disruption_simulation():
    """Verify disruption simulation activates scenario."""
    response = client.post("/api/disruptions/simulate")
    assert response.status_code == 200
    data = response.json()
    assert "disruption_id" in data
    assert "is_active" in data
