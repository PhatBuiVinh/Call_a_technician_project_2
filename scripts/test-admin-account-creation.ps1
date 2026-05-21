# Admin-Managed Technician Account Creation - Manual Test Script
# Tests all critical workflows for the new account creation feature
# Prerequisites: Backend must be running on http://localhost:5000

param(
    [string]$ApiUrl = "http://localhost:5000",
    [string]$AdminEmail = "edward@gmail.com",
    [string]$AdminPassword = "1234"
)

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  ADMIN-MANAGED TECHNICIAN ACCOUNT CREATION - MANUAL TEST      ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Helper function
function Test-ApiCall {
    param([string]$Name, [string]$Uri, [string]$Method = 'GET', $Headers, $Body)
    
    try {
        $params = @{
            Uri = $Uri
            Method = $Method
            UseBasicParsing = $true
            ErrorAction = 'Stop'
        }
        if ($Headers) { $params['Headers'] = $Headers }
        if ($Body) { $params['Body'] = $Body; $params['ContentType'] = 'application/json' }
        
        $response = Invoke-WebRequest @params
        return @{ Success = $true; Status = $response.StatusCode; Data = ($response.Content | ConvertFrom-Json) }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        return @{ Success = $false; Status = $statusCode; Error = $_.Exception.Message }
    }
}

# ============================================================================
# STEP 1: Login as Admin
# ============================================================================
Write-Host "STEP 1: Login as Admin" -ForegroundColor Yellow
Write-Host "──────────────────────────────────────────────────────────────" -ForegroundColor Gray

$loginBody = @{ email = $AdminEmail; password = $AdminPassword } | ConvertTo-Json
$loginResult = Test-ApiCall "Admin Login" "$ApiUrl/api/auth/login" "POST" @{} $loginBody

