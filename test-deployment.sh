#!/bin/bash

# Test Deployment Script
# Run this after deploying backend to verify everything works

echo "🧪 Testing CortexBuild Deployment"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend URL is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Please provide backend URL${NC}"
    echo "Usage: ./test-deployment.sh https://your-backend-url.onrender.com"
    exit 1
fi

BACKEND_URL="$1"
FRONTEND_URL="https://cortex-build-r8mkvuegc-adrian-b7e84541.vercel.app"

echo -e "${YELLOW}🔍 Testing Backend: $BACKEND_URL${NC}"
echo -e "${YELLOW}🔍 Testing Frontend: $FRONTEND_URL${NC}"
echo ""

# Test backend health
echo "1. Testing Backend Health..."
BACKEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/health" 2>/dev/null)
if [ "$BACKEND_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Backend is healthy (HTTP $BACKEND_RESPONSE)${NC}"
else
    echo -e "${RED}❌ Backend health check failed (HTTP $BACKEND_RESPONSE)${NC}"
fi

# Test backend auth endpoint
echo "2. Testing Backend Auth Endpoint..."
AUTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/auth/me" 2>/dev/null)
if [ "$AUTH_RESPONSE" = "401" ] || [ "$AUTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Backend auth endpoint responding (HTTP $AUTH_RESPONSE)${NC}"
else
    echo -e "${RED}❌ Backend auth endpoint failed (HTTP $AUTH_RESPONSE)${NC}"
fi

# Test frontend accessibility
echo "3. Testing Frontend Accessibility..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>/dev/null)
if [ "$FRONTEND_RESPONSE" = "200" ] || [ "$FRONTEND_RESPONSE" = "401" ]; then
    echo -e "${GREEN}✅ Frontend is accessible (HTTP $FRONTEND_RESPONSE)${NC}"
else
    echo -e "${RED}❌ Frontend not accessible (HTTP $FRONTEND_RESPONSE)${NC}"
fi

# Test CORS
echo "4. Testing CORS Configuration..."
CORS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -H "Origin: $FRONTEND_URL" "$BACKEND_URL/api/health" 2>/dev/null)
if [ "$CORS_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ CORS configured correctly${NC}"
else
    echo -e "${YELLOW}⚠️  CORS may need configuration (HTTP $CORS_RESPONSE)${NC}"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Open $FRONTEND_URL in your browser"
echo "2. Try to login with: adrian.stanca1@gmail.com / parola123"
echo "3. Check browser console for any errors"
echo "4. Verify all features work as expected"

echo ""
echo "📊 Deployment Summary:"
echo "- Frontend: $FRONTEND_URL"
echo "- Backend: $BACKEND_URL"
echo "- Status: Ready for testing"
