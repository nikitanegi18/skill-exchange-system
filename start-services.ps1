Write-Host "==============================================" -ForegroundColor Cyan
Write-Host " Starting Skill Exchange System Services" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

$root = $PSScriptRoot

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; npm run start:user"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; npm run start:skill"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; npm run start:exchange"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"

Write-Host ""
Write-Host "All services launched in separate windows:" -ForegroundColor Green
Write-Host "  - User Service:     http://localhost:5001" -ForegroundColor Yellow
Write-Host "  - Skill Service:    http://localhost:5002" -ForegroundColor Yellow
Write-Host "  - Exchange Service: http://localhost:5003" -ForegroundColor Yellow
Write-Host "  - Frontend:         http://localhost:5173" -ForegroundColor Yellow

