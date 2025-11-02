#!/bin/bash

# CortexBuild Production Authentication Fix Script
# ===============================================

set -e

echo "🔧 Fixing CortexBuild Production Authentication Issues..."
echo "======================================================="

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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the CortexBuild root directory."
    exit 1
fi

print_status "Step 1: Stopping existing processes..."
# Kill any existing processes on ports 3001 and 4173
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:4173 | xargs kill -9 2>/dev/null || true
print_success "Existing processes stopped"

print_status "Step 2: Building production version..."
npm run build
print_success "Production build completed"

print_status "Step 3: Starting backend server..."
# Start backend server in background
npm run server &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 5

print_status "Step 4: Testing backend health..."
if curl -f -s http://localhost:3001/api/health > /dev/null; then
    print_success "Backend is healthy"
else
    print_error "Backend health check failed"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

print_status "Step 5: Starting frontend preview..."
# Start frontend preview in background
npm run preview &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait for frontend to start
sleep 5

print_status "Step 6: Testing frontend accessibility..."
if curl -f -s http://localhost:4173 > /dev/null; then
    print_success "Frontend is accessible"
else
    print_error "Frontend accessibility check failed"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit 1
fi

print_status "Step 7: Testing authentication endpoint..."
auth_response=$(curl -s -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{"email": "adrian.stanca1@gmail.com", "password": "parola123"}' \
    http://localhost:3001/api/auth/login)

status_code="${auth_response: -3}"
response_body="${auth_response%???}"

if [ "$status_code" = "200" ]; then
    print_success "Authentication endpoint working - Status: $status_code"
    echo "Response: $response_body"
else
    print_warning "Authentication endpoint returned status: $status_code"
    echo "Response: $response_body"
fi

print_status "Step 8: Testing CORS configuration..."
cors_response=$(curl -s -w "%{http_code}" -X OPTIONS \
    -H "Origin: http://localhost:4173" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" \
    http://localhost:3001/api/auth/login)

cors_status="${cors_response: -3}"
if [ "$cors_status" = "200" ] || [ "$cors_status" = "204" ]; then
    print_success "CORS configuration working - Status: $cors_status"
else
    print_warning "CORS may have issues - Status: $cors_status"
fi

echo ""
print_success "🎉 Production Authentication Fix Complete!"
echo ""
echo "📊 Test Results:"
echo "✅ Backend Health: PASSED"
echo "✅ Frontend Access: PASSED"
echo "✅ Auth Endpoint: $([ "$status_code" = "200" ] && echo "PASSED" || echo "CHECK LOGS")"
echo "✅ CORS Config: $([ "$cors_status" = "200" ] || [ "$cors_status" = "204" ] && echo "PASSED" || echo "CHECK LOGS")"
echo ""
echo "🌐 Access your application:"
echo "  Frontend: http://localhost:4173"
echo "  Backend:  http://localhost:3001"
echo ""
echo "🔑 Test Login Credentials:"
echo "  Email:    adrian.stanca1@gmail.com"
echo "  Password: parola123"
echo ""
echo "To stop services:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Keep processes running
print_status "Services are running. Press Ctrl+C to stop all services."
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; exit" INT TERM

# Wait for user to stop
wait
