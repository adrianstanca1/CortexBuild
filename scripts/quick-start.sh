#!/bin/bash

# CortexBuild Quick Start & Recovery Script
# =========================================

set -e

echo "🚀 CortexBuild Quick Start & Recovery"
echo "====================================="

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

print_status "Step 1: Checking system requirements..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

NODE_VERSION=$(node --version)
print_success "Node.js version: $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

NPM_VERSION=$(npm --version)
print_success "npm version: $NPM_VERSION"

print_status "Step 2: Stopping any existing processes..."

# Kill any existing processes on ports 3001, 3002, 3003
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:3002 | xargs kill -9 2>/dev/null || true
lsof -ti:3003 | xargs kill -9 2>/dev/null || true

print_success "Existing processes stopped"

print_status "Step 3: Installing dependencies..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    npm install
    print_success "Dependencies installed"
else
    print_success "Dependencies already installed"
fi

print_status "Step 4: Checking environment configuration..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_warning ".env.local not found. Creating from template..."
    cp .env.example .env.local 2>/dev/null || print_warning "No .env.example found"
fi

print_success "Environment configuration checked"

print_status "Step 5: Starting CortexBuild services..."

# Start the application
echo ""
print_success "🎉 Starting CortexBuild..."
echo ""
echo "📊 Services starting:"
echo "  Frontend: http://localhost:3003 (or 3002)"
echo "  Backend:  http://localhost:3001"
echo "  Debug:    http://localhost:3003/debug.html"
echo ""
echo "🔑 Login credentials:"
echo "  Email:    adrian.stanca1@gmail.com"
echo "  Password: parola123"
echo ""
echo "🛠️ Debug tools:"
echo "  System check: ./scripts/debug-system.sh"
echo "  Error monitor: curl http://localhost:3001/api/errors"
echo ""
echo "⚠️  Press Ctrl+C to stop all services"
echo ""

# Start the application
npm run dev:all
