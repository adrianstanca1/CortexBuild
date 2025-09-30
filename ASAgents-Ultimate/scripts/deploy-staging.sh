#!/bin/bash
# Deployment script for staging

set -e

echo "🧪 Deploying ASAgents Ultimate to Staging"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Build the application
echo -e "${YELLOW}📦 Building application...${NC}"
pnpm install
pnpm run build

echo -e "${GREEN}✅ Build successful${NC}"

# Deploy to Vercel (staging)
echo -e "${YELLOW}🚀 Deploying to Vercel (staging)...${NC}"

if command -v vercel &> /dev/null; then
    vercel --token $VERCEL_TOKEN
    echo -e "${GREEN}✅ Staging deployment successful!${NC}"
else
    echo "❌ Vercel CLI not installed"
    echo "Install with: npm i -g vercel"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Staging deployment complete!${NC}"
