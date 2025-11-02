#!/bin/bash

# Test Script for Error Handling System
# Tests backend error middleware, database errors, and logging

echo "🧪 TESTING ERROR HANDLING SYSTEM"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local test_name="$1"
    local url="$2"
    local expected_status="$3"
    local method="${4:-GET}"
    local data="$5"
    
    echo -n "Testing: $test_name ... "
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" "$url")
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASSED${NC} (Status: $status_code)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC} (Expected: $expected_status, Got: $status_code)"
        echo "Response: $body"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

echo "📋 PHASE 1: Backend Error Handler Tests"
echo "========================================"
echo ""

# Test 1: 404 Handler
echo "Test 1.1: 404 Not Found Handler"
test_endpoint "Invalid route" "http://localhost:3001/api/invalid-endpoint" "404"
echo ""

# Test 2: Valid API endpoint
echo "Test 1.2: Valid endpoint (should work)"
test_endpoint "Get projects" "http://localhost:3001/api/projects" "200"
echo ""

# Test 3: Login endpoint
echo "Test 1.3: Login endpoint"
test_endpoint "Login" "http://localhost:3001/api/auth/login" "200" "POST" \
    '{"email":"adrian.stanca1@gmail.com","password":"Cumparavinde1"}'
echo ""

# Test 4: Invalid login
echo "Test 1.4: Invalid login credentials"
test_endpoint "Invalid login" "http://localhost:3001/api/auth/login" "401" "POST" \
    '{"email":"invalid@test.com","password":"wrong"}'
echo ""

# Test 5: Missing fields
echo "Test 1.5: Missing required fields"
test_endpoint "Missing fields" "http://localhost:3001/api/auth/login" "400" "POST" \
    '{"email":"test@test.com"}'
echo ""

echo ""
echo "📁 PHASE 2: Logging System Tests"
echo "================================"
echo ""

# Check if logs directory exists
if [ -d "logs" ]; then
    echo -e "${GREEN}✅ Logs directory exists${NC}"
    PASSED=$((PASSED + 1))
    
    # Check for log files
    log_files=$(ls logs/*.log 2>/dev/null | wc -l)
    if [ "$log_files" -gt 0 ]; then
        echo -e "${GREEN}✅ Log files created: $log_files file(s)${NC}"
        PASSED=$((PASSED + 1))
        
        echo ""
        echo "Recent log entries:"
        tail -5 logs/*.log 2>/dev/null | head -20
    else
        echo -e "${YELLOW}⚠️  No log files created yet${NC}"
        FAILED=$((FAILED + 1))
    fi
else
    echo -e "${YELLOW}⚠️  Logs directory not created yet${NC}"
    echo "   This is expected if server was just started"
    FAILED=$((FAILED + 1))
fi

echo ""
echo "📊 PHASE 3: Server Health Check"
echo "================================"
echo ""

# Check if server is running
if lsof -ti:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is running on port 3001${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌ Server is NOT running on port 3001${NC}"
    FAILED=$((FAILED + 1))
fi

# Check database
if [ -f "cortexbuild.db" ]; then
    db_size=$(du -h cortexbuild.db | cut -f1)
    echo -e "${GREEN}✅ Database exists (Size: $db_size)${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌ Database not found${NC}"
    FAILED=$((FAILED + 1))
fi

echo ""
echo "========================================"
echo "📊 TEST RESULTS SUMMARY"
echo "========================================"
echo ""
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo -e "Total:  $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed${NC}"
    exit 1
fi
