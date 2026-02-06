# Immediate Fix - Stuck on Permissions Screen

## The Problem

You're stuck on the "Enable Permissions" screen because:
1. The app is trying to call `/api/user/privacy` 
2. Backend server is not running or not accessible
3. The onboarding flow expects Electron environment

## Quick Fix Options

### Option 1: Skip Onboarding (Fastest)

**On EC2, after starting the app:**

1. Access: http://3.218.250.170:5173/skip-onboarding.html
2. Click "Skip Onboarding" button
3. You'll be redirected to the login page

### Option 2: Clear localStorage (Browser)

1. Open browser console (F12)
2. Run this code:
```javascript
localStorage.clear();
location.reload();
```

### Option 3: Manual localStorage Edit

1. Open browser console (F12)
2. Run this code:
```javascript
const authStore = JSON.parse(localStorage.getItem('auth-store'));
authStore.state.initState = 'done';
authStore.state.isFirstLaunch = false;
localStorage.setItem('auth-store', JSON.stringify(authStore));
location.reload();
```

## Permanent Fix - Start Backend

The permissions screen needs the backend API. Here's how to start it:

### 1. Find Your Backend

```bash
cd /path/to/app/backend
ls  # Look for main.py, app.py, or similar
```

### 2. Start Backend

```bash
# Common Python backend commands:
python main.py
# or
python app/main.py
# or
uvicorn app.main:app --host 0.0.0.0 --port 8000
# or
python -m app.main
```

### 3. Verify Backend is Running

```bash
curl http://localhost:8000/health
# Should return JSON response
```

### 4. Restart Frontend

```bash
# Stop current frontend (Ctrl+C)
# Then restart:
npm run dev:web
```

### 5. Access App

http://3.218.250.170:5173/

Should now work properly!

## Files to Copy to EC2

Copy these updated files to your EC2 instance:

```bash
# Essential files:
src/main.tsx
src/utils/electronMock.ts
src/utils/webOnlyConfig.ts
vite.config.web.ts
package.json
public/skip-onboarding.html

# Or just pull from git:
git pull
```

## What Changed

1. **src/main.tsx** - Added web-only initialization that skips onboarding
2. **src/utils/webOnlyConfig.ts** - NEW - Automatically skips onboarding in web mode
3. **src/utils/electronMock.ts** - Mocks Electron APIs including backend port
4. **public/skip-onboarding.html** - NEW - Manual skip tool

## Current Status

After copying the new files and restarting:
- ✅ Routing fixed (no more #/login)
- ✅ Electron APIs mocked
- ✅ Server listens on 0.0.0.0
- ⚠️ Onboarding screens should auto-skip (needs backend OR manual skip)

## Next Steps

**Right Now:**
1. Access http://3.218.250.170:5173/skip-onboarding.html
2. Click "Skip Onboarding"
3. You should reach the login page

**For Production:**
1. Start backend server
2. Copy updated files to EC2
3. Restart frontend with `npm run dev:web`
4. Everything should work automatically

## Troubleshooting

**Still stuck on permissions?**
- Clear browser cache completely
- Try incognito/private window
- Use the skip-onboarding.html page
- Check browser console for errors

**Backend not starting?**
- Check if Python is installed: `python --version`
- Check if dependencies installed: `pip list`
- Look for requirements.txt: `pip install -r requirements.txt`
- Check backend logs for errors

**API calls failing?**
- Verify backend is on port 8000
- Check VITE_PROXY_URL in .env
- Check browser Network tab for failed requests
- Ensure security group allows port 8000

## Quick Test

```bash
# On EC2:

# 1. Check if backend is running
curl http://localhost:8000/health

# 2. Check if frontend is running
curl http://localhost:5173/

# 3. Check ports
sudo netstat -tulpn | grep -E '5173|8000'
```

## Summary

**Immediate action:** Use http://3.218.250.170:5173/skip-onboarding.html to bypass the permissions screen.

**Proper solution:** Start the backend server so API calls work correctly.

The updated code will automatically skip onboarding in web-only mode once you copy the new files and restart.
