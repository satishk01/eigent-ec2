#!/bin/bash
# Quick start script for web-only deployment on EC2

echo "========================================="
echo "Starting Eigent in Web-Only Mode"
echo "========================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Check if port 5173 is already in use
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo "Warning: Port 5173 is already in use"
    echo "Killing existing process..."
    kill -9 $(lsof -t -i:5173)
    sleep 2
fi

echo ""
echo "Starting development server..."
echo "Access your app at: http://$(curl -s ifconfig.me):5173/"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the web-only dev server
npm run dev:web
