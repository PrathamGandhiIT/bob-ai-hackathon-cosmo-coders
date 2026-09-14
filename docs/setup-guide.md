# Setup Guide: Supply Guard AI

> **This file provides comprehensive instructions for local development, verification, and testing of Supply Guard AI.**

---

## Prerequisites

Before running the application, ensure your environment has:

- **Python 3.10+** (Tested on 3.10, 3.11, 3.12)
- **Node.js 18+** and **npm 9+**
- **Git**
- *(Optional)* **IBM watsonx.ai Account**: An IBM Cloud API key and Project ID for live foundation model queries. *(Note: Supply Guard AI includes an intelligent domain-heuristic fallback engine, allowing full functionality even without live watsonx credentials).*

---

## Environment Configuration

Copy `.env.example` in `src/backend/` to `.env`:

```bash
# In src/backend
cp .env.example .env
```

### Supported Environment Variables

| Variable | Description | Required | Default |
| :--- | :--- | :---: | :--- |
| `WATSONX_APIKEY` | IBM Cloud API key for watsonx.ai | No (Fallback active) | `""` |
| `WATSONX_PROJECT_ID` | Project GUID from your watsonx.ai workspace | No (Fallback active) | `""` |
| `WATSONX_URL` | watsonx.ai service endpoint URL | No | `https://us-south.ml.cloud.ibm.com` |
| `WATSONX_MODEL_ID` | Model identifier | No | `ibm/granite-13b-instruct-v2` |
| `APP_ENV` | Application environment (`development` / `production`) | No | `development` |
| `DB_PATH` | Path to SQLite database file | No | `app/database/supply_chain.db` |

---

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/hars-star/bob-ai-hackathon-cosmo-coders.git
cd bob-ai-hackathon-cosmo-coders
```

### 2. Backend Installation

```bash
cd src/backend

# (Recommended) Create and activate a virtual environment:
# On Windows PowerShell:
python -m venv venv
.\venv\Scripts\Activate.ps1

# On Linux/macOS:
python3 -m venv venv
source venv/bin/activate

# Install dependencies:
pip install -r requirements.txt
```

### 3. Frontend Installation

In a second terminal:

```bash
cd src/frontend

# Install npm packages:
npm install
```

---

## Running the Application

### 1. Launch the Backend API

```bash
cd src/backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- The backend initializes the SQLite database and seeds default data automatically on startup.
- Interactive API Documentation (Swagger UI): `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/api/health`

### 2. Launch the Frontend Development Server

In your second terminal:

```bash
cd src/frontend
npm run dev
```
- Open your browser to: `http://localhost:5173`

---

## Running Tests

### Backend Unit & Integration Tests

From the repository root or `src/backend`:

```bash
# Run pytest test suite:
pytest src/backend/tests/ -v
```

### Frontend Build Verification

```bash
cd src/frontend
npm run build
```

---

## Quick Verification Checklist

1. Open `http://localhost:5173` in your browser.
2. Check the **Overview Dashboard** — verify KPI metrics, Risk Distribution, and Active Disruptions are loaded.
3. Click **"Simulate New Disruption"** on the Overview or Disruptions page to trigger live disruption matching.
4. Navigate to **Shipments & Rerouting** — click on an affected shipment (e.g. `SHP-104`) and click **"Reroute Options"** to view cost, delay, and CO2 trade-offs.
5. Navigate to **Fleet Utilization** — filter by "Idle" assets to inspect candidate vehicles for reroute absorption.
6. Navigate to **Cold Chain** — verify temperature history charts and alert badges.
7. Navigate to **AI Copilot** — click any suggested query (e.g. *"What should I do about shipment SHP-104?"*) to verify the AI response.

---

## Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `Port 8000 already in use` | Another process is bound to port 8000 | Stop the existing process or change port: `uvicorn app.main:app --port 8080` (and update frontend API baseUrl in `src/frontend/src/services/api.js`). |
| `Network Error` in Frontend | Backend server is not running | Start backend via `python -m uvicorn app.main:app --port 8000`. |
| `watsonx 401 / 403 error` | Expired or incorrect IBM API key | Verify `WATSONX_APIKEY` and `WATSONX_PROJECT_ID` in `.env`. If not available, leave them blank to use the built-in heuristic AI fallback. |
| `Database locked` | Simultaneous write lock on SQLite | Restart the backend server; SQLite unlocks automatically. |
