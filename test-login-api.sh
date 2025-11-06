#!/bin/bash

# CortexBuild Login API Test Script
# This script tests the /api/auth/login endpoint

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_URL="${1:-https://cortex-build-mcnrk7yba-adrian-b7e84541.vercel.app}"
LOCAL_URL="${2:-http://localhost:3002}"
API_ENDPOINT="/api/auth/login"

# Test credentials
TEST_EMAIL="adrian.stanca1@gmail.com"
TEST_PASSWORD="password123"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}CortexBuild Login API Test${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to test endpoint
test_endpoint() {
    local url=$1
    local name=$2
    
    echo -e "${YELLOW}Testing: $name${NC}"
    echo -e "URL: ${BLUE}$url$API_ENDPOINT${NC}"
    echo ""
    
    # Test with curl
    response=$(curl -s -X POST "$url$API_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$TEST_EMAIL\",
            \"password\": \"$TEST_PASSWORD\"
        }")
    
    echo -e "Response:"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    echo ""
    
    # Check for success
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Login successful!${NC}"
        echo "$response" | jq '.token' 2>/dev/null || true
        return 0
    elif echo "$response" | grep -q '"error"'; then
        error=$(echo "$response" | jq -r '.error' 2>/dev/null || echo "Unknown error")
        echo -e "${RED}❌ Login failed: $error${NC}"
        return 1
    else
        echo -e "${RED}❌ Unexpected response${NC}"
        return 1
    fi
}

# Test CORS preflight
test_cors() {
    local url=$1
    local name=$2
    
    echo -e "${YELLOW}Testing CORS Preflight: $name${NC}"
    echo ""
    
    response=$(curl -s -X OPTIONS "$url$API_ENDPOINT" \
        -H "Origin: http://localhost:3000" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -v 2>&1)
    
    if echo "$response" | grep -q "Access-Control-Allow-Origin"; then
        echo -e "${GREEN}✅ CORS headers present${NC}"
        return 0
    else
        echo -e "${RED}❌ CORS headers missing${NC}"
        return 1
    fi
}

# Main tests
echo -e "${BLUE}1. Testing CORS Configuration${NC}"
echo "=================================="
test_cors "$FRONTEND_URL" "Production (Vercel)" || true
echo ""

echo -e "${BLUE}2. Testing Login Endpoint${NC}"
echo "=================================="
test_endpoint "$FRONTEND_URL" "Production (Vercel)" || true
echo ""

echo -e "${BLUE}3. Testing Local Development${NC}"
echo "=================================="
if curl -s "$LOCAL_URL" > /dev/null 2>&1; then
    test_endpoint "$LOCAL_URL" "Local Development" || true
else
    echo -e "${YELLOW}⚠️  Local server not running${NC}"
fi
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test Complete${NC}"
echo -e "${BLUE}========================================${NC}"

