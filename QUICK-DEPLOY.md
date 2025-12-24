# Quick Local Network Deployment

## For Testing with Multiple Users on Same Network

### Option 1: Using Live Server
1. Install VS Code Live Server extension
2. Open `frontend/login.html`
3. Right-click → "Open with Live Server"
4. Share the URL (e.g., `http://192.168.1.100:5500/login.html`)
5. Others on your network can access it

### Option 2: Using Python HTTP Server
```powershell
# In frontend folder
cd "c:\Users\hp\OneDrive\Pictures\Documents\tenant bill\frontend"

# Start server
python -m http.server 8080

# Share URL: http://YOUR_IP:8080/login.html
# Find your IP: ipconfig (look for IPv4 Address)
```

### Option 3: Using Node.js http-server
```powershell
# Install http-server globally
npm install -g http-server

# In frontend folder
cd "c:\Users\hp\OneDrive\Pictures\Documents\tenant bill\frontend"

# Start server
http-server -p 8080

# Share URL: http://YOUR_IP:8080/login.html
```

## ⚠️ Limitations:
- Only works on local network (not internet)
- Data stored in each user's browser
- Not secure for real business use
- No backup/recovery
- Each user needs their own device

## When to Use:
- Testing with family/friends
- Small home network
- Demo purposes
- Development testing

## DO NOT USE FOR:
- Real business
- Sensitive data
- Internet access
- Production environment
