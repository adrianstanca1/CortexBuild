#!/bin/bash

# CortexBuild Vercel Deployment Script
# ====================================

set -e

echo "🚀 Deploying CortexBuild to Vercel..."
echo "====================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
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

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
    print_success "Vercel CLI installed"
fi

# Check if we're logged in to Vercel
print_status "Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    print_warning "Not logged in to Vercel. Please log in..."
    vercel login
fi

# Set environment variables
print_status "Setting up environment variables..."

# Production environment variables
ENV_VARS=(
    "NODE_ENV=production"
    "SUPABASE_URL=https://zpbuvuxpfemldsknerew.supabase.co"
    "SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwYnV2dXhwZmVtbGRza25lcmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA0MDY5NzQsImV4cCI6MjA0NTk4Mjk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8"
    "GEMINI_API_KEY=AIzaSyC4BTpQS0_ZdZsOl0c3beb344hr3xZEVy8"
    "VITE_SUPABASE_URL=https://zpbuvuxpfemldsknerew.supabase.co"
    "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwYnV2dXhwZmVtbGRza25lcmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA0MDY5NzQsImV4cCI6MjA0NTk4Mjk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8"
    "VITE_GEMINI_API_KEY=AIzaSyC4BTpQS0_ZdZsOl0c3beb344hr3xZEVy8"
    "VITE_APP_VERSION=1.0.0"
    "VITE_ENVIRONMENT=production"
)

# Set each environment variable
for env_var in "${ENV_VARS[@]}"; do
    print_status "Setting: ${env_var%%=*}"
    echo "$env_var" | vercel env add production
done

print_success "Environment variables configured"

# Build and deploy
print_status "Building and deploying to Vercel..."

# Deploy to production
vercel --prod --yes

print_success "🎉 Deployment completed!"
echo ""
echo "Your CortexBuild application is now live on Vercel!"
echo ""
echo "Next steps:"
echo "1. Test your deployed application"
echo "2. Set up custom domain (if needed)"
echo "3. Configure monitoring and analytics"
echo ""

# Get deployment URL
DEPLOYMENT_URL=$(vercel ls --scope=team | grep cortexbuild | head -1 | awk '{print $2}')
if [ ! -z "$DEPLOYMENT_URL" ]; then
    echo "🌐 Deployment URL: https://$DEPLOYMENT_URL"
fi
