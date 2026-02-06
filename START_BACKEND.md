# How to Start the Backend on EC2

## The "Failed to Fetch" Error

This error means the frontend can't connect to the backend API. You need to start the backend server.

## Backend Setup

### 1. Check Python and UV

```bash
# Check Python version (needs 3.8+)
python3 --version

# Check if uv is installed
uv --version

# If uv is not installed:
curl -LsSf https://astral.sh/uv/install.sh | sh
# or
pip install uv
```

### 2. Navigate to Backend Directory

```bash
cd /path/to/app/backend
```

### 3. Install Dependencies (First Time Only)

```bash
# Using uv (recommended)
uv sync

# Or using pip
pip install -r requirements.txt  # if requirements.txt exists
```

### 4. Start the Backend Server

```bash
# Start on port 8000 (default for the app)
uv run uvicorn main:api --host 0.0.0.0 --port 8000

# Or if you want a different port:
uv run uvicorn main:api --host 0.0.0.0 --port 5001
```

**Important:** Use `--host 0.0.0.0` so it accepts external connections!

### 5. Verify Backend is Running

Open a new terminal and test:

```bash
# Test health endpoint
curl http://localhost:8000/health

# Or check if port is listening
netstat -tulpn | grep 8000
```

## EC2 Security Group

Make sure your EC2 security group allows port 8000:

1. AWS Console → EC2 → Security Groups
2. Add Inbound Rule:
   - Type: Custom TCP
   - Port: 8000
   - Source: 0.0.0.0/0

## Environment Variables

Create a `.env` file in the backend directory if needed:

```bash
cd backend
nano .env
```

Add any required environment variables (check with your team for specific values).

## Running Both Frontend and Backend

### Option 1: Two Terminal Windows

**Terminal 1 - Backend:**
```bash
cd /path/to/app/backend
uv run uvicorn main:api --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd /path/to/app
npm run dev:web
```

### Option 2: Using PM2 (Production)

```bash
# Install PM2 globally
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
```

### Option 3: Using Screen (Keep Running After Disconnect)

```bash
# Start backend in screen
screen -S backend
cd /path/to/app/backend
uv run uvicorn main:api --host 0.0.0.0 --port 8000
# Press Ctrl+A then D to detach

# Start frontend in another screen
screen -S frontend
cd /path/to/app
npm run dev:web
# Press Ctrl+A then D to detach

# List screens
screen -ls

# Reattach to a screen
screen -r backend
screen -r frontend
```

## Troubleshooting

### Error: "uv: command not found"

Install uv:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
source ~/.bashrc  # or ~/.zshrc
```

### Error: "Port 8000 already in use"

Find and kill the process:
```bash
# Find process using port 8000
lsof -i :8000

# Kill it
kill -9 <PID>
```

### Error: "Module not found"

Install dependencies:
```bash
cd backend
uv sync
```

### Backend starts but frontend still shows "Failed to fetch"

1. Check backend is accessible:
   ```bash
   curl http://localhost:8000/health
   ```

2. Check Vite proxy configuration in `vite.config.web.ts`:
   ```typescript
   proxy: {
     '/api': {
       target: 'http://localhost:8000',
       changeOrigin: true,
     },
   }
   ```

3. Check browser console (F12) for specific error messages

4. Verify security group allows port 8000

## Quick Start Script

Create a file `start-all.sh`:

```bash
#!/bin/bash

echo "Starting Eigent Backend and Frontend"

# Start backend in background
cd backend
uv run uvicorn main:api --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# Wait for backend to be ready
sleep 5

# Start frontend
cd ..
npm run dev:web

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT
```

Make it executable and run:
```bash
chmod +x start-all.sh
./start-all.sh
```

## Verification

After starting both servers:

1. **Backend:** http://3.218.250.170:8000/health
2. **Frontend:** http://3.218.250.170:5173/
3. **Check browser console** - Should see no "Failed to fetch" errors
4. **Try using the app** - Should be able to interact with features

## Logs

### View Backend Logs:
```bash
# If running in terminal, logs appear there

# If using PM2:
pm2 logs eigent-backend

# If using screen:
screen -r backend
```

### View Frontend Logs:
```bash
# If running in terminal, logs appear there

# If using PM2:
pm2 logs eigent-frontend

# If using screen:
screen -r frontend
```

## Next Steps

1. Start the backend server
2. Verify it's running: `curl http://localhost:8000/health`
3. Refresh your browser
4. The "Failed to fetch" error should be gone!
