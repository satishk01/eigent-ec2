#!/bin/bash

# Comprehensive backend status check script

echo "========================================="
echo "Backend Status Check"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if port 8000 is in use
echo "1. Checking if port 8000 is in use..."
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${GREEN}✓ Port 8000 is in use${NC}"
    echo "Process details:"
    lsof -i :8000
else
    echo -e "${RED}✗ Port 8000 is NOT in use${NC}"
    echo "Backend is not running!"
fi
echo ""

# Check for uvicorn processes
echo "2. Checking for uvicorn processes..."
if ps aux | grep -v grep | grep uvicorn > /dev/null; then
    echo -e "${GREEN}✓ Found uvicorn process:${NC}"
    ps aux | grep -v grep | grep uvicorn
else
    echo -e "${RED}✗ No uvicorn process found${NC}"
fi
echo ""

# Check if uv is installed
echo "3. Checking if uv is installed..."
if command -v uv &> /dev/null; then
    echo -e "${GREEN}✓ uv is installed${NC}"
    uv --version
else
    echo -e "${RED}✗ uv is NOT installed${NC}"
    echo "Install with: curl -LsSf https://astral.sh/uv/install.sh | sh"
fi
echo ""

# Check if backend directory exists
echo "4. Checking backend directory..."
if [ -d "backend" ]; then
    echo -e "${GREEN}✓ backend directory exists${NC}"
    if [ -f "backend/main.py" ]; then
        echo -e "${GREEN}✓ backend/main.py exists${NC}"
    else
        echo -e "${RED}✗ backend/main.py NOT found${NC}"
    fi
else
    echo -e "${RED}✗ backend directory NOT found${NC}"
    echo "Are you in the correct directory?"
fi
echo ""

# Try to connect to backend
echo "5. Testing backend connection..."
if curl -s --connect-timeout 2 http://localhost:8000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is responding at http://localhost:8000/api/health${NC}"
    echo "Response:"
    curl -s http://localhost:8000/api/health | jq . 2>/dev/null || curl -s http://localhost:8000/api/health
elif curl -s --connect-timeout 2 http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Backend is responding at http://localhost:8000/health${NC}"
    echo -e "${YELLOW}  But NOT at /api/health - missing url_prefix!${NC}"
    echo "Response:"
    curl -s http://localhost:8000/health | jq . 2>/dev/null || curl -s http://localhost:8000/health
else
    echo -e "${RED}✗ Backend is NOT responding${NC}"
    echo "Cannot connect to http://localhost:8000"
fi
echo ""

# Check backend logs if they exist
echo "6. Checking for backend logs..."
if [ -f "backend.log" ]; then
    echo -e "${GREEN}✓ Found backend.log${NC}"
    echo "Last 10 lines:"
    tail -10 backend.log
else
    echo -e "${YELLOW}⚠ No backend.log file found${NC}"
fi
echo ""

# Summary and recommendations
echo "========================================="
echo "Summary & Recommendations"
echo "========================================="
echo ""

if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    if curl -s --connect-timeout 2 http://localhost:8000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is running correctly!${NC}"
        echo ""
        echo "Backend is accessible at:"
        echo "  - http://localhost:8000/api/health"
        echo "  - http://$(curl -s ifconfig.me 2>/dev/null || echo "YOUR_IP"):8000/api/health"
    elif curl -s --connect-timeout 2 http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠ Backend is running but WITHOUT /api prefix${NC}"
        echo ""
        echo "To fix:"
        echo "  1. Stop the backend (Ctrl+C or kill process)"
        echo "  2. Restart with: url_prefix=/api uv run uvicorn main:api --host 0.0.0.0 --port 8000"
    else
        echo -e "${YELLOW}⚠ Something is on port 8000 but not responding${NC}"
        echo ""
        echo "To fix:"
        echo "  1. Kill the process: kill -9 \$(lsof -t -i:8000)"
        echo "  2. Start backend: cd backend && url_prefix=/api uv run uvicorn main:api --host 0.0.0.0 --port 8000"
    fi
else
    echo -e "${RED}✗ Backend is NOT running${NC}"
    echo ""
    echo "To start backend:"
    echo "  cd backend"
    echo "  url_prefix=/api uv run uvicorn main:api --host 0.0.0.0 --port 8000"
    echo ""
    echo "Or use the startup script:"
    echo "  ./start-backend-only.sh"
fi
echo ""
