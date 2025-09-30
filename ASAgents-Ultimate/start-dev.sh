#!/bin/bash

# =============================================================================
# Full Stack Development Server
# Starts frontend, backend, and server simultaneously
# =============================================================================

set -e

echo "🚀 Starting ASAgents Ultimate - Full Stack Development"
echo "======================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if ports are available
check_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${YELLOW}⚠️  Port $port is already in use (needed for $service)${NC}"
        echo "   Attempting to kill process..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Kill any existing processes
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down servers...${NC}"
    
    # Kill all background jobs
    jobs -p | xargs kill 2>/dev/null || true
    
    # Kill processes on our ports
    lsof -ti:5173,3000,4000 | xargs kill -9 2>/dev/null || true
    
    echo -e "${GREEN}✅ All servers stopped${NC}"
    exit 0
}

# Trap CTRL+C
trap cleanup INT TERM

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

echo -e "${BLUE}Node.js version: $(node -v)${NC}"
echo ""

# Check ports
echo "🔍 Checking ports..."
check_port 5173 "Frontend (Vite)"
check_port 3000 "Backend API"
check_port 4000 "Server API"
echo -e "${GREEN}✅ Ports are ready${NC}"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing root dependencies..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    cd server && npm install && cd ..
fi

echo ""
echo "🎯 Starting all services..."
echo ""

# Create log directory
mkdir -p logs

# Start Backend (Port 3000)
echo -e "${BLUE}📡 Starting Backend API (Port 3000)...${NC}"
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo -e "${GREEN}   Backend PID: $BACKEND_PID${NC}"
sleep 2

# Start Server (Port 4000)
echo -e "${BLUE}📡 Starting Server API (Port 4000)...${NC}"
cd server
npm run dev:simple > ../logs/server.log 2>&1 &
SERVER_PID=$!
cd ..
echo -e "${GREEN}   Server PID: $SERVER_PID${NC}"
sleep 2

# Start Frontend (Port 5173)
echo -e "${BLUE}🌐 Starting Frontend (Port 5173)...${NC}"
npm run dev > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}   Frontend PID: $FRONTEND_PID${NC}"
sleep 3

echo ""
echo "======================================================"
echo -e "${GREEN}✨ All services started successfully!${NC}"
echo "======================================================"
echo ""
echo "📊 Service Status:"
echo "   Frontend:  http://localhost:5173"
echo "   Backend:   http://localhost:3000/api"
echo "   Server:    http://localhost:4000/api"
echo ""
echo "📝 Logs:"
echo "   Frontend:  logs/frontend.log"
echo "   Backend:   logs/backend.log"
echo "   Server:    logs/server.log"
echo ""
echo "💡 Tips:"
echo "   - Press CTRL+C to stop all servers"
echo "   - Run 'tail -f logs/*.log' to view all logs"
echo "   - Changes will auto-reload with hot module replacement"
echo ""
echo -e "${YELLOW}👀 Watching for changes...${NC}"
echo ""

# Wait for any process to exit
wait
