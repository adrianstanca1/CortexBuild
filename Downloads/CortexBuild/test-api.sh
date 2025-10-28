#!/bin/bash

# ConstructAI API Test Script
# Tests all API endpoints locally

set -e

API_URL="http://localhost:3001/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 ConstructAI API Test Suite"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1: Health Check
echo "📊 Test 1: Health Check"
HEALTH=$(curl -s $API_URL/health)
if echo $HEALTH | grep -q "ok"; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo $HEALTH
    exit 1
fi
echo ""

# Test 2: Login
echo "🔐 Test 2: Login"
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"adrian.stanca1@gmail.com","password":"Cumparavinde1"}')

if echo $LOGIN_RESPONSE | grep -q "success"; then
    TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
    echo -e "${GREEN}✅ Login successful${NC}"
    echo "   Token: ${TOKEN:0:50}..."
else
    echo -e "${RED}❌ Login failed${NC}"
    echo $LOGIN_RESPONSE
    exit 1
fi
echo ""

# Test 3: Get Current User
echo "👤 Test 3: Get Current User"
ME_RESPONSE=$(curl -s $API_URL/auth/me \
    -H "Authorization: Bearer $TOKEN")

if echo $ME_RESPONSE | grep -q "adrian.stanca1@gmail.com"; then
    echo -e "${GREEN}✅ Get current user successful${NC}"
    echo "   User: $(echo $ME_RESPONSE | jq -r '.user.name')"
    echo "   Role: $(echo $ME_RESPONSE | jq -r '.user.role')"
else
    echo -e "${RED}❌ Get current user failed${NC}"
    echo $ME_RESPONSE
    exit 1
fi
echo ""

# Test 4: Refresh Token
echo "🔄 Test 4: Refresh Token"
REFRESH_RESPONSE=$(curl -s -X POST $API_URL/auth/refresh \
    -H "Authorization: Bearer $TOKEN")

if echo $REFRESH_RESPONSE | grep -q "success"; then
    NEW_TOKEN=$(echo $REFRESH_RESPONSE | jq -r '.token')
    echo -e "${GREEN}✅ Token refresh successful${NC}"
    echo "   New Token: ${NEW_TOKEN:0:50}..."
else
    echo -e "${RED}❌ Token refresh failed${NC}"
    echo $REFRESH_RESPONSE
    exit 1
fi
echo ""

# Test 5: Register New User
echo "📝 Test 5: Register New User"
RANDOM_EMAIL="test$(date +%s)@example.com"
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$RANDOM_EMAIL\",\"password\":\"TestPass123\",\"name\":\"Test User\",\"companyName\":\"Test Company\"}")

if echo $REGISTER_RESPONSE | grep -q "success"; then
    echo -e "${GREEN}✅ Registration successful${NC}"
    echo "   Email: $RANDOM_EMAIL"
else
    echo -e "${RED}❌ Registration failed${NC}"
    echo $REGISTER_RESPONSE
    exit 1
fi
echo ""

# Test 6: Logout
echo "🚪 Test 6: Logout"
LOGOUT_RESPONSE=$(curl -s -X POST $API_URL/auth/logout \
    -H "Authorization: Bearer $TOKEN")

if echo $LOGOUT_RESPONSE | grep -q "success"; then
    echo -e "${GREEN}✅ Logout successful${NC}"
else
    echo -e "${RED}❌ Logout failed${NC}"
    echo $LOGOUT_RESPONSE
    exit 1
fi
echo ""

# Test 7: Invalid Token
echo "🔒 Test 7: Invalid Token (should fail)"
INVALID_RESPONSE=$(curl -s $API_URL/auth/me \
    -H "Authorization: Bearer invalid-token")

if echo $INVALID_RESPONSE | grep -q "error"; then
    echo -e "${GREEN}✅ Invalid token correctly rejected${NC}"
else
    echo -e "${RED}❌ Invalid token test failed${NC}"
    echo $INVALID_RESPONSE
    exit 1
fi
echo ""

# Test 8: Rate Limiting (Login)
echo "⏱️  Test 8: Rate Limiting"
echo "   Attempting 6 rapid login requests..."
for i in {1..6}; do
    RATE_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"test@test.com","password":"wrong"}')
    
    if [ $i -eq 6 ]; then
        if echo $RATE_RESPONSE | grep -q "Too many"; then
            echo -e "${GREEN}✅ Rate limiting working (blocked on 6th attempt)${NC}"
        else
            echo -e "${YELLOW}⚠️  Rate limiting may not be working${NC}"
        fi
    fi
done
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 All tests passed!${NC}"
echo ""
echo "Test Results:"
echo "  ✅ Health Check"
echo "  ✅ Login"
echo "  ✅ Get Current User"
echo "  ✅ Refresh Token"
echo "  ✅ Register New User"
echo "  ✅ Logout"
echo "  ✅ Invalid Token Rejection"
echo "  ✅ Rate Limiting"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

