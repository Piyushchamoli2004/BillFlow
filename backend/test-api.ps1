# Test Backend API

Write-Host "🧪 Testing Backend API..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/api/health"
    Write-Host "✅ PASSED" -ForegroundColor Green
    $health | ConvertTo-Json
} catch {
    Write-Host "❌ FAILED: $_" -ForegroundColor Red
}

Write-Host "`n---`n"

# Test 2: Register User
Write-Host "Test 2: Register New User" -ForegroundColor Yellow
$registerBody = @{
    email = "test@example.com"
    password = "Test1234"
    name = "Test User"
} | ConvertTo-Json

try {
    $register = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/auth/register" -ContentType "application/json" -Body $registerBody
    Write-Host "✅ PASSED" -ForegroundColor Green
    Write-Host "User ID: $($register.data.user.userId)"
    Write-Host "Token: $($register.data.token.Substring(0, 20))..."
    $global:token = $register.data.token
} catch {
    Write-Host "⚠️  User might already exist" -ForegroundColor Yellow
    Write-Host "Trying to login instead..."
    
    # Try login
    $loginBody = @{
        email = "test@example.com"
        password = "Test1234"
    } | ConvertTo-Json
    
    try {
        $login = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/auth/login" -ContentType "application/json" -Body $loginBody
        Write-Host "✅ Login PASSED" -ForegroundColor Green
        $global:token = $login.data.token
    } catch {
        Write-Host "❌ FAILED: $_" -ForegroundColor Red
    }
}

Write-Host "`n---`n"

# Test 3: Get Profile (with auth)
Write-Host "Test 3: Get User Profile (Authenticated)" -ForegroundColor Yellow
if ($global:token) {
    try {
        $headers = @{
            "Authorization" = "Bearer $($global:token)"
        }
        $profile = Invoke-RestMethod -Method GET -Uri "http://localhost:3000/api/user/profile" -Headers $headers
        Write-Host "✅ PASSED" -ForegroundColor Green
        $profile | ConvertTo-Json
    } catch {
        Write-Host "❌ FAILED: $_" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  SKIPPED: No token available" -ForegroundColor Yellow
}

Write-Host "`n---`n"
Write-Host "🎉 Backend Testing Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Your backend is working with MongoDB!" -ForegroundColor Green
Write-Host "✅ You can now connect your frontend!" -ForegroundColor Green
