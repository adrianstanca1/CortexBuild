#!/bin/bash

# CortexBuild Production Build Script
# ===================================

set -e  # Exit on any error

echo "🚀 Starting CortexBuild Production Build..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check Node.js version
NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf dist/
rm -rf build/
rm -rf .vite/
print_success "Previous builds cleaned"

# Install dependencies
print_status "Installing production dependencies..."
npm ci --only=production
print_success "Dependencies installed"

# Copy production environment
print_status "Setting up production environment..."
if [ -f ".env.production" ]; then
    cp .env.production .env.local
    print_success "Production environment configured"
else
    print_warning "No .env.production file found. Using default environment."
fi

# Type checking
print_status "Running TypeScript type checking..."
npm run type-check
print_success "Type checking passed"

# Linting
print_status "Running ESLint..."
npm run lint
print_success "Linting passed"

# Run tests
print_status "Running tests..."
npm run test:run
print_success "Tests passed"

# Build frontend
print_status "Building frontend (Vite)..."
npm run build
print_success "Frontend build completed"

# Build backend (TypeScript compilation)
print_status "Building backend..."
npx tsc --project server/tsconfig.json --outDir dist/server
print_success "Backend build completed"

# Copy necessary files
print_status "Copying production files..."
cp package.json dist/
cp package-lock.json dist/
cp -r server/migrations dist/server/ 2>/dev/null || true
cp -r public dist/ 2>/dev/null || true
print_success "Production files copied"

# Create production package.json
print_status "Creating production package.json..."
node -e "
const pkg = require('./package.json');
const prodPkg = {
  name: pkg.name,
  version: pkg.version,
  description: pkg.description,
  main: 'server/index.js',
  scripts: {
    start: 'node server/index.js',
    'start:prod': 'NODE_ENV=production node server/index.js'
  },
  dependencies: Object.fromEntries(
    Object.entries(pkg.dependencies || {}).filter(([key]) => 
      !key.startsWith('@types/') && 
      !key.includes('dev') && 
      !key.includes('test')
    )
  )
};
require('fs').writeFileSync('dist/package.json', JSON.stringify(prodPkg, null, 2));
"
print_success "Production package.json created"

# Calculate build size
print_status "Calculating build sizes..."
FRONTEND_SIZE=$(du -sh dist/assets 2>/dev/null | cut -f1 || echo "N/A")
BACKEND_SIZE=$(du -sh dist/server 2>/dev/null | cut -f1 || echo "N/A")
TOTAL_SIZE=$(du -sh dist 2>/dev/null | cut -f1 || echo "N/A")

echo ""
echo "📊 Build Summary"
echo "================"
echo "Frontend size: $FRONTEND_SIZE"
echo "Backend size: $BACKEND_SIZE"
echo "Total size: $TOTAL_SIZE"
echo ""

print_success "🎉 Production build completed successfully!"
echo ""
echo "📁 Build artifacts are in the 'dist/' directory"
echo "🚀 Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Test the production build locally: npm run preview"
echo "2. Deploy to your hosting platform"
echo "3. Update environment variables on your hosting platform"
echo ""
