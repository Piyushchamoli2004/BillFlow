# 🔄 DEPLOY & UPDATE WITH GITHUB

## ✅ Deploy Once → Update Anytime Automatically!

This guide shows you how to deploy using GitHub so you can update your app by simply pushing code changes.

---

## 📦 STEP 1: Push to GitHub (One-Time Setup)

### 1.1: Initialize Git

```powershell
cd "C:\Users\hp\OneDrive\Pictures\Documents\tenant bill"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - BillFlow production ready"
```

### 1.2: Create GitHub Repository

1. Go to **https://github.com/new**
2. Fill in:
   - **Repository name:** `billflow`
   - **Description:** `Multi-user tenant billing management system`
   - **Visibility:** Private (or Public)
3. **DO NOT** check "Initialize with README" (we already have code)
4. Click **"Create repository"**

### 1.3: Push Code to GitHub

GitHub will show you commands. Run these:

```powershell
# Add GitHub as remote
git remote add origin https://github.com/YOUR-USERNAME/billflow.git

# Rename branch to main
git branch -M main

# Push code
git push -u origin main
```

**Enter your GitHub username and password when prompted.**

✅ **Done!** Your code is now on GitHub.

---

## 🚀 STEP 2: Deploy Backend (Render.com with GitHub)

### 2.1: Connect GitHub to Render

1. Go to **https://dashboard.render.com**
2. Sign up / Login (use **"Sign in with GitHub"** for easier setup)
3. Click **"New +"** → **"Web Service"**
4. Click **"Connect GitHub"**
5. Authorize Render to access your repositories
6. Select repository: **`billflow`**

### 2.2: Configure Backend Service

**Settings:**
- **Name:** `billflow-backend`
- **Region:** Oregon (or closest to you)
- **Branch:** `main`
- **Root Directory:** `backend` ⚠️ IMPORTANT!
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Environment Variables:** (Click "Advanced")
```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/billflow
JWT_SECRET=your_secret_key_change_this_12345
FRONTEND_URL=https://your-app.netlify.app
```

### 2.3: Deploy

1. Click **"Create Web Service"**
2. Wait 2-3 minutes for deployment
3. Copy your backend URL: `https://billflow-backend.onrender.com`

✅ **Backend is live!** Test: Visit `https://your-backend.onrender.com/api/health`

---

## 🎨 STEP 3: Deploy Frontend (Netlify with GitHub)

### 3.1: Connect GitHub to Netlify

1. Go to **https://app.netlify.com**
2. Sign up / Login (use **"GitHub"** option)
3. Click **"Add new site"** → **"Import an existing project"**
4. Click **"Deploy with GitHub"**
5. Authorize Netlify
6. Select repository: **`billflow`**

### 3.2: Configure Frontend

**Build settings:**
- **Base directory:** `frontend`
- **Build command:** (leave empty)
- **Publish directory:** `frontend`
- **Branch:** `main`

### 3.3: Deploy

1. Click **"Deploy site"**
2. Wait 30 seconds
3. Your site is live!
4. Copy URL: `https://random-name-123.netlify.app`

### 3.4: Update Backend CORS

1. Go back to **Render dashboard**
2. Open your backend service
3. Environment → Edit **`FRONTEND_URL`**
4. Set to: `https://your-netlify-url.netlify.app`
5. Save → Auto-redeploys in 1 minute

✅ **Frontend is live!**

---

## 🔄 STEP 4: Update Your App Anytime

Now whenever you make changes, they automatically deploy!

### Make Changes & Update

```powershell
# 1. Make your code changes in VS Code

# 2. Save all files

# 3. Commit changes
git add .
git commit -m "Updated: describe what you changed"

# 4. Push to GitHub
git push
```

**What happens automatically:**
- ✅ GitHub receives your changes
- ✅ Render detects changes → Rebuilds backend (2-3 minutes)
- ✅ Netlify detects changes → Rebuilds frontend (30 seconds)
- ✅ Your live app is updated!

**No manual upload needed!**

---

## 🎯 TYPICAL UPDATE WORKFLOW

### Example: Add a New Feature

