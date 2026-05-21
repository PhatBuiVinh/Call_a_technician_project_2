# Quick Test: Admin-Managed Technician Account Creation
$api = "http://localhost:5000"

Write-Host "`n=== TECHNICIAN ACCOUNT CREATION TEST ===" -ForegroundColor Cyan

# Step 1: Admin Login
Write-Host "`n[1] Admin Login..." -ForegroundColor Yellow
$adminBody = '{"email":"edward@gmail.com","password":"1234"}'
try {
    $resp = Invoke-WebRequest -Uri "$api/api/auth/login" -Method Post `
        -ContentType "application/json" -Body $adminBody -UseBasicParsing -ErrorAction Stop
    $adminData = $resp.Content | ConvertFrom-Json
    $token = $adminData.token
    Write-Host "OK - Token obtained" -ForegroundColor Green
} catch {
    Write-Host "FAILED - $($_.Exception.Message)" -ForegroundColor Red
    exit
}

$headers = @{"Authorization" = "Bearer $token"}

# Step 2: Get techs
Write-Host "`n[2] Get Technicians..." -ForegroundColor Yellow
try {
    $resp = Invoke-WebRequest -Uri "$api/api/techs" -Headers $headers `
        -UseBasicParsing -ErrorAction Stop
    $techs = $resp.Content | ConvertFrom-Json
    Write-Host "OK - Got $($techs.Count) technicians" -ForegroundColor Green
    
    # Find tech without account
    $techNoAccount = $techs | Where-Object { -not $_.hasLoginAccount } | Select-Object -First 1
    
    if ($techNoAccount) {
        Write-Host "   Found tech without account: $($techNoAccount.name)" -ForegroundColor Cyan
    } else {
        Write-Host "   All techs have accounts - creating test tech..." -ForegroundColor Yellow
        $newBody = @{
            name = "Test Tech $(Get-Random)"
            email = "test-$(Get-Random)@test.com"
            phone = "555-0000"
            active = $true
        } | ConvertTo-Json
        
        $resp = Invoke-WebRequest -Uri "$api/api/techs" -Method Post -Headers $headers `
            -ContentType "application/json" -Body $newBody -UseBasicParsing -ErrorAction Stop
        $techNoAccount = $resp.Content | ConvertFrom-Json
        Write-Host "   Created: $($techNoAccount.name)" -ForegroundColor Green
    }
} catch {
    Write-Host "FAILED - $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Step 3: Create account
Write-Host "`n[3] Create Login Account..." -ForegroundColor Yellow
$email = "tech-login-$(Get-Random)@company.com"
$password = "TestPass123"
$accountBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $resp = Invoke-WebRequest -Uri "$api/api/techs/$($techNoAccount._id)/create-account" `
        -Method Post -Headers $headers -ContentType "application/json" `
        -Body $accountBody -UseBasicParsing -ErrorAction Stop
    $userData = $resp.Content | ConvertFrom-Json
    Write-Host "OK - Account created" -ForegroundColor Green
    Write-Host "   Email: $($userData.user.email)" -ForegroundColor Cyan
    Write-Host "   Role: $($userData.user.role)" -ForegroundColor Cyan
} catch {
    Write-Host "FAILED - $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Step 4: Check duplicate email
Write-Host "`n[4] Test Duplicate Email Prevention..." -ForegroundColor Yellow
$dupBody = @{
    email = $email
    password = "AnotherPass456"
} | ConvertTo-Json

try {
    $resp = Invoke-WebRequest -Uri "$api/api/techs/$($techNoAccount._id)/create-account" `
        -Method Post -Headers $headers -ContentType "application/json" `
        -Body $dupBody -UseBasicParsing -ErrorAction Stop
    Write-Host "FAILED - Duplicate email was NOT blocked!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 409) {
        Write-Host "OK - Duplicate blocked (409)" -ForegroundColor Green
    } else {
        Write-Host "ERROR - Unexpected status: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Red
    }
}

# Step 5: Check duplicate techId
Write-Host "`n[5] Test Duplicate TechId Prevention..." -ForegroundColor Yellow
$dupTechBody = @{
    email = "another-$(Get-Random)@company.com"
    password = "AnotherPass456"
} | ConvertTo-Json

try {
    $resp = Invoke-WebRequest -Uri "$api/api/techs/$($techNoAccount._id)/create-account" `
        -Method Post -Headers $headers -ContentType "application/json" `
        -Body $dupTechBody -UseBasicParsing -ErrorAction Stop
    Write-Host "FAILED - Duplicate techId was NOT blocked!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 409) {
        Write-Host "OK - Duplicate blocked (409)" -ForegroundColor Green
    } else {
        Write-Host "ERROR - Unexpected status: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Red
    }
}

# Step 6: Login with new account
Write-Host "`n[6] Login with New Account..." -ForegroundColor Yellow
$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $resp = Invoke-WebRequest -Uri "$api/api/auth/login" -Method Post `
        -ContentType "application/json" -Body $loginBody -UseBasicParsing -ErrorAction Stop
    $userData = $resp.Content | ConvertFrom-Json
    Write-Host "OK - Login successful" -ForegroundColor Green
    Write-Host "   Name: $($userData.user.name)" -ForegroundColor Cyan
    Write-Host "   Email: $($userData.user.email)" -ForegroundColor Cyan
    Write-Host "   Role: $($userData.user.role)" -ForegroundColor Cyan
    
    if ($userData.user.role -eq "technician") {
        Write-Host "   ✓ Role is 'technician'" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Role should be 'technician'" -ForegroundColor Red
    }
} catch {
    Write-Host "FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Step 7: Test access control
Write-Host "`n[7] Test Access Control (Non-Admin)..." -ForegroundColor Yellow
if ($userData.token) {
    $techHeaders = @{"Authorization" = "Bearer $($userData.token)"}
    
    try {
        $resp = Invoke-WebRequest -Uri "$api/api/techs" -Headers $techHeaders `
            -UseBasicParsing -ErrorAction Stop
        Write-Host "FAILED - Tech user can access admin endpoint!" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode.Value__ -eq 403) {
            Write-Host "OK - Tech blocked from admin endpoint (403)" -ForegroundColor Green
        } else {
            Write-Host "ERROR - Unexpected status: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Red
        }
    }
}

Write-Host "`n=== TEST COMPLETE ===" -ForegroundColor Green
