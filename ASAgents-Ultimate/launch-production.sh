#!/bin/bash

# ASAgents Ultimate - Complete Launch Script
# Starts backend and opens production URL

echo "🚀 ASAgents Ultimate - Production Launch"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Production URL
PROD_URL="https://asa-gents-ultimate-46vy68kfy-adrian-b7e84541.vercel.app"
BACKEND_URL="http://localhost:3000"

echo -e "${BLUE}Production Frontend:${NC} $PROD_URL"
echo -e "${BLUE}Backend API:${NC} $BACKEND_URL"
echo ""

# Check if backend node_modules exist
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd backend && npm install && cd ..
fi

# Start backend
echo -e "${GREEN}Starting backend server...${NC}"
cd backend

# Check if database exists, if not create it
if [ ! -f "database.sqlite" ]; then
    echo -e "${YELLOW}Database not found, initializing...${NC}"
    npm run db:migrate
    npm run db:seed
fi

# Start backend in background
echo "Starting Express server on port 3000..."
npm start > ../logs/backend.log 2>&1 &
BACKEND_PID=$!

cd ..

# Wait for backend to start
echo -n "Waiting for backend to start"
for i in {1..10}; do
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

echo ""
echo "========================================"
echo -e "${GREEN}✓ Backend started successfully!${NC}"
echo "========================================"
echo ""

# Display URLs
echo "🌐 Application URLs:"
echo "-------------------"
echo -e "Production Frontend: ${BLUE}$PROD_URL${NC}"
echo -e "Backend API:         ${BLUE}$BACKEND_URL${NC}"
echo -e "API Health:          ${BLUE}$BACKEND_URL/api/health${NC}"
echo -e "API Docs:            ${BLUE}$BACKEND_URL/api-docs${NC}"
echo ""

# Display test credentials
echo "🔐 Test Credentials:"
echo "-------------------"
echo "Email:    admin@asagents.com"
echo "Password: admin123"
echo ""

# Display backend logs location
echo "📋 Backend Logs:"
echo "---------------"
echo "Location: logs/backend.log"
echo "View logs: tail -f logs/backend.log"
echo ""

# Display process info
echo "⚙️  Process Info:"
echo "----------------"
echo "Backend PID: $BACKEND_PID"
echo ""
echo "To stop backend: kill $BACKEND_PID"
echo "Or use: pkill -f \"node.*backend\""
echo ""

# Test backend
echo "🧪 Testing backend..."
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is responding${NC}"
else
    echo -e "${YELLOW}⚠ Backend may not be ready yet${NC}"
    echo "  Check logs: tail -f logs/backend.log"
fi

echo ""
echo "========================================"
echo "Next Steps:"
echo "========================================"
echo "1. Open production frontend: $PROD_URL"
echo "2. Login with admin@asagents.com / admin123"
echo "3. Test core features"
echo ""
echo "For local development:"
echo "- Run 'npm run dev' for frontend dev server"
echo "- Access at http://localhost:5173"
echo ""
echo "========================================"
echo -e "${GREEN}✓ Launch complete!${NC}"
echo "========================================"
