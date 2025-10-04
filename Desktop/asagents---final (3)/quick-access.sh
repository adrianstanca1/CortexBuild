#!/bin/bash
# ASAgents Construction Platform - Production Quick Access
# Version: 2.4.0
# Last Updated: January 2, 2025

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   ASAgents Construction Management Platform - v2.4.0          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✅ Production Status: LIVE${NC}"
echo ""
echo "🌐 Production URL:"
echo "   https://asagents-final-hjkhvgxor-adrian-b7e84541.vercel.app"
echo ""
echo "🎛️  Vercel Dashboard:"
echo "   https://vercel.com/adrian-b7e84541/asagents-final"
echo ""
echo "────────────────────────────────────────────────────────────────"
echo ""
echo "Available Commands:"
echo ""
echo -e "${BLUE}1.${NC} npm run dev          - Start development server"
echo -e "${BLUE}2.${NC} npm run build        - Build for production"
echo -e "${BLUE}3.${NC} npm run preview      - Preview production build"
echo -e "${BLUE}4.${NC} vercel --prod        - Deploy to production"
echo -e "${BLUE}5.${NC} vercel logs          - View deployment logs"
echo -e "${BLUE}6.${NC} vercel logs --follow - Monitor real-time logs"
echo -e "${BLUE}7.${NC} vercel ls --prod     - List production deployments"
echo -e "${BLUE}8.${NC} vercel rollback      - Rollback to previous version"
echo ""
echo "────────────────────────────────────────────────────────────────"
echo ""
echo "Quick Actions:"
echo ""

# Function definitions
open_production() {
    echo -e "${YELLOW}Opening production site...${NC}"
    open "https://asagents-final-hjkhvgxor-adrian-b7e84541.vercel.app"
}

open_dashboard() {
    echo -e "${YELLOW}Opening Vercel dashboard...${NC}"
    open "https://vercel.com/adrian-b7e84541/asagents-final"
}

view_logs() {
    echo -e "${YELLOW}Fetching recent logs...${NC}"
    vercel logs
}

check_status() {
    echo -e "${YELLOW}Checking deployment status...${NC}"
    vercel ls --prod | head -5
}

# Menu
echo "Select an action:"
echo "  [1] Open Production Site"
echo "  [2] Open Vercel Dashboard"
echo "  [3] View Recent Logs"
echo "  [4] Check Deployment Status"
echo "  [5] Deploy New Version"
echo "  [6] Exit"
echo ""
read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        open_production
        ;;
    2)
        open_dashboard
        ;;
    3)
        view_logs
        ;;
    4)
        check_status
        ;;
    5)
        echo -e "${YELLOW}Building and deploying...${NC}"
        npm run build && vercel --prod
        ;;
    6)
        echo -e "${GREEN}Goodbye!${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac
