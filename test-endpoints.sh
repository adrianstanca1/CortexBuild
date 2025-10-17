#!/bin/bash

echo "🧪 Testing CortexBuild API Endpoints..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3001/api"

# Test health endpoint
echo -e "${YELLOW}Testing health endpoint...${NC}"
HEALTH=$(curl -s "$BASE_URL/health")
if [ ! -z "$HEALTH" ]; then
    echo -e "${GREEN}✓ Health endpoint working${NC}"
else
    echo -e "${RED}✗ Health endpoint failed${NC}"
fi
echo ""

# Check if server is running
echo -e "${YELLOW}Checking if server is running...${NC}"
if curl -s "$BASE_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Server is running on port 3001${NC}"
else
    echo -e "${RED}✗ Server is not running. Please start it with: npm run server${NC}"
    exit 1
fi
echo ""

echo -e "${GREEN}✓ All preliminary checks passed!${NC}"
echo ""
echo "📝 To test authenticated endpoints, you need to:"
echo "   1. Start the server: npm run server"
echo "   2. Login and get a token"
echo "   3. Use the token in Authorization header"
