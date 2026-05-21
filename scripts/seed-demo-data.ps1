param(
  [string]$ApiBase = "http://localhost:5000",
  [string]$AdminEmail = "edward@gmail.com",
  [string]$AdminPassword = "1234",
  [string]$TechPassword = "DemoTech123!"
)

$ErrorActionPreference = "Stop"
$ApiBase = $ApiBase.TrimEnd("/")

function Invoke-JsonApi {
  param(
    [string]$Method = "GET",
    [string]$Path,
    [object]$Body = $null,
    [hashtable]$Headers = @{}
  )

  $request = @{
    Uri = "$ApiBase$Path"
    Method = $Method
    Headers = $Headers
    UseBasicParsing = $true
    ErrorAction = "Stop"
  }

  if ($null -ne $Body) {
    $request.ContentType = "application/json"
    $request.Body = ($Body | ConvertTo-Json -Depth 20)
  }

  try {
    $response = Invoke-WebRequest @request
    if ([string]::IsNullOrWhiteSpace($response.Content)) {
      return $null
    }
    $parsed = $response.Content | ConvertFrom-Json
    return $parsed
  } catch {
    $statusText = ""
    if ($_.Exception.Response) {
      $statusText = " [$($_.Exception.Response.StatusCode.value__)]"
    }
    $message = $_.ErrorDetails.Message
    if ([string]::IsNullOrWhiteSpace($message)) {
      $message = $_.Exception.Message
    }
    throw "API $Method $Path failed${statusText}: $message"
  }
}

function Get-DemoWindow {
  param(
    [int]$DaysFromToday,
    [int]$StartHour,
    [int]$DurationMins = 120
  )

  $start = (Get-Date).Date.AddDays($DaysFromToday).AddHours($StartHour)
  return @{
    startAt = $start.ToString("o")
    endAt = $start.AddMinutes($DurationMins).ToString("o")
  }
}

function Ensure-Technician {
  param(
    [hashtable]$Tech,
    [hashtable]$Headers
  )

  $techs = @(Invoke-JsonApi -Path "/api/techs" -Headers $Headers)
  $existing = @($techs | Where-Object { [string]($_.name) -eq [string]($Tech.name) }) | Select-Object -First 1

  if ($existing) {
    Write-Host "Technician exists: $($existing.name)" -ForegroundColor DarkGray
    return $existing
  }

  $created = Invoke-JsonApi -Method "POST" -Path "/api/techs" -Headers $Headers -Body $Tech
  Write-Host "Created technician: $($created.name)" -ForegroundColor Green
  return $created
}

function Get-TechnicianByName {
  param(
    [string]$Name,
    [hashtable]$Headers
  )

  $encodedName = [uri]::EscapeDataString($Name)
  $techs = @(Invoke-JsonApi -Path "/api/techs?q=$encodedName" -Headers $Headers)
  $tech = @($techs | Where-Object { [string]($_.name) -eq $Name }) | Select-Object -First 1
  if (-not $tech) {
    throw "Technician not found after seed: $Name"
  }
  return $tech
}

function Ensure-TechnicianLogin {
  param(
    [object]$Tech,
    [string]$Email,
    [string]$Password,
    [hashtable]$Headers
  )

  $targetId = [string]($Tech._id)
  $techs = @(Invoke-JsonApi -Path "/api/techs" -Headers $Headers)
  $fresh = @($techs | Where-Object { [string]($_._id) -eq $targetId }) | Select-Object -First 1

  if (-not $fresh) {
    throw "Technician not found while creating login: $($Tech.name)"
  }

  if ($fresh.hasLoginAccount) {
    Write-Host "Technician login already exists for $($fresh.name): $($fresh.loginEmail)" -ForegroundColor DarkGray
    return @{
      email = $fresh.loginEmail
      password = $Password
      knownPassword = ($fresh.loginEmail -eq $Email)
    }
  }

  $body = @{
    email = $Email
    password = $Password
  }
  Invoke-JsonApi -Method "POST" -Path "/api/techs/$($Tech._id)/create-account" -Headers $Headers -Body $body | Out-Null
  Write-Host "Created technician login: $Email" -ForegroundColor Green
  return @{
    email = $Email
    password = $Password
    knownPassword = $true
  }
}

