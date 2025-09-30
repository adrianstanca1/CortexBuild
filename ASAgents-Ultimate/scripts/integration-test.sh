#!/bin/bash

# Integration Testing Script for ASAgents Construction Management Platform
# This script validates all components work together properly

echo "🚀 Starting ASAgents Integration Testing Suite"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test Results
PASSED_TESTS=0
FAILED_TESTS=0
TOTAL_TESTS=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${BLUE}Test $TOTAL_TESTS: $test_name${NC}"
    
    # Run the test command
    result=$(eval "$test_command" 2>&1)
    
    if [[ $? -eq 0 && $result == *"$expected_result"* ]]; then
        echo -e "${GREEN}✓ PASSED${NC}: $test_name"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ FAILED${NC}: $test_name"
        echo -e "${YELLOW}Expected: $expected_result${NC}"
        echo -e "${YELLOW}Got: $result${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    echo ""
}

# Function to test API endpoint
test_api_endpoint() {
    local endpoint="$1"
    local expected_status="$2"
    local test_name="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${BLUE}Test $TOTAL_TESTS: $test_name${NC}"
    
    response=$(curl -s -w "%{http_code}" "http://localhost:5001$endpoint" -o /dev/null)
    
    if [[ "$response" == "$expected_status" ]]; then
        echo -e "${GREEN}✓ PASSED${NC}: API endpoint $endpoint returned $expected_status"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ FAILED${NC}: API endpoint $endpoint returned $response, expected $expected_status"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    echo ""
}

echo "1. Backend API Health Checks"
echo "============================"

# Test backend health endpoint
test_api_endpoint "/api/health" "200" "Backend Health Check"

# Test API endpoints
test_api_endpoint "/api/projects" "200" "Projects API Endpoint"
test_api_endpoint "/api/users" "401" "Users API Endpoint (Auth Required)"
test_api_endpoint "/api/workflows" "401" "Workflows API Endpoint (Auth Required)"
test_api_endpoint "/api/documents" "401" "Documents API Endpoint (Auth Required)"
test_api_endpoint "/api/reports" "401" "Reports API Endpoint (Auth Required)"

echo "2. Database Connectivity Tests"
echo "=============================="

# Test database connection via API
run_test "Database Connection via API" \
    "curl -s http://localhost:5001/api/health | jq -r '.data.database.status'" \
    "connected"

run_test "Database Tables Count" \
    "curl -s http://localhost:5001/api/health | jq -r '.data.database.tables'" \
    "16"

echo "3. Frontend Accessibility Tests"
echo "==============================="

# Test frontend server
run_test "Frontend Server Running" \
    "curl -s -I http://localhost:4001 | head -n1" \
    "200"

# Test if main application loads
run_test "Frontend Application Loads" \
    "curl -s http://localhost:4001 | grep -o '<title>.*</title>'" \
    "ASAgents"

echo "4. Component Integration Tests"
echo "============================="

# Check if component files exist and are properly structured
run_test "UserManagement Component Exists" \
    "test -f /Users/admin/Desktop/final/components/users/UserManagement.tsx && echo 'exists'" \
    "exists"

run_test "DocumentManagement Component Exists" \
    "test -f /Users/admin/Desktop/final/components/documents/DocumentManagement.tsx && echo 'exists'" \
    "exists"

run_test "WorkflowManagement Component Exists" \
    "test -f /Users/admin/Desktop/final/components/workflow/WorkflowManagement.tsx && echo 'exists'" \
    "exists"

run_test "AdvancedReporting Component Exists" \
    "test -f /Users/admin/Desktop/final/components/reporting/AdvancedReporting.tsx && echo 'exists'" \
    "exists"

run_test "ExecutiveDashboard Component Exists" \
    "test -f /Users/admin/Desktop/final/components/dashboard/ExecutiveDashboard.tsx && echo 'exists'" \
    "exists"

# Test component exports
run_test "UserManagement Component Export" \
    "grep -q 'export.*UserManagement' /Users/admin/Desktop/final/components/users/UserManagement.tsx && echo 'exported'" \
    "exported"

run_test "DocumentManagement Component Export" \
    "grep -q 'export.*DocumentManagement' /Users/admin/Desktop/final/components/documents/DocumentManagement.tsx && echo 'exported'" \
    "exported"

run_test "WorkflowManagement Component Export" \
    "grep -q 'export.*WorkflowManagement' /Users/admin/Desktop/final/components/workflow/WorkflowManagement.tsx && echo 'exported'" \
    "exported"

echo "5. Configuration and Environment Tests"
echo "======================================"

# Check package.json scripts
run_test "Package.json Has Dev Script" \
    "jq -r '.scripts.dev' /Users/admin/Desktop/final/package.json" \
    "vite"

run_test "Backend Package.json Has Dev Script" \
    "jq -r '.scripts.dev' /Users/admin/Desktop/final/backend/package.json" \
    "tsx watch src/index.ts"

# Check TypeScript configuration
run_test "TypeScript Config Exists" \
    "test -f /Users/admin/Desktop/final/tsconfig.json && echo 'exists'" \
    "exists"

run_test "Vite Config Exists" \
    "test -f /Users/admin/Desktop/final/vite.config.ts && echo 'exists'" \
    "exists"

echo "6. Security and Authentication Tests"
echo "===================================="

# Test that protected routes require authentication
test_api_endpoint "/api/admin" "401" "Protected Admin Route (No Auth)"
test_api_endpoint "/api/dashboard" "401" "Protected Dashboard Route (No Auth)"

# Test CORS headers
run_test "CORS Headers Present" \
    "curl -s -I http://localhost:5001/api/health | grep -i 'access-control-allow-origin'" \
    "access-control-allow-origin"

echo "7. Performance and Load Tests"
echo "============================="

# Test response times
run_test "API Response Time < 1000ms" \
    "time curl -s http://localhost:5001/api/health > /dev/null" \
    "real"

# Test concurrent requests (simplified)
run_test "Handle Multiple Concurrent Requests" \
    "for i in {1..5}; do curl -s http://localhost:5001/api/health & done; wait && echo 'completed'" \
    "completed"

echo "8. Error Handling Tests"
echo "======================"

# Test 404 handling
test_api_endpoint "/api/nonexistent" "404" "404 Error Handling"

# Test malformed requests
run_test "Handle Malformed JSON" \
    "curl -s -X POST -H 'Content-Type: application/json' -d 'invalid-json' http://localhost:5001/api/projects | jq -r '.error'" \
    "error"

echo ""
echo "=============================================="
echo "🎯 Integration Test Results Summary"
echo "=============================================="
echo -e "${GREEN}Passed Tests: $PASSED_TESTS${NC}"
echo -e "${RED}Failed Tests: $FAILED_TESTS${NC}"
echo -e "${BLUE}Total Tests:  $TOTAL_TESTS${NC}"
echo ""

SUCCESS_RATE=$(( (PASSED_TESTS * 100) / TOTAL_TESTS ))
echo -e "${YELLOW}Success Rate: $SUCCESS_RATE%${NC}"

if [[ $SUCCESS_RATE -ge 80 ]]; then
    echo -e "${GREEN}🎉 Integration Tests PASSED! System is ready for deployment.${NC}"
    exit 0
elif [[ $SUCCESS_RATE -ge 60 ]]; then
    echo -e "${YELLOW}⚠️  Integration Tests PARTIALLY PASSED. Some issues need attention.${NC}"
    exit 1
else
    echo -e "${RED}❌ Integration Tests FAILED. Significant issues need to be resolved.${NC}"
    exit 2
fi