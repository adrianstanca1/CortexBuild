# ASAgents Platform - Production Deployment Guide

This guide provides comprehensive instructions for deploying the ASAgents Platform to a production environment.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/asagents-platform.git
cd asagents-platform

# Run the production deployment script
./scripts/deploy-production.sh
```

## 📋 Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+ / RHEL 8+
- **CPU**: 4+ cores
- **RAM**: 8GB+ (16GB recommended)
- **Storage**: 100GB+ SSD
- **Network**: Static IP address, ports 80/443 open

### Software Dependencies
- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+ (for build process)
- OpenSSL (for certificate generation)
- Git

### Installation Commands
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y docker.io docker-compose nodejs npm git openssl

# CentOS/RHEL
sudo yum install -y docker docker-compose nodejs npm git openssl

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker
```

## 🔧 Configuration

### 1. Environment Variables

Copy and customize the production environment file:
```bash
cp .env.production.example .env.production
```

**Critical Variables to Update:**
```bash
# Database
DB_HOST=your-production-db-host
DB_PASSWORD=your-secure-password

# Security
JWT_SECRET=your-super-secure-jwt-secret
SESSION_SECRET=your-session-secret

# Email
SMTP_HOST=your-smtp-host
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password

# Cloud Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-s3-bucket

# Monitoring
SENTRY_DSN=your-sentry-dsn
SLACK_WEBHOOK_URL=your-slack-webhook
```

### 2. SSL Certificates

**Option A: Let's Encrypt (Recommended)**
```bash
# Install Certbot
sudo apt install certbot

# Generate certificates
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/server.crt
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/server.key
```

**Option B: Self-Signed (Development Only)**
```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/server.key \
  -out nginx/ssl/server.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=yourdomain.com"
```

### 3. Secrets Management

Create secure secrets:
```bash
mkdir -p secrets

# Generate strong passwords
openssl rand -base64 32 > secrets/db_password.txt
openssl rand -base64 32 > secrets/mysql_root_password.txt
openssl rand -base64 64 > secrets/jwt_secret.txt
openssl rand -base64 16 > secrets/grafana_password.txt

# Set proper permissions
chmod 600 secrets/*
```

## 🏗️ Deployment Process

### 1. Automated Deployment
```bash
# Run the complete deployment script
./scripts/deploy-production.sh
```

### 2. Manual Deployment Steps

If you prefer manual control:

```bash
# 1. Build the application
npm ci --production
npm run build:production

# 2. Build Docker images
docker-compose -f docker-compose.production.yml build

# 3. Start services
docker-compose -f docker-compose.production.yml up -d

# 4. Run database migrations
cd server && npm run migrate:production && cd ..

# 5. Verify deployment
./monitoring/health-check.js
```

## 📊 Monitoring & Observability

### Service URLs
- **Application**: https://yourdomain.com
- **API**: https://yourdomain.com/api
- **Grafana**: http://yourdomain.com:3000
- **Prometheus**: http://yourdomain.com:9090
- **Kibana**: http://yourdomain.com:5601

### Health Checks
```bash
# Manual health check
./monitoring/health-check.js

# Automated monitoring (add to crontab)
*/5 * * * * /path/to/asagents-platform/monitoring/health-check.js
```

### Log Locations
- **Application Logs**: `./logs/`
- **Nginx Logs**: `./nginx/logs/`
- **Docker Logs**: `docker-compose logs [service]`

## 🔒 Security Checklist

### Pre-Deployment
- [ ] Update all default passwords
- [ ] Configure firewall rules
- [ ] Set up SSL certificates
- [ ] Enable security headers
- [ ] Configure rate limiting
- [ ] Set up IP whitelisting (if needed)

### Post-Deployment
- [ ] Run security scan
- [ ] Test authentication flows
- [ ] Verify HTTPS redirects
- [ ] Check CORS configuration
- [ ] Test rate limiting
- [ ] Verify backup processes

### Firewall Configuration
```bash
# Ubuntu UFW
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# CentOS/RHEL Firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 💾 Backup & Recovery

### Automated Backups
Backups are automatically created daily at 2 AM UTC:
- **Database**: Full MySQL dump
- **Files**: Application uploads and configuration
- **Storage**: AWS S3 (configurable)

### Manual Backup
```bash
# Create immediate backup
docker exec asagents-platform_backup_1 /app/backup.sh

# Restore from backup
docker exec asagents-platform_backup_1 /app/restore.sh backup-file.tar.gz
```

### Backup Verification
```bash
# List available backups
aws s3 ls s3://your-backup-bucket/

# Download backup
aws s3 cp s3://your-backup-bucket/backup-20240101.tar.gz ./
```

## 🔄 Updates & Maintenance

### Application Updates
```bash
# 1. Create backup
./scripts/backup.sh

# 2. Pull latest code
git pull origin main

# 3. Rebuild and deploy
./scripts/deploy-production.sh

# 4. Verify deployment
./monitoring/health-check.js
```

### Database Migrations
```bash
# Run pending migrations
cd server
npm run migrate:production
cd ..
```

### Certificate Renewal
```bash
# Renew Let's Encrypt certificates
sudo certbot renew

# Restart nginx to load new certificates
docker-compose -f docker-compose.production.yml restart nginx
```

## 🚨 Troubleshooting

### Common Issues

**Service Won't Start**
```bash
# Check service logs
docker-compose -f docker-compose.production.yml logs [service-name]

# Check system resources
df -h
free -h
docker system df
```

**Database Connection Issues**
```bash
# Check database status
docker exec asagents-platform_database_1 mysqladmin ping

# Check database logs
docker-compose -f docker-compose.production.yml logs database
```

**SSL Certificate Issues**
```bash
# Verify certificate
openssl x509 -in nginx/ssl/server.crt -text -noout

# Test SSL connection
openssl s_client -connect yourdomain.com:443
```

### Performance Issues
```bash
# Monitor resource usage
docker stats

# Check application metrics
curl http://localhost:9090/metrics

# Analyze slow queries
docker exec asagents-platform_database_1 mysql -e "SHOW PROCESSLIST;"
```

## 📞 Support

### Emergency Contacts
- **System Administrator**: admin@yourdomain.com
- **Development Team**: dev@yourdomain.com
- **On-Call**: +1-555-0123

### Monitoring Alerts
- **Slack**: #alerts channel
- **Email**: alerts@yourdomain.com
- **PagerDuty**: (if configured)

### Documentation
- **API Documentation**: https://yourdomain.com/api/docs
- **User Guide**: https://docs.yourdomain.com
- **Admin Guide**: https://admin.yourdomain.com

## 📝 Maintenance Schedule

### Daily
- Automated backups
- Health checks
- Log rotation

### Weekly
- Security updates
- Performance review
- Backup verification

### Monthly
- Certificate renewal check
- Capacity planning review
- Security audit

### Quarterly
- Full system update
- Disaster recovery test
- Performance optimization

---

## 🎯 Next Steps

After successful deployment:

1. **Configure DNS** to point to your server
2. **Set up monitoring alerts** in Grafana
3. **Configure automated backups** to cloud storage
4. **Set up CI/CD pipeline** for automated deployments
5. **Implement log aggregation** with ELK stack
6. **Configure CDN** for static assets
7. **Set up load balancing** for high availability

For additional support, please refer to the [Technical Documentation](./docs/) or contact the development team.
