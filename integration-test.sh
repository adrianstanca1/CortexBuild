#!/bin/bash

# CortexBuild Integration Test Suite
# Tests all critical API endpoints and features

set -e  # Exit on error

BASE_URL="http://localhost:3001"
TOKEN=""
USER_ID=""
PROJECT_ID=""
PASS_COUNT=0
FAIL_COUNT=0

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 CortexBuild Integration Test Suite"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test helper function
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_status=$5
    
    echo -n "Testing: $name... "
    
    if [ "$method" == "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    status_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" == "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (Status: $status_code)"
        ((PASS_COUNT++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $status_code)"
        echo "Response: $body"
        ((FAIL_COUNT++))
        return 1
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  Authentication Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1: Health Check
echo -n "Testing: Health check... "
health_response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/health")
health_status=$(echo "$health_response" | tail -n 1)
if [ "$health_status" == "200" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASS_COUNT++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((FAIL_COUNT++))
fi

# Test 2: Login
echo -n "Testing: User login... "
login_response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "adrian.stanca1@gmail.com",
        "password": "parola123"
    }')

login_status=$(echo "$login_response" | tail -n 1)
login_body=$(echo "$login_response" | sed '$d')

if [ "$login_status" == "200" ]; then
    TOKEN=$(echo "$login_body" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    USER_ID=$(echo "$login_body" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    echo -e "${GREEN}✓ PASS${NC}"
    echo "   → Token obtained: ${TOKEN:0:20}..."
    ((PASS_COUNT++))
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "Response: $login_body"
    ((FAIL_COUNT++))
    exit 1
fi

# Test 3: Get current user
test_endpoint "Get current user" "GET" "/api/auth/me" "" "200"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  Project Management Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 4: List projects
test_endpoint "List projects" "GET" "/api/projects" "" "200"

# Test 5: Create project
echo -n "Testing: Create project... "

# Get companyId from current user
user_info=$(curl -s -X GET "$BASE_URL/api/auth/me" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")
COMPANY_ID=$(echo "$user_info" | grep -o '"company_id":"[^"]*' | cut -d'"' -f4)

create_project=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/projects" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"company_id\": \"$COMPANY_ID\",
        \"name\": \"Integration Test Project\",
        \"description\": \"Automated integration test\",
        \"budget\": 100000,
        \"start_date\": \"2025-01-01\",
        \"end_date\": \"2025-12-31\"
    }")

project_status=$(echo "$create_project" | tail -n 1)
project_body=$(echo "$create_project" | sed '$d')

if [ "$project_status" == "201" ]; then
    PROJECT_ID=$(echo "$project_body" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    echo -e "${GREEN}✓ PASS${NC}"
    echo "   → Project ID: $PROJECT_ID"
    ((PASS_COUNT++))
else
    echo -e "${RED}✗ FAIL${NC}"
    echo "Response: $project_body"
    ((FAIL_COUNT++))
fi

# Test 6: Get project details
if [ -n "$PROJECT_ID" ]; then
    test_endpoint "Get project details" "GET" "/api/projects/$PROJECT_ID" "" "200"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  Task Management Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 7: List tasks
test_endpoint "List tasks" "GET" "/api/tasks" "" "200"

# Test 8: Create task
if [ -n "$PROJECT_ID" ]; then
    test_endpoint "Create task" "POST" "/api/tasks" \
        "{\"project_id\": $PROJECT_ID, \"title\": \"Test Task\", \"description\": \"Integration test task\", \"priority\": \"High\"}" \
        "201"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  Client Management Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 9: List clients
test_endpoint "List clients" "GET" "/api/clients" "" "200"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  RFI Management Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 10: List RFIs
test_endpoint "List RFIs" "GET" "/api/rfis" "" "200"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  Invoice Management Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 11: List invoices
test_endpoint "List invoices" "GET" "/api/invoices" "" "200"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7️⃣  SDK Developer Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 12: Developer dashboard
test_endpoint "Developer dashboard" "GET" "/api/developer/dashboard/summary" "" "200"

# Test 13: List workflows
test_endpoint "List workflows" "GET" "/api/workflows" "" "200"

# Test 14: List agents
test_endpoint "List agents" "GET" "/api/agents/marketplace" "" "200"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8️⃣  AI Features Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 15: AI usage stats
test_endpoint "AI usage statistics" "GET" "/api/ai/usage" "" "200"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "9️⃣  Marketplace Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 16: List marketplace modules
test_endpoint "List marketplace modules" "GET" "/api/marketplace/modules" "" "200"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔟 Subscription Management Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 17: Get subscription status (Optional - endpoint not yet implemented)
# test_endpoint "Get subscription status" "GET" "/api/subscriptions/status" "" "200"
echo "Testing: Get subscription status... ⊘ SKIPPED (endpoint not implemented)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TOTAL_TESTS=$((PASS_COUNT + FAIL_COUNT))
SUCCESS_RATE=$((PASS_COUNT * 100 / TOTAL_TESTS))

echo "Total Tests:    $TOTAL_TESTS"
echo -e "Passed:         ${GREEN}$PASS_COUNT${NC}"
echo -e "Failed:         ${RED}$FAIL_COUNT${NC}"
echo "Success Rate:   $SUCCESS_RATE%"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ All integration tests passed!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}✗ Some tests failed. Please review errors above.${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 1
fi
