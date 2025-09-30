#!/bin/bash

# ASAgents Platform - SQLite Production Deployment Script
# Optimized for Express + SQLite backend architecture

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
COMPOSE_FILE="docker-compose.sqlite.yml"

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
    mkdir -p logs backups uploads secrets nginx/{ssl,logs} backend/data monitoring/grafana/{dashboards,datasources}
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
    
    if [ ! -f "backend/.env.production" ]; then
        error "Backend production environment file (backend/.env.production) not found"
    fi
    
    if [ ! -f "$COMPOSE_FILE" ]; then
        error "Production Docker Compose file ($COMPOSE_FILE) not found"
    fi
    
    success "Prerequisites check passed"
}

# Setup secrets
setup_secrets() {
    log "Setting up secrets..."
    
    if [ ! -d "secrets" ]; then
        mkdir -p secrets
    fi
    
    # Generate JWT secret if it doesn't exist
    if [ ! -f "secrets/jwt_secret.txt" ]; then
        openssl rand -base64 64 > secrets/jwt_secret.txt
        log "Generated JWT secret"
    fi
    
    # Generate Grafana password if it doesn't exist
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
    
    # Install frontend dependencies
    log "Installing frontend dependencies..."
    npm ci --production
    
    # Build frontend
    log "Building frontend for production..."
    npm run build
    
    # Install backend dependencies
    log "Installing backend dependencies..."
    cd backend
    npm ci --production
    cd ..
    
    success "Application build completed"
}

# Setup database
setup_database() {
    log "Setting up SQLite database..."
    
    # Ensure database directory exists
    mkdir -p backend/data
    
    # Run database migrations
    cd backend
    if [ -f "database.sqlite" ]; then
        log "Backing up existing database..."
        cp database.sqlite data/database.backup.$(date +%Y%m%d_%H%M%S).sqlite
    fi
    
    # Run migrations and seed data
    npm run db:migrate
    npm run db:seed
    
    # Move database to data directory if needed
    if [ -f "database.sqlite" ] && [ ! -f "data/database.sqlite" ]; then
        mv database.sqlite data/database.sqlite
    fi
    
    cd ..
    success "Database setup completed"
}

# Create backup
create_backup() {
    log "Creating backup before deployment..."
    
    if [ -d "$BACKUP_DIR" ]; then
        rm -rf "$BACKUP_DIR"
    fi
    mkdir -p "$BACKUP_DIR"
    
    # Backup SQLite database if it exists
    if [ -f "backend/data/database.sqlite" ]; then
        log "Backing up SQLite database..."
        cp backend/data/database.sqlite "$BACKUP_DIR/"
    fi
    
    # Backup uploads
    if [ -d "uploads" ]; then
        log "Backing up uploads..."
        cp -r uploads "$BACKUP_DIR/"
    fi
    
    # Backup configuration
    log "Backing up configuration..."
    cp .env.production "$BACKUP_DIR/"
    cp backend/.env.production "$BACKUP_DIR/"
    cp $COMPOSE_FILE "$BACKUP_DIR/"
    
    success "Backup created at $BACKUP_DIR"
}

# Deploy application
deploy_application() {
    log "Deploying application..."
    
    # Stop existing services
    log "Stopping existing services..."
    docker-compose -f $COMPOSE_FILE down || true
    
    # Build and start services
    log "Building and starting services..."
    docker-compose -f $COMPOSE_FILE build
    docker-compose -f $COMPOSE_FILE up -d
    
    success "Application deployed"
}

# Health check
health_check() {
    log "Performing health checks..."
    
    # Wait for services to start
    sleep 60
    
    # Check backend
    if curl -f http://localhost:5001/api/health &> /dev/null; then
        success "Backend health check passed"
    else
        warning "Backend health check failed"
    fi
    
    # Check frontend (through nginx)
    if curl -f http://localhost:80/health &> /dev/null; then
        success "Frontend health check passed"
    else
        warning "Frontend health check failed"
    fi
    
    # Check if containers are running
    if docker-compose -f $COMPOSE_FILE ps | grep -q "Up"; then
        success "Docker containers are running"
    else
        warning "Some Docker containers may not be running properly"
    fi
}

# Setup SSL certificates
setup_ssl() {
    log "Setting up SSL certificates..."
    
    if [ ! -f "nginx/ssl/server.crt" ] || [ ! -f "nginx/ssl/server.key" ]; then
        log "Generating self-signed SSL certificate..."
        mkdir -p nginx/ssl
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/server.key \
            -out nginx/ssl/server.crt \
            -subj "/C=US/ST=State/L=City/O=ASAgents/CN=localhost"
        
        warning "Self-signed certificate generated. Replace with proper SSL certificate for production."
    fi
    
    success "SSL setup completed"
}

# Setup monitoring (optional)
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Create Prometheus configuration
    mkdir -p monitoring
    cat > monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'asagents-backend'
    static_configs:
      - targets: ['backend:5001']
    metrics_path: '/api/health'
    
  - job_name: 'asagents-frontend'
    static_configs:
      - targets: ['frontend:80']
EOF
    
    success "Monitoring setup completed"
}

# Cleanup old resources
cleanup() {
    log "Cleaning up old resources..."
    
    # Remove unused Docker images
    docker image prune -f
    
    # Remove old backups (keep last 7 days)
    find backups -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true
    
    # Remove old logs (keep last 30 days)
    find logs -type f -mtime +30 -delete 2>/dev/null || true
    
    success "Cleanup completed"
}

# Main deployment process
main() {
    log "Starting SQLite production deployment for $PROJECT_NAME"
    
    create_directories
    check_prerequisites
    setup_secrets
    setup_ssl
    setup_monitoring
    create_backup
    build_application
    setup_database
    deploy_application
    health_check
    cleanup
    
    success "Production deployment completed successfully!"
    
    log "Deployment Summary:"
    log "- Environment: $DEPLOYMENT_ENV"
    log "- Architecture: Express + SQLite"
    log "- Backup Location: $BACKUP_DIR"
    log "- Log File: $LOG_FILE"
    log "- Frontend URL: http://localhost:80"
    log "- Backend URL: http://localhost:5001"
    log "- Backend Health: http://localhost:5001/api/health"
    
    if docker-compose -f $COMPOSE_FILE ps | grep -q "grafana"; then
        log "- Grafana URL: http://localhost:3000"
        log "- Prometheus URL: http://localhost:9090"
    fi
    
    log ""
    log "Next Steps:"
    log "1. Update DNS records to point to this server"
    log "2. Replace self-signed SSL certificates with proper certificates"
    log "3. Configure firewall rules for production"
    log "4. Set up automated backups"
    log "5. Configure monitoring alerts"
    log "6. Test all functionality"
}

# Handle script interruption
trap 'error "Deployment interrupted"' INT TERM

# Run main function
main "$@"
