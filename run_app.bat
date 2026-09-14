@echo off
echo ===================================================
echo  Starting SupplyGuard AI - Control Tower Prototype
echo ===================================================

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "SupplyGuard Backend (FastAPI)" cmd /k "cd src\backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

echo [2/2] Starting Vite Frontend on http://localhost:5173 ...
start "SupplyGuard Frontend (Vite)" cmd /k "cd src\frontend && npm run dev"

echo.
echo All services started successfully!
echo Open your browser at: http://localhost:5173
echo ===================================================
