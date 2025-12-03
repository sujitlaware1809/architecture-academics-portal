Write-Host "Starting backend server..."
Set-Location "$PSScriptRoot"
& ".\winvenv\Scripts\python.exe" run_server.py