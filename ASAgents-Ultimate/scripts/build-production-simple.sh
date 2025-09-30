#!/bin/bash

# ASAgents Platform - Simple Production Build Script
# This script creates a production build focusing on the working backend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log "Starting simple production build..."

# Create necessary directories
log "Creating directories..."
mkdir -p dist logs backups uploads backend/data

# Build backend first
log "Building backend..."
cd backend

# Install backend dependencies
log "Installing backend dependencies..."
npm ci --production

# Setup database
log "Setting up database..."
if [ ! -f "data/database.sqlite" ]; then
    npm run db:migrate
    npm run db:seed
    success "Database initialized"
else
    log "Database already exists"
fi

cd ..

# Create a simple static frontend build
log "Creating simple frontend build..."
mkdir -p dist

# Create a simple index.html for production
cat > dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ASAgents Platform - Production</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            text-align: center;
            max-width: 600px;
        }
        .logo {
            font-size: 2.5em;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 20px;
        }
        .status {
            display: inline-block;
            padding: 8px 16px;
            background: #10b981;
            color: white;
            border-radius: 20px;
            font-size: 0.9em;
            margin: 10px 0;
        }
        .info {
            margin: 20px 0;
            color: #666;
        }
        .api-link {
            display: inline-block;
            padding: 12px 24px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px;
            transition: background 0.3s;
        }
        .api-link:hover {
            background: #5a67d8;
        }
        .features {
            text-align: left;
            margin: 30px 0;
        }
        .features h3 {
            color: #333;
            margin-bottom: 15px;
        }
        .features ul {
            list-style: none;
            padding: 0;
        }
        .features li {
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .features li:before {
            content: "✓ ";
            color: #10b981;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🏗️ ASAgents Platform</div>
        <div class="status">Production Ready</div>
        
        <div class="info">
            <p>Welcome to the ASAgents Construction Management Platform</p>
            <p>Your Express + SQLite backend is running and ready for production use.</p>
        </div>

        <div class="features">
            <h3>Available Services:</h3>
            <ul>
                <li>Express.js REST API Backend</li>
                <li>SQLite Database with Sample Data</li>
                <li>JWT Authentication System</li>
                <li>Real-time WebSocket Communication</li>
                <li>Project Management APIs</li>
                <li>Invoice Management System</li>
                <li>User Management & Authentication</li>
                <li>Health Monitoring & Status Checks</li>
            </ul>
        </div>

        <div>
            <a href="/api/health" class="api-link" target="_blank">Health Check</a>
            <a href="/api/projects" class="api-link" target="_blank">Projects API</a>
            <a href="/api/invoices" class="api-link" target="_blank">Invoices API</a>
        </div>

        <div class="info">
            <p><strong>Backend URL:</strong> <code id="backend-url">http://localhost:5001</code></p>
            <p><strong>WebSocket:</strong> <code id="ws-url">ws://localhost:5001/ws</code></p>
        </div>

        <script>
            // Update URLs based on current location
            const protocol = window.location.protocol;
            const host = window.location.host;
            const backendUrl = protocol + '//' + host.replace(':80', ':5001').replace(':443', ':5001');
            const wsUrl = (protocol === 'https:' ? 'wss:' : 'ws:') + '//' + host.replace(':80', ':5001').replace(':443', ':5001') + '/ws';
            
            document.getElementById('backend-url').textContent = backendUrl;
            document.getElementById('ws-url').textContent = wsUrl;

            // Test backend connectivity
            fetch(backendUrl + '/api/health')
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'healthy') {
                        document.querySelector('.status').style.background = '#10b981';
                        document.querySelector('.status').textContent = 'Backend Connected ✓';
                    }
                })
                .catch(() => {
                    document.querySelector('.status').style.background = '#ef4444';
                    document.querySelector('.status').textContent = 'Backend Disconnected ✗';
                });
        </script>
    </div>
</body>
</html>
EOF

# Copy static assets
log "Copying static assets..."
if [ -d "public" ]; then
    cp -r public/* dist/ 2>/dev/null || true
fi

# Create health check endpoint for frontend
cat > dist/health << 'EOF'
healthy
EOF

success "Simple production build completed!"

log "Build Summary:"
log "- Backend: Express + SQLite ready"
log "- Frontend: Simple production page created"
log "- Database: SQLite with sample data"
log "- Static files: Copied to dist/"
log ""
log "To start production servers:"
log "1. Backend: cd backend && npm start"
log "2. Frontend: serve dist/ on port 80"
log ""
log "Production URLs:"
log "- Frontend: http://localhost:80"
log "- Backend: http://localhost:5001"
log "- Health: http://localhost:5001/api/health"
