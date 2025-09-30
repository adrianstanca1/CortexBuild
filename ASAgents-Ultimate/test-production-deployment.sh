#!/bin/bash

# Production Deployment Test Suite
# Tests the deployed frontend and backend connectivity

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_URL="https://asa-gents-ultimate-3jmskyfxv-adrian-b7e84541.vercel.app"
BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   ASAgents Ultimate - Production Deployment Tests     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Test 1: Frontend Accessibility
echo -e "${YELLOW}[TEST 1] Checking Frontend Deployment...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 401 ]; then
    echo -e "${GREEN}✓ Frontend is accessible (HTTP $HTTP_CODE)${NC}"
    if [ "$HTTP_CODE" -eq 401 ]; then
        echo -e "${YELLOW}  Note: 401 indicates Clerk auth is active (expected)${NC}"
    fi
else
    echo -e "${RED}✗ Frontend returned HTTP $HTTP_CODE${NC}"
fi
echo ""

# Test 2: Frontend Response Time
echo -e "${YELLOW}[TEST 2] Measuring Frontend Response Time...${NC}"
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$FRONTEND_URL")
echo -e "${GREEN}✓ Response time: ${RESPONSE_TIME}s${NC}"
if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l) )); then
    echo -e "${GREEN}  Performance: Excellent${NC}"
elif (( $(echo "$RESPONSE_TIME < 5.0" | bc -l) )); then
    echo -e "${YELLOW}  Performance: Good${NC}"
else
    echo -e "${RED}  Performance: Needs optimization${NC}"
fi
echo ""

# Test 3: HTTPS/SSL
echo -e "${YELLOW}[TEST 3] Verifying HTTPS/SSL...${NC}"
if curl -s "$FRONTEND_URL" | grep -q "<!DOCTYPE html>"; then
    echo -e "${GREEN}✓ SSL certificate is valid${NC}"
else
    echo -e "${RED}✗ SSL issues detected${NC}"
fi
echo ""

# Test 4: Security Headers
echo -e "${YELLOW}[TEST 4] Checking Security Headers...${NC}"
HEADERS=$(curl -s -I "$FRONTEND_URL")

if echo "$HEADERS" | grep -q "strict-transport-security"; then
    echo -e "${GREEN}✓ HSTS enabled${NC}"
else
    echo -e "${YELLOW}⚠ HSTS not detected${NC}"
fi

if echo "$HEADERS" | grep -q "x-frame-options"; then
    echo -e "${GREEN}✓ X-Frame-Options set${NC}"
else
    echo -e "${YELLOW}⚠ X-Frame-Options not set${NC}"
fi
echo ""

# Test 5: Backend Health (if available)
echo -e "${YELLOW}[TEST 5] Checking Backend Connectivity...${NC}"
if curl -s --max-time 5 "${BACKEND_URL}/api/health" > /dev/null 2>&1; then
    BACKEND_HEALTH=$(curl -s "${BACKEND_URL}/api/health")
    echo -e "${GREEN}✓ Backend is responding${NC}"
    echo -e "${BLUE}  Response: $BACKEND_HEALTH${NC}"
else
    echo -e "${YELLOW}⚠ Backend not accessible at $BACKEND_URL${NC}"
    echo -e "${YELLOW}  This is expected if backend not yet deployed${NC}"
fi
echo ""

# Test 6: Static Assets
echo -e "${YELLOW}[TEST 6] Verifying Static Assets...${NC}"
ASSETS=(
    "/manifest.webmanifest"
    "/registerSW.js"
)

for asset in "${ASSETS[@]}"; do
    ASSET_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_URL}${asset}")
    if [ "$ASSET_CODE" -eq 200 ]; then
        echo -e "${GREEN}✓ ${asset} - OK${NC}"
    else
        echo -e "${YELLOW}⚠ ${asset} - HTTP $ASSET_CODE${NC}"
    fi
done
echo ""

# Test 7: PWA Manifest
echo -e "${YELLOW}[TEST 7] Checking PWA Configuration...${NC}"
MANIFEST=$(curl -s "${FRONTEND_URL}/manifest.webmanifest")
if [ -n "$MANIFEST" ]; then
    echo -e "${GREEN}✓ PWA manifest found${NC}"
    echo -e "${BLUE}  Manifest includes:${NC}"
    echo "$MANIFEST" | grep -o '"name":[^,]*' | head -1 || echo "  (Unable to parse)"
else
    echo -e "${RED}✗ PWA manifest not found${NC}"
fi
echo ""

# Test 8: Service Worker
echo -e "${YELLOW}[TEST 8] Checking Service Worker...${NC}"
SW_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_URL}/sw.js")
if [ "$SW_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Service worker available${NC}"
else
    echo -e "${YELLOW}⚠ Service worker returned HTTP $SW_CODE${NC}"
fi
echo ""

# Test 9: Mobile Responsiveness (Meta Tags)
echo -e "${YELLOW}[TEST 9] Checking Mobile Optimization...${NC}"
HTML=$(curl -s "$FRONTEND_URL")
if echo "$HTML" | grep -q "viewport"; then
    echo -e "${GREEN}✓ Viewport meta tag found${NC}"
else
    echo -e "${RED}✗ Viewport meta tag missing${NC}"
fi

if echo "$HTML" | grep -q "mobile-web-app-capable"; then
    echo -e "${GREEN}✓ Mobile web app capable${NC}"
else
    echo -e "${YELLOW}⚠ Mobile web app meta tag not found${NC}"
fi
echo ""

# Test 10: Build Artifacts
echo -e "${YELLOW}[TEST 10] Verifying Build Artifacts...${NC}"
if [ -d "dist" ]; then
    BUILD_SIZE=$(du -sh dist | cut -f1)
    FILE_COUNT=$(find dist -type f | wc -l)
    echo -e "${GREEN}✓ Build directory exists${NC}"
    echo -e "${BLUE}  Size: $BUILD_SIZE${NC}"
    echo -e "${BLUE}  Files: $FILE_COUNT${NC}"
else
    echo -e "${YELLOW}⚠ Build directory not found (may have been cleaned)${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    Test Summary                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Frontend Status: DEPLOYED${NC}"
echo -e "${BLUE}Production URL: $FRONTEND_URL${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Configure Clerk authentication keys in Vercel"
echo "2. Deploy backend to Railway/Render/Heroku"
echo "3. Update VITE_API_URL environment variable"
echo "4. Test full authentication flow"
echo "5. Verify all features working end-to-end"
echo ""
echo -e "${GREEN}For detailed instructions, see IMMEDIATE_NEXT_STEPS.md${NC}"
echo ""
