# Complete Solution - EC2 Deployment

## Current Status

✅ Frontend is running and accessible  
✅ Login works and bypasses permissions screen  
❌ Backend is not running → "Failed to fetch" errors  

## The Solution

You need to start the backend server. Here's how:

## Quick Start (Easiest Method)

### 1. Copy the startup script to EC2

```bash
scp start-all.sh ec2-user@3.218.250.170:/path/to/app/
```

### 2. On EC2, make it executable and run

```bash
chmod +x start-all.sh
./start-all.sh
```

This will:
- Start backend on port 8000
- Start frontend on port 5173
- Show you the URLs to access
- Keep both running until you press Ctrl+C

## Manual Start (If Script Doesn't Work)

### Terminal 1 - Start Backend

```bash
cd /path/to/app/backend

# Install uv if not installed
curl -LsSf https://astral.sh/uv/install.sh | sh
source ~/.bashrc

# Install dependencies (first time only)
uv sync

# Start backend
uv run uvicorn main:api --host 0.0.0.0 --port 8000
```

### Terminal 2 - Start Frontend

```bash
cd /path/to/app

# Start frontend
npm run dev:web
```

## Verify Everything Works

### 1. Check Backend

```bash
curl http://localhost:8000/health
# Should return: {"status":"ok"} or similar
```

### 2. Check Frontend

```bash
curl http://localhost:5173/
# Should return HTML
```

### 3. Check in Browser

1. Open: http://3.218.250.170:5173/
2. Login with your credentials
3. Open browser console (F12)
4. Should see NO "Failed to fetch" errors
5. App should work normally!

## EC2 Security Group (IMPORTANT!)

Make sure BOTH ports are allowed:

| Port | Service | Status |
|------|---------|--------|
| 5173 | Frontend | ✅ Already working |
| 8000 | Backend | ⚠️ Need to add |

**Add port 8000:**
1. AWS Console → EC2 → Security Groups
2. Select your instance's security group
3. Add Inbound Rule:
   - Type: Custom TCP
   - Port: 8000
   - Source: 0.0.0.0/0

## Production Deployment (Recommended)

For production, use PM2 to keep services running:

```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start "uv run uvicorn main:api --host 0.0.0.0 --port 8000" --name eigent-backend

# Start frontend
cd ..
pm2 serve dist 5173 --spa --name eigent-frontend

# Save configuration
pm2 save

# Enable auto-start on reboot
pm2 startup
# Follow the instructions it gives you

# Check status
pm2 status

# View logs
pm2 logs
```

## Troubleshooting

### "uv: command not found"

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
source ~/.bashrc
```

### "Port 8000 already in use"

```bash
# Find and kill the process
kill -9 $(lsof -t -i:8000)
```

### Backend starts but still "Failed to fetch"

1. **Check backend is accessible:**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Check security group allows port 8000**

3. **Check browser console for specific error**

4. **Verify proxy config in vite.config.web.ts:**
   ```typescript
   proxy: {
     '/api': {
       target: 'http://localhost:8000',
       changeOrigin: true,
     },
   }
   ```

### Backend crashes on startup

```bash
# Check logs
tail -f backend.log

# Or if using PM2
pm2 logs eigent-backend

# Common issues:
# - Missing dependencies: run `uv sync`
# - Python version: needs Python 3.8+
# - Port conflict: kill process on port 8000
```

## File Checklist

All files that should be on your EC2 instance:

### Core Application:
- ✅ `src/main.tsx` - BrowserRouter + web-only init
- ✅ `src/pages/Login.tsx` - Sets initState after login
- ✅ `src/pages/SignUp.tsx` - Sets initState after signup
- ✅ `src/utils/electronMock.ts` - Electron API mocks
- ✅ `src/utils/webOnlyConfig.ts` - Web-only config
- ✅ `vite.config.ts` - Server config
- ✅ `vite.config.web.ts` - Web-only Vite config
- ✅ `package.json` - Dependencies and scripts

### Backend:
- ✅ `backend/main.py` - Backend entry point
- ✅ `backend/pyproject.toml` - Python dependencies
- ✅ All backend files

### Utilities:
- ✅ `start-all.sh` - Startup script
- ✅ `public/skip-onboarding.html` - Skip tool

## Complete Startup Sequence

1. **Copy all files to EC2**
   ```bash
   git pull  # or scp files
   ```

2. **Make startup script executable**
   ```bash
   chmod +x start-all.sh
   ```

3. **Run the startup script**
   ```bash
   ./start-all.sh
   ```

4. **Access the application**
   - Frontend: http://3.218.250.170:5173/
   - Backend: http://3.218.250.170:8000/health

5. **Login and use the app**
   - No more "Failed to fetch" errors!
   - All features should work

## Summary of All Fixes

### Issue 1: Hash Router ✅ FIXED
- Changed HashRouter → BrowserRouter
- URLs now: `/login` instead of `#/login`

### Issue 2: External Access ✅ FIXED
- Added `host: '0.0.0.0'` to Vite config
- Server now accepts external connections

### Issue 3: Electron Compatibility ✅ FIXED
- Created Electron API mocks
- App runs in web-only mode

### Issue 4: Onboarding Screens ✅ FIXED
- Auto-skips in web-only mode
- Login/signup set initState to 'done'
- Manual skip tool available

### Issue 5: Backend Not Running ⚠️ IN PROGRESS
- Need to start backend server
- Use `start-all.sh` or manual commands above

## Next Steps

1. **Start the backend** using one of the methods above
2. **Verify both services are running**
3. **Access the app** at http://3.218.250.170:5173/
4. **Login and test** - should work perfectly!

## Support

If you encounter any issues:

1. Check logs:
   ```bash
   tail -f backend.log
   tail -f frontend.log
   # or
   pm2 logs
   ```

2. Check processes:
   ```bash
   netstat -tulpn | grep -E '5173|8000'
   ps aux | grep -E 'uvicorn|node'
   ```

3. Check browser console (F12) for specific errors

4. Verify security group allows both ports 5173 and 8000

The application is now fully configured and ready to run on EC2!
