# Proxy Configuration Fix

## The Issue

The diagnostic tool showed:
- ✅ Frontend working
- ✅ Backend running on port 8000
- ❌ Backend API proxy failing (404)

This happened because:
1. `.env` had wrong backend port (3001 instead of 8000)
2. Backend wasn't configured with `/api` prefix

## Files Fixed

### 1. `.env` (Frontend)
Changed:
```env
VITE_PROXY_URL=http://localhost:3001  # WRONG
```

To:
```env
VITE_PROXY_URL=http://localhost:8000  # CORRECT
```

### 2. `backend/.env` (Backend) - NEW FILE
Created with:
```env
url_prefix=/api
```

This tells the backend to serve all routes under `/api` prefix.

## How to Apply the Fix

### On EC2:

**1. Copy the updated files:**
```bash
# Copy .env
scp .env ec2-user@3.218.250.170:/path/to/app/

# Copy backend/.env
scp backend/.env ec2-user@3.218.250.170:/path/to/app/backend/
```

**2. Restart both services:**

**Terminal 1 - Restart Backend:**
```bash
# Stop current backend (Ctrl+C)

# Restart with new config
cd /path/to/app/backend
uv run uvicorn main:api --host 0.0.0.0 --port 8000
```

**Terminal 2 - Restart Frontend:**
```bash
# Stop current frontend (Ctrl+C)

# Restart with new config
cd /path/to/app
npm run dev:web
```

**3. Verify the fix:**

Access the diagnostic tool:
http://3.218.250.170:5173/diagnostic.html

All three tests should now PASS:
- ✅ Frontend Server
- ✅ Backend Health (Direct)
- ✅ Backend API (Proxied)

## Alternative: Use Environment Variables

Instead of creating backend/.env, you can set the environment variable when starting:

```bash
cd backend
url_prefix=/api uv run uvicorn main:api --host 0.0.0.0 --port 8000
```

## Update start-all.sh

If using the startup script, update it to include the environment variable:

```bash
# In start-all.sh, change the backend start line to:
cd backend
url_prefix=/api uv run uvicorn main:api --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
```

## Verification Steps

After restarting:

**1. Test backend health directly:**
```bash
curl http://localhost:8000/api/health
```
Should return: `{"status":"healthy"}` or similar

**2. Test through proxy:**
```bash
curl http://localhost:5173/api/health
```
Should return the same response

**3. Test in browser:**
- Open: http://3.218.250.170:5173/diagnostic.html
- All tests should PASS
- Open: http://3.218.250.170:5173/
- Login and use the app
- No more "Failed to fetch" errors!

## What Changed

### Before:
```
Frontend (5173) → /api → Proxy to localhost:3001 → ❌ Nothing there
Backend (8000) → /health → ✅ Works but not proxied
```

### After:
```
Frontend (5173) → /api → Proxy to localhost:8000 → Backend /api/health → ✅ Works!
Backend (8000) → /api/health → ✅ Works with prefix
```

## Troubleshooting

### Still getting 404?

**Check backend logs:**
```bash
# Look for this line when backend starts:
# "Loading routers with prefix: '/api'"
```

If it says `prefix: ''`, the backend/.env file isn't being loaded.

**Solution:**
```bash
# Explicitly set the environment variable
cd backend
export url_prefix=/api
uv run uvicorn main:api --host 0.0.0.0 --port 8000
```

### Backend starts but no /api prefix?

The backend reads `url_prefix` from environment. Make sure:
1. `backend/.env` file exists
2. Contains `url_prefix=/api`
3. Backend is restarted after creating the file

### Proxy still not working?

**Check Vite config:**
```bash
# Verify vite.config.web.ts has:
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
  },
}
```

**Restart frontend:**
```bash
npm run dev:web
```

## Summary

The fix requires:
1. ✅ Update `.env` - Set `VITE_PROXY_URL=http://localhost:8000`
2. ✅ Create `backend/.env` - Set `url_prefix=/api`
3. ✅ Restart backend
4. ✅ Restart frontend
5. ✅ Test with diagnostic tool

After this, all API calls should work correctly!
