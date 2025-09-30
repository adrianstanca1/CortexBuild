#!/bin/bash

# Backend Connectivity Test Script
# Tests the ASAgents Ultimate backend services

echo "🔍 ASAgents Ultimate - Backend Connectivity Test"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=$3
    
    echo -n "Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>&1)
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (Status: $response)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $response)"
        ((FAILED++))
    fi
}

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:3000}"
PROD_URL="https://asa-gents-ultimate-46vy68kfy-adrian-b7e84541.vercel.app"

echo "Testing Backend: $BACKEND_URL"
echo "Testing Production: $PROD_URL"
echo ""

# Test 1: Backend Health Check
echo "1. Backend Health Check"
echo "----------------------"
test_endpoint "Backend Health" "$BACKEND_URL/api/health" "200"
echo ""

# Test 2: Backend API Routes
echo "2. Backend API Routes"
echo "--------------------"
test_endpoint "Auth Login Endpoint" "$BACKEND_URL/api/auth/login" "405"  # Method not allowed (needs POST)
test_endpoint "Auth Register Endpoint" "$BACKEND_URL/api/auth/register" "405"
test_endpoint "Agents Endpoint" "$BACKEND_URL/api/agents" "401"  # Unauthorized (needs auth)
echo ""

# Test 3: Production Frontend
echo "3. Production Frontend"
echo "---------------------"
test_endpoint "Production Homepage" "$PROD_URL" "200"
test_endpoint "Production API Health" "$PROD_URL/api/health" "200"
echo ""

# Test 4: Database Connectivity
echo "4. Database Connectivity"
echo "------------------------"
if [ -f "backend/data/database.sqlite" ]; then
    echo -e "${GREEN}✓ SQLite database file exists${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ SQLite database file not found${NC}"
    echo "  (Will be created on first backend start)"
fi
echo ""

# Test 5: Environment Variables
echo "5. Environment Variables"
echo "------------------------"

check_env_var() {
    local var_name=$1
    if [ -z "${!var_name}" ]; then
        echo -e "${YELLOW}⚠ $var_name${NC} not set"
    else
        echo -e "${GREEN}✓ $var_name${NC} is set"
        ((PASSED++))
    fi
}

check_env_var "DATABASE_URL"
check_env_var "JWT_SECRET"
check_env_var "SESSION_SECRET"
echo ""

# Test 6: Frontend Build
echo "6. Frontend Build Status"
echo "------------------------"
if [ -d "dist" ]; then
    echo -e "${GREEN}✓ Frontend build exists${NC}"
    echo "  Files: $(find dist -type f | wc -l | tr -d ' ')"
    echo "  Size: $(du -sh dist | cut -f1)"
    ((PASSED++))
else
    echo -e "${RED}✗ Frontend build not found${NC}"
    ((FAILED++))
fi
echo ""

# Test 7: Backend Dependencies
echo "7. Backend Dependencies"
echo "----------------------"
if [ -f "backend/package.json" ]; then
    echo -e "${GREEN}✓ Backend package.json exists${NC}"
    ((PASSED++))
    
    if [ -d "backend/node_modules" ]; then
        echo -e "${GREEN}✓ Backend node_modules exists${NC}"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠ Backend dependencies not installed${NC}"
        echo "  Run: cd backend && npm install"
    fi
else
    echo -e "${RED}✗ Backend package.json not found${NC}"
    ((FAILED++))
fi
echo ""

# Test 8: Port Availability
echo "8. Port Availability"
echo "-------------------"
check_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${YELLOW}⚠ Port $port${NC} ($service) is in use"
    else
        echo -e "${GREEN}✓ Port $port${NC} ($service) is available"
        ((PASSED++))
    fi
}

check_port 3000 "Backend API"
check_port 5173 "Frontend Dev"
echo ""

# Summary
echo "================================================"
echo "Test Summary"
echo "================================================"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All critical tests passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start backend: cd backend && npm start"
    echo "2. Start frontend: npm run dev"
    echo "3. Access app: http://localhost:5173"
    exit 0
else
    echo -e "${YELLOW}⚠ Some tests failed${NC}"
    echo ""
    echo "Recommended actions:"
    if [ ! -d "backend/node_modules" ]; then
        echo "- Install backend dependencies: cd backend && npm install"
    fi
    if [ -z "$DATABASE_URL" ]; then
        echo "- Set up environment variables: cp .env.example .env.local"
    fi
    echo "- Review NEXT_PHASE_ACTION_PLAN.md for detailed instructions"
    exit 1
fi
