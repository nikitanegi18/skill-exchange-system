@echo off
echo ==============================================
echo  Starting Skill Exchange System Services
echo ==============================================

echo Starting User Service (Port 5001)...
start "User Service [5001]" cmd /k "cd /d %~dp0backend && npm run start:user"

echo Starting Skill Service (Port 5002)...
start "Skill Service [5002]" cmd /k "cd /d %~dp0backend && npm run start:skill"

echo Starting Exchange Service (Port 5003)...
start "Exchange Service [5003]" cmd /k "cd /d %~dp0backend && npm run start:exchange"

echo Starting E2EE Messaging (Port 3001)...
start "E2EE Service [3001]" cmd /k "cd /d %~dp0backend && node e2ee-backend.js"

echo Starting Frontend (Port 5174)...
start "Frontend [5174]" cmd /k "cd /d %~dp0frontend && npm run dev -- --port 5174"

echo.
echo All services have been launched in separate terminal windows!
echo - User Service:     http://localhost:5001
echo - Skill Service:    http://localhost:5002
echo - Exchange Service: http://localhost:5003
echo - Frontend:         http://localhost:5173
echo.
pause

