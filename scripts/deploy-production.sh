#!/bin/bash

# CortexBuild Production Deployment Script
# ========================================

set -e  # Exit on any error

echo "🚀 CortexBuild Production Deployment"
echo "===================================="

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

# Check for required environment variables
print_status "Checking environment configuration..."
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found. Please create it with your production settings."
    exit 1
fi

# Load production environment
export $(grep -v '^#' .env.production | xargs)
print_success "Production environment loaded"

# Verify Node.js version
NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf dist/
rm -rf build/
rm -rf .vite/
print_success "Previous builds cleaned"

# Install production dependencies
print_status "Installing production dependencies..."
npm ci --only=production --silent
print_success "Dependencies installed"

# Run pre-deployment checks
print_status "Running pre-deployment checks..."

# Type checking
print_status "Running TypeScript type checking..."
if npm run type-check 2>/dev/null; then
    print_success "Type checking passed"
else
    print_warning "Type checking failed, but continuing with deployment"
fi

# Linting
print_status "Running ESLint..."
if npm run lint 2>/dev/null; then
    print_success "Linting passed"
else
    print_warning "Linting failed, but continuing with deployment"
fi

# Build frontend
print_status "Building frontend (Vite)..."
NODE_ENV=production npm run build
print_success "Frontend build completed"

# Build backend
print_status "Building backend..."
npx tsc --project server/tsconfig.json --outDir dist/server --skipLibCheck
print_success "Backend build completed"

# Copy production files
print_status "Copying production files..."
cp package.json dist/
cp package-lock.json dist/
cp .env.production dist/.env
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
    start: 'NODE_ENV=production node server/index.js',
    'start:prod': 'NODE_ENV=production node server/index.js'
  },
  dependencies: {
    'express': pkg.dependencies.express,
    'cors': pkg.dependencies.cors,
    'ws': pkg.dependencies.ws,
    '@supabase/supabase-js': pkg.dependencies['@supabase/supabase-js'],
    'uuid': pkg.dependencies.uuid,
    'bcryptjs': pkg.dependencies.bcryptjs,
    'jsonwebtoken': pkg.dependencies.jsonwebtoken,
    'helmet': pkg.dependencies.helmet,
    'compression': pkg.dependencies.compression,
    'dotenv': pkg.dependencies.dotenv
  }
};
require('fs').writeFileSync('dist/package.json', JSON.stringify(prodPkg, null, 2));
"
print_success "Production package.json created"

# Create PM2 ecosystem file
print_status "Creating PM2 ecosystem file..."
cat > dist/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'cortexbuild-api',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/cortexbuild/error.log',
    out_file: '/var/log/cortexbuild/out.log',
    log_file: '/var/log/cortexbuild/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF
print_success "PM2 ecosystem file created"

# Create nginx configuration
print_status "Creating nginx configuration..."
mkdir -p dist/nginx
cat > dist/nginx/cortexbuild.conf << 'EOF'
server {
    listen 80;
    server_name cortexbuild.com www.cortexbuild.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name cortexbuild.com www.cortexbuild.com;

    ssl_certificate /etc/ssl/certs/cortexbuild.crt;
    ssl_certificate_key /etc/ssl/private/cortexbuild.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    root /var/www/cortexbuild;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # API proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket proxy
    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location / {
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Assets with cache busting
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
print_success "Nginx configuration created"

# Calculate build sizes
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
echo "1. Upload the 'dist/' directory to your production server"
echo "2. Install PM2: npm install -g pm2"
echo "3. Start the application: pm2 start dist/ecosystem.config.js"
echo "4. Configure nginx with the provided configuration"
echo "5. Set up SSL certificates"
echo "6. Configure your domain DNS"
echo ""
