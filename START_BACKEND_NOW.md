# Start Backend Right Now

## The Issue

The diagnostic shows backend is NOT running:
- ❌ Backend Health (Direct) - 404 Not Found
- ❌ Backend API (Proxied) - 404 Not Found

## Quick Fix - Start Backend

### On your EC2 instance, run these commands:

```bash
# Navigate to backend directory
cd /path/to/app/backend

# Start backend with /api prefix
url_prefix=/api uv run uvicorn main:api --host 0.0.0.0 --port 8000
```

You should see output like:
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

## Verify It's Running

Open a new terminal and test:

```bash
# Test the health endpoint with /api prefix
curl http://localhost:8000/api/health

# Should return something like:
# {"status":"healthy"}
```

## If You Get Errors

### Error: "uv: command not found"

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
source ~/.bashrc
```

### Error: "Address already in use"

```bash
# Kill the process on port 8000
kill -9 $(lsof -t -i:8000)

# Then start again
cd /path/to/app/backend
url_prefix=/api uv run uvicorn main:api --host 0.0.0.0 --port 8000
```

### Error: "No module named..."

```bash
# Install dependencies
cd /path/to/app/backend
uv sync

# Then start
url_prefix=/api uv run uvicorn main:api --host 0.0.0.0 --port 8000
```

## Alternative: Use the Startup Script

If you have the updated files:

```bash
cd /path/to/app
chmod +x start-all.sh
./start-all.sh
```

This will start both backend and frontend automatically.

## Check Status

After starting, verify with diagnostic tool:
http://3.218.250.170:5173/diagnostic.html

Should show:
- ✅ Frontend Server - PASS
- ✅ Backend Health (Direct) - PASS
- ✅ Backend API (Proxied) - PASS

## Keep Backend Running

### Option 1: Use screen (survives disconnect)

```bash
# Start a screen session
screen -S backend

# Start backend
cd /path/to/app/backend
url_prefix=/api uv run uvicorn main:api --host 0.0.0.0 --port 8000

# Detach: Press Ctrl+A then D

# Reattach later:
screen -r backend
```

### Option 2: Use PM2 (production)

```bash
# Install PM2
npm install -g pm2

# Start backend
cd /path/to/app/backend
pm2 start "url_prefix=/api uv run uvicorn main:api --host 0.0.0.0 --port 8000" --name eigent-backend

# Check status
pm2 status

# View logs
pm2 logs eigent-backend

# Save configuration
pm2 save

# Enable auto-start on reboot
pm2 startup
```

## Common Mistakes

1. **Forgetting `url_prefix=/api`**
   - Backend will start but routes won't have /api prefix
   - Proxy will fail with 404

2. **Wrong directory**
   - Must be in `backend/` directory when starting
   - Or use full path: `cd /path/to/app/backend`

3. **Port conflict**
   - Another process using port 8000
   - Kill it first: `kill -9 $(lsof -t -i:8000)`

4. **Missing dependencies**
   - Run `uv sync` first
   - Make sure uv is installed

## Expected Behavior

When backend starts correctly:

1. **Console output shows:**
   ```
   INFO:     Started server process
   INFO:     Application startup complete
   INFO:     Uvicorn running on http://0.0.0.0:8000
   ```

2. **Health check works:**
   ```bash
   curl http://localhost:8000/api/health
   # Returns: {"status":"healthy"}
   ```

3. **Diagnostic tool shows all PASS**

4. **App works without "Failed to fetch" errors**

## Summary

The backend is not running. Start it with:

```bash
cd /path/to/app/backend
url_prefix=/api uv run uvicorn main:api --host 0.0.0.0 --port 8000
```

Then refresh the diagnostic tool to verify all tests pass!
