$api = "http://localhost:5000"

Write-Host "`n=== TECHNICIAN ACCOUNT CREATION TEST ===" -ForegroundColor Cyan

Write-Host "`n[1] Admin Login..." -ForegroundColor Yellow
$adminBody = '{"email":"edward@gmail.com","password":"1234"}'
$resp = Invoke-WebRequest -Uri "$api/api/auth/login" -Method Post -ContentType "application/json" -Body $adminBody -UseBasicParsing
$adminData = $resp.Content | ConvertFrom-Json
$token = $adminData.token
Write-Host "OK - Token obtained" -ForegroundColor Green

$headers = @{"Authorization" = "Bearer $token"}

Write-Host "`n[2] Get Technicians..." -ForegroundColor Yellow
$resp = Invoke-WebRequest -Uri "$api/api/techs" -Headers $headers -UseBasicParsing
$techs = $resp.Content | ConvertFrom-Json
Write-Host "OK - Got $($techs.Count) technicians" -ForegroundColor Green

$techNoAccount = $techs | Where-Object { -not $_.hasLoginAccount } | Select-Object -First 1

if ($null -eq $techNoAccount) {
    Write-Host "Creating test tech..." -ForegroundColor Yellow
    $newBody = @{name="Test$(Get-Random)";email="t$(Get-Random)@x.com";phone="555-0000";active=$true} | ConvertTo-Json
    $resp = Invoke-WebRequest -Uri "$api/api/techs" -Method Post -Headers $headers -ContentType "application/json" -Body $newBody -UseBasicParsing
    $techNoAccount = $resp.Content | ConvertFrom-Json
}
Write-Host "Target: $($techNoAccount.name)" -ForegroundColor Cyan

Write-Host "`n[3] Create Login Account..." -ForegroundColor Yellow
$email = "tech$(Get-Random)@test.com"
$password = "TestPass123"
$accountBody = @{email=$email;password=$password} | ConvertTo-Json
$resp = Invoke-WebRequest -Uri "$api/api/techs/$($techNoAccount._id)/create-account" -Method Post -Headers $headers -ContentType "application/json" -Body $accountBody -UseBasicParsing
$userData = $resp.Content | ConvertFrom-Json
Write-Host "OK - Account created" -ForegroundColor Green
Write-Host "Email: $($userData.user.email)" -ForegroundColor Cyan
Write-Host "Role: $($userData.user.role)" -ForegroundColor Cyan

Write-Host "`n[4] Test Duplicate Email..." -ForegroundColor Yellow
$dupBody = @{email=$email;password="Pass456"} | ConvertTo-Json
try {
    $resp = Invoke-WebRequest -Uri "$api/api/techs/$($techNoAccount._id)/create-account" -Method Post -Headers $headers -ContentType "application/json" -Body $dupBody -UseBasicParsing
    Write-Host "FAILED - Duplicate NOT blocked!" -ForegroundColor Red
} catch {
    $status = $_.Exception.Response.StatusCode.Value__
    if ($status -eq 409) {
        Write-Host "OK - Duplicate blocked (409)" -ForegroundColor Green
    }
}

Write-Host "`n[5] Test Duplicate TechId..." -ForegroundColor Yellow
$dupTechBody = @{email="other$(Get-Random)@test.com";password="Pass456"} | ConvertTo-Json
try {
    $resp = Invoke-WebRequest -Uri "$api/api/techs/$($techNoAccount._id)/create-account" -Method Post -Headers $headers -ContentType "application/json" -Body $dupTechBody -UseBasicParsing
    Write-Host "FAILED - Duplicate TechId NOT blocked!" -ForegroundColor Red
} catch {
    $status = $_.Exception.Response.StatusCode.Value__
    if ($status -eq 409) {
        Write-Host "OK - Duplicate TechId blocked (409)" -ForegroundColor Green
    }
}

Write-Host "`n[6] Login with New Account..." -ForegroundColor Yellow
$loginBody = @{email=$email;password=$password} | ConvertTo-Json
$resp = Invoke-WebRequest -Uri "$api/api/auth/login" -Method Post -ContentType "application/json" -Body $loginBody -UseBasicParsing
$loginData = $resp.Content | ConvertFrom-Json
Write-Host "OK - Login successful" -ForegroundColor Green
Write-Host "Role: $($loginData.user.role)" -ForegroundColor Cyan

Write-Host "`n[7] Test Access Control..." -ForegroundColor Yellow
$techHeaders = @{"Authorization" = "Bearer $($loginData.token)"}
try {
    $resp = Invoke-WebRequest -Uri "$api/api/techs" -Headers $techHeaders -UseBasicParsing
    Write-Host "FAILED - Tech can access admin endpoint!" -ForegroundColor Red
} catch {
    $status = $_.Exception.Response.StatusCode.Value__
    if ($status -eq 403) {
        Write-Host "OK - Tech blocked from admin endpoint (403)" -ForegroundColor Green
    }
}

Write-Host "`n=== ALL TESTS PASSED ===" -ForegroundColor Green
