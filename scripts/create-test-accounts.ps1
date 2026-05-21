# Phase 1.5 Test Accounts Creation Script
param(
    [string]$AdminEmail = "edward@gmail.com",
    [string]$AdminPassword = "1234"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Creating Test Accounts for Technician Workflow QA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login and get admin token
Write-Host "Step 1: Getting admin token..." -ForegroundColor Yellow
try {
    $loginBody = @{email=$AdminEmail; password=$AdminPassword} | ConvertTo-Json
    $loginRes = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $loginBody `
        -UseBasicParsing `
        -ErrorAction Stop
    
    $loginData = $loginRes.Content | ConvertFrom-Json
    $token = $loginData.token
    Write-Host "✅ Got admin token" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to login: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Create Tech record
Write-Host "Step 2: Creating Tech record..." -ForegroundColor Yellow
try {
    $techBody = @{
        name="John Smith"
        email="john.smith@company.com"
        phone="555-1234"
        active=$true
    } | ConvertTo-Json
    
    $techRes = Invoke-WebRequest -Uri "http://localhost:5000/api/techs" `
        -Method POST `
        -Headers @{
            "Content-Type"="application/json"
            "Authorization"="Bearer $token"
        } `
        -Body $techBody `
        -UseBasicParsing `
        -ErrorAction Stop
    
    $techData = $techRes.Content | ConvertFrom-Json
    $techId = $techData._id
    Write-Host "✅ Tech created with ID: $techId" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create tech: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Create Technician User account
Write-Host "Step 3: Creating Technician User account..." -ForegroundColor Yellow
try {
    $userBody = @{
        name="John Smith"
        email="john.tech@company.com"
        password="TestPass123"
        role="technician"
        techId=$techId
    } | ConvertTo-Json
    
    $userRes = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" `
        -Method POST `
        -Headers @{
            "Content-Type"="application/json"
            "Authorization"="Bearer $token"
        } `
        -Body $userBody `
        -UseBasicParsing `
        -ErrorAction Stop
    
    $userData = $userRes.Content | ConvertFrom-Json
    Write-Host "✅ Technician user created" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create user: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ TEST ACCOUNTS CREATED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "ADMIN ACCOUNT:" -ForegroundColor Cyan
Write-Host "  Email:    edward@gmail.com" -ForegroundColor White
Write-Host "  Password: 1234" -ForegroundColor White
Write-Host ""
Write-Host "TECHNICIAN ACCOUNT:" -ForegroundColor Cyan
Write-Host "  Email:    john.tech@company.com" -ForegroundColor White
Write-Host "  Password: TestPass123" -ForegroundColor White
Write-Host ""
Write-Host "TECHNICIAN NAME: John Smith" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Open Admin Portal (http://localhost:5173)" -ForegroundColor White
Write-Host "2. Login as admin (edward@gmail.com / 1234)" -ForegroundColor White
Write-Host "3. Create a new job and assign it to 'John Smith'" -ForegroundColor White
Write-Host "4. Open a NEW INCOGNITO WINDOW" -ForegroundColor White
Write-Host "5. Login as technician (john.tech@company.com / TestPass123)" -ForegroundColor White
Write-Host "6. Verify you see the job in 'My Jobs'" -ForegroundColor White
Write-Host "7. Update job status (Assigned → Accepted → etc.)" -ForegroundColor White
Write-Host ""