function Remove-UnusedDuplicateDemoTechnicians {
  param(
    [string[]]$Names,
    [hashtable]$Headers
  )

  $jobs = @(Invoke-JsonApi -Path "/api/jobs" -Headers $Headers)
  $usedTechIds = @{}
  foreach ($job in $jobs) {
    if ($job.assignedTo) {
      $usedTechIds[[string]($job.assignedTo)] = $true
    }
  }

  foreach ($name in $Names) {
    $encodedName = [uri]::EscapeDataString($name)
    $matches = @(Invoke-JsonApi -Path "/api/techs?q=$encodedName" -Headers $Headers |
      Where-Object { [string]($_.name) -eq $name })

    if ($matches.Count -le 1) {
      continue
    }

    $keep = @($matches | Where-Object { $_.hasLoginAccount -or $usedTechIds.ContainsKey([string]($_._id)) } | Select-Object -First 1)
    if (-not $keep) {
      $keep = $matches | Select-Object -First 1
    }

    foreach ($tech in $matches) {
      $id = [string]($tech._id)
      $isDemoSeedTech = [string]($tech.notes) -like "Demo launch technician*"
      if ($id -eq [string]($keep._id)) { continue }
      if ($tech.hasLoginAccount) { continue }
      if ($usedTechIds.ContainsKey($id)) { continue }
      if (-not $isDemoSeedTech) { continue }

      Invoke-JsonApi -Method "DELETE" -Path "/api/techs/$id" -Headers $Headers | Out-Null
      Write-Host "Removed unused duplicate demo technician: $($tech.name)" -ForegroundColor Yellow
    }
  }
}

function Ensure-Customer {
  param(
    [hashtable]$Customer,
    [hashtable]$Headers
  )

  $customers = @(Invoke-JsonApi -Path "/api/customers" -Headers $Headers)
  $existing = $customers | Where-Object { $_.customerId -eq $Customer.customerId } | Select-Object -First 1

  if ($existing) {
    Write-Host "Customer exists: $($existing.name)" -ForegroundColor DarkGray
    return $existing
  }

  $created = Invoke-JsonApi -Method "POST" -Path "/api/customers" -Headers $Headers -Body $Customer
  Write-Host "Created customer: $($created.name)" -ForegroundColor Green
  return $created
}

function New-InvoiceNumber {
  param([hashtable]$Headers)
  $next = Invoke-JsonApi -Path "/api/invoices/next-number" -Headers $Headers
  return $next.number
}

function New-DemoInvoice {
  param(
    [hashtable]$Headers,
    [string]$Number,
    [hashtable]$Job,
    [string]$Status
  )

  $body = @{
    number = $Number
    customer = $Job.customerName
    amount = $Job.amount
    status = $Status
    date = $Job.startAt
    notes = "Demo launch invoice linked to $($Job.title)."
    customerId = $Job.customerId
    customerName = $Job.customerName
    customerPhone = $Job.phone
    customerEmail = $Job.customerEmail
    customerAddress = $Job.customerAddress
    jobTitle = $Job.title
    jobDescription = $Job.description
    fixedPrice = 165
    additionalMins = $Job.additionalMins
    software = $Job.software
    pensionYearDiscount = $Job.pensionYearDiscount
    socialMediaDiscount = $Job.socialMediaDiscount
  }

  Invoke-JsonApi -Method "POST" -Path "/api/invoices" -Headers $Headers -Body $body | Out-Null
  Write-Host "Created invoice: $Number ($Status)" -ForegroundColor Green
}

function New-DemoJob {
  param(
    [hashtable]$Headers,
    [hashtable]$Job,
    [string]$InvoiceStatus = "Pending"
  )

  $invoice = New-InvoiceNumber -Headers $Headers
  $Job.invoice = $invoice

  $created = Invoke-JsonApi -Method "POST" -Path "/api/jobs" -Headers $Headers -Body $Job
  Write-Host "Created job: $($created.title) [$($created.status)]" -ForegroundColor Green

  New-DemoInvoice -Headers $Headers -Number $invoice -Job $Job -Status $InvoiceStatus
  return $created
}

function Add-Completion {
  param(
    [hashtable]$Headers,
    [object]$Job,
    [bool]$FollowUpRequired = $false,
    [bool]$CloseAfterCompletion = $false
  )

  $tinyPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/l3J4pAAAAABJRU5ErkJggg=="
  $body = @{
    status = "Completed"
    note = "Demo completion update added for launch walkthrough."
    completionForm = @{
      workPerformed = "Checked the device, confirmed the fault, completed the repair, tested startup, internet access, and customer login."
      partsUsed = "Thermal paste, SSD diagnostic tools, replacement cable as required"
      followUpRequired = $FollowUpRequired
      followUpNotes = if ($FollowUpRequired) { "Customer should be contacted next week to confirm performance is still stable." } else { "" }
    }
    photos = @($tinyPng)
  }

  $completed = Invoke-JsonApi -Method "PUT" -Path "/api/jobs/$($Job._id)/status" -Headers $Headers -Body $body
  Write-Host "Completed job with evidence: $($completed.title)" -ForegroundColor Green

  if ($CloseAfterCompletion) {
    $closed = Invoke-JsonApi -Method "PUT" -Path "/api/jobs/$($Job._id)/status" -Headers $Headers -Body @{ status = "Closed" }
    Write-Host "Closed job: $($closed.title)" -ForegroundColor Green
    return $closed
  }

  return $completed
}

Write-Host "`n=== Call-a-Technician demo data seed ===" -ForegroundColor Cyan
Write-Host "API: $ApiBase" -ForegroundColor DarkGray

try {
  Invoke-JsonApi -Path "/api/health" | Out-Null
} catch {
  Write-Host "Backend is not reachable at $ApiBase." -ForegroundColor Red
  Write-Host "Start it first with: cd packages/backend-api; npm start" -ForegroundColor Yellow
  throw
}

$login = Invoke-JsonApi -Method "POST" -Path "/api/auth/login" -Body @{
  email = $AdminEmail
  password = $AdminPassword
}

$headers = @{ Authorization = "Bearer $($login.token)" }
Write-Host "Logged in as admin: $($login.user.email)" -ForegroundColor Green

$techData = @(
  @{
    name = "Jordan Smith"
    email = "jordan.smith@example.com"
    phone = "0412 100 201"
    skills = @("Laptop repair", "Windows troubleshooting", "Hardware upgrades")
    active = $true
    notes = "Demo launch technician. Best for laptop and desktop repair."
    address = "Adelaide CBD"
    emergencyContactName = "Taylor Smith"
    emergencyContactPhone = "0412 100 202"
  },
  @{
    name = "Aisha Patel"
    email = "aisha.patel@example.com"
    phone = "0412 200 301"
    skills = @("Networking", "Printer setup", "Wi-Fi troubleshooting")
    active = $true
    notes = "Demo launch technician. Best for network and printer jobs."
    address = "Norwood SA"
    emergencyContactName = "Ravi Patel"
    emergencyContactPhone = "0412 200 302"
  },
  @{
    name = "Sam Wilson"
    email = "sam.wilson@example.com"
    phone = "0412 300 401"
    skills = @("Business support", "Email setup", "Data backup")
    active = $true
    notes = "Demo launch technician. Best for small business support."
    address = "Glenelg SA"
    emergencyContactName = "Morgan Wilson"
    emergencyContactPhone = "0412 300 402"
  }
)

$techMap = @{}
foreach ($tech in $techData) {
  $created = Ensure-Technician -Tech $tech -Headers $headers
  $techMap[[string]($created.name)] = $created
}

$jordanTech = Get-TechnicianByName -Name "Jordan Smith" -Headers $headers
$demoLogin = Ensure-TechnicianLogin -Tech $jordanTech -Email "jordan.demo.tech@example.com" -Password $TechPassword -Headers $headers
Remove-UnusedDuplicateDemoTechnicians -Names @("Jordan Smith", "Aisha Patel", "Sam Wilson") -Headers $headers

$customers = @(
  @{
    customerId = "DEMO-91001"
    name = "Mia Thompson"
    phone = "0412 345 678"
    email = "mia.thompson@example.com"
    address = "12 Jetty Road, Glenelg SA 5045"
  },
  @{
    customerId = "DEMO-91002"
    name = "Daniel Nguyen"
    phone = "0487 654 321"
    email = "daniel.nguyen@example.com"
    address = "8 The Parade, Norwood SA 5067"
  },
  @{
    customerId = "DEMO-91003"
    name = "BrightStart Accounting"
    phone = "08 8123 4567"
    email = "hello@brightstart.example.com"
    address = "55 King William Street, Adelaide SA 5000"
  },
  @{
    customerId = "DEMO-91004"
    name = "Grace Lee"
    phone = "0433 222 111"
    email = "grace.lee@example.com"
    address = "22 Fullarton Road, Kent Town SA 5067"
  }
)

$customerMap = @{}
foreach ($customer in $customers) {
  $created = Ensure-Customer -Customer $customer -Headers $headers
  $customerMap[$created.customerId] = $created
}

$incoming = @(Invoke-JsonApi -Path "/api/incoming-jobs?q=Mia%20Thompson" -Headers $headers)
if ($incoming.Count -eq 0) {
  $tinyPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/l3J4pAAAAABJRU5ErkJggg=="
  Invoke-JsonApi -Method "POST" -Path "/api/marketing/job-request" -Body @{
    fullName = "Mia Thompson"
    phone = "0412 345 678"
    email = "mia.thompson@example.com"
    description = "My laptop is overheating, the fan is very loud, and it shuts down during online classes."
    images = @($tinyPng)
  } | Out-Null
  Write-Host "Created incoming website request: Mia Thompson laptop issue" -ForegroundColor Green
} else {
  Write-Host "Incoming website request already exists for Mia Thompson" -ForegroundColor DarkGray
}

$existingDemoJobs = @(Invoke-JsonApi -Path "/api/jobs?q=DEMO%20Launch" -Headers $headers)
if ($existingDemoJobs.Count -ge 6) {
  Write-Host "Demo jobs already exist ($($existingDemoJobs.Count)). Skipping job creation." -ForegroundColor Yellow
} else {
  $w1 = Get-DemoWindow -DaysFromToday 1 -StartHour 10 -DurationMins 120
  $w2 = Get-DemoWindow -DaysFromToday 1 -StartHour 13 -DurationMins 90
  $w3 = Get-DemoWindow -DaysFromToday 0 -StartHour 15 -DurationMins 120
  $w4 = Get-DemoWindow -DaysFromToday -1 -StartHour 11 -DurationMins 120
  $w5 = Get-DemoWindow -DaysFromToday -2 -StartHour 9 -DurationMins 90

  New-DemoJob -Headers $headers -InvoiceStatus "Pending" -Job @{
    title = "DEMO Launch: New customer request review"
    priority = "Medium"
    status = "Open"
    technician = ""
    phone = "0433 222 111"
    description = "Customer needs advice about a slow home office computer and possible data backup."
    customerName = "Grace Lee"
    customerId = "DEMO-91004"
    customerEmail = "grace.lee@example.com"
    customerAddress = "22 Fullarton Road, Kent Town SA 5067"
    amount = 165
    durationMins = 90
    additionalMins = 0
    software = @()
    pensionYearDiscount = $false
    socialMediaDiscount = $false
    troubleshooting = "Ask customer when the slowness started and whether important files are backed up."
  } | Out-Null

  New-DemoJob -Headers $headers -InvoiceStatus "Pending" -Job @{
    title = "DEMO Launch: Laptop overheating and slow startup"
    priority = "High"
    status = "Assigned"
    technician = "Jordan Smith"
    phone = "0412 345 678"
    description = "Laptop fan is very loud, device is hot, and startup takes more than ten minutes."
    startAt = $w1.startAt
    endAt = $w1.endAt
    customerName = "Mia Thompson"
    customerId = "DEMO-91001"
    customerEmail = "mia.thompson@example.com"
    customerAddress = "12 Jetty Road, Glenelg SA 5045"
    amount = 220
    durationMins = 120
    additionalMins = 30
    software = @(@{ name = "Malware cleanup"; value = 45 })
    pensionYearDiscount = $false
    socialMediaDiscount = $true
    troubleshooting = "Check dust buildup, startup apps, Windows updates, malware scan, and disk health."
  } | Out-Null

  New-DemoJob -Headers $headers -InvoiceStatus "Pending" -Job @{
    title = "DEMO Launch: Printer not connecting to laptop"
    priority = "Medium"
    status = "Accepted"
    technician = "Aisha Patel"
    phone = "0487 654 321"
    description = "Customer printer appears offline and cannot print from a Windows laptop."
    startAt = $w2.startAt
    endAt = $w2.endAt
    customerName = "Daniel Nguyen"
    customerId = "DEMO-91002"
    customerEmail = "daniel.nguyen@example.com"
    customerAddress = "8 The Parade, Norwood SA 5067"
    amount = 165
    durationMins = 90
    additionalMins = 0
    software = @()
    pensionYearDiscount = $false
    socialMediaDiscount = $false
    troubleshooting = "Confirm printer Wi-Fi, reinstall driver, check default printer, and run a test page."
  } | Out-Null

  New-DemoJob -Headers $headers -InvoiceStatus "Pending" -Job @{
    title = "DEMO Launch: Small business email setup"
    priority = "High"
    status = "In Progress"
    technician = "Sam Wilson"
    phone = "08 8123 4567"
    description = "Small business needs email accounts configured on two laptops and one phone."
    startAt = $w3.startAt
    endAt = $w3.endAt
    customerName = "BrightStart Accounting"
    customerId = "DEMO-91003"
    customerEmail = "hello@brightstart.example.com"
    customerAddress = "55 King William Street, Adelaide SA 5000"
    amount = 260
    durationMins = 120
    additionalMins = 60
    software = @(@{ name = "Microsoft 365 setup support"; value = 55 })
    pensionYearDiscount = $false
    socialMediaDiscount = $false
    troubleshooting = "Confirm mailbox access, MFA, Outlook profiles, phone mail app, and send/receive test."
  } | Out-Null

  $completedJob = New-DemoJob -Headers $headers -InvoiceStatus "Paid" -Job @{
    title = "DEMO Launch: Desktop SSD upgrade and cleanup"
    priority = "Medium"
    status = "In Progress"
    technician = "Jordan Smith"
    phone = "0412 345 678"
    description = "Desktop computer is slow. Customer approved SSD upgrade and software cleanup."
    startAt = $w4.startAt
    endAt = $w4.endAt
    customerName = "Mia Thompson"
    customerId = "DEMO-91001"
    customerEmail = "mia.thompson@example.com"
    customerAddress = "12 Jetty Road, Glenelg SA 5045"
    amount = 340
    durationMins = 120
    additionalMins = 60
    software = @(@{ name = "Backup and migration"; value = 75 })
    pensionYearDiscount = $false
    socialMediaDiscount = $false
    troubleshooting = "Backup user files, install SSD, migrate profile, remove startup bloat, and verify boot speed."
  }
  Add-Completion -Headers $headers -Job $completedJob -FollowUpRequired $true -CloseAfterCompletion $false | Out-Null

  $closedJob = New-DemoJob -Headers $headers -InvoiceStatus "Paid" -Job @{
    title = "DEMO Launch: Wi-Fi router replacement"
    priority = "Low"
    status = "In Progress"
    technician = "Aisha Patel"
    phone = "0487 654 321"
    description = "Home Wi-Fi drops every few minutes. Router replacement and setup required."
    startAt = $w5.startAt
    endAt = $w5.endAt
    customerName = "Daniel Nguyen"
    customerId = "DEMO-91002"
    customerEmail = "daniel.nguyen@example.com"
    customerAddress = "8 The Parade, Norwood SA 5067"
    amount = 210
    durationMins = 90
    additionalMins = 30
    software = @()
    pensionYearDiscount = $true
    socialMediaDiscount = $false
    troubleshooting = "Replace router, set secure Wi-Fi name/password, test speed, and connect customer devices."
  }
  Add-Completion -Headers $headers -Job $closedJob -FollowUpRequired $false -CloseAfterCompletion $true | Out-Null
}

Write-Host "`n=== Demo seed complete ===" -ForegroundColor Cyan
Write-Host "Admin login: $AdminEmail / $AdminPassword" -ForegroundColor White
if ($demoLogin.knownPassword) {
  Write-Host "Technician login: $($demoLogin.email) / $($demoLogin.password)" -ForegroundColor White
} else {
  Write-Host "Technician login exists for Jordan Smith: $($demoLogin.email)" -ForegroundColor Yellow
  Write-Host "Password was not changed because the API does not expose a reset endpoint." -ForegroundColor Yellow
}
Write-Host "Seeded demo names: Mia Thompson, Daniel Nguyen, BrightStart Accounting, Grace Lee." -ForegroundColor White
Write-Host "Seeded job search term: DEMO Launch" -ForegroundColor White
