#!/bin/bash

# Deployment script for CortexBuild with parallel processing support
# This script handles deployment with PM2 worker processes

set -e

echo "🚀 Starting CortexBuild deployment with parallel processing..."

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 is not installed. Installing..."
    npm install -g pm2
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run database migrations
echo "🗄️ Running database migrations..."
if [ -f "server/migrations/add_parallel_processing.sql" ]; then
    echo "Applying parallel processing migration..."
    # Note: You'll need to run this manually or integrate with your migration system
    echo "⚠️ Please run: sqlite3 cortexbuild.db < server/migrations/add_parallel_processing.sql"
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Stop existing PM2 processes
echo "🛑 Stopping existing processes..."
pm2 delete all || true

# Start processes with PM2
echo "▶️ Starting processes with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Show status
echo "📊 PM2 Status:"
pm2 list

# Show logs
echo "📝 Recent logs:"
pm2 logs --lines 20

echo "✅ Deployment completed successfully!"
echo ""
echo "Available commands:"
echo "  pm2 list              - Show process status"
echo "  pm2 logs              - Show logs"
echo "  pm2 monit             - Monitor processes"
echo "  pm2 restart all       - Restart all processes"
echo "  pm2 stop all          - Stop all processes"