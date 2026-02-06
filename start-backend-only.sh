#!/bin/bash

# Quick script to start just the backend

echo "Starting Eigent Backend..."
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ]; then
    echo "Error: backend directory not found"
    echo "Please run this script from the app root directory"
    exit 1
fi

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "Error: 'uv' is not installed"
    echo "Install it with: curl -LsSf https://astral.sh/uv/install.sh | sh"
    exit 1
fi

# Kill any existing process on port 8000
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "Killing existing process on port 8000..."
    kill -9 $(lsof -t -i:8000) 2>/dev/null || true
    sleep 2
fi

# Navigate to backend
cd backend

# Start backend with /api prefix
echo "Starting backend on port 8000 with /api prefix..."
echo ""
echo "Backend will be available at:"
echo "  - http://localhost:8000/api/health"
echo "  - http://$(curl -s ifconfig.me 2>/dev/null || echo "YOUR_IP"):8000/api/health"
echo ""
echo "Press Ctrl+C to stop"
echo ""

url_prefix=/api uv run uvicorn main:api --host 0.0.0.0 --port 8000
