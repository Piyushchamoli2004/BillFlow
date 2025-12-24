Write-Host "Starting BillFlow Backend Server..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to the project directory
Set-Location "c:\Users\hp\OneDrive\Pictures\Documents\tenant bill"

# Kill any existing node processes
$processes = Get-Process -Name node -ErrorAction SilentlyContinue
if ($processes) {
    Write-Host "Stopping existing Node.js processes..." -ForegroundColor Yellow
    $processes | Stop-Process -Force
    Start-Sleep -Seconds 2
}

# Start the server
Write-Host "Starting server..." -ForegroundColor Green
Write-Host ""

node server.js

# Keep window open if there's an error
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Red
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
