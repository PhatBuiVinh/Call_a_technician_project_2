$api = "http://localhost:5000"

Write-Host "Checking technician account status..." -ForegroundColor Yellow

$loginBody = '{"email":"edward@gmail.com","password":"1234"}'
$resp = Invoke-WebRequest -Uri "$api/api/auth/login" -Method Post -ContentType "application/json" -Body $loginBody -UseBasicParsing
$adminData = $resp.Content | ConvertFrom-Json
$token = $adminData.token
$headers = @{"Authorization" = "Bearer $token"}

$resp = Invoke-WebRequest -Uri "$api/api/techs" -Headers $headers -UseBasicParsing
$techs = $resp.Content | ConvertFrom-Json

Write-Host "`nTechnician Account Status:" -ForegroundColor Cyan
Write-Host "--------------------------------------" -ForegroundColor Gray

$withoutCount = 0
$withCount = 0

foreach ($tech in $techs) {
    if ($tech.hasLoginAccount) {
        $withCount = $withCount + 1
        Write-Host ("OK $($tech.name) - HAS account: " + $tech.loginEmail) -ForegroundColor Green
    } else {
        $withoutCount = $withoutCount + 1
        Write-Host ("NO $($tech.name) - NO account") -ForegroundColor Yellow
    }
}

Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "  With accounts:    $withCount" -ForegroundColor Green
Write-Host "  Without accounts: $withoutCount" -ForegroundColor Yellow

if ($withoutCount -eq 0) {
    Write-Host "`nAll technicians have accounts - Create Login button will NOT show!" -ForegroundColor Yellow
}
