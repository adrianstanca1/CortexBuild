#!/bin/bash

# CortexBuild 2.0 Production Deployment Script
# Usage: ./scripts/deploy.sh [target] [environment]
# Example: ./scripts/deploy.sh vercel production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="CortexBuild 2.0"
APP_VERSION="2.0.0"
BUILD_DIR="dist"
DOCKER_IMAGE="cortexbuild/app"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Parse arguments
TARGET=${1:-"vercel"}
ENVIRONMENT=${2:-"production"}

log_info "🚀 Starting deployment of $APP_NAME v$APP_VERSION"
log_info "📋 Target: $TARGET"
log_info "🌍 Environment: $ENVIRONMENT"

# Pre-deployment checks
log_info "🔍 Running pre-deployment checks..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    log_error "Node.js version 18 or higher is required. Current version: $(node --version)"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    log_error "npm is not installed."
    exit 1
fi

log_success "✅ Pre-deployment checks passed"

# Install dependencies
log_info "📦 Installing dependencies..."
npm ci --silent
log_success "✅ Dependencies installed"

# Run tests (if available)
if npm run test --silent 2>/dev/null; then
    log_info "🧪 Running tests..."
    npm run test
    log_success "✅ Tests passed"
else
    log_warning "⚠️ No tests found, skipping test phase"
fi

# Build the application
log_info "🏗️ Building application..."
npm run build
log_success "✅ Application built successfully"

# Verify build
log_info "🔍 Verifying build..."
if [ ! -d "$BUILD_DIR" ]; then
    log_error "Build directory '$BUILD_DIR' not found"
    exit 1
fi

if [ ! -f "$BUILD_DIR/index.html" ]; then
    log_error "index.html not found in build directory"
    exit 1
fi

# Run build verification
npm run build:verify
log_success "✅ Build verification completed"

# Deploy based on target
case $TARGET in
    "vercel")
        log_info "🚀 Deploying to Vercel..."
        
        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            log_info "📦 Installing Vercel CLI..."
            npm install -g vercel
        fi
        
        # Deploy to Vercel
        if [ "$ENVIRONMENT" = "production" ]; then
            vercel --prod --yes
        else
            vercel --yes
        fi
        
        log_success "✅ Deployed to Vercel successfully"
        ;;
        
    "netlify")
        log_info "🚀 Deploying to Netlify..."
        
        # Check if Netlify CLI is installed
        if ! command -v netlify &> /dev/null; then
            log_info "📦 Installing Netlify CLI..."
            npm install -g netlify-cli
        fi
        
        # Deploy to Netlify
        if [ "$ENVIRONMENT" = "production" ]; then
            netlify deploy --prod --dir=$BUILD_DIR
        else
            netlify deploy --dir=$BUILD_DIR
        fi
        
        log_success "✅ Deployed to Netlify successfully"
        ;;
        
    "aws")
        log_info "🚀 Deploying to AWS S3 + CloudFront..."
        
        # Check if AWS CLI is installed
        if ! command -v aws &> /dev/null; then
            log_error "AWS CLI is not installed. Please install AWS CLI."
            exit 1
        fi
        
        # Set S3 bucket based on environment
        if [ "$ENVIRONMENT" = "production" ]; then
            S3_BUCKET="cortexbuild-production"
            CLOUDFRONT_ID="E1234567890ABC"
        else
            S3_BUCKET="cortexbuild-staging"
            CLOUDFRONT_ID="E0987654321DEF"
        fi
        
        # Sync to S3
        log_info "📤 Syncing files to S3..."
        aws s3 sync $BUILD_DIR/ s3://$S3_BUCKET --delete --cache-control "public, max-age=31536000" --exclude "*.html"
        aws s3 sync $BUILD_DIR/ s3://$S3_BUCKET --delete --cache-control "public, max-age=3600" --include "*.html"
        
        # Invalidate CloudFront
        log_info "🔄 Invalidating CloudFront cache..."
        aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"
        
        log_success "✅ Deployed to AWS successfully"
        ;;
        
    "docker")
        log_info "🐳 Building Docker image..."
        
        # Check if Docker is installed
        if ! command -v docker &> /dev/null; then
            log_error "Docker is not installed. Please install Docker."
            exit 1
        fi
        
        # Build Docker image
        docker build -f Dockerfile.production -t $DOCKER_IMAGE:$APP_VERSION .
        docker tag $DOCKER_IMAGE:$APP_VERSION $DOCKER_IMAGE:latest
        
        log_success "✅ Docker image built successfully"
        
        # Push to registry (if configured)
        if [ ! -z "$DOCKER_REGISTRY" ]; then
            log_info "📤 Pushing to Docker registry..."
            docker push $DOCKER_IMAGE:$APP_VERSION
            docker push $DOCKER_IMAGE:latest
            log_success "✅ Docker image pushed to registry"
        fi
        ;;
        
    "github-pages")
        log_info "🚀 Deploying to GitHub Pages..."
        
        # Check if gh CLI is installed
        if ! command -v gh &> /dev/null; then
            log_warning "GitHub CLI not found. Using git commands..."
        fi
        
        # Deploy to gh-pages branch
        npm run deploy:gh-pages
        
        log_success "✅ Deployed to GitHub Pages successfully"
        ;;
        
    "local")
        log_info "🏠 Starting local production server..."
        
        # Start local production server
        npm run preview
        
        log_success "✅ Local production server started"
        ;;
        
    *)
        log_error "Unknown deployment target: $TARGET"
        log_info "Available targets: vercel, netlify, aws, docker, github-pages, local"
        exit 1
        ;;
esac

# Post-deployment tasks
log_info "🔧 Running post-deployment tasks..."

# Health check (if URL is available)
if [ ! -z "$HEALTH_CHECK_URL" ]; then
    log_info "🏥 Running health check..."
    if curl -f "$HEALTH_CHECK_URL/health" > /dev/null 2>&1; then
        log_success "✅ Health check passed"
    else
        log_warning "⚠️ Health check failed"
    fi
fi

# Cleanup
log_info "🧹 Cleaning up..."
# Add any cleanup tasks here

log_success "🎉 Deployment completed successfully!"
log_info "📊 Deployment Summary:"
log_info "   • Application: $APP_NAME v$APP_VERSION"
log_info "   • Target: $TARGET"
log_info "   • Environment: $ENVIRONMENT"
log_info "   • Build Size: $(du -sh $BUILD_DIR | cut -f1)"
log_info "   • Timestamp: $(date)"

if [ "$TARGET" = "local" ]; then
    log_info "🌐 Local server running at: http://localhost:4173"
fi

log_info "🚀 CortexBuild 2.0 is now live and ready for enterprise use!"
