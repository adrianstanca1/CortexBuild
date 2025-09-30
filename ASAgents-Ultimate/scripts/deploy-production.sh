#!/bin/bash

# ASAgents Platform - Production Deployment Script
# This script handles the complete production deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOYMENT_ENV="production"
PROJECT_NAME="asagents-platform"
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
LOG_FILE="./logs/deployment_$(date +%Y%m%d_%H%M%S).log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    mkdir -p logs backups uploads secrets monitoring/grafana/{dashboards,datasources} nginx/{ssl,logs}
    success "Directories created"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    # Check if required files exist
    if [ ! -f ".env.production" ]; then
        error "Production environment file (.env.production) not found"
    fi
    
    if [ ! -f "docker-compose.production.yml" ]; then
        error "Production Docker Compose file not found"
    fi
    
    success "Prerequisites check passed"
}

# Setup secrets
setup_secrets() {
    log "Setting up secrets..."
    
    if [ ! -d "secrets" ]; then
        mkdir -p secrets
    fi
    
    # Generate secrets if they don't exist
    if [ ! -f "secrets/db_password.txt" ]; then
        openssl rand -base64 32 > secrets/db_password.txt
        log "Generated database password"
    fi
    
    if [ ! -f "secrets/mysql_root_password.txt" ]; then
        openssl rand -base64 32 > secrets/mysql_root_password.txt
        log "Generated MySQL root password"
    fi
    
    if [ ! -f "secrets/jwt_secret.txt" ]; then
        openssl rand -base64 64 > secrets/jwt_secret.txt
        log "Generated JWT secret"
    fi
    
    if [ ! -f "secrets/grafana_password.txt" ]; then
        openssl rand -base64 16 > secrets/grafana_password.txt
        log "Generated Grafana password"
    fi
    
    # Set proper permissions
    chmod 600 secrets/*
    success "Secrets setup completed"
}

# Build application
build_application() {
    log "Building application..."
    
    # Install dependencies
    log "Installing frontend dependencies..."
    npm ci --production
    
    # Build frontend
    log "Building frontend for production..."
    npm run build:production
    
    # Install server dependencies
    log "Installing server dependencies..."
    cd server
    npm ci --production
    cd ..
    
    success "Application build completed"
}

# Database migration
run_migrations() {
    log "Running database migrations..."
    
    # Start database service first
    docker-compose -f docker-compose.production.yml up -d database
    
    # Wait for database to be ready
    log "Waiting for database to be ready..."
    sleep 30
    
    # Run migrations
    cd server
    npm run migrate:production
    cd ..
    
    success "Database migrations completed"
}

# Create backup
create_backup() {
    log "Creating backup before deployment..."
    
    if [ -d "$BACKUP_DIR" ]; then
        rm -rf "$BACKUP_DIR"
    fi
    mkdir -p "$BACKUP_DIR"
    
    # Backup database if it exists
    if docker ps | grep -q "${PROJECT_NAME}_database"; then
        log "Backing up database..."
        docker exec "${PROJECT_NAME}_database_1" mysqldump -u root -p$(cat secrets/mysql_root_password.txt) asagents_production > "$BACKUP_DIR/database.sql"
    fi
    
    # Backup uploads
    if [ -d "uploads" ]; then
        log "Backing up uploads..."
        cp -r uploads "$BACKUP_DIR/"
    fi
    
    # Backup configuration
    log "Backing up configuration..."
    cp .env.production "$BACKUP_DIR/"
    cp docker-compose.production.yml "$BACKUP_DIR/"
    
    success "Backup created at $BACKUP_DIR"
}

# Deploy application
deploy_application() {
    log "Deploying application..."
    
    # Pull latest images
    log "Pulling latest Docker images..."
    docker-compose -f docker-compose.production.yml pull
    
    # Stop existing services
    log "Stopping existing services..."
    docker-compose -f docker-compose.production.yml down
    
    # Start services
    log "Starting services..."
    docker-compose -f docker-compose.production.yml up -d
    
    success "Application deployed"
}

# Health check
health_check() {
    log "Performing health checks..."
    
    # Wait for services to start
    sleep 60
    
    # Check frontend
    if curl -f http://localhost:80/health &> /dev/null; then
        success "Frontend health check passed"
    else
        warning "Frontend health check failed"
    fi
    
    # Check backend
    if curl -f http://localhost:3001/api/health &> /dev/null; then
        success "Backend health check passed"
    else
        warning "Backend health check failed"
    fi
    
    # Check database
    if docker exec "${PROJECT_NAME}_database_1" mysqladmin ping -h localhost &> /dev/null; then
        success "Database health check passed"
    else
        warning "Database health check failed"
    fi
    
    # Check Redis
    if docker exec "${PROJECT_NAME}_redis_1" redis-cli ping &> /dev/null; then
        success "Redis health check passed"
    else
        warning "Redis health check failed"
    fi
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Create Prometheus configuration
    cat > monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'asagents-backend'
    static_configs:
      - targets: ['backend:3001']
    metrics_path: '/metrics'
    
  - job_name: 'asagents-frontend'
    static_configs:
      - targets: ['frontend:80']
    metrics_path: '/metrics'
    
  - job_name: 'mysql'
    static_configs:
      - targets: ['database:3306']
    
  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
EOF
    
    success "Monitoring setup completed"
}

# Setup SSL certificates
setup_ssl() {
    log "Setting up SSL certificates..."
    
    if [ ! -f "nginx/ssl/server.crt" ] || [ ! -f "nginx/ssl/server.key" ]; then
        log "Generating self-signed SSL certificate..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/server.key \
            -out nginx/ssl/server.crt \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        
        warning "Self-signed certificate generated. Replace with proper SSL certificate for production."
    fi
    
    success "SSL setup completed"
}

# Cleanup old resources
cleanup() {
    log "Cleaning up old resources..."
    
    # Remove unused Docker images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    # Remove old backups (keep last 7 days)
    find backups -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true
    
    # Remove old logs (keep last 30 days)
    find logs -type f -mtime +30 -delete 2>/dev/null || true
    
    success "Cleanup completed"
}

# Main deployment process
main() {
    log "Starting production deployment for $PROJECT_NAME"
    
    # Check if running as root (not recommended)
    if [ "$EUID" -eq 0 ]; then
        warning "Running as root is not recommended for production deployments"
    fi
    
    create_directories
    check_prerequisites
    setup_secrets
    setup_ssl
    setup_monitoring
    create_backup
    build_application
    run_migrations
    deploy_application
    health_check
    cleanup
    
    success "Production deployment completed successfully!"
    
    log "Deployment Summary:"
    log "- Environment: $DEPLOYMENT_ENV"
    log "- Backup Location: $BACKUP_DIR"
    log "- Log File: $LOG_FILE"
    log "- Frontend URL: http://localhost:80"
    log "- Backend URL: http://localhost:3001"
    log "- Grafana URL: http://localhost:3000"
    log "- Prometheus URL: http://localhost:9090"
    log "- Kibana URL: http://localhost:5601"
    
    log "Important: Update DNS records to point to this server"
    log "Important: Replace self-signed SSL certificates with proper certificates"
    log "Important: Configure firewall rules for production"
    log "Important: Set up automated backups"
    log "Important: Configure monitoring alerts"
}

# Handle script interruption
trap 'error "Deployment interrupted"' INT TERM

# Run main function
main "$@"
