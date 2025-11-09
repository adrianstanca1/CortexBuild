#!/bin/bash

echo "🧪 CortexBuild Backend Functionality Check"
echo "=========================================="
echo ""

BASE_URL="http://localhost:3001"

# Get auth token
echo "🔐 Authenticating..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"adrian.stanca1@gmail.com","password":"parola123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
USER_NAME=$(echo $LOGIN_RESPONSE | jq -r '.user.name')
USER_ROLE=$(echo $LOGIN_RESPONSE | jq -r '.user.role')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    echo "✅ Logged in as: $USER_NAME ($USER_ROLE)"
else
    echo "❌ Login failed"
    exit 1
fi

echo ""
echo "📊 Testing Core Endpoints..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Function to test endpoint
test_api() {
    local name=$1
    local endpoint=$2
    local method=${3:-GET}
    
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [[ $http_code == 200 || $http_code == 201 ]]; then
        # Try to parse as JSON and get count
        if echo "$body" | jq -e 'type' &>/dev/null; then
            if echo "$body" | jq -e 'type == "array"' &>/dev/null; then
                count=$(echo "$body" | jq 'length')
                echo "✅ $name: $count items"
            elif echo "$body" | jq -e 'type == "object"' &>/dev/null; then
                echo "✅ $name: OK"
            else
                echo "✅ $name"
            fi
        else
            echo "✅ $name"
        fi
    else
        echo "❌ $name (HTTP $http_code)"
    fi
}

# Test all endpoints
test_api "Health Check" "/api/health" "GET"
test_api "Projects" "/api/projects"
test_api "Tasks" "/api/tasks"
test_api "Clients" "/api/clients"
test_api "RFIs" "/api/rfis"
test_api "Invoices" "/api/invoices"
test_api "Time Entries" "/api/time-entries"
test_api "Subcontractors" "/api/subcontractors"
test_api "Purchase Orders" "/api/purchase-orders"
test_api "Milestones" "/api/milestones"
test_api "Documents" "/api/documents"
test_api "Modules" "/api/modules"

echo ""
echo "🤖 Testing AI & Developer Features..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_api "AI Usage" "/api/ai/usage"
test_api "AI Agents" "/api/agents"
test_api "Workflows" "/api/workflows"
test_api "Automations" "/api/automations"
test_api "Smart Tools" "/api/smart-tools"
test_api "SDK Modules" "/api/sdk/modules"
test_api "SDK Workflows" "/api/sdk/workflows"
test_api "Developer Dashboard" "/api/developer/dashboard/summary"
test_api "Marketplace" "/api/marketplace"
test_api "Integrations" "/api/integrations"

echo ""
echo "👑 Testing Admin Features..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_api "Admin Users" "/api/admin/users"
test_api "Admin Companies" "/api/admin/companies"
test_api "Admin SDK Stats" "/api/admin/sdk/stats"
test_api "Enhanced Analytics" "/api/admin/enhanced/analytics"

echo ""
echo "💰 Testing Subscription & Widgets..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_api "Subscription Plans" "/api/subscriptions/plans"
test_api "Current Subscription" "/api/subscriptions/current"
test_api "Widgets" "/api/widgets"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Backend functionality check complete!"
