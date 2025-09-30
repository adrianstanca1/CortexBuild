#!/bin/bash

# ASAgents Platform - Advanced Production Deployment Pipeline
# Enhanced deployment automation with CI/CD integration, health checks, and rollback capabilities

set -e  # Exit on any error
set -o pipefail  # Exit on pipe errors

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
DEPLOYMENT_ENV="${1:-production}"
FRONTEND_DIR="."
BACKEND_DIR="./server"
BUILD_DIR="./dist"
BACKUP_DIR="./backups"
LOG_DIR="./logs/deployment"
HEALTH_CHECK_TIMEOUT=300
ROLLBACK_ENABLED=true

# Create log directory
mkdir -p "$LOG_DIR"

# Logging function
log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case "$level" in
        INFO)
            echo -e "${BLUE}ℹ️  [$timestamp] $message${NC}" | tee -a "$LOG_DIR/deployment.log"
            ;;
        SUCCESS)
            echo -e "${GREEN}✅ [$timestamp] $message${NC}" | tee -a "$LOG_DIR/deployment.log"
            ;;
        WARNING)
            echo -e "${YELLOW}⚠️  [$timestamp] $message${NC}" | tee -a "$LOG_DIR/deployment.log"
            ;;
        ERROR)
            echo -e "${RED}❌ [$timestamp] $message${NC}" | tee -a "$LOG_DIR/deployment.log"
            ;;
        DEPLOY)
            echo -e "${PURPLE}🚀 [$timestamp] $message${NC}" | tee -a "$LOG_DIR/deployment.log"
            ;;
        HEALTH)
            echo -e "${CYAN}🔍 [$timestamp] $message${NC}" | tee -a "$LOG_DIR/deployment.log"
            ;;
    esac
}

# Deployment functions
check_prerequisites() {
    log "INFO" "Checking deployment prerequisites..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        log "ERROR" "Node.js is not installed"
        exit 1
    fi
    
    local node_version=$(node --version | sed 's/v//')
    log "INFO" "Node.js version: $node_version"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log "ERROR" "npm is not installed"
        exit 1
    fi
    
    # Check Git (for version tagging)
    if ! command -v git &> /dev/null; then
        log "WARNING" "Git not found - version tagging disabled"
    fi
    
    # Check Docker (if using containerized deployment)
    if command -v docker &> /dev/null; then
        log "INFO" "Docker available - containerized deployment possible"
    fi
    
    # Check environment files
    if [[ "$DEPLOYMENT_ENV" == "production" && ! -f ".env.production" ]]; then
        log "WARNING" "Production environment file not found"
    fi
    
    log "SUCCESS" "Prerequisites check completed"
}

create_backup() {
    log "INFO" "Creating deployment backup..."
    
    local backup_timestamp=$(date '+%Y%m%d_%H%M%S')
    local backup_name="deployment_backup_${backup_timestamp}"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    mkdir -p "$backup_path"
    
    # Backup current build (if exists)
    if [[ -d "$BUILD_DIR" ]]; then
        cp -r "$BUILD_DIR" "$backup_path/dist_backup"
        log "INFO" "Build directory backed up"
    fi
    
    # Backup environment files
    find . -name ".env*" -maxdepth 1 -exec cp {} "$backup_path/" \;
    
    # Backup package files
    cp package.json "$backup_path/"
    cp package-lock.json "$backup_path/" 2>/dev/null || true
    
    # Create backup info
    cat > "$backup_path/backup_info.txt" << EOF
Backup Created: $(date)
Environment: $DEPLOYMENT_ENV
Node Version: $(node --version)
NPM Version: $(npm --version)
Git Commit: $(git rev-parse HEAD 2>/dev/null || echo "Not available")
Git Branch: $(git branch --show-current 2>/dev/null || echo "Not available")
EOF
    
    echo "$backup_path" > "$LOG_DIR/latest_backup.txt"
    log "SUCCESS" "Backup created: $backup_name"
}

