#!/bin/bash

# Start CortexBuild in development mode
# Runs both frontend (port 3000) and backend (port 3001)

echo "🚀 Starting CortexBuild Development Environment..."
echo ""

# Check if ports are available
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3001 is already in use (backend)"
    read -p "Kill existing process? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        lsof -ti:3001 | xargs kill -9
        echo "✅ Port 3001 freed"
    else
        echo "❌ Cannot start backend on port 3001"
        exit 1
    fi
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3000 is already in use (frontend)"
    read -p "Kill existing process? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        lsof -ti:3000 | xargs kill -9
        echo "✅ Port 3000 freed"
    else
        echo "❌ Cannot start frontend on port 3000"
        exit 1
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 LOGIN CREDENTIALS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Super Admin:"
echo "  Email:    adrian.stanca1@gmail.com"
echo "  Password: Cumparavinde1"
echo ""
echo "Company Admin:"
echo "  Email:    adrian@ascladdingltd.co.uk"
echo "  Password: password123"
echo ""
echo "Developer:"
echo "  Email:    dev@constructco.com"
echo "  Password: password123"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start backend in background
echo "🔧 Starting backend server (port 3001)..."
npm run server > /dev/null 2>&1 &
BACKEND_PID=$!

# Wait for backend to be ready
sleep 3

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend failed to start"
    exit 1
fi

if ! lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "❌ Backend is not listening on port 3001"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Backend running (PID: $BACKEND_PID)"

# Start frontend in background
echo "🎨 Starting frontend server (port 3000)..."
npm run dev > /dev/null 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to be ready
sleep 5

# Check if frontend started successfully
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "❌ Frontend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

if ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "❌ Frontend is not listening on port 3000"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Frontend running (PID: $FRONTEND_PID)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ CortexBuild is running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Frontend:  http://localhost:3000"
echo "🔌 Backend:   http://localhost:3001"
echo "📡 WebSocket: ws://localhost:3001/ws"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT TERM

# Keep script running
wait