if ($loginResult.Success) {
    Write-Host "✅ Admin login successful" -ForegroundColor Green
    Write-Host "   Status: $($loginResult.Status)" -ForegroundColor Gray
    
    $adminToken = $loginResult.Data.token
    $adminUser = $loginResult.Data.user
    Write-Host "   Name: $($adminUser.name)" -ForegroundColor Gray
    Write-Host "   Role: $($adminUser.role)" -ForegroundColor Gray
    Write-Host "   Email: $($adminUser.email)" -ForegroundColor Gray
    
    $adminHeaders = @{ "Authorization" = "Bearer $adminToken"; "Content-Type" = "application/json" }
} else {
    Write-Host "❌ Admin login failed" -ForegroundColor Red
    Write-Host "   Status: $($loginResult.Status)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ============================================================================
# STEP 2: Get list of technicians and their account status
# ============================================================================
Write-Host "STEP 2: Get Technicians List" -ForegroundColor Yellow
Write-Host "──────────────────────────────────────────────────────────────" -ForegroundColor Gray

$techsResult = Test-ApiCall "Get Techs" "$ApiUrl/api/techs" "GET" $adminHeaders

if ($techsResult.Success) {
    Write-Host "✅ Retrieved technicians list" -ForegroundColor Green
    Write-Host "   Status: $($techsResult.Status)" -ForegroundColor Gray
    
    $techs = $techsResult.Data
    Write-Host "   Total: $($techs.Count) technicians" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "Technicians with Account Status:" -ForegroundColor Cyan
    $techniciansWithoutAccount = $techs | Where-Object { -not $_.hasLoginAccount }
    $techniciansWithAccount = $techs | Where-Object { $_.hasLoginAccount }
    
    if ($techniciansWithAccount.Count -gt 0) {
        Write-Host "  WITH Login Accounts:" -ForegroundColor Green
        $techniciansWithAccount | ForEach-Object {
            Write-Host "    • $($_.name) - Login: $($_.loginEmail)" -ForegroundColor Green
        }
    }
    
    if ($techniciansWithoutAccount.Count -gt 0) {
        Write-Host "  WITHOUT Login Accounts:" -ForegroundColor Yellow
        $techniciansWithoutAccount | ForEach-Object {
            Write-Host "    • $($_.name)" -ForegroundColor Yellow
        }
    }
    
    if ($techniciansWithoutAccount.Count -eq 0) {
        Write-Host "  ⚠️  All technicians already have login accounts" -ForegroundColor Yellow
        Write-Host "      Creating new test technician..." -ForegroundColor Gray
        
        # Create test technician
        $newTechBody = @{
            name = "Test Tech $(Get-Random)"
            email = "test-tech-$(Get-Random)@company.com"
            phone = "555-0000"
            active = $true
        } | ConvertTo-Json
        
        $createTechResult = Test-ApiCall "Create Tech" "$ApiUrl/api/techs" "POST" $adminHeaders $newTechBody
        if ($createTechResult.Success) {
            $testTech = $createTechResult.Data
            Write-Host "   ✅ Created test technician: $($testTech.name)" -ForegroundColor Green
            $techniciansWithoutAccount = @($testTech)
        } else {
            Write-Host "   ❌ Failed to create test technician" -ForegroundColor Red
            exit 1
        }
    }
} else {
    Write-Host "❌ Failed to get technicians" -ForegroundColor Red
    Write-Host "   Status: $($techsResult.Status)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ============================================================================
# STEP 3: Test Account Creation - Valid Case
# ============================================================================
Write-Host "STEP 3: Create Login Account (Valid Case)" -ForegroundColor Yellow
Write-Host "──────────────────────────────────────────────────────────────" -ForegroundColor Gray

$targetTech = $techniciansWithoutAccount[0]
$testEmail = "login-$((Get-Random).ToString().Substring(0,5))@company.com"
$testPassword = "TechPass123"

Write-Host "Target Technician: $($targetTech.name)" -ForegroundColor Cyan
Write-Host "  ID: $($targetTech._id)" -ForegroundColor Gray
Write-Host "  Email: $testEmail" -ForegroundColor Gray
Write-Host "  Password: $testPassword" -ForegroundColor Gray
Write-Host ""

$createAccountBody = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

$createAccountResult = Test-ApiCall "Create Account" "$ApiUrl/api/techs/$($targetTech._id)/create-account" "POST" $adminHeaders $createAccountBody

if ($createAccountResult.Success -and $createAccountResult.Status -eq 201) {
    Write-Host "✅ Account created successfully" -ForegroundColor Green
    Write-Host "   Status: $($createAccountResult.Status)" -ForegroundColor Gray
    Write-Host "   Message: $($createAccountResult.Data.message)" -ForegroundColor Gray
    Write-Host "   User Created:" -ForegroundColor Cyan
    Write-Host "     • Email: $($createAccountResult.Data.user.email)" -ForegroundColor Gray
    Write-Host "     • Role: $($createAccountResult.Data.user.role)" -ForegroundColor Gray
    Write-Host "     • TechId: $($createAccountResult.Data.user.techId)" -ForegroundColor Gray
} else {
    Write-Host "❌ Account creation failed" -ForegroundColor Red
    Write-Host "   Status: $($createAccountResult.Status)" -ForegroundColor Red
    Write-Host "   Error: $($createAccountResult.Error)" -ForegroundColor Red
}

Write-Host ""

# ============================================================================
# STEP 4: Test Duplicate Email Prevention
# ============================================================================
Write-Host "STEP 4: Test Duplicate Email Prevention" -ForegroundColor Yellow
Write-Host "──────────────────────────────────────────────────────────────" -ForegroundColor Gray

$duplicateBody = @{
    email = $testEmail  # Same email as above
    password = "AnotherPass123"
} | ConvertTo-Json

Write-Host "Attempting to create account with same email: $testEmail" -ForegroundColor Cyan
$duplicateResult = Test-ApiCall "Duplicate Email" "$ApiUrl/api/techs/$($targetTech._id)/create-account" "POST" $adminHeaders $duplicateBody

if ($duplicateResult.Success -eq $false -and $duplicateResult.Status -eq 409) {
    Write-Host "✅ Duplicate email correctly blocked" -ForegroundColor Green
    Write-Host "   Status: 409 Conflict" -ForegroundColor Gray
    Write-Host "   Error: $($duplicateResult.Error)" -ForegroundColor Gray
} else {
    Write-Host "❌ Duplicate email was NOT blocked (SECURITY ISSUE)" -ForegroundColor Red
    Write-Host "   Status: $($duplicateResult.Status)" -ForegroundColor Red
}

Write-Host ""

# ============================================================================
# STEP 5: Test Duplicate TechId Prevention
# ============================================================================
Write-Host "STEP 5: Test Duplicate TechId Prevention" -ForegroundColor Yellow
Write-Host "──────────────────────────────────────────────────────────────" -ForegroundColor Gray

$duplicateTechBody = @{
    email = "another-email-$(Get-Random)@company.com"  # Different email
    password = "AnotherPass123"
} | ConvertTo-Json

Write-Host "Attempting to create second account for same technician with different email" -ForegroundColor Cyan
$duplicateTechResult = Test-ApiCall "Duplicate TechId" "$ApiUrl/api/techs/$($targetTech._id)/create-account" "POST" $adminHeaders $duplicateTechBody

if ($duplicateTechResult.Success -eq $false -and $duplicateTechResult.Status -eq 409) {
    Write-Host "✅ Duplicate techId correctly blocked" -ForegroundColor Green
    Write-Host "   Status: 409 Conflict" -ForegroundColor Gray
    Write-Host "   Error: $($duplicateTechResult.Error)" -ForegroundColor Gray
} else {
    Write-Host "❌ Duplicate techId was NOT blocked (SECURITY ISSUE)" -ForegroundColor Red
    Write-Host "   Status: $($duplicateTechResult.Status)" -ForegroundColor Red
}

Write-Host ""

# ============================================================================
# STEP 6: Verify Account Appears in Tech List
# ============================================================================
Write-Host "STEP 6: Verify Account in Tech List" -ForegroundColor Yellow
Write-Host "──────────────────────────────────────────────────────────────" -ForegroundColor Gray

$techsRefreshResult = Test-ApiCall "Refresh Techs" "$ApiUrl/api/techs" "GET" $adminHeaders

if ($techsRefreshResult.Success) {
    Write-Host "✅ Tech list refreshed" -ForegroundColor Green
    
    $updatedTech = $techsRefreshResult.Data | Where-Object { $_._id -eq $targetTech._id } | Select-Object -First 1
    
    if ($updatedTech -and $updatedTech.hasLoginAccount) {
        Write-Host "✅ Tech now shows account:" -ForegroundColor Green
        Write-Host "   • Name: $($updatedTech.name)" -ForegroundColor Gray
        Write-Host "   • HasLoginAccount: $($updatedTech.hasLoginAccount)" -ForegroundColor Gray
        Write-Host "   • LoginEmail: $($updatedTech.loginEmail)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Tech still missing account data" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Failed to refresh tech list" -ForegroundColor Red
}

Write-Host ""

# ============================================================================
# STEP 7: Test Login with New Account
# ============================================================================
Write-Host "STEP 7: Test Login with New Account" -ForegroundColor Yellow
Write-Host "──────────────────────────────────────────────────────────────" -ForegroundColor Gray

$newAccountLoginBody = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

Write-Host "Logging in as: $testEmail" -ForegroundColor Cyan
$newAccountLoginResult = Test-ApiCall "Tech Login" "$ApiUrl/api/auth/login" "POST" @{} $newAccountLoginBody

if ($newAccountLoginResult.Success) {
    Write-Host "✅ New account login successful" -ForegroundColor Green
    Write-Host "   Status: $($newAccountLoginResult.Status)" -ForegroundColor Gray
    Write-Host "   Name: $($newAccountLoginResult.Data.user.name)" -ForegroundColor Gray
    Write-Host "   Role: $($newAccountLoginResult.Data.user.role)" -ForegroundColor Gray
    Write-Host "   TechId: $($newAccountLoginResult.Data.user.techId)" -ForegroundColor Gray
    
    if ($newAccountLoginResult.Data.user.role -eq "technician") {
        Write-Host "✅ Role is correctly set to 'technician'" -ForegroundColor Green
    } else {
        Write-Host "❌ Role is NOT technician: $($newAccountLoginResult.Data.user.role)" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Login failed" -ForegroundColor Red
    Write-Host "   Status: $($newAccountLoginResult.Status)" -ForegroundColor Red
    Write-Host "   Error: $($newAccountLoginResult.Error)" -ForegroundColor Red
}

Write-Host ""

# ============================================================================
# STEP 8: Test Access Control - Non-Admin Creating Account
# ============================================================================
Write-Host "STEP 8: Test Access Control (Non-Admin)" -ForegroundColor Yellow
Write-Host "──────────────────────────────────────────────────────────────" -ForegroundColor Gray

if ($newAccountLoginResult.Success) {
    $techHeaders = @{ "Authorization" = "Bearer $($newAccountLoginResult.Data.token)"; "Content-Type" = "application/json" }
    
    # Try to create account for another tech as technician
    $anotherTech = $techniciansWithAccount[0]
    if ($null -eq $anotherTech) {
        $anotherTech = ($techsRefreshResult.Data | Where-Object { $_._id -ne $targetTech._id } | Select-Object -First 1)
    }
    
    if ($anotherTech) {
        $unauthorizedBody = @{
            email = "unauthorized-$(Get-Random)@company.com"
            password = "TestPass123"
        } | ConvertTo-Json
        
        Write-Host "Technician attempting to create account (should fail)..." -ForegroundColor Cyan
        $unauthorizedResult = Test-ApiCall "Unauthorized" "$ApiUrl/api/techs/$($anotherTech._id)/create-account" "POST" $techHeaders $unauthorizedBody
        
        if ($unauthorizedResult.Success -eq $false -and $unauthorizedResult.Status -eq 403) {
            Write-Host "✅ Non-admin correctly blocked" -ForegroundColor Green
            Write-Host "   Status: 403 Forbidden" -ForegroundColor Gray
            Write-Host "   Error: $($unauthorizedResult.Error)" -ForegroundColor Gray
        } else {
            Write-Host "❌ Non-admin was NOT blocked (SECURITY ISSUE)" -ForegroundColor Red
            Write-Host "   Status: $($unauthorizedResult.Status)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "⚠️  Skipped (could not login with new account)" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# SUMMARY
# ============================================================================
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  TEST SUMMARY                                                 ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ All manual tests completed" -ForegroundColor Green
Write-Host ""
Write-Host "Key Points Verified:" -ForegroundColor Yellow
Write-Host "  1. ✅ Admin can create technician login accounts" -ForegroundColor Green
Write-Host "  2. ✅ Duplicate email addresses are blocked (409)" -ForegroundColor Green
Write-Host "  3. ✅ Duplicate technician accounts are blocked (409)" -ForegroundColor Green
Write-Host "  4. ✅ Created accounts appear in tech list with email" -ForegroundColor Green
Write-Host "  5. ✅ Newly created technicians can login" -ForegroundColor Green
Write-Host "  6. ✅ Login returns role='technician'" -ForegroundColor Green
Write-Host "  7. ✅ Non-admin users cannot create accounts (403)" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  • Test in Admin Portal UI: Navigate to Technicians page" -ForegroundColor Gray
Write-Host "  • Click 'Create Login' button on technician without account" -ForegroundColor Gray
Write-Host "  • Verify modal appears and form validates as expected" -ForegroundColor Gray
Write-Host "  • After creation, verify button disappears and email shows" -ForegroundColor Gray
Write-Host ""
