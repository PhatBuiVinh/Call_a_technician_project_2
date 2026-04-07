# Start all Call-A-Technician services
Write-Host "Starting Call-A-Technician Services..." -ForegroundColor Cyan

# Start Backend API
Write-Host "`n[1/3] Starting Backend API..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'packages\backend-api'; Write-Host 'Backend API Starting...' -ForegroundColor Green; node server.js"

Start-Sleep -Seconds 2

# Start Admin Portal
Write-Host "[2/3] Starting Admin Portal..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'apps\admin-portal'; Write-Host 'Admin Portal Starting...' -ForegroundColor Green; npx vite"

Start-Sleep -Seconds 2

# Start Marketing Site
Write-Host "[3/3] Starting Marketing Site..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'apps\marketing-site'; Write-Host 'Marketing Site Starting...' -ForegroundColor Green; npx vite --port 5174"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Services are starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nThree PowerShell windows should open:" -ForegroundColor White
Write-Host "  1. Backend API (port 3000)" -ForegroundColor Gray
Write-Host "  2. Admin Portal (port 5173)" -ForegroundColor Gray
Write-Host "  3. Marketing Site (port 5174)" -ForegroundColor Gray
Write-Host "`nWait for all to finish loading..." -ForegroundColor Yellow
Write-Host "`nAccess your apps at:" -ForegroundColor White
Write-Host "  Marketing Site: http://localhost:5174" -ForegroundColor Cyan
Write-Host "  Admin Portal:   http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend API:    http://localhost:3000" -ForegroundColor Cyan
Write-Host ""


