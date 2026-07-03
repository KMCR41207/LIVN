@echo off
echo Starting Livaani servers...

:: Start backend server
start "Livaani Backend" cmd /k "cd /d %~dp0server && node index.js"

:: Wait a moment then start frontend
timeout /t 2 /nobreak > nul
start "Livaani Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo Both servers started!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5174
