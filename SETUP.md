# BillFlow - Backend Setup & Installation Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

1. **Node.js** (v18.0.0 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **MongoDB** (v6.0 or higher)
   - **Option 1: Local Installation**
     - Download from: https://www.mongodb.com/try/download/community
     - Windows: Use MongoDB Installer
     - After installation, start MongoDB service
   
   - **Option 2: MongoDB Atlas (Cloud)**
     - Create free account at: https://www.mongodb.com/cloud/atlas
     - Create a cluster and get connection string
     - Update `.env` file with your connection string

3. **Git** (Optional, for version control)
   - Download from: https://git-scm.com/

---

## 🚀 Installation Steps

### Step 1: Navigate to Project Directory

Open PowerShell or Command Prompt and navigate to your project folder:

```powershell
cd "c:\Users\hp\OneDrive\Pictures\Documents\tenant bill"
```

### Step 2: Install Node.js Dependencies

Run the following command to install all required packages:

```powershell
npm install
```

This will install:
- express (v4.18.2) - Web framework
- mongoose (v8.0.3) - MongoDB ODM
- bcryptjs (v2.4.3) - Password hashing
- jsonwebtoken (v9.0.2) - JWT authentication
- dotenv (v16.3.1) - Environment variables
- cors (v2.8.5) - CORS middleware
- express-validator (v7.0.1) - Request validation

### Step 3: Configure Environment Variables

The `.env` file is already created. Update it with your settings:

```env
# Server Configuration
PORT=5000

# MongoDB Connection
# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/billflow

# Option 2: MongoDB Atlas (Replace with your connection string)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/billflow?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://127.0.0.1:5500
```

**Important:** Change `JWT_SECRET` to a strong random string in production!

---

## 🗄️ MongoDB Setup

### Option A: Local MongoDB

1. **Start MongoDB Service:**

   **Windows:**
   ```powershell
   net start MongoDB
   ```
   
   Or use MongoDB Compass GUI to start the service.

2. **Verify MongoDB is Running:**
   ```powershell
   mongosh
   ```
   
   If connected successfully, you'll see the MongoDB shell.

### Option B: MongoDB Atlas (Cloud)

1. **Create Account:** Go to https://www.mongodb.com/cloud/atlas
2. **Create Cluster:** Follow the free tier setup
3. **Whitelist IP:** Add `0.0.0.0/0` for development (or your specific IP)
4. **Create Database User:** Set username and password
5. **Get Connection String:** Click "Connect" → "Connect your application"
6. **Update .env:** Replace `MONGODB_URI` with your connection string

---

## ▶️ Running the Application

### Step 1: Start MongoDB (if using local)

Ensure MongoDB is running:
```powershell
net start MongoDB
```

### Step 2: Start Backend Server

**Development Mode (with auto-restart):**
```powershell
npm run dev
```

**Production Mode:**
```powershell
npm start
```

You should see:
```
✅ Server running on port 5000
✅ MongoDB Connected: mongodb://localhost:27017/billflow
```

### Step 3: Start Frontend

Open `index.html` with Live Server in VS Code, or open directly in browser:

1. **Using VS Code Live Server:**
   - Install "Live Server" extension
   - Right-click `index.html`
   - Select "Open with Live Server"
   - Default URL: http://127.0.0.1:5500

2. **Or open directly:**
   - Navigate to project folder
   - Double-click `index.html`

---

## 🧪 Testing the Application

### 1. Register a New User

1. Open browser: http://127.0.0.1:5500/index.html
2. Click "Login" button (top right)
3. Click "Create New Admin Account"
4. Fill in the form:
   - Full Name: John Doe
   - Phone: 1234567890
   - Email: admin@example.com
   - Password: test123
5. Click "Create Account"
6. You should be redirected to dashboard

### 2. Login with Existing User

1. Go to login page: http://127.0.0.1:5500/login.html
2. Enter credentials:
   - Email: admin@example.com
   - Password: test123
3. Click "Login"
4. You should be redirected to dashboard

### 3. Test API Endpoints (Optional)

Using PowerShell or a tool like Postman:

**Register User:**
```powershell
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "test123"
    phone = "9876543210"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

**Login:**
```powershell
$body = @{
    email = "test@example.com"
    password = "test123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

---

## 📁 Project Structure

```
tenant bill/
├── controllers/
│   ├── authController.js       # Authentication logic
│   └── userController.js       # User profile logic
├── models/
│   └── User.js                 # User database schema
├── routes/
│   ├── auth.js                 # Authentication routes
│   └── user.js                 # User routes
├── middleware/
│   └── auth.js                 # JWT verification
├── index.html                  # Landing page
├── login.html                  # Login page
├── register.html               # Registration page
├── dashboard.html              # Main dashboard
├── generate-bill.html          # Bill generation form
├── script.js                   # Landing page JS
├── login-script.js             # Login page JS
├── register-script.js          # Register page JS
├── dashboard-script.js         # Dashboard JS
├── styles.css                  # Landing page styles
├── login-styles.css            # Login/Register styles
├── dashboard-styles.css        # Dashboard styles
├── generate-bill-styles.css    # Bill generation styles
├── server.js                   # Express server
├── package.json                # Node.js dependencies
└── .env                        # Environment variables
```

---

## 🔐 API Endpoints

### Authentication Routes

**POST** `/api/auth/register`
- Register new user
- Body: `{ name, email, password, phone, organization? }`
- Returns: `{ status, message, data: { user, token } }`

**POST** `/api/auth/login`
- Login user
- Body: `{ email, password }`
- Returns: `{ status, message, data: { user, token } }`

**POST** `/api/auth/logout`
- Logout user
- Headers: `Authorization: Bearer <token>`
- Returns: `{ status, message }`

### User Routes (Protected)

**GET** `/api/user/profile`
- Get user profile
- Headers: `Authorization: Bearer <token>`
- Returns: `{ status, data: { user } }`

**PUT** `/api/user/profile`
- Update user profile
- Headers: `Authorization: Bearer <token>`
- Body: `{ name?, organization?, phone? }`
- Returns: `{ status, message, data: { user } }`

**GET** `/api/user/stats`
- Get user statistics
- Headers: `Authorization: Bearer <token>`
- Returns: `{ status, data: { stats } }`

---

## 🛠️ Troubleshooting

### Issue: MongoDB Connection Failed

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions:**
1. Check if MongoDB service is running:
   ```powershell
   Get-Service MongoDB
   ```
2. Start MongoDB service:
   ```powershell
   net start MongoDB
   ```
3. Verify connection string in `.env` file
4. For Atlas: Check network access and credentials

### Issue: Port 5000 Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solutions:**
1. Change port in `.env` file:
   ```env
   PORT=5001
   ```
2. Or kill the process using port 5000:
   ```powershell
   Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
   ```

### Issue: CORS Error in Browser

**Error:** `Access to fetch at 'http://localhost:5000' ... blocked by CORS policy`

**Solutions:**
1. Verify `CORS_ORIGIN` in `.env` matches your frontend URL
2. Restart backend server after changing `.env`
3. Check browser console for exact origin being used

### Issue: Token Expired

**Error:** `Token expired`

**Solutions:**
1. Login again to get a new token
2. Token expires after 7 days (configurable in `.env`)
3. Clear browser localStorage and login again

### Issue: npm install fails

**Error:** Various npm errors

**Solutions:**
1. Delete `node_modules` folder and `package-lock.json`
   ```powershell
   Remove-Item -Recurse -Force node_modules, package-lock.json
   ```
2. Clear npm cache:
   ```powershell
   npm cache clean --force
   ```
3. Run install again:
   ```powershell
   npm install
   ```

---

## 🔒 Security Notes

### For Development:
- Default JWT_SECRET is insecure - for testing only
- CORS set to allow http://127.0.0.1:5500
- Password minimum length: 6 characters

### For Production:
1. **Change JWT_SECRET** to a strong random string:
   ```powershell
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
2. **Use HTTPS** for all communications
3. **Set specific CORS origin** to your production domain
4. **Use MongoDB Atlas** with proper authentication
5. **Enable rate limiting** and add helmet for security headers
6. **Increase password requirements** (length, complexity)
7. **Add email verification** for new registrations
8. **Implement refresh tokens** for better security

---

## 📝 Next Steps

### Features to Add:

1. **Bill Management:**
   - Create bills (connect generate-bill.html)
   - View bill history
   - Update bill status
   - Delete bills

2. **Tenant Management:**
   - Add tenants
   - Edit tenant details
   - View tenant list
   - Tenant dashboard access

3. **Payment Processing:**
   - Record payments
   - Payment history
   - Payment reminders
   - Payment reports

4. **Admin Features:**
   - User management
   - Organization settings
   - Backup/export data
   - Analytics dashboard

5. **Notifications:**
   - Email notifications
   - SMS alerts
   - In-app notifications
   - Payment reminders

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review API documentation
3. Check browser console for errors
4. Check server logs in terminal

---

## 📄 License

This project is for educational purposes.

---

**Happy Coding! 🚀**
