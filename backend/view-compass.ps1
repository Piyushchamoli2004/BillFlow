Write-Host "🔍 Quick MongoDB Compass Guide" -ForegroundColor Cyan
Write-Host ""
Write-Host "Follow these steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Open MongoDB Compass application" -ForegroundColor Green
Write-Host "    (Search 'MongoDB Compass' in Windows Start menu)"
Write-Host ""
Write-Host "2️⃣  Connect to database:" -ForegroundColor Green
Write-Host "    Connection String: " -NoNewline
Write-Host "mongodb://localhost:27017" -ForegroundColor Cyan
Write-Host "    Then click 'Connect' button"
Write-Host ""
Write-Host "3️⃣  You'll see on the left:" -ForegroundColor Green
Write-Host "    📦 billflow (your database)" -ForegroundColor Yellow
Write-Host "       └── 📄 users (collection)" -ForegroundColor Yellow
Write-Host ""
Write-Host "4️⃣  Click on 'users' collection" -ForegroundColor Green
Write-Host ""
Write-Host "5️⃣  You'll see your user data!" -ForegroundColor Green
Write-Host "    Example:" -ForegroundColor Gray
Write-Host '    {' -ForegroundColor Gray
Write-Host '      "email": "demo@example.com",' -ForegroundColor Gray
Write-Host '      "name": "Demo User",' -ForegroundColor Gray
Write-Host '      "userId": "user_..."' -ForegroundColor Gray
Write-Host '    }' -ForegroundColor Gray
Write-Host ""
Write-Host "💡 TIP: Switch to 'Table' view (top right) for easier reading!" -ForegroundColor Magenta
Write-Host ""
Write-Host "📚 Full guide available in: COMPASS-GUIDE.md" -ForegroundColor Yellow
Write-Host ""

# Check if Compass might be installed
$compassPaths = @(
    "$env:LOCALAPPDATA\Programs\mongosh\mongosh.exe",
    "C:\Program Files\MongoDB\Compass\MongoDBCompass.exe",
    "$env:LOCALAPPDATA\MongoDBCompass\MongoDBCompass.exe"
)

$found = $false
foreach ($path in $compassPaths) {
    if (Test-Path $path) {
        Write-Host "✅ Found MongoDB Compass at: $path" -ForegroundColor Green
        $found = $true
        break
    }
}

if (-not $found) {
    Write-Host "Cannot find MongoDB Compass?" -ForegroundColor Yellow
    Write-Host "   Look in Start Menu or download it" -ForegroundColor Yellow
}
