# ChainGuard AI — Source Code Directory

This directory contains the complete source code for ChainGuard AI, split into backend and frontend services.

---

## Directory Organization

```
src/
├── backend/                  # FastAPI Application, Services & SQLite DB
│   ├── app/
│   │   ├── core/             # Configuration & environment settings (config.py)
│   │   ├── database/         # DB connection, schema DDL, and CSV seeding engine
│   │   ├── models/           # Pydantic data schemas & request/response types
│   │   ├── routes/           # REST API endpoints (health, dashboard, shipments, disruptions, fleet, cold-chain, AI)
│   │   ├── services/         # Core business logic:
│   │   │   ├── ai_provider.py         # watsonx.ai integration + heuristic fallback
│   │   │   ├── cold_chain.py          # IoT temperature sensor monitor & excursion alerts
│   │   │   ├── disruption_engine.py   # Spatial disruption-to-shipment correlation
│   │   │   ├── fleet_intelligence.py  # Fleet utilization & redeployment optimizer
│   │   │   ├── rerouting_engine.py    # Multi-objective Pareto trade-off scoring
│   │   │   └── risk_engine.py         # Composite supply chain risk scoring
│   │   └── main.py           # FastAPI entrypoint, middleware, and route registration
│   ├── seed_data/            # Synthetic CSV datasets (shipments, disruptions, fleet, sensor_logs)
│   ├── tests/                # Pytest test suite (test_api.py)
│   ├── .env.example          # Template for environment variables
│   └── requirements.txt      # Python dependencies (FastAPI, Uvicorn, ibm-watsonx-ai, etc.)
│
└── frontend/                 # React 18 + Vite Web Application
    ├── public/               # Favicon and static web assets
    ├── src/
    │   ├── assets/           # UI media & brand logos
    │   ├── components/       # Reusable components (Navbar, StatsCard, StatusBadge, Modal)
    │   ├── layouts/          # DashboardLayout (Sidebar navigation + content shell)
    │   ├── pages/            # 6 Interactive Operations Views:
    │   │   ├── Overview.jsx           # High-level KPIs, risk distribution & simulation controls
    │   │   ├── Disruptions.jsx        # Active disruption events & geographic impact zones
    │   │   ├── Shipments.jsx          # Shipment manifest, detail drawer & rerouting modal
    │   │   ├── Fleet.jsx              # Fleet asset cards, utilization meters & re-allocation
    │   │   ├── ColdChain.jsx          # Temperature sensor charts & cold-chain compliance alerts
    │   │   └── AICopilot.jsx          # Interactive AI chat assistant with prompt chips
    │   ├── services/         # Axios API client (api.js) connecting to FastAPI
    │   ├── App.jsx           # React Router DOM routes
    │   ├── index.css         # Custom glassmorphic dark theme tokens & styles
    │   └── main.jsx          # React DOM entry point
    ├── index.html            # Web page shell with Inter typography & metadata
    ├── package.json          # Frontend dependencies (Lucide React, Recharts, Axios)
    └── vite.config.js        # Vite build & local dev server configuration
```

---

## Quickstart

### 1. Run Backend
```bash
cd src/backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### 2. Run Frontend
```bash
cd src/frontend
npm install
npm run dev
```
Navigate to: `http://localhost:5173`
