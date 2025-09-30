#!/bin/bash

# 🚀 ASAgents-Ultimate Quick Start Script
# This script sets up and runs the development environment

set -e  # Exit on error

echo "🚀 ASAgents-Ultimate Development Environment"
echo "==========================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Function to print colored output
print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Step 1: Check Node.js version
print_step "Checking Node.js version..."
NODE_VERSION=$(node --version)
echo "   Node.js version: $NODE_VERSION"
print_success "Node.js is installed"

# Step 2: Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Installing dependencies..."
    NODE_ENV= npm install --include=dev
    print_success "Dependencies installed"
else
    print_success "Dependencies already installed"
fi

# Step 3: Check environment variables
print_step "Checking environment variables..."
if [ ! -f ".env.local" ]; then
    print_warning ".env.local not found. Creating from example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo "   Please update .env.local with your actual values"
    else
        echo "   No .env.example found. Skipping..."
    fi
else
    print_success "Environment variables configured"
fi

# Step 4: Run type check
print_step "Running TypeScript type check..."
if npm run type-check 2>&1 | grep -q "error TS"; then
    ERROR_COUNT=$(npm run type-check 2>&1 | grep "error TS" | wc -l | tr -d ' ')
    print_warning "Found $ERROR_COUNT TypeScript errors (non-blocking)"
else
    print_success "No TypeScript errors found"
fi

# Step 5: Check if port 5173 is available
print_step "Checking if port 5173 is available..."
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "Port 5173 is already in use. Stopping existing process..."
    kill $(lsof -t -i:5173) 2>/dev/null || true
    sleep 2
fi
print_success "Port 5173 is available"

# Step 6: Display project information
echo ""
echo "========================================="
echo "📊 Project Information"
echo "========================================="
echo "Project Name: ASAgents-Ultimate"
echo "Version: $(node -p "require('./package.json').version")"
echo "Node Version: $NODE_VERSION"
echo "Packages Installed: $(ls node_modules 2>/dev/null | wc -l | tr -d ' ')"
echo ""

# Step 7: Display available commands
echo "========================================="
echo "🛠️  Available Commands"
echo "========================================="
echo "npm run dev          - Start development server"
echo "npm run build        - Build for production"
echo "npm run preview      - Preview production build"
echo "npm run type-check   - Check TypeScript errors"
echo "npm run lint         - Lint code"
echo "npm run lint:fix     - Auto-fix linting issues"
echo "npm run format       - Format code with Prettier"
echo ""

# Step 8: Display next steps
echo "========================================="
echo "🎯 Next Steps"
echo "========================================="
echo "1. Review .env.local and add your API keys"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:5173 in your browser"
echo "4. Start building features!"
echo ""

# Step 9: Ask if user wants to start dev server
read -p "Would you like to start the development server now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_step "Starting development server..."
    echo ""
    echo "========================================="
    echo "🚀 Development Server Starting..."
    echo "========================================="
    echo "Local:   http://localhost:5173/"
    echo "Press Ctrl+C to stop the server"
    echo "========================================="
    echo ""
    npm run dev
else
    echo ""
    print_success "Setup complete! Run 'npm run dev' when ready to start."
fi
