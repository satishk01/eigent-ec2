# Backend Not Running - Quick Fix

## The Problem

You're seeing "Failed to fetch" errors because the **backend server is not running**.

## Quick Diagnostic

Access this page to check status:
**http://3.218.250.170:5173/diagnostic.html**

This will tell you exactly what's wrong and how to fix it.

## Quick Fix

### On your EC2 instance, run:

```bash
# Navigate to backend directory
cd /path/to/app/backend

# Start the backend
uv run uvicorn main:api --host 0.0.0.0 --port 8000
```

### If you don't have `uv`:

```bash
# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh
source ~/.bashrc

# Then start backend
cd /path/to/app/backend
uv sync  # Install dependencies
uv run uvicorn main:api --host 0.0.0.0 --port 8000
```

## Verify Backend is Running

```bash
# Test the health endpoint
curl http://localhost:8000/health

# Should return something like:
# {"status":"ok"}
```

## Common Issues

### 1. "uv: command not found"

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
source ~/.bashrc
```

### 2. "Port 8000 already in use"

```bash
# Find and kill the process
kill -9 $(lsof -t -i:8000)
```

### 3. "Module not found" errors

```bash
cd backend
uv sync  # Install all dependencies
```

### 4. Backend starts but still getting errors

- Check EC2 security group allows port 8000
- Restart frontend: `npm run dev:web`
- Clear browser cache (Ctrl+Shift+R)

## Check What's Running

```bash
# Check if backend is running
netstat -tulpn | grep 8000

# Check if frontend is running
netstat -tulpn | grep 5173

# Check all node/python processes
ps aux | grep -E 'uvicorn|node'
```

## Full Restart

If nothing works, restart everything:

```bash
# Kill all processes
kill -9 $(lsof -t -i:8000)
kill -9 $(lsof -t -i:5173)

# Start backend
cd /path/to/app/backend
uv run uvicorn main:api --host 0.0.0.0 --port 8000 &

# Wait a few seconds
sleep 5

# Start frontend
cd ..
npm run dev:web
```

## Using the Startup Script

Easiest way - use the provided script:

```bash
cd /path/to/app
chmod +x start-all.sh
./start-all.sh
```

This starts both backend and frontend automatically.

## Expected Output

When backend starts successfully, you should see:

```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

## Test After Starting

1. **Test backend directly:**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Test from browser:**
   - Open: http://3.218.250.170:8000/health
   - Should see JSON response

3. **Test frontend:**
   - Open: http://3.218.250.170:5173/
   - Login
   - Should work without "Failed to fetch" errors

## Still Not Working?

1. **Run diagnostic tool:**
   http://3.218.250.170:5173/diagnostic.html

2. **Check logs:**
   ```bash
   # If using start-all.sh
   tail -f backend.log
   tail -f frontend.log
   ```

3. **Check browser console:**
   - Press F12
   - Look for red errors
   - Check Network tab for failed requests

4. **Verify security group:**
   - AWS Console → EC2 → Security Groups
   - Must allow ports 5173 AND 8000

## Summary

The "Failed to fetch" error means the backend is not running. Start it with:

```bash
cd backend
uv run uvicorn main:api --host 0.0.0.0 --port 8000
```

Then refresh your browser and the errors should be gone!
