$api = "http://localhost:5000"

Write-Host "Detailed Tech Data Check..." -ForegroundColor Yellow

$loginBody = '{"email":"edward@gmail.com","password":"1234"}'
$resp = Invoke-WebRequest -Uri "$api/api/auth/login" -Method Post -ContentType "application/json" -Body $loginBody -UseBasicParsing
$adminData = $resp.Content | ConvertFrom-Json
$token = $adminData.token
$headers = @{"Authorization" = "Bearer $token"}

$resp = Invoke-WebRequest -Uri "$api/api/techs" -Headers $headers -UseBasicParsing
$techs = $resp.Content | ConvertFrom-Json

Write-Host "`nRaw API Response:" -ForegroundColor Cyan
$techs | ConvertTo-Json -Depth 3
