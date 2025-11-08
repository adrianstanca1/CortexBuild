#!/bin/bash

# 🎮 CortexBuild Fun Debug Commands
# Collection of entertaining debug utilities

# Colors and emojis for fun output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Fun banner
show_banner() {
    echo -e "${CYAN}"
    echo "  ╔═══════════════════════════════════════╗"
    echo "  ║        🎮 CortexBuild Debug Fun       ║"
    echo "  ║     Where debugging meets party! 🎉   ║"
    echo "  ╚═══════════════════════════════════════╝"
    echo -e "${NC}"
}

# Server status check with fun output
check_servers() {
    echo -e "${YELLOW}🔍 Checking server status...${NC}"
    
    # Check API server
    if curl -s http://localhost:3001/api/health > /dev/null; then
        echo -e "${GREEN}✅ API Server (3001): ${WHITE}ONLINE AND HAPPY! 🎉${NC}"
    else
        echo -e "${RED}❌ API Server (3001): ${WHITE}OFFLINE OR SHY 😴${NC}"
    fi
    
    # Check development server
    if curl -s http://localhost:3005 > /dev/null; then
        echo -e "${GREEN}✅ Dev Server (3005): ${WHITE}READY TO ROCK! 🚀${NC}"
    else
        echo -e "${RED}❌ Dev Server (3005): ${WHITE}TAKING A NAP 💤${NC}"
    fi
    
    # Check production preview
    if curl -s http://localhost:4173 > /dev/null; then
        echo -e "${GREEN}✅ Preview Server (4173): ${WHITE}PRODUCTION READY! 💎${NC}"
    else
        echo -e "${RED}❌ Preview Server (4173): ${WHITE}NOT STARTED YET 🛠️${NC}"
    fi
}

# Fun login test
test_login() {
    echo -e "${CYAN}🔐 Testing login with demo credentials...${NC}"
    
    RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email": "demo@cortexbuild.com", "password": "demo-password"}')
    
    if echo "$RESPONSE" | grep -q '"success":true'; then
        echo -e "${GREEN}🎉 LOGIN SUCCESS! Welcome to the party! 🥳${NC}"
        TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        echo -e "${BLUE}🎫 Token received: ${TOKEN:0:50}...${NC}"
        
        # Test dashboard access
        echo -e "${YELLOW}📊 Testing dashboard access...${NC}"
        DASHBOARD=$(curl -s -H "Authorization: Bearer $TOKEN" \
            "http://localhost:3001/api/dashboard/stats")
        
        if echo "$DASHBOARD" | grep -q '"success":true'; then
            PROJECTS=$(echo "$DASHBOARD" | grep -o '"totalProjects":[0-9]*' | cut -d':' -f2)
            TASKS=$(echo "$DASHBOARD" | grep -o '"totalTasks":[0-9]*' | cut -d':' -f2)
            echo -e "${GREEN}🎯 Dashboard loaded! ${WHITE}$PROJECTS projects, $TASKS tasks${NC}"
        else
            echo -e "${RED}💥 Dashboard access failed!${NC}"
        fi
    else
        echo -e "${RED}💀 LOGIN FAILED! Check your credentials!${NC}"
    fi
}

# Stress test with fun output
stress_test() {
    echo -e "${PURPLE}💪 Starting stress test... Hold onto your hard hats! 🏗️${NC}"
    
    START_TIME=$(date +%s%N)
    
    # Run 10 parallel requests
    for i in {1..10}; do
        curl -s http://localhost:3001/api/health > /dev/null &
    done
    
    wait # Wait for all background jobs to complete
    
    END_TIME=$(date +%s%N)
    DURATION=$(( (END_TIME - START_TIME) / 1000000 )) # Convert to milliseconds
    
    echo -e "${GREEN}🏆 Stress test completed in ${WHITE}${DURATION}ms${GREEN}!${NC}"
    echo -e "${CYAN}💎 Your server is stronger than a construction crane! 🏗️${NC}"
}

# Fun endpoint explorer
explore_endpoints() {
    echo -e "${YELLOW}🗺️ Exploring API endpoints...${NC}"
    
    ENDPOINTS=(
        "GET /api/health 🏥"
        "POST /api/auth/login 🔐"
        "GET /api/dashboard/stats 📊"
        "GET /api/dashboard/projects 🏗️"
        "GET /api/dashboard/tasks 📋"
        "GET /api/user/profile 👤"
    )
    
    for endpoint in "${ENDPOINTS[@]}"; do
        echo -e "${BLUE}  🎯 $endpoint${NC}"
    done
    
    echo -e "${GREEN}✨ All endpoints are ready for your commands!${NC}"
}

