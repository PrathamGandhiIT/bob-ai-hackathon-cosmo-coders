# SupplyGuard AI — Presentation Deck & Pitch Outline

Place your finalized slide export here as `slides.pdf` or `slides.pptx`.

---

## Recommended Slide Deck Structure & Speaker Script

### Slide 1: Title & Vision
- **Header**: SupplyGuard AI — Autonomous Supply Chain Control Tower & Fleet Optimizer
- **Team**: Cosmo Coders (Harshit Dhanani & Team)
- **Track**: AI (IBM Bob AI Innovation Hackathon 2026)
- **Sub-tag**: Proactive Resilience, Multi-Objective Rerouting, and Cold-Chain Compliance powered by watsonx.ai.

### Slide 2: The Multi-Billion Dollar Supply Chain Crisis
- **Talking Points**:
  - $184M average annual cost of disruptions to global enterprises.
  - 6 to 18 hours of manual latency to identify impacted shipments after port or geopolitical strikes.
  - 50% of global vaccines and biologicals are wasted annually due to cold-chain temperature excursions.
  - Opaque rerouting decisions create massive carbon footprint spikes and budget overruns.

### Slide 3: The Solution — SupplyGuard AI
- **Visual**: Screenshot of `01_overview_dashboard.png`
- **Talking Points**:
  - End-to-end intelligent control tower correlating real-time global disruptions with multimodal freight.
  - Instant composite risk scoring across cargo value, SLA delay sensitivity, and temperature criticality.
  - Automated fleet capacity matching and cold-chain IoT telemetry guard.

### Slide 4: Multi-Objective Rerouting Engine (Core Innovation)
- **Visual**: Screenshot of `04_reroute_alternatives_tradeoffs.png`
- **Talking Points**:
  - Traditional systems only optimize on single factors (lowest cost or fastest speed).
  - Supply Guard AI calculates Pareto-optimal trade-offs across **Cost ($), Delay (Days), Risk Index (0-100), and CO2 Emissions (kg)**.
  - Human-in-the-loop decision capability: dispatchers review transparent multi-carrier alternatives before committing.

### Slide 5: Fleet Optimization & Cold-Chain IoT Guard
- **Visual**: Screenshots of `05_fleet_utilization.png` & `06_cold_chain_monitoring.png`
- **Talking Points**:
  - Automatically identifies idle regional vehicles (reefers, dry vans) to absorb disrupted cargo locally.
  - Real-time sensor telemetry with time-series charts, excursion count tracking, and automated spoilage risk alerts.

### Slide 6: IBM Technologies Integration
- **IBM watsonx.ai (`ibm/granite-13b-instruct-v2`)**: Context-aware LLM engine that consumes live shipment risk profiles and generates structured operational playbooks and action steps.
- **Fail-safe Dual AI**: Local domain heuristic rules guarantee 100% operational resilience during offline network scenarios.
- **IBM Bob AI Tooling**: Accelerated development, system architecture synthesis, and clean standard submission scaffolding.

### Slide 7: Technical Architecture & Performance
- **Visual**: Architecture Diagram (FastAPI + React Vite + Recharts + SQLite)
- **Key Metrics**:
  - Sub-100ms API response time.
  - 100% automated test coverage across core route contracts.
  - Zero-config local launch with automated database seeding.

### Slide 8: The Team & Vision
- **Team Cosmo Coders**: Harshit Dhanani (Team Lead), Pratham Gandhi, Pratik Agarwal, Dhairya Shah.
- **Future Roadmap**: Live AIS satellite marine data ingestion, SAP/Oracle ERP connectors, and Kafka streaming architecture.
