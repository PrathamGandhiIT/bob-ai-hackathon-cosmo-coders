"""AI provider abstraction layer.

Supports:
  1. IBM watsonx (when API credentials are configured)
  2. Deterministic fallback (always available, no external dependency)

The fallback generates structured responses using application data and
template-based reasoning — ensuring the application works without an LLM.
"""

from __future__ import annotations

import sqlite3
import json
from typing import Optional

from app.core.config import settings
from app.services.risk_engine import calculate_risk
from app.services.fleet_intelligence import recommend_fleet_for_shipment
from app.services.cold_chain import get_cold_chain_for_shipment


# ── Provider interface ────────────────────────────────────────────────────────

def get_ai_response(query: str, conn: sqlite3.Connection, context: Optional[dict] = None) -> dict:
    """Route the AI request to the configured provider."""
    provider = settings.AI_PROVIDER.lower()

    if provider == "watsonx" and settings.WATSONX_API_KEY:
        return _watsonx_response(query, conn, context)
    else:
        return _fallback_response(query, conn, context)


# ── IBM watsonx provider ─────────────────────────────────────────────────────

def _watsonx_response(query: str, conn: sqlite3.Connection, context: Optional[dict] = None) -> dict:
    """Generate response using IBM watsonx.ai.

    Uses the Granite model for structured logistics recommendations.
    Falls back to deterministic provider if the API call fails.
    """
    try:
        import httpx

        # Build context from application data
        app_context = _build_context(query, conn)

        prompt = _build_watsonx_prompt(query, app_context)

        payload = {
            "model_id": "ibm/granite-13b-instruct-v2",
            "input": prompt,
            "parameters": {
                "decoding_method": "greedy",
                "max_new_tokens": 800,
                "temperature": 0.3,
                "top_p": 0.9,
                "repetition_penalty": 1.1,
            },
            "project_id": settings.WATSONX_PROJECT_ID,
        }

        headers = {
            "Authorization": f"Bearer {settings.WATSONX_API_KEY}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        with httpx.Client(timeout=30.0) as client:
            response = client.post(
                f"{settings.WATSONX_URL}/ml/v1/text/generation?version=2024-03-14",
                json=payload,
                headers=headers,
            )
            response.raise_for_status()
            result = response.json()

        generated_text = result.get("results", [{}])[0].get("generated_text", "")

        return {
            "response": generated_text.strip(),
            "provider": "IBM watsonx (Granite)",
            "structured_actions": _extract_actions(generated_text),
            "confidence": "high",
        }

    except Exception as e:
        print(f"⚠️ watsonx call failed ({e}), falling back to deterministic provider")
        return _fallback_response(query, conn, context)


def _build_watsonx_prompt(query: str, context: str) -> str:
    """Build a structured prompt for the watsonx model."""
    return f"""You are an AI logistics operations assistant for a supply chain control tower.
Use the following operational context to answer the user's question.
Provide specific, actionable recommendations based on the data.

OPERATIONAL CONTEXT:
{context}

USER QUESTION: {query}

Provide a structured response with:
1. Situation assessment
2. Recommended actions (numbered)
3. Brief reasoning

RESPONSE:"""


# ── Deterministic fallback ────────────────────────────────────────────────────

def _fallback_response(query: str, conn: sqlite3.Connection, context: Optional[dict] = None) -> dict:
    """Generate a structured response using application data and templates.

    No external API required — fully deterministic.
    """
    query_lower = query.lower()

    # Detect query intent and route to appropriate handler
    if _matches_any(query_lower, ["shp-", "shipment"]):
        return _handle_shipment_query(query, query_lower, conn)
    elif _matches_any(query_lower, ["risk", "at risk", "most at risk", "critical"]):
        return _handle_risk_query(query, conn)
    elif _matches_any(query_lower, ["fleet", "vehicle", "redeploy", "truck", "asset"]):
        return _handle_fleet_query(query, conn)
    elif _matches_any(query_lower, ["disruption", "impact", "port", "congestion"]):
        return _handle_disruption_query(query, conn)
    elif _matches_any(query_lower, ["recovery", "plan", "action"]):
        return _handle_recovery_query(query, conn)
    elif _matches_any(query_lower, ["cold", "temperature", "chain", "excursion"]):
        return _handle_cold_chain_query(query, conn)
    elif _matches_any(query_lower, ["summary", "overview", "status", "situation"]):
        return _handle_summary_query(query, conn)
    else:
        return _handle_general_query(query, conn)


def _handle_shipment_query(query: str, query_lower: str, conn: sqlite3.Connection) -> dict:
    """Handle queries about specific shipments."""
    # Extract shipment ID
    import re
    match = re.search(r'(SHP-\d+)', query.upper())
    if not match:
        return _handle_general_query(query, conn)

    sid = match.group(1)
    shipment = conn.execute(
        "SELECT * FROM shipments WHERE shipment_id = ?", (sid,)
    ).fetchone()

    if not shipment:
        return {
            "response": f"Shipment {sid} was not found in the system. Please verify the shipment ID.",
            "provider": "Deterministic Fallback",
            "structured_actions": ["Verify shipment ID", "Check with dispatch team"],
            "confidence": "high",
        }

    ship = dict(shipment)
    risk = calculate_risk(ship, conn)
    fleet_recs = recommend_fleet_for_shipment(sid, conn)
    cold_chain = get_cold_chain_for_shipment(sid, conn)

    # Build structured response
    situation = (
        f"**Shipment {sid}** is currently **{ship['status']}** on route "
        f"{ship['route']}.\n\n"
        f"- **Cargo:** {ship['cargo_description']}\n"
        f"- **Priority:** {ship['priority']}\n"
        f"- **Carrier:** {ship['carrier']}\n"
        f"- **ETA:** {ship['eta']}\n"
        f"- **Risk Score:** {risk['risk_score']}/100 ({risk['risk_level']})\n"
    )

    if ship["disruption_id"]:
        disruption = conn.execute(
            "SELECT * FROM disruptions WHERE disruption_id = ?",
            (ship["disruption_id"],),
        ).fetchone()
        if disruption:
            situation += (
                f"\n**Active Disruption:** {disruption['type']} at {disruption['location']} "
                f"({disruption['severity']} severity, est. {disruption['expected_duration_hours']}h duration)\n"
            )

    if cold_chain and cold_chain["status"] != "Normal":
        situation += (
            f"\n**Cold-Chain Alert:** {cold_chain['status']} — "
            f"Latest temp: {cold_chain['latest_temperature']}°C "
            f"(required: {cold_chain['temperature_min']}–{cold_chain['temperature_max']}°C)\n"
        )

    # Build actions
    actions = risk["recommended_actions"][:]

    if fleet_recs:
        best = fleet_recs[0]
        actions.append(
            f"Deploy {best['vehicle_type']} {best['vehicle_id']} from {best['location']} "
            f"({best['distance_km']} km away, {best['utilization_pct']}% utilized)"
        )

    if cold_chain and cold_chain["status"] != "Normal":
        actions.append("Increase temperature monitoring frequency to every 15 minutes")
        actions.append("Prepare contingency refrigerated storage at nearest hub")

    # Build reasoning
    reasoning_parts = [f"- {r}" for r in risk["reasons"]]
    reasoning = "\n".join(reasoning_parts)

    response = (
        f"## Situation Assessment\n\n{situation}\n\n"
        f"## Recommended Actions\n\n"
        + "\n".join(f"{i+1}. {a}" for i, a in enumerate(actions))
        + f"\n\n## Reasoning\n\n{reasoning}"
    )

    return {
        "response": response,
        "provider": "Deterministic Fallback",
        "structured_actions": actions,
        "confidence": "high",
    }


def _handle_risk_query(query: str, conn: sqlite3.Connection) -> dict:
    """Handle queries about risk levels across shipments."""
    from app.services.risk_engine import calculate_all_risks

    risks = calculate_all_risks(conn)
    critical = [r for r in risks if r["risk_level"] == "Critical"]
    high = [r for r in risks if r["risk_level"] == "High"]

    response = f"## Risk Overview\n\n"
    response += f"**{len(critical)} critical** and **{len(high)} high-risk** shipments detected.\n\n"

    if critical:
        response += "### Critical Risk Shipments\n\n"
        for r in critical[:5]:
            ship = conn.execute(
                "SELECT cargo_description, route FROM shipments WHERE shipment_id = ?",
                (r["shipment_id"],),
            ).fetchone()
            response += (
                f"- **{r['shipment_id']}** — Score: {r['risk_score']}/100 — "
                f"{ship['cargo_description'] if ship else 'Unknown cargo'}\n"
            )

    if high:
        response += "\n### High Risk Shipments\n\n"
        for r in high[:5]:
            ship = conn.execute(
                "SELECT cargo_description, route FROM shipments WHERE shipment_id = ?",
                (r["shipment_id"],),
            ).fetchone()
            response += (
                f"- **{r['shipment_id']}** — Score: {r['risk_score']}/100 — "
                f"{ship['cargo_description'] if ship else 'Unknown cargo'}\n"
            )

    actions = [
        "Address critical-risk shipments immediately",
        "Assign backup fleet to high-priority delayed shipments",
        "Monitor cold-chain readings for temperature-sensitive cargo",
    ]

    response += "\n## Recommended Actions\n\n"
    response += "\n".join(f"{i+1}. {a}" for i, a in enumerate(actions))

    return {
        "response": response,
        "provider": "Deterministic Fallback",
        "structured_actions": actions,
        "confidence": "high",
    }


def _handle_fleet_query(query: str, conn: sqlite3.Connection) -> dict:
    """Handle queries about fleet availability and redeployment."""
    from app.services.fleet_intelligence import get_fleet_summary

    summary = get_fleet_summary(conn)
    idle_vehicles = conn.execute(
        "SELECT * FROM fleet WHERE status = 'Idle'"
    ).fetchall()

    response = f"## Fleet Status\n\n"
    response += (
        f"- **Total Vehicles:** {summary['total_vehicles']}\n"
        f"- **Active:** {summary['active']}\n"
        f"- **Idle:** {summary['idle']}\n"
        f"- **Refrigerated (idle):** {summary['refrigerated_idle']}\n"
        f"- **Average Utilization:** {summary['average_utilization']}%\n\n"
    )

    if idle_vehicles:
        response += "### Available for Redeployment\n\n"
        for v in idle_vehicles:
            reefer = " 🧊" if v["is_refrigerated"] else ""
            response += (
                f"- **{v['vehicle_id']}** — {v['type']}{reefer} at {v['location']}, "
                f"{v['capacity_tons']}t capacity\n"
            )

    actions = [
        f"Redeploy {summary['idle']} idle vehicles to support affected shipments",
        "Prioritize refrigerated units for cold-chain cargo",
        "Review underutilized vehicles (<40% utilization) for backup assignments",
    ]

    response += "\n## Recommended Actions\n\n"
    response += "\n".join(f"{i+1}. {a}" for i, a in enumerate(actions))

    return {
        "response": response,
        "provider": "Deterministic Fallback",
        "structured_actions": actions,
        "confidence": "high",
    }


def _handle_disruption_query(query: str, conn: sqlite3.Connection) -> dict:
    """Handle queries about active disruptions and their impact."""
    disruptions = conn.execute(
        "SELECT * FROM disruptions WHERE status = 'Active'"
    ).fetchall()

    response = f"## Active Disruptions\n\n"

    if not disruptions:
        response += "No active disruptions detected. All routes are operating normally.\n"
        return {
            "response": response,
            "provider": "Deterministic Fallback",
            "structured_actions": ["Continue standard monitoring"],
            "confidence": "high",
        }

    actions = []
    for d in disruptions:
        affected = conn.execute(
            "SELECT COUNT(*) as cnt FROM shipments WHERE disruption_id = ?",
            (d["disruption_id"],),
        ).fetchone()
        count = affected["cnt"] if affected else 0

        response += (
            f"### {d['disruption_id']}: {d['type']}\n\n"
            f"- **Location:** {d['location']}\n"
            f"- **Severity:** {d['severity']}\n"
            f"- **Duration:** {d['expected_duration_hours']}h estimated\n"
            f"- **Affected Shipments:** {count}\n"
            f"- **Description:** {d['description']}\n\n"
        )
        actions.append(f"Address {d['severity'].lower()}-severity {d['type']} at {d['location']}")

    actions.extend([
        "Identify and reroute affected shipments",
        "Assign backup fleet assets to critical shipments",
    ])

    response += "## Recommended Actions\n\n"
    response += "\n".join(f"{i+1}. {a}" for i, a in enumerate(actions))

    return {
        "response": response,
        "provider": "Deterministic Fallback",
        "structured_actions": actions,
        "confidence": "high",
    }


def _handle_recovery_query(query: str, conn: sqlite3.Connection) -> dict:
    """Handle requests for recovery plans."""
    from app.services.risk_engine import calculate_all_risks

    risks = calculate_all_risks(conn)
    critical = [r for r in risks if r["risk_level"] == "Critical"]

    if not critical:
        return {
            "response": "## Recovery Plan\n\nNo critical shipments require a recovery plan at this time. All shipments are within acceptable risk thresholds.",
            "provider": "Deterministic Fallback",
            "structured_actions": ["Continue monitoring"],
            "confidence": "high",
        }

    response = f"## Recovery Plan for {len(critical)} Critical Shipments\n\n"
    actions = []

    for i, r in enumerate(critical[:5], 1):
        ship = conn.execute(
            "SELECT * FROM shipments WHERE shipment_id = ?",
            (r["shipment_id"],),
        ).fetchone()

        if not ship:
            continue

        fleet_recs = recommend_fleet_for_shipment(r["shipment_id"], conn)
        cold_chain = get_cold_chain_for_shipment(r["shipment_id"], conn)

        response += f"### {i}. {r['shipment_id']} — Risk: {r['risk_score']}/100\n\n"
        response += f"**{ship['cargo_description']}** ({ship['origin']} → {ship['destination']})\n\n"

        step_actions = []
        if ship["disruption_id"]:
            step_actions.append("Reroute through alternative corridor to bypass disruption zone")
        if fleet_recs:
            best = fleet_recs[0]
            step_actions.append(
                f"Assign {best['vehicle_type']} {best['vehicle_id']} from {best['location']}"
            )
        if cold_chain and cold_chain["status"] != "Normal":
            step_actions.append("Activate emergency temperature monitoring protocol")
        step_actions.append("Notify customer of revised delivery timeline")
        step_actions.append("Escalate to logistics manager for priority handling")

        for j, sa in enumerate(step_actions, 1):
            response += f"   {j}. {sa}\n"
        response += "\n"
        actions.extend(step_actions)

    return {
        "response": response,
        "provider": "Deterministic Fallback",
        "structured_actions": actions[:10],
        "confidence": "high",
    }


def _handle_cold_chain_query(query: str, conn: sqlite3.Connection) -> dict:
    """Handle queries about cold-chain status."""
    from app.services.cold_chain import get_cold_chain_alerts

    alerts = get_cold_chain_alerts(conn)

    response = "## Cold-Chain Status\n\n"

    if not alerts:
        response += "All cold-chain shipments are within acceptable temperature ranges. ✅\n"
        return {
            "response": response,
            "provider": "Deterministic Fallback",
            "structured_actions": ["Continue standard monitoring"],
            "confidence": "high",
        }

    response += f"**{len(alerts)} shipments with temperature alerts:**\n\n"
    actions = []

    for a in alerts:
        emoji = "🔴" if a["status"] == "Critical" else "🟡"
        response += (
            f"- {emoji} **{a['shipment_id']}** — {a['status']} — "
            f"Latest: {a['latest_temperature']}°C "
            f"(range: {a['temperature_min']}–{a['temperature_max']}°C) — "
            f"{a['excursion_count']} excursion(s), {a['total_excursion_minutes']} min total\n"
        )
        if a["status"] == "Critical":
            actions.append(f"URGENT: Inspect {a['shipment_id']} cargo integrity immediately")

    actions.extend([
        "Increase monitoring frequency to 15-minute intervals",
        "Prepare contingency refrigerated storage",
        "Document excursion events for quality review",
    ])

    response += "\n## Recommended Actions\n\n"
    response += "\n".join(f"{i+1}. {a}" for i, a in enumerate(actions))

    return {
        "response": response,
        "provider": "Deterministic Fallback",
        "structured_actions": actions,
        "confidence": "high",
    }


def _handle_summary_query(query: str, conn: sqlite3.Connection) -> dict:
    """Handle requests for operational summaries."""
    from app.services.risk_engine import get_risk_summary
    from app.services.fleet_intelligence import get_fleet_summary
    from app.services.cold_chain import get_cold_chain_alerts
    from app.services.disruption_engine import is_simulation_active

    risk_sum = get_risk_summary(conn)
    fleet_sum = get_fleet_summary(conn)
    cc_alerts = get_cold_chain_alerts(conn)
    sim_active = is_simulation_active(conn)

    disruption_count = conn.execute(
        "SELECT COUNT(*) as cnt FROM disruptions WHERE status = 'Active'"
    ).fetchone()["cnt"]

    response = "## Operational Summary\n\n"

    if sim_active:
        response += "> ⚠️ **Disruption simulation is active**\n\n"

    response += (
        f"### Shipments\n"
        f"- Total tracked: {risk_sum['total_shipments']}\n"
        f"- Critical risk: {risk_sum['critical_risk']}\n"
        f"- High risk: {risk_sum['high_risk']}\n"
        f"- Average risk score: {risk_sum['average_score']}\n\n"
        f"### Disruptions\n"
        f"- Active disruptions: {disruption_count}\n\n"
        f"### Fleet\n"
        f"- Idle vehicles: {fleet_sum['idle']}/{fleet_sum['total_vehicles']}\n"
        f"- Idle refrigerated: {fleet_sum['refrigerated_idle']}\n"
        f"- Avg utilization: {fleet_sum['average_utilization']}%\n\n"
        f"### Cold Chain\n"
        f"- Active alerts: {len(cc_alerts)}\n"
    )

    return {
        "response": response,
        "provider": "Deterministic Fallback",
        "structured_actions": ["Review critical-risk shipments", "Monitor cold-chain alerts"],
        "confidence": "high",
    }


def _handle_general_query(query: str, conn: sqlite3.Connection) -> dict:
    """Handle unrecognized queries with a helpful response."""
    return {
        "response": (
            "I can help you with supply chain operations. Try asking about:\n\n"
            "- **Specific shipments:** \"What should I do about shipment SHP-104?\"\n"
            "- **Risk assessment:** \"Which shipments are most at risk?\"\n"
            "- **Fleet redeployment:** \"Which fleet assets can be redeployed?\"\n"
            "- **Disruption impact:** \"What is the impact of the current disruption?\"\n"
            "- **Recovery planning:** \"Give me a recovery plan for critical shipments.\"\n"
            "- **Cold-chain status:** \"Are there any temperature alerts?\"\n"
            "- **Operations summary:** \"Give me a status overview.\"\n"
        ),
        "provider": "Deterministic Fallback",
        "structured_actions": [],
        "confidence": "medium",
    }


# ── Utilities ─────────────────────────────────────────────────────────────────

def _matches_any(text: str, keywords: list[str]) -> bool:
    """Check if text contains any of the given keywords."""
    return any(kw in text for kw in keywords)


def _extract_actions(text: str) -> list[str]:
    """Extract numbered action items from generated text."""
    import re
    actions = re.findall(r'\d+\.\s+(.+)', text)
    return actions[:10]


def _build_context(query: str, conn: sqlite3.Connection) -> str:
    """Build operational context string for the AI model."""
    from app.services.risk_engine import get_risk_summary
    from app.services.disruption_engine import is_simulation_active

    risk_sum = get_risk_summary(conn)
    sim_active = is_simulation_active(conn)

    disruptions = conn.execute(
        "SELECT disruption_id, type, location, severity FROM disruptions WHERE status = 'Active'"
    ).fetchall()

    context_parts = [
        f"Simulation Active: {sim_active}",
        f"Total Shipments: {risk_sum['total_shipments']}",
        f"Critical Risk: {risk_sum['critical_risk']}",
        f"High Risk: {risk_sum['high_risk']}",
        f"Active Disruptions: {len(disruptions)}",
    ]

    for d in disruptions:
        context_parts.append(
            f"Disruption: {d['type']} at {d['location']} ({d['severity']})"
        )

    # If query mentions a specific shipment, include its details
    import re
    match = re.search(r'(SHP-\d+)', query.upper())
    if match:
        sid = match.group(1)
        ship = conn.execute(
            "SELECT * FROM shipments WHERE shipment_id = ?", (sid,)
        ).fetchone()
        if ship:
            context_parts.append(
                f"Shipment {sid}: {ship['cargo_description']}, "
                f"{ship['origin']}→{ship['destination']}, "
                f"Status: {ship['status']}, Priority: {ship['priority']}"
            )

    return "\n".join(context_parts)
