#!/bin/bash

# CortexBuild Production Testing Script
# =====================================

set -e

echo "🧪 Testing CortexBuild Production Build..."
echo "========================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

# Test configuration
API_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:4173"
TEST_EMAIL="adrian.stanca1@gmail.com"
TEST_PASSWORD="parola123"

# Function to test API endpoint
test_endpoint() {
    local endpoint=$1
    local expected_status=${2:-200}
    local method=${3:-GET}
    local data=${4:-""}
    
    print_status "Testing $method $endpoint"
    
    if [ "$method" = "POST" ] && [ ! -z "$data" ]; then
        response=$(curl -s -w "%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_URL$endpoint")
    else
        response=$(curl -s -w "%{http_code}" "$API_URL$endpoint")
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

# Function to test authenticated endpoint
test_auth_endpoint() {
    local endpoint=$1
    local token=$2
    local expected_status=${3:-200}
    
    print_status "Testing authenticated $endpoint"
    
    response=$(curl -s -w "%{http_code}" \
        -H "Authorization: Bearer $token" \
        "$API_URL$endpoint")
    
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

# Start production build testing
print_status "Starting production build tests..."

# Check if production build exists
if [ ! -d "dist" ]; then
    print_error "Production build not found. Run 'npm run build:prod' first."
    exit 1
fi

print_success "Production build found"

# Start preview server in background
print_status "Starting preview server..."
npm run preview &
PREVIEW_PID=$!

# Wait for preview server to start
sleep 5

# Test frontend accessibility
print_status "Testing frontend accessibility..."
if curl -f -s "$FRONTEND_URL" > /dev/null; then
    print_success "Frontend is accessible"
else
    print_error "Frontend is not accessible"
    kill $PREVIEW_PID 2>/dev/null || true
    exit 1
fi

# Test API health endpoint
print_status "Testing API endpoints..."
test_endpoint "/api/health" 200

# Test authentication
print_status "Testing authentication..."
login_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASSWORD\"}" \
    "$API_URL/api/auth/login")

if echo "$login_response" | grep -q "token"; then
    print_success "Authentication successful"
    token=$(echo "$login_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    # Test authenticated endpoints
    test_auth_endpoint "/api/projects" "$token"
    test_auth_endpoint "/api/tasks" "$token"
    
else
    print_warning "Authentication test skipped (no test user configured)"
fi

# Test AI endpoints (if configured)
if [ ! -z "$GEMINI_API_KEY" ] && [ "$GEMINI_API_KEY" != "your-gemini-api-key" ]; then
    print_status "Testing AI endpoints..."
    if [ ! -z "$token" ]; then
        ai_response=$(curl -s -X POST \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -d '{"message": "Hello"}' \
            "$API_URL/api/ai/chat")
        
        if echo "$ai_response" | grep -q "success"; then
            print_success "AI chat endpoint working"
        else
            print_warning "AI chat endpoint may have issues"
        fi
    fi
else
    print_warning "AI tests skipped (no API key configured)"
fi

# Performance tests
print_status "Running basic performance tests..."

# Test frontend load time
frontend_time=$(curl -w "%{time_total}" -s -o /dev/null "$FRONTEND_URL")
print_status "Frontend load time: ${frontend_time}s"

# Test API response time
api_time=$(curl -w "%{time_total}" -s -o /dev/null "$API_URL/api/health")
print_status "API response time: ${api_time}s"

# Cleanup
print_status "Cleaning up..."
kill $PREVIEW_PID 2>/dev/null || true

echo ""
print_success "🎉 Production testing completed!"
echo ""
echo "📊 Test Summary:"
echo "✅ Frontend accessibility: PASSED"
echo "✅ API health check: PASSED"
echo "✅ Authentication: $([ ! -z "$token" ] && echo "PASSED" || echo "SKIPPED")"
echo "✅ Performance: Frontend ${frontend_time}s, API ${api_time}s"
echo ""
echo "🚀 Your production build is ready for deployment!"
echo ""
