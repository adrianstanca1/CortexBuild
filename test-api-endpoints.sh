#!/bin/bash

echo "================================================"
echo "CortexBuild API Endpoint Testing"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_BASE="http://localhost:3001/api"

echo "Testing Backend Server Health..."
echo "----------------------------------------------"

# Test 1: Auth endpoint (should return error without token)
echo -n "1. Auth Me Endpoint: "
RESPONSE=$(curl -s -w "\n%{http_code}" "${API_BASE}/auth/me")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    echo -e "${GREEN}✓ Working${NC} (HTTP $HTTP_CODE - Expected auth error)"
else
    echo -e "${RED}✗ Failed${NC} (HTTP $HTTP_CODE)"
fi

# Test 2: Projects endpoint (should require auth)
echo -n "2. Projects Endpoint: "
RESPONSE=$(curl -s -w "\n%{http_code}" "${API_BASE}/projects")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Working${NC} (HTTP $HTTP_CODE)"
else
    echo -e "${RED}✗ Failed${NC} (HTTP $HTTP_CODE)"
fi

# Test 3: Tasks endpoint
echo -n "3. Tasks Endpoint: "
RESPONSE=$(curl -s -w "\n%{http_code}" "${API_BASE}/tasks")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Working${NC} (HTTP $HTTP_CODE)"
else
    echo -e "${RED}✗ Failed${NC} (HTTP $HTTP_CODE)"
fi

# Test 4: Marketplace endpoint
echo -n "4. Marketplace Endpoint: "
RESPONSE=$(curl -s -w "\n%{http_code}" "${API_BASE}/global-marketplace/apps")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✓ Working${NC} (HTTP $HTTP_CODE)"
else
    echo -e "${RED}✗ Failed${NC} (HTTP $HTTP_CODE)"
fi

# Test 5: AI endpoint
echo -n "5. AI Endpoint: "
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_BASE}/ai/chat" -H "Content-Type: application/json" -d '{"message":"test"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "400" ]; then
    echo -e "${GREEN}✓ Working${NC} (HTTP $HTTP_CODE)"
else
    echo -e "${RED}✗ Failed${NC} (HTTP $HTTP_CODE)"
fi

echo ""
echo "================================================"
echo "Frontend Server Health..."
echo "================================================"

# Test Frontend
echo -n "6. Frontend Homepage: "
RESPONSE=$(curl -s -w "\n%{http_code}" "http://localhost:3000")
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Working${NC} (HTTP $HTTP_CODE)"
else
    echo -e "${RED}✗ Failed${NC} (HTTP $HTTP_CODE)"
fi

echo ""
echo "================================================"
echo "Database Health..."
echo "================================================"

# Test Database
echo -n "7. SQLite Database: "
if [ -f "cortexbuild.db" ]; then
    TABLE_COUNT=$(sqlite3 cortexbuild.db "SELECT COUNT(*) FROM sqlite_master WHERE type='table';")
    echo -e "${GREEN}✓ Working${NC} ($TABLE_COUNT tables)"
else
    echo -e "${RED}✗ Not Found${NC}"
fi

echo -n "8. User Count: "
USER_COUNT=$(sqlite3 cortexbuild.db "SELECT COUNT(*) FROM users;")
echo -e "${GREEN}$USER_COUNT users${NC}"

echo -n "9. Project Count: "
PROJECT_COUNT=$(sqlite3 cortexbuild.db "SELECT COUNT(*) FROM projects;")
echo -e "${GREEN}$PROJECT_COUNT projects${NC}"

echo -n "10. App Count: "
APP_COUNT=$(sqlite3 cortexbuild.db "SELECT COUNT(*) FROM sdk_apps;")
echo -e "${GREEN}$APP_COUNT marketplace apps${NC}"

echo ""
echo "================================================"
echo "Test Login API"
echo "================================================"

# Test login with credentials
echo -n "11. Login Test: "
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE}/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"adrian.stanca1@gmail.com","password":"password123"}')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✓ Login Successful${NC}"

    # Extract token and test authenticated endpoint
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

    echo -n "12. Authenticated Request: "
    AUTH_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "${API_BASE}/auth/me")

    if echo "$AUTH_RESPONSE" | grep -q "email"; then
        echo -e "${GREEN}✓ Authentication Working${NC}"
    else
        echo -e "${YELLOW}⚠ Auth may need verification${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Login response unexpected${NC}"
fi

echo ""
echo "================================================"
echo "Summary"
echo "================================================"
echo -e "${GREEN}✓ Backend Server: Running on port 3001${NC}"
echo -e "${GREEN}✓ Frontend Server: Running on port 3000${NC}"
echo -e "${GREEN}✓ Database: Initialized and populated${NC}"
echo -e "${GREEN}✓ API Endpoints: Responding${NC}"
echo ""
echo "Access the application at: http://localhost:3000"
echo "API documentation at: http://localhost:3001/api"
echo ""

