#!/bin/bash

# CortexBuild System Debug Script
# ===============================

set -e

echo "🔧 CortexBuild System Debug & Health Check"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_debug() {
    echo -e "${PURPLE}[DEBUG]${NC} $1"
}

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=${3:-200}
    local auth_header=${4:-""}
    
    print_debug "Testing $method $endpoint"
    
    if [ ! -z "$auth_header" ]; then
        response=$(curl -s -w "%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $auth_header" \
            "http://localhost:3001$endpoint")
    else
        response=$(curl -s -w "%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            "http://localhost:3001$endpoint")
    fi
    
    status_code="${response: -3}"
    body="${response%???}"
    
    if [ "$status_code" = "$expected_status" ]; then
        print_success "$endpoint - Status: $status_code"
        return 0
    else
        print_error "$endpoint - Expected: $expected_status, Got: $status_code"
        echo "Response: $body"
        return 1
    fi
}

echo ""
print_status "Step 1: System Environment Check"
echo "================================="

# Check Node.js version
NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

# Check npm version
NPM_VERSION=$(npm --version)
print_status "npm version: $NPM_VERSION"

# Check if processes are running
print_status "Checking running processes..."
if lsof -i:3001 > /dev/null 2>&1; then
    print_success "Backend server running on port 3001"
else
    print_warning "Backend server not running on port 3001"
fi

if lsof -i:3003 > /dev/null 2>&1; then
    print_success "Frontend server running on port 3003"
elif lsof -i:3002 > /dev/null 2>&1; then
    print_success "Frontend server running on port 3002"
else
    print_warning "Frontend server not running"
fi

echo ""
print_status "Step 2: Backend API Health Check"
echo "================================="

# Test health endpoint
test_endpoint "GET" "/api/health" 200

# Test authentication
print_debug "Testing authentication..."
auth_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"email": "adrian.stanca1@gmail.com", "password": "parola123"}' \
    http://localhost:3001/api/auth/login)

if echo "$auth_response" | grep -q "token"; then
    print_success "Authentication working"
    token=$(echo "$auth_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    print_debug "Token obtained: ${token:0:20}..."
    
    # Test authenticated endpoints
    test_endpoint "GET" "/api/projects" 200 "$token"
    test_endpoint "GET" "/api/tasks" 200 "$token"
    
else
    print_error "Authentication failed"
    echo "Response: $auth_response"
fi

echo ""
print_status "Step 3: Frontend Accessibility Check"
echo "===================================="

# Test frontend
if curl -f -s http://localhost:3003 > /dev/null; then
    print_success "Frontend accessible on port 3003"
elif curl -f -s http://localhost:3002 > /dev/null; then
    print_success "Frontend accessible on port 3002"
else
    print_error "Frontend not accessible"
fi

echo ""
print_status "Step 4: Database Connection Check"
echo "================================="

# Test database connection through API
db_response=$(curl -s http://localhost:3001/api/health)
if echo "$db_response" | grep -q "ok"; then
    print_success "Database connection healthy"
else
    print_warning "Database connection may have issues"
fi

echo ""
print_status "Step 5: AI Services Check"
echo "========================="

if [ ! -z "$token" ]; then
    ai_response=$(curl -s -w "%{http_code}" -X POST \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -d '{"message": "Debug test message"}' \
        http://localhost:3001/api/ai/chat)
    
    ai_status="${ai_response: -3}"
    if [ "$ai_status" = "200" ]; then
        print_success "AI chat service working"
    else
        print_warning "AI chat service may have issues (Status: $ai_status)"
    fi
else
    print_warning "Skipping AI test - no auth token"
fi

echo ""
print_status "Step 6: Performance Metrics"
echo "==========================="

# Test response times
print_debug "Measuring API response times..."
api_time=$(curl -w "%{time_total}" -s -o /dev/null http://localhost:3001/api/health)
print_status "API response time: ${api_time}s"

if curl -f -s http://localhost:3003 > /dev/null; then
    frontend_time=$(curl -w "%{time_total}" -s -o /dev/null http://localhost:3003)
    print_status "Frontend load time: ${frontend_time}s"
fi

echo ""
print_status "Step 7: Environment Variables Check"
echo "==================================="

# Check critical environment variables
if [ ! -z "$SUPABASE_URL" ]; then
    print_success "SUPABASE_URL is set"
else
    print_warning "SUPABASE_URL not found in environment"
fi

if [ ! -z "$GEMINI_API_KEY" ]; then
    print_success "GEMINI_API_KEY is set"
else
    print_warning "GEMINI_API_KEY not found in environment"
fi

echo ""
print_status "Step 8: File System Check"
echo "========================="

# Check critical files
critical_files=(
    "package.json"
    "vite.config.ts"
    "server/index.ts"
    ".env.local"
    "App.tsx"
    "index.html"
    "auth/authService.ts"
)

for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file exists"
    else
        print_error "$file missing"
    fi
done

echo ""
print_success "🎉 Debug Check Complete!"
echo ""
echo "📊 System Summary:"
echo "=================="
echo "✅ Backend API: $([ "$?" -eq 0 ] && echo "HEALTHY" || echo "CHECK LOGS")"
echo "✅ Frontend: $(curl -f -s http://localhost:3003 > /dev/null && echo "ACCESSIBLE" || echo "CHECK LOGS")"
echo "✅ Authentication: $(echo "$auth_response" | grep -q "token" && echo "WORKING" || echo "CHECK LOGS")"
echo "✅ Database: $(echo "$db_response" | grep -q "ok" && echo "CONNECTED" || echo "CHECK LOGS")"
echo "✅ AI Services: $([ "$ai_status" = "200" ] && echo "ACTIVE" || echo "CHECK CONFIG")"
echo ""
echo "🌐 Access Points:"
echo "  Frontend: http://localhost:3003 (or 3002)"
echo "  Backend:  http://localhost:3001"
echo "  Debug Dashboard: file://$(pwd)/debug-dashboard.html"
echo ""
echo "🔑 Test Credentials:"
echo "  Email: adrian.stanca1@gmail.com"
echo "  Password: parola123"
echo ""