run_tests() {
    log "INFO" "Running test suite..."
    
    # Frontend tests
    if [[ -f "package.json" ]] && npm run test:ci --if-present; then
        log "SUCCESS" "Frontend tests passed"
    else
        log "WARNING" "Frontend tests failed or not configured"
    fi
    
    # Backend tests
    if [[ -f "$BACKEND_DIR/package.json" ]]; then
        cd "$BACKEND_DIR"
        if npm test --if-present; then
            log "SUCCESS" "Backend tests passed"
        else
            log "WARNING" "Backend tests failed or not configured"
        fi
        cd ..
    fi
    
    # TypeScript compilation check
    if npm run type-check --if-present; then
        log "SUCCESS" "TypeScript compilation check passed"
    else
        log "WARNING" "TypeScript compilation issues detected"
    fi
}

build_application() {
    log "INFO" "Building application for $DEPLOYMENT_ENV..."
    
    # Install dependencies
    log "INFO" "Installing frontend dependencies..."
    npm ci --production=false
    
    # Backend dependencies
    if [[ -f "$BACKEND_DIR/package.json" ]]; then
        log "INFO" "Installing backend dependencies..."
        cd "$BACKEND_DIR"
        npm ci --production=false
        cd ..
    fi
    
    # Environment-specific build
    case "$DEPLOYMENT_ENV" in
        production)
            log "INFO" "Building for production..."
            NODE_ENV=production npm run build:production
            ;;
        staging)
            log "INFO" "Building for staging..."
            NODE_ENV=staging npm run build:staging 2>/dev/null || npm run build
            ;;
        *)
            log "INFO" "Building for development..."
            npm run build
            ;;
    esac
    
    # Backend build
    if [[ -f "$BACKEND_DIR/package.json" ]]; then
        log "INFO" "Building backend..."
        cd "$BACKEND_DIR"
        npm run build
        cd ..
    fi
    
    log "SUCCESS" "Application build completed"
}

deploy_to_platform() {
    local platform="$1"
    
    case "$platform" in
        vercel)
            log "DEPLOY" "Deploying to Vercel..."
            npm run deploy:vercel
            ;;
        railway)
            log "DEPLOY" "Deploying to Railway..."
            npm run deploy:railway
            ;;
        ionos)
            log "DEPLOY" "Deploying to IONOS..."
            npm run deploy:ionos
            ;;
        webspace)
            log "DEPLOY" "Deploying to webspace via SFTP..."
            npm run deploy:webspace
            ;;
        docker)
            log "DEPLOY" "Building and deploying Docker containers..."
            docker-compose -f docker-compose.production.yml up -d --build
            ;;
        *)
            log "ERROR" "Unknown deployment platform: $platform"
            return 1
            ;;
    esac
}

health_check() {
    local url="$1"
    local timeout="${2:-$HEALTH_CHECK_TIMEOUT}"
    
    log "HEALTH" "Performing health check on $url..."
    
    local start_time=$(date +%s)
    local end_time=$((start_time + timeout))
    
    while [[ $(date +%s) -lt $end_time ]]; do
        if curl -f -s --max-time 10 "$url/health" > /dev/null 2>&1; then
            log "SUCCESS" "Health check passed"
            return 0
        fi
        
        log "INFO" "Waiting for service to be ready..."
        sleep 10
    done
    
    log "ERROR" "Health check failed - service not responding after ${timeout}s"
    return 1
}

performance_check() {
    local url="$1"
    
    log "HEALTH" "Running performance check on $url..."
    
    # Lighthouse CI (if available)
    if command -v lhci &> /dev/null; then
        log "INFO" "Running Lighthouse performance audit..."
        lhci autorun --upload.target=temporary-public-storage || log "WARNING" "Lighthouse audit failed"
    fi
    
    # Basic performance metrics
    local response_time=$(curl -o /dev/null -s -w '%{time_total}\n' "$url")
    log "INFO" "Response time: ${response_time}s"
    
    # Check if response time is acceptable (< 2s)
    if (( $(echo "$response_time < 2.0" | bc -l) )); then
        log "SUCCESS" "Performance check passed"
    else
        log "WARNING" "Performance check failed - slow response time: ${response_time}s"
    fi
}

