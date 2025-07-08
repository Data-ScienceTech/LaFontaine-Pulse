#!/usr/bin/env pwsh
# Test analytics event sending to Azure backend

Write-Host "Testing analytics event sending to Azure backend..." -ForegroundColor Green

$apiUrl = "https://ca-wcqu6ch7fild4.calmmushroom-85bd2862.eastus2.azurecontainerapps.io"

# Test 1: Send a test analytics event
Write-Host "`nSending test analytics event..." -ForegroundColor Yellow

$testEvent = @{
    siteId = "lafontaine-noise-pulse"
    sessionId = "test-session-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    eventType = "page_view"
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    url = "https://papineau-noise-pulse.vercel.app/"
    referrer = ""
    userAgent = "PowerShell-Test-Agent/1.0"
    language = "en"
    screenSize = "1920x1080"
    windowSize = "1920x1080"
    timezone = "America/Montreal"
    data = @{
        test = $true
        source = "manual-test"
    }
    source = "lafontaine-noise-pulse"
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$apiUrl/api/analytics" -Method POST -Body $testEvent -ContentType "application/json"
    Write-Host "✓ Analytics event sent successfully" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to send analytics event: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Retrieve analytics events to verify the event was stored
Write-Host "`nRetrieving analytics events..." -ForegroundColor Yellow

try {
    $events = Invoke-RestMethod -Uri "$apiUrl/api/analytics" -Method GET
    Write-Host "✓ Retrieved $($events.Count) analytics events" -ForegroundColor Green
    
    if ($events.Count -gt 0) {
        Write-Host "`nMost recent events:" -ForegroundColor Cyan
        $events | Select-Object -Last 3 | ForEach-Object {
            Write-Host "- $($_.eventType) at $($_.timestamp) from $($_.url)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "✗ Failed to retrieve analytics events: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Send multiple different event types
Write-Host "`nSending different event types..." -ForegroundColor Yellow

$eventTypes = @(
    @{ type = "interaction"; data = @{ element = "noise_display"; action = "view" } },
    @{ type = "language_switch"; data = @{ from = "en"; to = "fr" } },
    @{ type = "time_spent"; data = @{ page = "main"; duration = 30000 } }
)

foreach ($eventData in $eventTypes) {
    $event = @{
        siteId = "lafontaine-noise-pulse"
        sessionId = "test-session-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        eventType = $eventData.type
        timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        url = "https://papineau-noise-pulse.vercel.app/"
        referrer = ""
        userAgent = "PowerShell-Test-Agent/1.0"
        language = "en"
        screenSize = "1920x1080"
        windowSize = "1920x1080"
        timezone = "America/Montreal"
        data = $eventData.data
        source = "lafontaine-noise-pulse"
    } | ConvertTo-Json -Depth 10

    try {
        $response = Invoke-RestMethod -Uri "$apiUrl/api/analytics" -Method POST -Body $event -ContentType "application/json"
        Write-Host "✓ Sent $($eventData.type) event" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to send $($eventData.type) event: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Final count
Write-Host "`nFinal analytics count:" -ForegroundColor Yellow
try {
    $finalEvents = Invoke-RestMethod -Uri "$apiUrl/api/analytics" -Method GET
    Write-Host "✓ Total events: $($finalEvents.Count)" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to get final count: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest completed!" -ForegroundColor Green
