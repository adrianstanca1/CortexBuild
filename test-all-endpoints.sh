#!/bin/bash

echo "🧪 CortexBuild API Comprehensive Test Suite"
echo "=========================================="
echo ""

BASE_URL="http://localhost:3001"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TOTAL=0
PASSED=0
FAILED=0

test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local auth_header=$4
    local data=$5
    
    TOTAL=$((TOTAL + 1))
    
    if [ -n "$data" ]; then
        response=$(curl -s -X "$method" "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            $auth_header \
            -d "$data")
    else
        response=$(curl -s -X "$method" "$BASE_URL$endpoint" $auth_header)
    fi
    
    http_code=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$BASE_URL$endpoint" $auth_header ${data:+-d "$data"})
    
    if [[ $http_code -ge 200 && $http_code -lt 400 ]]; then
        echo -e "${GREEN}✓${NC} $description (HTTP $http_code)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗${NC} $description (HTTP $http_code)"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# 1. Health Check
echo "1️⃣  Health & System Endpoints"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "GET" "/api/health" "Health check"
echo ""

# 2. Authentication
echo "2️⃣  Authentication Endpoints"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "POST" "/api/auth/login" "Login endpoint" "" '{"email":"adrian.stanca1@gmail.com","password":"parola123"}'

# Get auth token for subsequent tests
TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"adrian.stanca1@gmail.com","password":"parola123"}' | jq -r '.token')

AUTH_HEADER="-H \"Authorization: Bearer $TOKEN\""

test_endpoint "POST" "/api/auth/refresh" "Token refresh" "$AUTH_HEADER"
test_endpoint "GET" "/api/auth/me" "Get current user" "$AUTH_HEADER"
echo ""

# 3. Core Business Endpoints
echo "3️⃣  Core Business Endpoints"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "GET" "/api/clients" "List clients" "$AUTH_HEADER"
test_endpoint "GET" "/api/projects" "List projects" "$AUTH_HEADER"
test_endpoint "GET" "/api/tasks" "List tasks" "$AUTH_HEADER"
test_endpoint "GET" "/api/rfis" "List RFIs" "$AUTH_HEADER"
test_endpoint "GET" "/api/invoices" "List invoices" "$AUTH_HEADER"
test_endpoint "GET" "/api/time-entries" "List time entries" "$AUTH_HEADER"
test_endpoint "GET" "/api/subcontractors" "List subcontractors" "$AUTH_HEADER"
test_endpoint "GET" "/api/purchase-orders" "List purchase orders" "$AUTH_HEADER"
test_endpoint "GET" "/api/milestones" "List milestones" "$AUTH_HEADER"
test_endpoint "GET" "/api/documents" "List documents" "$AUTH_HEADER"
echo ""

# 4. AI & Automation
echo "4️⃣  AI & Automation Endpoints"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "GET" "/api/ai/usage" "AI usage stats" "$AUTH_HEADER"
test_endpoint "GET" "/api/agents" "List AI agents" "$AUTH_HEADER"
test_endpoint "GET" "/api/workflows" "List workflows" "$AUTH_HEADER"
test_endpoint "GET" "/api/automations" "List automations" "$AUTH_HEADER"
test_endpoint "GET" "/api/smart-tools" "List smart tools" "$AUTH_HEADER"
echo ""

# 5. Developer Platform
echo "5️⃣  Developer Platform Endpoints"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "GET" "/api/sdk/modules" "SDK modules" "$AUTH_HEADER"
test_endpoint "GET" "/api/sdk/workflows" "SDK workflows" "$AUTH_HEADER"
test_endpoint "GET" "/api/developer/dashboard/summary" "Developer dashboard" "$AUTH_HEADER"
test_endpoint "GET" "/api/marketplace" "Marketplace" "$AUTH_HEADER"
test_endpoint "GET" "/api/integrations" "Integrations" "$AUTH_HEADER"
echo ""

# 6. Admin Endpoints
echo "6️⃣  Admin Endpoints"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "GET" "/api/admin/users" "Admin users list" "$AUTH_HEADER"
test_endpoint "GET" "/api/admin/companies" "Admin companies list" "$AUTH_HEADER"
test_endpoint "GET" "/api/admin/sdk/stats" "Admin SDK stats" "$AUTH_HEADER"
test_endpoint "GET" "/api/admin/enhanced/analytics" "Enhanced analytics" "$AUTH_HEADER"
echo ""

# 7. Module System
echo "7️⃣  Module System Endpoints"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "GET" "/api/modules" "List modules" "$AUTH_HEADER"
test_endpoint "GET" "/api/modules/categories" "Module categories" "$AUTH_HEADER"
test_endpoint "GET" "/api/modules/installed" "Installed modules" "$AUTH_HEADER"
echo ""

# 8. Subscription & Billing
echo "8️⃣  Subscription & Billing"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "GET" "/api/subscriptions/plans" "Subscription plans" "$AUTH_HEADER"
test_endpoint "GET" "/api/subscriptions/current" "Current subscription" "$AUTH_HEADER"
echo ""

# 9. Widgets & UI
echo "9️⃣  Widgets & UI Endpoints"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "GET" "/api/widgets" "List widgets" "$AUTH_HEADER"
echo ""

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Total Tests:  $TOTAL"
echo -e "${GREEN}Passed:${NC}       $PASSED"
echo -e "${RED}Failed:${NC}       $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
