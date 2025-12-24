#!/bin/bash
# Quick deployment script for BillFlow

echo "🚀 BillFlow Deployment Helper"
echo "=============================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Production ready"
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Create GitHub repository at: https://github.com/new"
echo "2. Run these commands:"
echo "   git remote add origin https://github.com/YOUR-USERNAME/billflow.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Deploy Backend (Render.com):"
echo "   - Go to: https://render.com/deploy"
echo "   - Connect GitHub repo"
echo "   - Service: Web Service"
echo "   - Build: npm install"
echo "   - Start: npm start"
echo ""
echo "4. Deploy Frontend (Netlify):"
echo "   - Go to: https://app.netlify.com/drop"
echo "   - Drag 'frontend' folder"
echo "   - Done!"
echo ""
echo "✨ Full guide: See DEPLOY-NOW.md"
