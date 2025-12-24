# Quick Deployment Script for BillFlow
# Run this in PowerShell

Write-Host "🚀 BillFlow Deployment Helper" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-Not (Test-Path ".git")) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit - Production ready"
    Write-Host "✅ Git initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git already initialized" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 DEPLOYMENT STEPS:" -ForegroundColor Cyan
Write-Host ""

Write-Host "STEP 1: Create GitHub Repository" -ForegroundColor Yellow
Write-Host "   Go to: https://github.com/new" -ForegroundColor White
Write-Host "   Name: billflow" -ForegroundColor White
Write-Host ""

Write-Host "STEP 2: Push to GitHub" -ForegroundColor Yellow
Write-Host "   git remote add origin https://github.com/YOUR-USERNAME/billflow.git" -ForegroundColor White
Write-Host "   git branch -M main" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor White
Write-Host ""

Write-Host "STEP 3: Deploy Backend (FREE)" -ForegroundColor Yellow
Write-Host "   Option A - Render.com:" -ForegroundColor White
Write-Host "   1. Go to: https://render.com" -ForegroundColor White
Write-Host "   2. New → Web Service" -ForegroundColor White
Write-Host "   3. Connect GitHub repo" -ForegroundColor White
Write-Host "   4. Build: npm install" -ForegroundColor White
Write-Host "   5. Start: npm start" -ForegroundColor White
Write-Host "   6. Add Environment Variables from backend/.env.example" -ForegroundColor White
Write-Host ""

Write-Host "   Option B - Railway.app:" -ForegroundColor White
Write-Host "   1. Go to: https://railway.app" -ForegroundColor White
Write-Host "   2. New Project → Deploy from GitHub" -ForegroundColor White
Write-Host "   3. Add MongoDB plugin" -ForegroundColor White
Write-Host "   4. Deploy automatically" -ForegroundColor White
Write-Host ""

Write-Host "STEP 4: Setup MongoDB Atlas (FREE)" -ForegroundColor Yellow
Write-Host "   1. Go to: https://www.mongodb.com/cloud/atlas" -ForegroundColor White
Write-Host "   2. Create FREE cluster" -ForegroundColor White
Write-Host "   3. Create database user" -ForegroundColor White
Write-Host "   4. Whitelist IP: 0.0.0.0/0" -ForegroundColor White
Write-Host "   5. Get connection string" -ForegroundColor White
Write-Host "   6. Add to Render environment variables" -ForegroundColor White
Write-Host ""

Write-Host "STEP 5: Deploy Frontend (FREE)" -ForegroundColor Yellow
Write-Host "   Option A - Netlify (EASIEST):" -ForegroundColor White
Write-Host "   1. Go to: https://app.netlify.com/drop" -ForegroundColor White
Write-Host "   2. Drag 'frontend' folder" -ForegroundColor White
Write-Host "   3. Get URL instantly!" -ForegroundColor White
Write-Host ""

Write-Host "   Option B - Vercel:" -ForegroundColor White
Write-Host "   1. Go to: https://vercel.com" -ForegroundColor White
Write-Host "   2. Import project" -ForegroundColor White
Write-Host "   3. Deploy frontend folder" -ForegroundColor White
Write-Host ""

Write-Host "STEP 6: Update CORS" -ForegroundColor Yellow
Write-Host "   Add your frontend URL to backend/server.js CORS config" -ForegroundColor White
Write-Host ""

Write-Host "✨ Done! Your app will be live for multiple users!" -ForegroundColor Green
Write-Host ""
Write-Host "📖 Full guide: See DEPLOY-NOW.md" -ForegroundColor Cyan

# Pause
Read-Host -Prompt "Press Enter to exit"