rollback_deployment() {
    if [[ "$ROLLBACK_ENABLED" != "true" ]]; then
        log "WARNING" "Rollback is disabled"
        return 1
    fi
    
    log "WARNING" "Initiating deployment rollback..."
    
    local latest_backup_file="$LOG_DIR/latest_backup.txt"
    
    if [[ -f "$latest_backup_file" ]]; then
        local backup_path=$(cat "$latest_backup_file")
        
        if [[ -d "$backup_path" ]]; then
            log "INFO" "Restoring from backup: $backup_path"
            
            # Restore build
            if [[ -d "$backup_path/dist_backup" ]]; then
                rm -rf "$BUILD_DIR" 2>/dev/null || true
                cp -r "$backup_path/dist_backup" "$BUILD_DIR"
                log "INFO" "Build directory restored"
            fi
            
            # Restore environment files
            cp "$backup_path"/.env* . 2>/dev/null || true
            
            log "SUCCESS" "Rollback completed"
            return 0
        fi
    fi
    
    log "ERROR" "No backup found for rollback"
    return 1
}

send_notification() {
    local status="$1"
    local message="$2"
    local webhook_url="${SLACK_WEBHOOK_URL:-}"
    
    if [[ -n "$webhook_url" ]]; then
        local color
        case "$status" in
            success) color="good" ;;
            warning) color="warning" ;;
            error) color="danger" ;;
            *) color="#439FE0" ;;
        esac
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"attachments\":[{\"color\":\"$color\",\"text\":\"$message\"}]}" \
            "$webhook_url" 2>/dev/null || log "WARNING" "Failed to send notification"
    fi
}

tag_release() {
    if ! command -v git &> /dev/null; then
        log "WARNING" "Git not available - skipping release tagging"
        return
    fi
    
    local version=$(node -p "require('./package.json').version" 2>/dev/null || echo "unknown")
    local tag="v${version}-$(date '+%Y%m%d-%H%M%S')"
    
    git tag "$tag" 2>/dev/null && log "INFO" "Created release tag: $tag" || log "WARNING" "Failed to create release tag"
}

# Main deployment function
main() {
    local deployment_platform="${2:-vercel}"
    local start_time=$(date +%s)
    
    log "DEPLOY" "Starting deployment pipeline for $DEPLOYMENT_ENV on $deployment_platform"
    
    # Send start notification
    send_notification "info" "🚀 Deployment started for $DEPLOYMENT_ENV environment"
    
    # Trap errors for rollback
    trap 'handle_deployment_error $?' ERR
    
    # Deployment steps
    check_prerequisites
    create_backup
    run_tests
    build_application
    
    # Deploy to platform
    deploy_to_platform "$deployment_platform"
    
    # Post-deployment checks
    case "$deployment_platform" in
        vercel)
            local app_url="https://asagents.vercel.app"
            ;;
        railway)
            local app_url="https://asagents-production.up.railway.app"
            ;;
        *)
            local app_url="https://your-domain.com"
            ;;
    esac
    
    if health_check "$app_url"; then
        performance_check "$app_url"
        tag_release
        
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        log "SUCCESS" "Deployment completed successfully in ${duration}s"
        send_notification "success" "✅ Deployment completed successfully for $DEPLOYMENT_ENV in ${duration}s"
    else
        log "ERROR" "Deployment health check failed"
        rollback_deployment
        send_notification "error" "❌ Deployment failed for $DEPLOYMENT_ENV - rollback initiated"
        exit 1
    fi
}

handle_deployment_error() {
    local exit_code=$1
    log "ERROR" "Deployment failed with exit code $exit_code"
    
    if [[ "$ROLLBACK_ENABLED" == "true" ]]; then
        log "WARNING" "Attempting automatic rollback..."
        rollback_deployment
    fi
    
    send_notification "error" "❌ Deployment pipeline failed for $DEPLOYMENT_ENV"
    exit $exit_code
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi