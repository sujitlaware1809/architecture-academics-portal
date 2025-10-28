@echo off
echo Starting Architecture Academics Portal...
echo.

REM Create a new window for the backend
echo [1/2] Starting Backend (FastAPI)...
start "Backend - FastAPI" cmd /k "cd /d "%~dp0backend" && .\winvenv\Scripts\activate && python run_server.py"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Create a new window for the frontend
echo [2/2] Starting Frontend (Next.js)...
start "Frontend - Next.js" cmd /k "cd /d "%~dp0frontend" && pnpm dev"

echo.
echo ✅ Both services are starting...
echo.
echo 📡 Backend will be available at: http://localhost:8000
echo 🌐 Frontend will be available at: http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul