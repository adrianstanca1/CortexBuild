#!/bin/bash

# =============================================================================
# ASAgents.o.uk - Quick Setup Script
# =============================================================================

echo "🔧 ASAgents.o.uk Quick Setup"
echo "============================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the ASAgents-Ultimate directory."
    exit 1
fi

print_status "Setting up ASAgents.o.uk deployment environment..."

# Step 1: Check Node.js version
print_status "Checking Node.js version..."
node_version=$(node --version)
print_success "Node.js version: $node_version"

# Step 2: Check if Vercel CLI is installed
print_status "Checking Vercel CLI..."
if command -v vercel &> /dev/null; then
    vercel_version=$(vercel --version)
    print_success "Vercel CLI installed: $vercel_version"
else
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
    print_success "Vercel CLI installed"
fi

# Step 3: Clear any existing builds
print_status "Cleaning existing builds..."
rm -rf dist/
rm -rf node_modules/.vite
print_success "Build directories cleaned"

# Step 4: Install dependencies
print_status "Installing dependencies..."
unset NODE_ENV
npm install --legacy-peer-deps
print_success "Dependencies installed"

# Step 5: Test build
print_status "Testing production build..."
npm run build
if [ $? -eq 0 ]; then
    print_success "✅ Build test successful"
else
    echo "❌ Build test failed"
    exit 1
fi

# Step 6: Check build size
if [ -d "dist" ]; then
    build_size=$(du -sh dist/ | cut -f1)
    print_success "Build size: $build_size"
fi

# Step 7: Verify required files
print_status "Verifying deployment files..."

required_files=(
    "vercel.json"
    ".env.production" 
    "deploy-asagents-o-uk.sh"
    "ASAGENTS_O_UK_CHECKLIST.md"
    "DOMAIN_DEPLOYMENT_GUIDE.md"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "✅ $file"
    else
        print_warning "⚠️  $file not found"
    fi
done

# Step 8: Check API endpoints
print_status "Checking API structure..."

api_files=(
    "api/health.ts"
    "api/auth/login.ts"
    "api/projects.ts"
    "api/analytics/dashboard.ts"
)

for file in "${api_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "✅ $file"
    else
        print_warning "⚠️  $file not found"
    fi
done

# Step 9: Verify Vercel login
print_status "Checking Vercel authentication..."
if vercel whoami &> /dev/null; then
    vercel_user=$(vercel whoami 2>/dev/null)
    print_success "Logged in as: $vercel_user"
else
    print_warning "Not logged in to Vercel"
    echo "Run 'vercel login' to authenticate before deployment"
fi

# Step 10: Display summary
echo ""
echo "======================================"
print_success "🎉 Setup Complete!"
echo "======================================"
echo ""
print_status "Ready for deployment to asagents.o.uk"
echo ""
print_status "Next steps:"
echo "1. Ensure you're logged in to Vercel: vercel login"
echo "2. Run the deployment script: ./deploy-asagents-o-uk.sh"
echo "3. Configure DNS records (see DOMAIN_DEPLOYMENT_GUIDE.md)"
echo ""
print_status "Quick deployment command:"
echo "./deploy-asagents-o-uk.sh"
echo ""
print_success "Setup completed successfully! 🚀"