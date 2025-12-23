@echo off
echo Stopping existing server...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq *uvicorn*" 2>nul

echo Starting backend server...
cd /d E:\Projects\client\Suresh_Sir_Arch\backend
winvenv\Scripts\python.exe run_server.py
