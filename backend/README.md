# Tenant Bill Management System - Backend

Backend API for Tenant Bill Management System built with Node.js, Express, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Install dependencies**
```bash
cd backend
npm install
```

2. **Setup PostgreSQL Database**
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE tenant_bill_db;

# Exit psql
\q
```

3. **Configure Environment Variables**
```bash
# Copy example env file
copy .env.example .env

# Edit .env with your settings
notepad .env
```

Required settings in `.env`:
- `DB_PASSWORD` - Your PostgreSQL password
- `JWT_SECRET` - Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- `EMAIL_USER` - Your email for sending resets
- `EMAIL_PASSWORD` - Your email app password

4. **Initialize Database Tables**
```bash
npm run init-db
```

5. **Start Server**
```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Server will run on: http://localhost:5000

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with code
- `POST /verify-token` - Verify JWT token

### Users (`/api/users`)
- `GET /profile` - Get user profile (requires auth)
- `PUT /profile` - Update user profile (requires auth)

### Tenants (`/api/tenants`)
- `GET /` - Get all tenants (requires auth)
- `GET /:id` - Get tenant by ID (requires auth)
- `POST /` - Create new tenant (requires auth)
- `PUT /:id` - Update tenant (requires auth)
- `DELETE /:id` - Delete tenant (requires auth)

### Bills (`/api/bills`)
- `GET /` - Get all bills (requires auth)
- `GET /:id` - Get bill by ID (requires auth)
- `POST /` - Create new bill (requires auth)
- `PUT /:id` - Update bill (requires auth)
- `DELETE /:id` - Delete bill (requires auth)
- `PATCH /:id/status` - Update bill payment status (requires auth)

## 🔐 Authentication

All protected endpoints require JWT token in header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🧪 Testing API

### Using PowerShell (curl)

**Health Check:**
```powershell
curl http://localhost:5000/api/health
```

**Register User:**
```powershell
$body = @{
    email = "test@example.com"
    password = "Test1234"
    name = "Test User"
} | ConvertTo-Json

curl -Method POST -Uri http://localhost:5000/api/auth/register -ContentType "application/json" -Body $body
```

**Login:**
```powershell
$body = @{
    email = "test@example.com"
    password = "Test1234"
} | ConvertTo-Json

curl -Method POST -Uri http://localhost:5000/api/auth/login -ContentType "application/json" -Body $body
```

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # PostgreSQL connection
├── middleware/
│   ├── auth.js              # JWT authentication
│   └── validation.js        # Input validation
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management
│   ├── tenants.js           # Tenant CRUD
│   └── bills.js             # Bill CRUD
├── scripts/
│   └── initDatabase.js      # Database initialization
├── utils/
│   └── email.js             # Email sending
├── .env.example             # Environment template
├── .gitignore
├── package.json
├── server.js                # Main entry point
└── README.md
```

## 🔧 Database Schema

### users
- id, user_id, email, password_hash
- name, phone, organization
- created_at, updated_at, last_login, is_active

### tenants
- id, tenant_id, user_id, name
- room, phone, email, rent_amount, status
- move_in_date, created_at, updated_at

### bills
- id, bill_id, user_id, tenant_id
- bill_number, tenant_name, room
- rent_amount, electricity_amount, water_amount
- maintenance_amount, other_charges, total_amount
- bill_month, due_date, status
- payment_date, payment_method, notes
- created_at, updated_at

### password_resets
- id, email, reset_code
- expires_at, used, created_at

### sessions
- id, session_token, user_id
- expires_at, created_at, last_activity
- ip_address, user_agent

## 🛡️ Security Features

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT authentication
- ✅ Rate limiting (100 requests per 15 min)
- ✅ Input validation and sanitization
- ✅ SQL injection protection
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Environment variable protection

## 📧 Email Configuration

### Gmail Setup:
1. Enable 2-factor authentication
2. Generate App Password
3. Use in `.env`:
```
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password
```

## 🐛 Troubleshooting

### Database Connection Error
```
❌ Failed to connect to database
```
**Fix:** Check PostgreSQL is running and `.env` has correct `DB_PASSWORD`

### Email Not Sending
**Fix:** 
- Check email credentials in `.env`
- Verify Gmail App Password (not regular password)
- Check firewall isn't blocking port 587

### Port Already in Use
**Fix:** Change `PORT` in `.env` or kill process:
```powershell
# Find process on port 5000
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

## 🚀 Deployment

See `PRODUCTION-ROADMAP.md` for deployment options:
- Heroku
- DigitalOcean
- AWS
- Azure
- Render
- Railway

## 📝 License

MIT
