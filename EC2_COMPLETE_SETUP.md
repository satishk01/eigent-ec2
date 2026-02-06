# Complete EC2 Setup Guide - Frontend + Backend

## Overview

Your Eigent application has two parts:
1. **Frontend** (React app) - Port 5173
2. **Backend** (Python API) - Port 8000 (or dynamic)

The permissions screen is trying to call `/api/user/privacy` which needs the backend running.

## Solution Applied

We've added:
1. **Electron API mocks** - For web-only mode
2. **Web-only config** - Skips onboarding screens automatically
3. **Backend port mock** - Routes API calls correctly

## Files Modified/Created

### Modified:
1. **src/main.tsx** - Added web-only initialization
2. **src/utils/electronMock.ts** - Added backend port mock
3. **package.json** - Added web-only scripts

### Created:
1. **src/utils/webOnlyConfig.ts** - Web-only configuration
2. **vite.config.web.ts** - Web-only Vite config
3. **EC2_COMPLETE_SETUP.md** - This guide

## EC2 Deployment Steps

### Step 1: Update Files on EC2

Copy all modified files to your EC2 instance:

```bash
# Option A: Using git (recommended)
cd /path/to/app
git pull

# Option B: Using scp
scp -r src/ package.json vite.config.web.ts ec2-user@3.218.250.170:/path/to/app/
```

### Step 2: Configure Security Group

Allow both frontend and backend ports:

**AWS Console → EC2 → Security Groups → Add Inbound Rules:**

| Type | Port | Source | Description |
|------|------|--------|-------------|
| Custom TCP | 5173 | 0.0.0.0/0 | Frontend (React) |
| Custom TCP | 8000 | 0.0.0.0/0 | Backend (API) |

### Step 3: Start Backend Server

Your backend is in the `backend/` directory. Start it first:

```bash
cd /path/to/app/backend

# If using Python virtual environment
source venv/bin/activate  # or activate.bat on Windows

# Start the backend (check your backend's start command)
python app/main.py
# or
uvicorn app.main:app --host 0.0.0.0 --port 8000
# or
python -m app.main
```

**Verify backend is running:**
```bash
curl http://localhost:8000/health
# Should return: {"status": "ok"} or similar
```

### Step 4: Configure Environment Variables

Create `.env.production` in the root directory:

```env
# Backend URL
VITE_PROXY_URL=http://localhost:8000
VITE_BASE_URL=http://3.218.250.170:8000
VITE_USE_LOCAL_PROXY=false

# Other configs (if needed)
NODE_ENV=production
```

### Step 5: Start Frontend

```bash
cd /path/to/app

# Install dependencies (if needed)
npm install

# Start in web-only mode
npm run dev:web
```

### Step 6: Access Application

Open browser:
- **Frontend:** http://3.218.250.170:5173/
- **Backend API:** http://3.218.250.170:8000/health

## Production Deployment (Recommended)

For production, use PM2 to manage both processes:

### 1. Build Frontend

```bash
npm run build:web
```

### 2. Start Backend with PM2

```bash
cd backend
pm2 start app/main.py --name eigent-backend --interpreter python3
```

### 3. Start Frontend with PM2

```bash
cd ..
pm2 serve dist 5173 --spa --name eigent-frontend
```

### 4. Save PM2 Configuration

```bash
pm2 save
pm2 startup
# Follow the instructions to enable auto-start on reboot
```

### 5. Check Status

```bash
pm2 status
pm2 logs eigent-frontend
pm2 logs eigent-backend
```

## Using Nginx (Production Alternative)

For better performance, use Nginx as reverse proxy:

### 1. Install Nginx

```bash
sudo yum install nginx -y  # Amazon Linux
# or
sudo apt install nginx -y  # Ubuntu
```

### 2. Configure Nginx

Create `/etc/nginx/conf.d/eigent.conf`:

```nginx
server {
    listen 80;
    server_name 3.218.250.170;  # or your domain

    # Frontend
    location / {
        root /path/to/app/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. Start Nginx

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx
```

### 4. Access via Port 80

Now access: **http://3.218.250.170/** (no port needed!)

## Troubleshooting

### Issue: Stuck on Permissions Screen

**Cause:** Backend not running or not accessible

**Solutions:**
1. Check backend is running: `curl http://localhost:8000/health`
2. Check backend logs: `pm2 logs eigent-backend` or check console
3. Verify VITE_PROXY_URL in .env points to backend
4. Clear browser cache and localStorage:
   ```javascript
   // In browser console (F12)
   localStorage.clear();
   location.reload();
   ```

### Issue: API Calls Failing (404 or CORS errors)

**Solutions:**
1. Verify backend is running on port 8000
2. Check Vite proxy configuration in `vite.config.web.ts`
3. Ensure backend allows CORS from frontend origin
4. Check browser console for specific error messages

### Issue: "Cannot GET /login" or 404 on refresh

**Solution:** This is fixed by BrowserRouter + server config. Ensure:
- Using `npm run dev:web` (not `npm run dev`)
- Server redirects all routes to index.html

### Issue: Backend Connection Refused

**Solutions:**
1. Check backend is listening on 0.0.0.0 (not just 127.0.0.1)
2. Verify security group allows port 8000
3. Check firewall: `sudo iptables -L`
4. Test locally first: `curl http://localhost:8000/health`

### Issue: Still Shows Onboarding Screens

**Solution:** Clear localStorage and reload:
```javascript
// Browser console (F12)
localStorage.clear();
location.reload();
```

## Environment Variables Reference

### Frontend (.env.production)
```env
VITE_PROXY_URL=http://localhost:8000
VITE_BASE_URL=http://3.218.250.170:8000
VITE_USE_LOCAL_PROXY=false
```

### Backend (if needed)
Check your `backend/.env` or `backend/config.py` for backend-specific variables.

## Verification Checklist

- [ ] Security group allows ports 5173 and 8000
- [ ] Backend is running and accessible
- [ ] Frontend is running in web-only mode
- [ ] Can access http://3.218.250.170:5173/
- [ ] Can access http://3.218.250.170:5173/login (no #)
- [ ] API calls work (check browser Network tab)
- [ ] No errors in browser console
- [ ] No errors in backend logs

## Quick Commands

```bash
# Check what's running
sudo netstat -tulpn | grep -E '5173|8000'

# Check PM2 status
pm2 status
pm2 logs

# Restart services
pm2 restart eigent-frontend
pm2 restart eigent-backend

# View logs
pm2 logs eigent-frontend --lines 100
pm2 logs eigent-backend --lines 100

# Stop services
pm2 stop all
pm2 delete all

# Check Nginx
sudo systemctl status nginx
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

## Next Steps

1. Copy all modified files to EC2
2. Start backend server first
3. Start frontend with `npm run dev:web`
4. Access http://3.218.250.170:5173/
5. Should bypass permissions screen and go to login

If you still see the permissions screen, clear localStorage in browser console and reload.
