# Call-A-Technician - Start All Applications
# This script starts all three applications in separate windows

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Call-A-Technician Platform  " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get current directory
$rootDir = $PSScriptRoot
if (-not $rootDir) {
    $rootDir = Get-Location
}

Write-Host "Root Directory: $rootDir" -ForegroundColor Yellow
Write-Host ""

# Start Backend API
Write-Host "[1/3] Starting Backend API..." -ForegroundColor Green
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$rootDir\packages\backend-api'; Write-Host '========================================' -ForegroundColor Green; Write-Host '   BACKEND API - PORT 3000' -ForegroundColor White; Write-Host '========================================' -ForegroundColor Green; Write-Host ''; npm run dev"
)

Start-Sleep -Seconds 2

# Start Admin Portal
Write-Host "[2/3] Starting Admin Portal..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$rootDir\apps\admin-portal'; Write-Host '========================================' -ForegroundColor Cyan; Write-Host '   ADMIN PORTAL - PORT 5173' -ForegroundColor White; Write-Host '========================================' -ForegroundColor Cyan; Write-Host ''; npm run dev"
)

Start-Sleep -Seconds 2

# Start Marketing Site
Write-Host "[3/3] Starting Marketing Site..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$rootDir\apps\marketing-site'; Write-Host '========================================' -ForegroundColor Yellow; Write-Host '   MARKETING SITE - PORT 5174' -ForegroundColor White; Write-Host '========================================' -ForegroundColor Yellow; Write-Host ''; npm run dev"
)

Write-Host ""
Write-Host "✅ All applications are starting..." -ForegroundColor Green
Write-Host ""
Write-Host "📋 You should see 3 PowerShell windows:" -ForegroundColor Cyan
Write-Host "   1. Backend API (Green) - http://localhost:3000" -ForegroundColor White
Write-Host "   2. Admin Portal (Cyan) - http://localhost:5173" -ForegroundColor White
Write-Host "   3. Marketing Site (Yellow) - http://localhost:5174" -ForegroundColor White
Write-Host ""
Write-Host "⏱️  Wait 30-60 seconds for all applications to compile and start..." -ForegroundColor Yellow
Write-Host ""
Write-Host "🌐 Then open your browser to:" -ForegroundColor Magenta
Write-Host "   • Marketing Site: http://localhost:5174" -ForegroundColor White
Write-Host "   • Admin Portal:   http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT: Make sure MongoDB is running!" -ForegroundColor Red
Write-Host "   If backend shows MongoDB error, start MongoDB first." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