```powershell
# 1. Create a new branch for your feature
git checkout -b new-feature

# 2. Make changes in VS Code
# (edit files, add features, fix bugs)

# 3. Test locally
cd backend
npm start
# Test with frontend

# 4. Commit your changes
git add .
git commit -m "Added new tenant filtering feature"

# 5. Push to GitHub
git push origin new-feature

# 6. Merge to main (on GitHub or locally)
git checkout main
git merge new-feature
git push

# ✅ Auto-deploys to production!
```

---

## 🔍 Monitor Deployments

### Render (Backend)
- Dashboard: https://dashboard.render.com
- View logs, deployment status, errors
- See each deployment in "Events" tab

### Netlify (Frontend)
- Dashboard: https://app.netlify.com
- View deployment history
- Rollback to previous versions if needed

---

## 🎨 CUSTOM DOMAIN (Optional)

### Add Your Own Domain

**For Frontend (Netlify):**
1. Buy domain (Namecheap, GoDaddy, etc.)
2. Netlify → Domain settings → Add custom domain
3. Update DNS records as shown
4. SSL certificate auto-generated (FREE)

**For Backend (Render):**
1. Render → Settings → Custom domain
2. Add your domain (e.g., api.yourdomain.com)
3. Update DNS CNAME record
4. SSL auto-generated (FREE)

**Result:** 
- Frontend: `https://yourdomain.com`
- Backend: `https://api.yourdomain.com`

---

## 🔐 ENVIRONMENT VARIABLES (Secure Updates)

### Update Secrets Without Redeploying Code

**Render:**
1. Dashboard → Your service → Environment
2. Edit variables
3. Click "Save" → Auto-redeploys

**Common updates:**
- Change `JWT_SECRET` for security
- Update `MONGODB_URI` if database changes
- Modify `FRONTEND_URL` if domain changes

---

## 🚨 ROLLBACK (If Something Breaks)

### Netlify Rollback

1. Dashboard → Deploys
2. Find working deployment
3. Click "..." → Publish deploy
4. Done! (Instant rollback)

### Render Rollback

1. Dashboard → Your service → Events
2. Find previous successful deploy
3. Click "Redeploy"
4. Done! (Takes 2-3 minutes)

### Git Rollback

```powershell
# See commit history
git log --oneline

# Rollback to previous commit
git revert HEAD
git push

# Or hard reset (careful!)
git reset --hard COMMIT_HASH
git push --force
```

---

## 📊 DEPLOYMENT BRANCHES

### Different Environments

**Production (main branch):**
```powershell
git checkout main
git push
# → Deploys to production URLs
```

**Staging (develop branch):**
```powershell
git checkout -b develop
git push origin develop

# Create separate services on Render/Netlify
# - billflow-backend-staging
# - billflow-staging.netlify.app
```

**Testing:**
- Test on staging first
- Merge to main when ready
- Production auto-updates

---

## 🎯 CONTINUOUS DEPLOYMENT BENEFITS

✅ **Push once, deploy everywhere**
✅ **No manual uploads**
✅ **Version history (rollback anytime)**
✅ **Team collaboration (multiple developers)**
✅ **Automatic deployments**
✅ **Deployment previews (Netlify shows preview before live)**
✅ **Build logs (see exactly what happened)**

---

## 📋 QUICK REFERENCE

### Update App
```powershell
git add .
git commit -m "Your changes"
git push
```

### Create Feature Branch
```powershell
git checkout -b feature-name
# make changes
git commit -am "Feature complete"
git push origin feature-name
```

### Merge to Production
```powershell
git checkout main
git merge feature-name
git push
```

### View Status
```powershell
git status          # See changed files
git log --oneline   # See commit history
git diff            # See exact changes
```

---

## 🎉 YOU'RE ALL SET!

**Now you can:**
- ✅ Deploy using GitHub (one-time setup)
- ✅ Update app by simply pushing code
- ✅ Rollback if needed
- ✅ Use branches for features
- ✅ Collaborate with team members

**Next time you update:**
```powershell
# 1. Make changes
# 2. git add .
# 3. git commit -m "Updates"
# 4. git push
# 5. Wait 3 minutes → LIVE!
```

---

## 📖 Related Guides

- **Initial Deployment:** [DEPLOY-IN-3-STEPS.md](./DEPLOY-IN-3-STEPS.md)
- **Full Guide:** [DEPLOY-NOW.md](./DEPLOY-NOW.md)
- **Checklist:** [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)

---

**Last Updated:** December 24, 2025
