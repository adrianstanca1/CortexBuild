#!/bin/bash

# ASAgents-Ultimate Vercel Deployment Script
# This script prepares and optionally deploys the application to Vercel

set -e

echo "🚀 ASAgents-Ultimate Vercel Deployment Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/Users/admin/Desktop/asagents-ultimate"
DEPLOYMENT_DIR="$PROJECT_DIR/deployment"
BUILD_DIR="$PROJECT_DIR/final/dist"

echo -e "${BLUE}📁 Project Directory: $PROJECT_DIR${NC}"
echo -e "${BLUE}📦 Deployment Directory: $DEPLOYMENT_DIR${NC}"
echo -e "${BLUE}🔨 Build Directory: $BUILD_DIR${NC}"
echo ""

# Check if deployment directory exists
if [ ! -d "$DEPLOYMENT_DIR" ]; then
    echo -e "${RED}❌ Deployment directory not found: $DEPLOYMENT_DIR${NC}"
    exit 1
fi

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${YELLOW}⚠️  Build directory not found. Building application...${NC}"
    cd "$PROJECT_DIR/final"
    npm run build
    echo -e "${GREEN}✅ Build completed${NC}"
fi

# Copy latest build to deployment directory
echo -e "${YELLOW}📋 Copying latest build to deployment directory...${NC}"
cp -r "$BUILD_DIR"/* "$DEPLOYMENT_DIR/"
echo -e "${GREEN}✅ Files copied successfully${NC}"

# Verify deployment files
echo -e "${YELLOW}🔍 Verifying deployment files...${NC}"
REQUIRED_FILES=("index.html" "vercel.json" "manifest.json")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$DEPLOYMENT_DIR/$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ Missing: $file${NC}"
    fi
done

# Check assets directory
if [ -d "$DEPLOYMENT_DIR/assets" ]; then
    ASSET_COUNT=$(ls -1 "$DEPLOYMENT_DIR/assets" | wc -l)
    echo -e "${GREEN}✅ assets/ directory ($ASSET_COUNT files)${NC}"
else
    echo -e "${RED}❌ Missing: assets/ directory${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment package ready!${NC}"
echo ""
echo -e "${BLUE}📊 Deployment Summary:${NC}"
echo -e "   Location: $DEPLOYMENT_DIR"
echo -e "   Size: $(du -sh "$DEPLOYMENT_DIR" | cut -f1)"
echo -e "   Files: $(find "$DEPLOYMENT_DIR" -type f | wc -l) files"
echo ""

# Deployment options
echo -e "${YELLOW}🚀 Deployment Options:${NC}"
echo ""
echo -e "${BLUE}Option 1: Vercel Web Interface (Recommended)${NC}"
echo "   1. Visit: https://vercel.com/new"
echo "   2. Drag folder: $DEPLOYMENT_DIR"
echo "   3. Deploy!"
echo ""
echo -e "${BLUE}Option 2: Create Deployment Package${NC}"
echo "   Run: cd $PROJECT_DIR && zip -r asagents-deployment.zip deployment/"
echo "   Upload the zip file to Vercel"
echo ""
echo -e "${BLUE}Option 3: Vercel CLI (if installed)${NC}"
echo "   Run: cd $DEPLOYMENT_DIR && vercel --prod"
echo ""

# Ask user what they want to do
echo -e "${YELLOW}What would you like to do?${NC}"
echo "1) Create deployment zip file"
echo "2) Open Vercel website"
echo "3) Show deployment folder in Finder"
echo "4) Exit"
echo ""
read -p "Choose an option (1-4): " choice

case $choice in
    1)
        echo -e "${YELLOW}📦 Creating deployment zip file...${NC}"
        cd "$PROJECT_DIR"
        zip -r "asagents-ultimate-deployment.zip" deployment/
        echo -e "${GREEN}✅ Created: $PROJECT_DIR/asagents-ultimate-deployment.zip${NC}"
        echo -e "${BLUE}💡 Upload this file to https://vercel.com/new${NC}"
        ;;
    2)
        echo -e "${BLUE}🌐 Opening Vercel website...${NC}"
        open "https://vercel.com/new"
        ;;
    3)
        echo -e "${BLUE}📁 Opening deployment folder...${NC}"
        open "$DEPLOYMENT_DIR"
        ;;
    4)
        echo -e "${GREEN}👋 Goodbye!${NC}"
        ;;
    *)
        echo -e "${RED}❌ Invalid option${NC}"
        ;;
esac

echo ""
echo -e "${GREEN}🎯 Next Steps:${NC}"
echo "1. Deploy using one of the options above"
echo "2. Test your live application"
echo "3. Share the URL with your team"
echo ""
echo -e "${BLUE}📚 For detailed instructions, see: $PROJECT_DIR/VERCEL_DEPLOYMENT.md${NC}"
echo ""
echo -e "${GREEN}🚀 Happy deploying!${NC}"
