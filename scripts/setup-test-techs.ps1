$api = "http://localhost:5000"

Write-Host "Step 1: Login as admin..." -ForegroundColor Yellow
$loginBody = '{"email":"edward@gmail.com","password":"1234"}'
$resp = Invoke-WebRequest -Uri "$api/api/auth/login" -Method Post -ContentType "application/json" -Body $loginBody -UseBasicParsing
$adminData = $resp.Content | ConvertFrom-Json
$token = $adminData.token
$headers = @{"Authorization" = "Bearer $token"}
Write-Host "OK" -ForegroundColor Green

Write-Host "`nStep 2: Get current technicians..." -ForegroundColor Yellow
$resp = Invoke-WebRequest -Uri "$api/api/techs" -Headers $headers -UseBasicParsing
$techs = $resp.Content | ConvertFrom-Json
Write-Host "Found: $($techs.Count) technicians" -ForegroundColor Cyan

if ($techs.Count -eq 0) {
    Write-Host "`nStep 3: Creating test technicians..." -ForegroundColor Yellow
    
    $techs = @()
    
    for ($i = 1; $i -le 3; $i++) {
        $body = @{
            name = "Technician $i"
            email = "tech$i@company.com"
            phone = "555-000$i"
            active = $true
        } | ConvertTo-Json
        
        $resp = Invoke-WebRequest -Uri "$api/api/techs" -Method Post -Headers $headers -ContentType "application/json" -Body $body -UseBasicParsing
        $newTech = $resp.Content | ConvertFrom-Json
        $techs += $newTech
        Write-Host "  Created: $($newTech.name)" -ForegroundColor Green
    }
    
    Write-Host "`nNow all technicians have NO login accounts!" -ForegroundColor Yellow
    Write-Host "Go to http://localhost:5173/app and navigate to Technicians" -ForegroundColor Cyan
    Write-Host "You should now see the 'Create Login' button!" -ForegroundColor Cyan
} else {
    Write-Host "`nTechnicians found:" -ForegroundColor Green
    $techs | ForEach-Object {
        $status = if ($_.hasLoginAccount) { "HAS account" } else { "NO account" }
        Write-Host "  - $($_.name): $status" -ForegroundColor Cyan
    }
}
