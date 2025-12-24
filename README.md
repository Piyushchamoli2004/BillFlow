# 🚀 Quick Start Guide - BillFlow

Get up and running in 5 minutes!

## ⚡ Fast Setup (Windows)

### 1. Install Dependencies
```powershell
npm install
```

### 2. Start MongoDB
```powershell
net start MongoDB
```

### 3. Start Backend Server
```powershell
npm start
```

### 4. Open Frontend
- Open `index.html` with Live Server in VS Code
- Or double-click `index.html` to open in browser
- Default URL: http://127.0.0.1:5500

## 🎯 First Time Setup

### Create Your First Admin Account

1. Click **"Login"** button on homepage
2. Click **"Create New Admin Account"**
3. Fill in details:
   - Name: Your Name
   - Email: admin@example.com
   - Phone: 1234567890
   - Password: test123
4. Click **"Create Account"**
5. You'll be logged in automatically!

## 🔍 What You Get

### Pages Available:
- ✅ **Landing Page** (index.html) - Modern SaaS homepage
- ✅ **Login Page** (login.html) - With cute bear animation
- ✅ **Register Page** (register.html) - Create new accounts
- ✅ **Dashboard** (dashboard.html) - Main admin panel
- ✅ **Generate Bill** (generate-bill.html) - Bill creation form

### Backend Features:
- ✅ User Registration with validation
- ✅ User Login with JWT tokens
- ✅ Protected routes with authentication
- ✅ Password hashing with bcrypt
- ✅ MongoDB database integration
- ✅ User profile management
- ✅ User statistics API

## 🛠️ Common Commands

```powershell
# Start backend server
npm start

# Start backend with auto-reload (for development)
npm run dev

# Check if MongoDB is running
Get-Service MongoDB

# Start MongoDB if not running
net start MongoDB

# Stop MongoDB
net stop MongoDB
```

## 📍 URLs

- **Frontend:** http://127.0.0.1:5500
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

## 🔐 Test Credentials

After registration, use these to login:
- **Email:** admin@example.com
- **Password:** test123

## ❗ Troubleshooting

**Backend won't start?**
- Make sure MongoDB is running: `net start MongoDB`
- Check port 5000 is not in use

**Login doesn't work?**
- Ensure backend server is running
- Check browser console for errors
- Verify .env file settings

**Can't access frontend?**
- Use Live Server extension in VS Code
- Or check file:// URL in browser

## 📚 Full Documentation

For detailed setup and troubleshooting, see **SETUP.md**

---

**Need Help?** Check the SETUP.md file for detailed instructions!
