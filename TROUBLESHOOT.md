# Troubleshooting - Backend Not Starting

## Run This First

On your EC2 instance:

```bash
cd /path/to/app
chmod +x check-backend-status.sh
./check-backend-status.sh
```

This will tell you exactly what's wrong.

## Common Issues & Solutions

### Issue 1: Backend Never Started

**Symptoms:**
- Diagnostic shows 404 errors
- `netstat -tulpn | grep 8000` shows nothing

**Solution:**
```bash
cd /path/to/app/backend
url_prefix=/api uv run uvicorn main:api --host 0.0.0.0 --port 8000
```

### Issue 2: Backend Started But Crashed

**Symptoms:**
- You started it but it's not running anymore
- No process on port 8000

**Check logs:**
```bash
cd /path/to/app
cat backend.log  # if using start-all.sh
```

**Common crash reasons:**
1. **Missing dependencies**
   ```bash
   cd backend
   uv sync
   ```

2. **Python version too old**
   ```bash
   python3 --version  # Need 3.8+
   ```

3. **Port already in use**
   ```bash
   kill -9 $(lsof -t -i:8000)
   ```

### Issue 3: Backend Running Without /api Prefix

**Symptoms:**
- `curl http://localhost:8000/health` works
- `curl http://localhost:8000/api/health` gives 404

**Solution:**
Stop and restart with url_prefix:
```bash
# Find and kill the process
kill -9 $(lsof -t -i:8000)

# Restart with prefix
cd backend
url_prefix=/api uv run uvicorn main:api --host 0.0.0.0 --port 8000
```

### Issue 4: Wrong Directory

**Symptoms:**
- Error: "No module named 'app'"
- Error: "Cannot find main.py"

**Solution:**
Make sure you're in the backend directory:
```bash
cd /path/to/app/backend
pwd  # Should show: /path/to/app/backend
ls main.py  # Should exist
```

### Issue 5: uv Not Installed

**Symptoms:**
- Error: "uv: command not found"

**Solution:**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
source ~/.bashrc
uv --version
```

### Issue 6: Dependencies Not Installed

**Symptoms:**
- Error: "No module named 'fastapi'"
- Error: "ModuleNotFoundError"

**Solution:**
```bash
cd backend
uv sync
```

## Step-by-Step Debugging

### Step 1: Check if backend is running

```bash
netstat -tulpn | grep 8000
```

**If nothing shows:** Backend is not running → Go to Step 2

**If something shows:** Backend is running → Go to Step 3

### Step 2: Try to start backend

```bash
cd /path/to/app/backend
url_prefix=/api uv run uvicorn main:api --host 0.0.0.0 --port 8000
```

**Watch for errors:**
- "uv: command not found" → Install uv
- "No module named..." → Run `uv sync`
- "Address already in use" → Kill process on port 8000
- "Cannot find main.py" → Wrong directory

### Step 3: Test if backend responds

```bash
# Test with /api prefix
curl http://localhost:8000/api/health

# Test without prefix
curl http://localhost:8000/health
```

**If /api/health works:** ✅ Backend is correct!

**If only /health works:** Backend running without prefix → Restart with url_prefix

**If neither works:** Backend is running but not responding → Check logs

### Step 4: Check backend logs

```bash
# If using start-all.sh
cat backend.log

# If running manually, check terminal output
```

Look for:
- "Application startup complete" → Good!
- Error messages → Fix the error
- Nothing → Backend didn't start

## Manual Test Commands

```bash
# 1. Check if port is in use
lsof -i :8000

# 2. Check for uvicorn process
ps aux | grep uvicorn

# 3. Test backend health
curl http://localhost:8000/api/health

# 4. Test from external IP
curl http://3.218.250.170:8000/api/health

# 5. Check if uv is installed
uv --version

# 6. Check Python version
python3 --version

# 7. List backend directory
ls -la backend/

# 8. Check backend dependencies
cd backend && uv pip list
```

## Still Not Working?

### Get detailed status:

```bash
cd /path/to/app
./check-backend-status.sh
```

### Try a clean start:

```bash
# 1. Kill everything
kill -9 $(lsof -t -i:8000) 2>/dev/null
kill -9 $(lsof -t -i:5173) 2>/dev/null

# 2. Clean install backend
cd backend
rm -rf .venv
uv sync

# 3. Start backend
url_prefix=/api uv run uvicorn main:api --host 0.0.0.0 --port 8000
```

### Check security group:

1. AWS Console → EC2 → Security Groups
2. Find your instance's security group
3. Verify inbound rules allow:
   - Port 8000 (backend)
   - Port 5173 (frontend)

## Expected Output When Working

When you start the backend correctly, you should see:

```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

Then testing should work:

```bash
$ curl http://localhost:8000/api/health
{"status":"healthy"}
```

And diagnostic tool should show all PASS.

## Quick Reference

```bash
# Start backend
cd backend && url_prefix=/api uv run uvicorn main:api --host 0.0.0.0 --port 8000

# Check status
./check-backend-status.sh

# Test health
curl http://localhost:8000/api/health

# View logs
tail -f backend.log

# Kill backend
kill -9 $(lsof -t -i:8000)
```
