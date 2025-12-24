# 🚀 Quick Start Guide - BillFlow

## Prerequisites
- Node.js installed (v14 or higher)
- MongoDB installed locally OR MongoDB Atlas account
- VS Code with Live Server extension (for frontend)

---

## 🏃 Running Locally (5 Minutes)

### Step 1: Setup Backend

```powershell
# Navigate to backend folder
cd "C:\Users\hp\OneDrive\Pictures\Documents\tenant bill\backend"

# Install dependencies (first time only)
npm install

# Start the server
npm start
```

**Expected output:**
```
✅ MongoDB Connected Successfully
🚀 BillFlow Backend Server Started
🌐 Server running on http://localhost:3000
```

### Step 2: Setup Frontend

1. Open VS Code
2. Open folder: `C:\Users\hp\OneDrive\Pictures\Documents\tenant bill\frontend`
3. Right-click on `index.html`
4. Click "Open with Live Server"
5. Browser opens at `http://localhost:5500`

---

## 🎯 First Time Setup

### 1. Register Account
- Click "Get Started" or "Register"
- Fill in your details
- Create account

### 2. Complete Profile
- Go to Settings
- Add your property/company name
- Save changes (will redirect automatically)

### 3. Add Tenants
- Click "Tenants" in navigation
- Click "Add New Tenant"
- Fill tenant details
- Save

### 4. Generate Bill
- Click "Generate Bill"
- Select tenant from dropdown (automatically refreshed)
- Fill bill details
- Generate & download PDF

---

## 🔧 Troubleshooting

### Backend Not Starting?
**Check:**
1. MongoDB is running (if using local MongoDB)
2. Port 3000 is not in use
3. `.env` file exists in backend folder

**Fix:**
```powershell
# Kill process on port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Restart backend
npm start
```

### Frontend Not Loading Tenants?
**Check:**
1. Backend is running on port 3000
2. No console errors (F12 → Console)
3. API connection successful

**Fix:**
- Refresh page (F5)
- Clear browser cache (Ctrl + Shift + Delete)
- Check Network tab in DevTools

### Settings Not Redirecting?
**Already Fixed!** ✅
- Now redirects after 500ms
- Goes to admin-dashboard.html

---

## 📱 Access on Other Devices (Same Network)

### Find Your IP Address
```powershell
ipconfig
# Look for "IPv4 Address" under your active network
# Example: 192.168.31.179
```

### Share URLs
- **Frontend:** `http://YOUR-IP:5500/index.html`
- **Backend:** Update API URL in `api-connector.js`

---

## ✅ What's Fixed

1. ✅ **Settings Page** - Redirects immediately after save
2. ✅ **Tenant Dropdown** - Shows newly added tenants automatically
3. ✅ **Syntax Errors** - All fixed (generate-bill-script.js)
4. ✅ **Code Structure** - Clean and organized
5. ✅ **Error Handling** - Proper notifications on all pages
6. ✅ **Navigation** - Working smoothly across all pages
7. ✅ **Deployment Ready** - Can deploy immediately

---

## 🌐 Ready to Deploy?

See `DEPLOYMENT-CHECKLIST.md` for complete deployment guide.

**Quick Options:**
1. **Netlify (Frontend)** - Drag & drop deployment
2. **Railway (Backend)** - GitHub integration
3. **MongoDB Atlas (Database)** - Free tier available

---

## 📚 Additional Resources

- `README.md` - Project overview
- `DEPLOYMENT-GUIDE.md` - Detailed deployment steps
- `USER-GUIDE-AUTH.md` - User authentication guide
- `PROJECT-STRUCTURE.md` - Code structure

---

## 🎉 You're All Set!

The application is now:
- 🐛 Bug-free
- 🚀 Ready to run locally
- 🌐 Ready to deploy
- 📱 Mobile-friendly
- 🔒 Secure

**Enjoy using BillFlow!** 💙