# System info with fun facts
show_system_info() {
    echo -e "${CYAN}🖥️ System Information (Fun Edition):${NC}"
    echo -e "${WHITE}OS: ${NC}$(uname -s) $(uname -r)"
    echo -e "${WHITE}Node.js: ${NC}$(node --version 2>/dev/null || echo 'Not installed')"
    echo -e "${WHITE}npm: ${NC}$(npm --version 2>/dev/null || echo 'Not installed')"
    echo -e "${WHITE}Current Directory: ${NC}$(pwd)"
    echo -e "${WHITE}Disk Space: ${NC}$(df -h . | tail -1 | awk '{print $4}') available"
    echo -e "${WHITE}Memory: ${NC}$(free -h 2>/dev/null | grep Mem | awk '{print $7}' || echo 'Unknown') available"
    echo -e "${GREEN}🎮 Fun Level: ${WHITE}MAXIMUM! 🔥${NC}"
}

# Generate random construction facts
random_fun_fact() {
    FACTS=(
        "🏗️ The tallest building in the world is the Burj Khalifa at 828 meters!"
        "🔨 A construction worker's hard hat was invented in 1919!"
        "🏠 The Great Wall of China took over 2,000 years to build!"
        "🌉 The Golden Gate Bridge's cables contain 80,000 miles of wire!"
        "🏛️ The Leaning Tower of Pisa took 344 years to complete!"
        "🗼 The Eiffel Tower grows 6 inches taller in summer due to thermal expansion!"
        "🏰 The Empire State Building was built in just 410 days!"
    )
    
    RANDOM_FACT=${FACTS[$RANDOM % ${#FACTS[@]}]}
    echo -e "${PURPLE}🎲 Random Construction Fact:${NC}"
    echo -e "${WHITE}$RANDOM_FACT${NC}"
}

# Interactive menu
show_menu() {
    echo -e "${YELLOW}🎮 Choose your debug adventure:${NC}"
    echo -e "${GREEN}1.${NC} 🔍 Check Server Status"
    echo -e "${GREEN}2.${NC} 🔐 Test Login & Dashboard"
    echo -e "${GREEN}3.${NC} 💪 Run Stress Test"
    echo -e "${GREEN}4.${NC} 🗺️ Explore API Endpoints"
    echo -e "${GREEN}5.${NC} 🖥️ Show System Info"
    echo -e "${GREEN}6.${NC} 🎲 Random Fun Fact"
    echo -e "${GREEN}7.${NC} 🌐 Open Debug Playground"
    echo -e "${GREEN}8.${NC} 🎪 Run Interactive API Tester"
    echo -e "${GREEN}9.${NC} 🚪 Exit"
    echo ""
}

# Open debug playground in browser
open_playground() {
    echo -e "${CYAN}🌐 Opening Debug Playground...${NC}"
    
    if command -v open &> /dev/null; then
        open "file://$(pwd)/debug-playground.html"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "file://$(pwd)/debug-playground.html"
    else
        echo -e "${YELLOW}📂 Please open this file in your browser:${NC}"
        echo -e "${WHITE}file://$(pwd)/debug-playground.html${NC}"
    fi
}

# Run interactive API tester
run_api_tester() {
    echo -e "${CYAN}🎪 Starting Interactive API Tester...${NC}"
    
    if [ -f "api-tester.js" ]; then
        node api-tester.js
    else
        echo -e "${RED}❌ API tester not found! Make sure api-tester.js exists.${NC}"
    fi
}

# Main function
main() {
    show_banner
    
    while true; do
        show_menu
        read -p "$(echo -e ${CYAN}Enter your choice \(1-9\): ${NC})" choice
        echo ""
        
        case $choice in
            1) check_servers ;;
            2) test_login ;;
            3) stress_test ;;
            4) explore_endpoints ;;
            5) show_system_info ;;
            6) random_fun_fact ;;
            7) open_playground ;;
            8) run_api_tester ;;
            9) 
                echo -e "${GREEN}🎉 Thanks for debugging with style! Keep building awesome things! 🚀${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}❌ Invalid choice! Please try again.${NC}"
                ;;
        esac
        
        echo ""
        read -p "$(echo -e ${YELLOW}Press Enter to continue...${NC})"
        echo ""
    done
}

# Make it executable and run
chmod +x "$0"

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main
fi
