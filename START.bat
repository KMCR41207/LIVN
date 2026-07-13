@echo off
echo Starting Livaani servers...

:: Kill anything on port 5000 first to avoid EADDRINUSE
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
  taskkill /PID %%a /F >nul 2>&1
)

:: Start backend server
start "Livaani Backend" cmd /k "cd /d %~dp0backend && node index.js"

:: Wait for backend to be ready then start frontend
timeout /t 3 /nobreak > nul
start "Livaani Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ✅ Both servers started!
echo    Backend:  http://localhost:5000
echo    Frontend: http://localhost:5173
echo    Admin:    http://localhost:5173/admin
echo.
pause
