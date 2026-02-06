# Quick Fix Summary - EC2 Web Deployment

## The Problem

You were running an **Electron desktop app** on EC2 using `xvfb`, which caused issues because:
1. The app uses `HashRouter` (creates `#/login` URLs)
2. Electron plugins try to launch desktop app features
3. Server wasn't configured to accept external connections

## The Solution

Created a **web-only mode** that:
1. Uses `BrowserRouter` (clean URLs like `/login`)
2. Mocks all Electron APIs so they don't cause errors
3. Runs as a pure web application without Electron

## Files Changed

### Modified:
1. **src/main.tsx** - Added BrowserRouter + Electron mocks
2. **vite.config.ts** - Added `host: '0.0.0.0'`
3. **package.json** - Added `dev:web` and `build:web` scripts

### Created:
1. **src/utils/electronMock.ts** - Mocks Electron APIs
2. **vite.config.web.ts** - Web-only Vite config
3. **start-web.sh** - Quick start script

## How to Deploy on EC2

### 1. Copy Files to EC2
```bash
# Copy all modified files or use git pull
scp -r src/ package.json vite.config.web.ts start-web.sh ec2-user@3.218.250.170:/path/to/app/
```

### 2. Configure Security Group
AWS Console → EC2 → Security Groups → Add Inbound Rule:
- Type: Custom TCP
- Port: 5173
- Source: 0.0.0.0/0

### 3. Run on EC2
```bash
# SSH into EC2
ssh ec2-user@3.218.250.170

# Navigate to app directory
cd /path/to/app

# Option A: Use the quick start script
chmod +x start-web.sh
./start-web.sh

# Option B: Run manually
npm install
npm run dev:web
```

### 4. Access Your App
Open browser: **http://3.218.250.170:5173/**

## Key Commands

```bash
# Development (web-only, NO xvfb needed!)
npm run dev:web

# Production build
npm run build:web

# Serve production build
pm2 serve dist 5173 --spa --name eigent-web
```

## What Changed

### Before:
```bash
# Had to use xvfb, URLs had #
sudo xvfb-run --auto-servernum npm run dev
# Result: http://3.218.250.170:5173/#/login
```

### After:
```bash
# No xvfb needed, clean URLs
npm run dev:web
# Result: http://3.218.250.170:5173/login
```

## Verification

After starting the server, test these URLs:
- ✅ http://3.218.250.170:5173/
- ✅ http://3.218.250.170:5173/login (no #!)
- ✅ http://3.218.250.170:5173/history
- ✅ Refresh any page - should work

## Troubleshooting

**Nothing loads?**
1. Check security group allows port 5173
2. Verify: `netstat -tulpn | grep 5173`
3. Make sure using `dev:web` not `dev`

**Still see errors?**
1. Clear browser cache
2. Check browser console (F12)
3. Verify all files were copied

## Files to Copy

Essential files to copy to EC2:
- `src/main.tsx`
- `src/utils/electronMock.ts` (new file)
- `vite.config.web.ts` (new file)
- `package.json`
- `start-web.sh` (optional, for convenience)

That's it! The app will now run as a pure web application on EC2 without Electron.


## UPDATE: Stuck on Permissions Screen?

If you're stuck on the "Enable Permissions" screen, use one of these solutions:

### Solution 1: Skip Onboarding Page (Easiest)
Access: **http://3.218.250.170:5173/skip-onboarding.html**
Click the button to bypass onboarding screens.

### Solution 2: Browser Console
Press F12, then run:
```javascript
localStorage.clear();
location.reload();
```

### Solution 3: Start Backend Server
The permissions screen needs the backend API:
```bash
cd backend
python main.py  # or your backend start command
```

### Latest Files Added:
- `src/utils/webOnlyConfig.ts` - Auto-skips onboarding
- `public/skip-onboarding.html` - Manual skip tool

After copying these new files and restarting, the app will automatically skip onboarding in web-only mode!
