#!/bin/bash

# CortexBuild Production Environment Setup Script
# ==============================================

set -e

echo "🔧 Setting up CortexBuild Production Environment"
echo "==============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. Consider using a non-root user for security."
fi

# Create necessary directories
print_status "Creating production directories..."
sudo mkdir -p /var/log/cortexbuild
sudo mkdir -p /var/www/cortexbuild
sudo mkdir -p /etc/nginx/sites-available
sudo mkdir -p /etc/nginx/sites-enabled
sudo mkdir -p /etc/ssl/certs
sudo mkdir -p /etc/ssl/private
print_success "Directories created"

# Set proper permissions
print_status "Setting directory permissions..."
sudo chown -R $USER:$USER /var/log/cortexbuild
sudo chmod 755 /var/log/cortexbuild
sudo chown -R www-data:www-data /var/www/cortexbuild
sudo chmod 755 /var/www/cortexbuild
print_success "Permissions set"

# Install Node.js (if not already installed)
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_success "Node.js installed"
else
    NODE_VERSION=$(node --version)
    print_status "Node.js already installed: $NODE_VERSION"
fi

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    sudo npm install -g pm2
    print_success "PM2 installed"
else
    print_status "PM2 already installed"
fi

# Install Nginx (if not already installed)
if ! command -v nginx &> /dev/null; then
    print_status "Installing Nginx..."
    sudo apt-get update
    sudo apt-get install -y nginx
    print_success "Nginx installed"
else
    print_status "Nginx already installed"
fi

# Install Certbot for SSL certificates
if ! command -v certbot &> /dev/null; then
    print_status "Installing Certbot for SSL..."
    sudo apt-get install -y certbot python3-certbot-nginx
    print_success "Certbot installed"
else
    print_status "Certbot already installed"
fi

# Create systemd service for PM2
print_status "Setting up PM2 systemd service..."
sudo pm2 startup systemd -u $USER --hp $HOME
print_success "PM2 systemd service configured"

# Create log rotation configuration
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/cortexbuild > /dev/null << 'EOF'
/var/log/cortexbuild/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 cortexbuild cortexbuild
    postrotate
        pm2 reload cortexbuild-api
    endscript
}
EOF
print_success "Log rotation configured"

# Create environment validation script
print_status "Creating environment validation script..."
cat > validate-env.js << 'EOF'
const fs = require('fs');
const path = require('path');

function validateEnvironment() {
    console.log('🔍 Validating production environment...');
    
    const envFile = '.env.production';
    if (!fs.existsSync(envFile)) {
        console.error('❌ .env.production file not found');
        process.exit(1);
    }
    
    const envContent = fs.readFileSync(envFile, 'utf8');
    const requiredVars = [
        'NODE_ENV',
        'PORT',
        'SUPABASE_URL',
        'SUPABASE_SERVICE_KEY',
        'VITE_SUPABASE_URL',
        'VITE_SUPABASE_ANON_KEY',
        'JWT_SECRET',
        'GEMINI_API_KEY'
    ];
    
    const missingVars = [];
    const placeholderVars = [];
    
    requiredVars.forEach(varName => {
        const regex = new RegExp(`^${varName}=(.*)$`, 'm');
        const match = envContent.match(regex);
        
        if (!match) {
            missingVars.push(varName);
        } else {
            const value = match[1].trim();
            if (value === '' || value.includes('your-') || value.includes('placeholder')) {
                placeholderVars.push(varName);
            }
        }
    });
    
    if (missingVars.length > 0) {
        console.error('❌ Missing environment variables:', missingVars.join(', '));
        process.exit(1);
    }
    
    if (placeholderVars.length > 0) {
        console.warn('⚠️  Placeholder values detected:', placeholderVars.join(', '));
        console.warn('   Please update these with actual production values');
    }
    
    console.log('✅ Environment validation passed');
}

validateEnvironment();
EOF

node validate-env.js
rm validate-env.js
print_success "Environment validation completed"

# Create deployment checklist
print_status "Creating deployment checklist..."
cat > deployment-checklist.md << 'EOF'
# CortexBuild Production Deployment Checklist

## Pre-Deployment
- [ ] Update .env.production with actual production values
- [ ] Replace placeholder API keys with real ones
- [ ] Configure domain DNS to point to server
- [ ] Ensure SSL certificates are ready

## Environment Variables to Update
- [ ] OPENAI_API_KEY (replace with production key)
- [ ] ANTHROPIC_API_KEY (replace with production key)
- [ ] JWT_SECRET (generate secure 32+ character string)
- [ ] ENCRYPTION_KEY (generate secure 32+ character string)
- [ ] STRIPE_* keys (if using payments)
- [ ] SMTP_* settings (for email notifications)

## Security
- [ ] Generate strong JWT_SECRET
- [ ] Configure firewall (UFW)
- [ ] Set up fail2ban
- [ ] Configure SSL/TLS certificates
- [ ] Review and update CORS settings

## Database
- [ ] Verify Supabase production database
- [ ] Run database migrations
- [ ] Set up database backups
- [ ] Configure connection pooling

## Monitoring
- [ ] Set up PM2 monitoring
- [ ] Configure log rotation
- [ ] Set up health checks
- [ ] Configure error tracking (Sentry)

## Performance
- [ ] Enable Nginx gzip compression
- [ ] Configure caching headers
- [ ] Set up CDN (if needed)
- [ ] Optimize database queries

## Final Steps
- [ ] Test all endpoints
- [ ] Verify WebSocket connections
- [ ] Test file uploads
- [ ] Verify AI features work
- [ ] Test authentication flow
- [ ] Check real-time features
EOF

print_success "Deployment checklist created"

echo ""
echo "🎉 Production environment setup completed!"
echo ""
echo "Next steps:"
echo "1. Review and update .env.production with your actual production values"
echo "2. Follow the deployment-checklist.md"
echo "3. Configure your domain DNS"
echo "4. Set up SSL certificates with: sudo certbot --nginx -d yourdomain.com"
echo "5. Deploy your application files"
echo ""
