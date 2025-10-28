#!/bin/bash

# ==============================================
# ASAgents Deployment Script
# Supports multiple deployment targets
# ==============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}➜ $1${NC}"
}

# Function to build the project
build_project() {
    print_info "Building project..."
    npm run build
    print_success "Build completed"
}

# Function to deploy to IONOS via SFTP
deploy_ionos() {
    print_info "Deploying to IONOS webspace..."
    
    if [ -z "$DEPLOY_SERVER" ] || [ -z "$DEPLOY_USERNAME" ] || [ -z "$DEPLOY_PASSWORD" ]; then
        print_error "IONOS deployment credentials not found in .env.local"
        exit 1
    fi
    
    # Install lftp if not available
    if ! command -v lftp &> /dev/null; then
        print_info "Installing lftp..."
        brew install lftp 2>/dev/null || {
            print_error "Failed to install lftp. Please install it manually: brew install lftp"
            exit 1
        }
    fi
    
    # Create lftp script
    cat > /tmp/deploy_script.lftp << EOF
set sftp:auto-confirm yes
set ssl:verify-certificate no
open -u $DEPLOY_USERNAME,$DEPLOY_PASSWORD sftp://$DEPLOY_SERVER:$DEPLOY_PORT
lcd dist
cd /
mirror --reverse --verbose --parallel=4 --exclude-glob logs/ --exclude-glob *.log* --only-newer
bye
EOF
    
    print_info "Uploading files via SFTP..."
    lftp -f /tmp/deploy_script.lftp
    rm /tmp/deploy_script.lftp
    
    print_success "Deployment to IONOS completed!"
    print_info "Site should be live at: https://$DEPLOY_SERVER"
}

# Function to deploy to Vercel
deploy_vercel() {
    print_info "Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI not found. Install it: npm i -g vercel"
        exit 1
    fi
    
    vercel --prod
    print_success "Deployment to Vercel completed!"
}

# Function to deploy to Netlify
deploy_netlify() {
    print_info "Deploying to Netlify..."
    
    if ! command -v netlify &> /dev/null; then
        print_error "Netlify CLI not found. Install it: npm i -g netlify-cli"
        exit 1
    fi
    
    netlify deploy --prod --dir=dist
    print_success "Deployment to Netlify completed!"
}

# Function to create Docker image
deploy_docker() {
    print_info "Building Docker image..."
    
    if [ ! -f Dockerfile ]; then
        print_info "Creating Dockerfile..."
        cat > Dockerfile << 'EOF'
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF
    fi
    
    docker build -t asagents:latest .
    print_success "Docker image built successfully!"
    print_info "Run with: docker run -p 80:80 asagents:latest"
}

# Function for dry run
dry_run() {
    print_info "Performing dry run..."
    print_info "Would build project"
    print_info "Would deploy to specified target"
    print_info "Build files would be in: dist/"
    ls -lh dist/ 2>/dev/null || print_info "(dist/ directory not found - run build first)"
    print_success "Dry run completed"
}

# Main deployment logic
main() {
    TARGET=${1:-ionos}
    
    print_info "ASAgents Deployment Script"
    print_info "Target: $TARGET"
    echo ""
    
    case $TARGET in
        ionos)
            build_project
            deploy_ionos
            ;;
        vercel)
            build_project
            deploy_vercel
            ;;
        netlify)
            build_project
            deploy_netlify
            ;;
        docker)
            build_project
            deploy_docker
            ;;
        build-only)
            build_project
            print_info "Build files are in: dist/"
            ;;
        dry-run)
            dry_run
            ;;
        *)
            print_error "Unknown target: $TARGET"
            echo ""
            echo "Usage: ./deploy.sh [target]"
            echo ""
            echo "Available targets:"
            echo "  ionos       - Deploy to IONOS webspace (default)"
            echo "  vercel      - Deploy to Vercel"
            echo "  netlify     - Deploy to Netlify"
            echo "  docker      - Build Docker image"
            echo "  build-only  - Only build the project"
            echo "  dry-run     - Test without deploying"
            exit 1
            ;;
    esac
    
    echo ""
    print_success "All done! 🚀"
}

# Run main function
main "$@"
