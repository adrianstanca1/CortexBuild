#!/bin/bash

# CortexBuild Development Servers Startup Script

echo "🚀 Starting CortexBuild Development Servers..."
echo ""

# Kill any existing processes
echo "Stopping existing servers..."
pkill -f "vite" 2>/dev/null || true
pkill -f "tsx server" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
sleep 2

# Start backend server
echo "Starting backend server (port 3001)..."
npm run server > logs/server.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 5

# Check if backend started
if lsof -i :3001 > /dev/null 2>&1; then
    echo "✅ Backend running on http://localhost:3001"
else
    echo "❌ Backend failed to start. Check logs/server.log"
    tail -20 logs/server.log
    exit 1
fi

# Start frontend server
echo "Starting frontend server (port 3000)..."
npm run dev > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait for frontend to start
sleep 3

# Check if frontend started
if lsof -i :3000 > /dev/null 2>&1; then
    echo "✅ Frontend running on http://localhost:3000"
else
    echo "❌ Frontend failed to start. Check logs/frontend.log"
    tail -20 logs/frontend.log
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All servers started successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Frontend:  http://localhost:3000"
echo "🔧 Backend:   http://localhost:3001"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f logs/server.log"
echo "   Frontend: tail -f logs/frontend.log"
echo ""
echo "🛑 To stop servers:"
echo "   ./stop-servers.sh"
echo ""

# Save PIDs for later
echo "$BACKEND_PID" > logs/backend.pid
echo "$FRONTEND_PID" > logs/frontend.pid
