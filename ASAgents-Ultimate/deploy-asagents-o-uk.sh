#!/bin/bash

# =============================================================================
# ASAgents.o.uk Domain Deployment Script
# =============================================================================

echo "🚀 ASAgents.o.uk Deployment Starting..."
echo "======================================"

# Exit on any error
set -e

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
    print_error "package.json not found. Please run this script from the ASAgents-Ultimate directory."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI is not installed. Please install it with: npm install -g vercel"
    exit 1
fi

# Step 1: Clean previous builds
print_status "Step 1: Cleaning previous builds..."
rm -rf dist/
rm -rf node_modules/.vite
rm -rf .vercel
print_success "Build directories cleaned"

# Step 2: Install dependencies
print_status "Step 2: Installing dependencies..."
npm install --legacy-peer-deps
print_success "Dependencies installed"

# Step 3: Run build
print_status "Step 3: Building for production..."
npm run build
print_success "Build completed successfully"

# Step 4: Run pre-deployment tests
print_status "Step 4: Running pre-deployment checks..."

# Check if build files exist
if [ ! -f "dist/index.html" ]; then
    print_error "Build failed - index.html not found in dist/"
    exit 1
fi

# Check bundle size
bundle_size=$(du -sh dist/ | cut -f1)
print_success "Build size: $bundle_size"

# Step 5: Deploy to Vercel
print_status "Step 5: Deploying to Vercel..."

# Login to Vercel (if not already logged in)
if ! vercel whoami &> /dev/null; then
    print_warning "Not logged in to Vercel. Please login:"
    vercel login
fi

# Deploy to production
print_status "Deploying to production..."
vercel --prod --yes

# Step 6: Configure custom domain
print_status "Step 6: Configuring custom domain..."

# Add the custom domain (this might fail if already added, that's OK)
vercel domains add asagents.o.uk || print_warning "Domain might already be configured"

# Step 7: Verify deployment
print_status "Step 7: Verifying deployment..."

# Get the deployment URL
deployment_url=$(vercel --prod --yes 2>&1 | grep -o 'https://[^[:space:]]*' | tail -1)

if [ -z "$deployment_url" ]; then
    print_warning "Could not extract deployment URL automatically"
    deployment_url="https://asagents.o.uk"
fi

print_success "Deployment URL: $deployment_url"

# Test the deployment
print_status "Testing deployment endpoints..."

# Test main page
if curl -s --head "$deployment_url" | grep -q "200 OK"; then
    print_success "✓ Main page is accessible"
else
    print_warning "⚠ Main page might not be ready yet"
fi

# Test API health endpoint
if curl -s --head "$deployment_url/api/health" | grep -q "200 OK"; then
    print_success "✓ API health endpoint is working"
else
    print_warning "⚠ API health endpoint might not be ready yet"
fi

# Step 8: Domain configuration instructions
print_status "Step 8: DNS Configuration Required"
echo ""
echo "To complete the setup, configure these DNS records with your domain provider:"
echo ""
echo "Type: CNAME"
echo "Name: asagents"
echo "Value: cname.vercel-dns.com"
echo ""
echo "Type: CNAME"
echo "Name: www.asagents"  
echo "Value: cname.vercel-dns.com"
echo ""

# Step 9: Final status
echo ""
echo "======================================"
print_success "🎉 ASAgents.o.uk Deployment Complete!"
echo "======================================"
echo ""
print_status "Next steps:"
echo "1. Configure DNS records (see above)"
echo "2. Wait for DNS propagation (up to 24 hours)"
echo "3. Verify SSL certificate is issued"
echo "4. Test all functionality"
echo ""
print_status "URLs to test:"
echo "• Production: https://asagents.o.uk"
echo "• API Health: https://asagents.o.uk/api/health"
echo "• Projects: https://asagents.o.uk/api/projects"
echo "• Dashboard: https://asagents.o.uk/api/analytics/dashboard"
echo ""
print_status "Vercel Dashboard: https://vercel.com/dashboard"
echo ""
print_success "Deployment completed successfully! 🚀"