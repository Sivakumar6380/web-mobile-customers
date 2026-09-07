@echo off
echo Starting Backend API...
start cmd /k "cd backend && venv\Scripts\activate && python app.py"

echo Starting Frontend Dev Server...
start cmd /k "cd frontend && npm.cmd run dev"

echo Both servers are starting!
timeout /t 3 /nobreak >nul
start http://localhost:5173

