# 🚀 ASAgents Platform - Production Deployment Guide

## Overview

This guide covers the production deployment of the ASAgents Platform with the Express + SQLite backend architecture.

## 🏗️ Architecture

- **Frontend**: React + TypeScript (served via Nginx)
- **Backend**: Express.js + TypeScript + SQLite
- **Database**: SQLite (file-based, persistent storage)
- **Reverse Proxy**: Nginx with SSL termination
- **Process Management**: PM2 or Docker Compose
- **Monitoring**: Prometheus + Grafana (optional)
- **Backup**: Automated SQLite backups

## 📋 Prerequisites

### System Requirements
- **OS**: Linux (Ubuntu 20.04+ recommended)
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: Minimum 20GB, Recommended 50GB+
- **CPU**: 2+ cores recommended

### Software Requirements
- Docker & Docker Compose
- Node.js 18+ (if using PM2)
- Nginx (if not using Docker)
- SSL certificates (Let's Encrypt recommended)

## 🚀 Deployment Options

### Option 1: Docker Compose (Recommended)

#### 1. Prepare Environment
```bash
# Clone repository
git clone https://github.com/adrianstanca1/final.git
cd final

# Copy and configure environment files
cp .env.production.example .env.production
cp backend/.env.production.example backend/.env.production

# Edit environment files with your domain and secrets
nano .env.production
nano backend/.env.production
```

#### 2. Configure Secrets
```bash
# Create secrets directory
mkdir -p secrets

# Generate JWT secret
openssl rand -base64 64 > secrets/jwt_secret.txt

# Generate Grafana password (if using monitoring)
openssl rand -base64 16 > secrets/grafana_password.txt

# Set proper permissions
chmod 600 secrets/*
```

#### 3. SSL Certificates
```bash
# For production, use Let's Encrypt
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com

# Copy certificates to nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/server.crt
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/server.key

# Or generate self-signed for testing
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/server.key \
    -out nginx/ssl/server.crt \
    -subj "/C=US/ST=State/L=City/O=ASAgents/CN=yourdomain.com"
```

#### 4. Deploy
```bash
# Run the deployment script
./scripts/deploy-sqlite-production.sh

# Or manually with Docker Compose
docker-compose -f docker-compose.sqlite.yml up -d
```

### Option 2: PM2 Process Manager

#### 1. Install Dependencies
```bash
# Install Node.js and PM2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# Install application dependencies
npm ci --production
cd backend && npm ci --production && cd ..
```

#### 2. Build Application
```bash
# Build frontend
npm run build

# Setup database
cd backend
npm run db:migrate
npm run db:seed
cd ..
```

#### 3. Start with PM2
```bash
# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env.production)
```env
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com/ws
VITE_APP_NAME=ASAgents Platform
```

#### Backend (backend/.env.production)
```env
NODE_ENV=production
PORT=5001
DATABASE_PATH=/app/data/database.sqlite
JWT_SECRET=your-super-secure-jwt-secret
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

### Nginx Configuration

Update `nginx/nginx.production.conf` with your domain:
```nginx
server_name yourdomain.com www.yourdomain.com;
```

## 🔍 Health Checks

### Backend Health Check
```bash
curl http://localhost:5001/api/health
```

### Frontend Health Check
```bash
curl http://localhost:80/health
```

### Docker Services Status
```bash
docker-compose -f docker-compose.sqlite.yml ps
```

## 📊 Monitoring

### Access Monitoring Dashboards
- **Grafana**: http://yourdomain.com:3000
- **Prometheus**: http://yourdomain.com:9090

### Log Files
- **Backend**: `./logs/backend-*.log`
- **Frontend**: `./logs/frontend-*.log`
- **Nginx**: `./nginx/logs/`

## 💾 Backup & Recovery

### Automated Backups
Backups run automatically via Docker service:
- **Database**: Daily at 2:00 AM
- **Uploads**: Daily at 2:00 AM
- **Retention**: 30 days

### Manual Backup
```bash
# Backup database
sqlite3 backend/data/database.sqlite ".backup backups/manual_$(date +%Y%m%d_%H%M%S).sqlite"

# Backup uploads
tar -czf backups/uploads_$(date +%Y%m%d_%H%M%S).tar.gz uploads/
```

### Restore from Backup
```bash
# Stop services
docker-compose -f docker-compose.sqlite.yml down

# Restore database
cp backups/your-backup.sqlite backend/data/database.sqlite

# Restore uploads
tar -xzf backups/uploads_backup.tar.gz

# Start services
docker-compose -f docker-compose.sqlite.yml up -d
```

## 🔒 Security

### Firewall Configuration
```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### SSL Certificate Renewal
```bash
# Add to crontab for automatic renewal
0 12 * * * /usr/bin/certbot renew --quiet
```

### Security Headers
Nginx configuration includes:
- HSTS
- X-Frame-Options
- X-Content-Type-Options
- CSP headers

## 🚨 Troubleshooting

### Common Issues

#### Backend Not Starting
```bash
# Check logs
docker-compose -f docker-compose.sqlite.yml logs backend

# Check database permissions
ls -la backend/data/
```

#### Frontend Not Loading
```bash
# Check nginx logs
docker-compose -f docker-compose.sqlite.yml logs nginx

# Verify build files
ls -la dist/
```

#### Database Issues
```bash
# Check database file
sqlite3 backend/data/database.sqlite ".tables"

# Run migrations
cd backend && npm run db:migrate
```

### Performance Optimization

#### Database Optimization
```sql
-- Run in SQLite
PRAGMA optimize;
VACUUM;
ANALYZE;
```

#### Nginx Optimization
- Enable gzip compression
- Set proper cache headers
- Use HTTP/2

## 📈 Scaling

### Horizontal Scaling
- Use load balancer (HAProxy/Nginx)
- Multiple backend instances
- Shared file storage (NFS/S3)

### Database Scaling
- Consider PostgreSQL for high load
- Implement read replicas
- Database connection pooling

## 🔄 Updates & Maintenance

### Application Updates
```bash
# Pull latest code
git pull origin main

# Rebuild and deploy
./scripts/deploy-sqlite-production.sh
```

### System Maintenance
```bash
# Update system packages
sudo apt update && sudo apt upgrade

# Clean Docker resources
docker system prune -f

# Rotate logs
logrotate -f /etc/logrotate.conf
```

## 📞 Support

### Log Locations
- Application logs: `./logs/`
- Nginx logs: `./nginx/logs/`
- Docker logs: `docker-compose logs`

### Monitoring Alerts
Configure alerts for:
- High CPU/Memory usage
- Disk space low
- Service downtime
- Failed backups

---

## ✅ Deployment Checklist

- [ ] Environment files configured
- [ ] SSL certificates installed
- [ ] Secrets generated
- [ ] Database migrated and seeded
- [ ] Services started
- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] Backups scheduled
- [ ] Firewall configured
- [ ] DNS records updated

**🎉 Your ASAgents Platform is now ready for production!**
