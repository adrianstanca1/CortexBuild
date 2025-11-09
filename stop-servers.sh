#!/bin/bash

# CortexBuild Development Servers Stop Script

echo "🛑 Stopping CortexBuild Development Servers..."

# Kill by PIDs if available
if [ -f logs/backend.pid ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    kill $BACKEND_PID 2>/dev/null || true
    rm logs/backend.pid
fi

if [ -f logs/frontend.pid ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    kill $FRONTEND_PID 2>/dev/null || true
    rm logs/frontend.pid
fi

# Kill by process name
pkill -f "vite" 2>/dev/null || true
pkill -f "tsx server" 2>/dev/null || true

# Kill by port
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

sleep 1

echo "✅ All servers stopped"
