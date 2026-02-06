# EC2 Web Deployment Guide (Without Electron)

## Problem Identified

Your application is an **Electron desktop app** that includes Electron-specific code. When running on EC2 with `xvfb`, it tries to launch Electron which causes issues. For web deployment, you need to run it in **web-only mode**.

## Solution

We've created:
1. **Electron API mocks** - Mock all Electron APIs for web environment
2. **Web-only Vite config** - Configuration without Electron plugins
3. **New npm scripts** - Commands to run in web-only mode

## Files Modified

1. **src/main.tsx** - Added BrowserRouter and Electron mock initialization
2. **vite.config.ts** - Added host: '0.0.0.0' for external access
3. **package.json** - Added `dev:web` and `build:web` scripts

## Files Created

1. **src/utils/electronMock.ts** - Mock Electron APIs for web
2. **vite.config.web.ts** - Web-only Vite configuration
3. **EC2_WEB_DEPLOYMENT.md** - This guide

## EC2 Deployment Steps

### Step 1: Copy Files to EC2

Copy these modified/new files to your EC2 instance:
```bash
scp src/main.tsx ec2-user@3.218.250.170:/path/to/app/src/
scp src/utils/electronMock.ts ec2-user@3.218.250.170:/path/to/app/src/utils/
scp vite.config.web.ts ec2-user@3.218.250.170:/path/to/app/
scp package.json ec2-user@3.218.250.170:/path/to/app/
```

Or use git to pull the changes.

### Step 2: Configure EC2 Security Group

**CRITICAL:** Allow port 5173 in your EC2 security group:
1. AWS Console → EC2 → Security Groups
2. Select your instance's security group
3. Add Inbound Rule:
   - Type: Custom TCP
   - Port: 5173
   - Source: 0.0.0.0/0 (or your specific IP)

### Step 3: Run on EC2

**Option A: Development Mode (Recommended for Testing)**

On your EC2 instance:
```bash
# Install dependencies (if needed)
npm install

# Run in web-only mode (NO xvfb needed!)
npm run dev:web
```

**Option B: Production Build**

```bash
# Build for web
npm run build:web

# Serve with PM2
npm install -g pm2
pm2 serve dist 5173 --spa --name eigent-web
pm2 save
pm2 startup
```

**Option C: Using the provided server.js**

```bash
# Build first
npm run build:web

# Install express
npm install express

# Run server
node server.js
```

### Step 4: Access Your Application

Open in browser:
- **http://3.218.250.170:5173/**
- **http://3.218.250.170:5173/login** (no more #!)
- **http://3.218.250.170:5173/history**

## Key Differences

### Before (Electron Mode):
```bash
# Required xvfb and tried to launch Electron
sudo xvfb-run --auto-servernum npm run dev
```

### After (Web Mode):
```bash
# No xvfb needed, runs as pure web app
npm run dev:web
```

## What the Mocks Do

The Electron API mocks provide stub implementations for all Electron-specific features:
- Window controls (minimize, maximize, close) - logged to console
- File system operations - return empty/null values
- IPC communication - logged to console
- Webview management - no-op functions

This allows the app to run without errors, though Electron-specific features won't work (which is expected in web mode).

## Troubleshooting

### Issue: Still getting Electron errors
**Solution:** Make sure you're using `npm run dev:web` not `npm run dev`

### Issue: Port 5173 not accessible
**Solutions:**
1. Check security group allows port 5173
2. Verify app is running: `netstat -tulpn | grep 5173`
3. Check if another process is using the port: `lsof -i :5173`

### Issue: Blank page or errors in console
**Solutions:**
1. Check browser console (F12) for specific errors
2. Verify all files were copied correctly
3. Clear browser cache and hard refresh (Ctrl+Shift+R)
4. Check that electronMock.ts was created properly

### Issue: API calls failing
**Solutions:**
1. Check if backend is running
2. Verify VITE_PROXY_URL in .env file
3. Check proxy configuration in vite.config.web.ts

### Issue: Features not working (file upload, etc.)
**Expected:** Some Electron-specific features won't work in web mode. You may need to implement web alternatives for:
- File system access (use browser file APIs)
- Window controls (hide or remove these UI elements)
- Native dialogs (use web-based dialogs)

## Environment Variables

Create `.env.production` for production settings:

```env
VITE_API_URL=http://your-backend-url:8000
VITE_PROXY_URL=http://localhost:8000
VITE_USE_LOCAL_PROXY=false
```

## Production Deployment Checklist

- [ ] Security group configured for port 5173
- [ ] All modified files copied to EC2
- [ ] Dependencies installed (`npm install`)
- [ ] Using web-only commands (`dev:web` or `build:web`)
- [ ] Backend API is accessible
- [ ] Environment variables configured
- [ ] Process manager (PM2) set up for auto-restart
- [ ] Tested all routes work without `#`

## Commands Reference

```bash
# Development (web-only)
npm run dev:web

# Build (web-only)
npm run build:web

# Check what's running on port 5173
sudo netstat -tulpn | grep 5173

# Kill process on port 5173
sudo kill -9 $(lsof -t -i:5173)

# View PM2 logs
pm2 logs eigent-web

# Restart PM2 app
pm2 restart eigent-web

# Stop PM2 app
pm2 stop eigent-web
```

## Next Steps

1. SSH into your EC2 instance
2. Navigate to your app directory
3. Copy the modified files
4. Run: `npm run dev:web`
5. Access: http://3.218.250.170:5173/

The app should now load properly without the `#/login` issue!
