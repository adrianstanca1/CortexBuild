#!/bin/bash

# CortexBuild Docker Deployment Script
# ====================================

set -e

echo "🐳 Building and deploying CortexBuild with Docker..."
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

# Configuration
IMAGE_NAME="cortexbuild"
TAG="latest"
CONTAINER_NAME="cortexbuild-app"
PORT="3001"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

print_success "Docker is available and running"

# Stop and remove existing container if it exists
print_status "Cleaning up existing containers..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true
print_success "Cleanup completed"

# Build Docker image
print_status "Building Docker image: $IMAGE_NAME:$TAG"
docker build -t $IMAGE_NAME:$TAG .
print_success "Docker image built successfully"

# Run the container
print_status "Starting container: $CONTAINER_NAME"
docker run -d \
  --name $CONTAINER_NAME \
  --restart unless-stopped \
  -p $PORT:$PORT \
  --env-file .env.production \
  $IMAGE_NAME:$TAG

print_success "Container started successfully"

# Wait for the application to start
print_status "Waiting for application to start..."
sleep 10

# Health check
print_status "Performing health check..."
if curl -f http://localhost:$PORT/api/health &> /dev/null; then
    print_success "Health check passed"
else
    print_error "Health check failed"
    print_status "Container logs:"
    docker logs $CONTAINER_NAME --tail 20
    exit 1
fi

# Display container information
print_status "Container information:"
docker ps --filter name=$CONTAINER_NAME --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
print_success "🎉 CortexBuild deployed successfully with Docker!"
echo ""
echo "Application is running at: http://localhost:$PORT"
echo ""
echo "Useful commands:"
echo "  View logs:    docker logs $CONTAINER_NAME -f"
echo "  Stop app:     docker stop $CONTAINER_NAME"
echo "  Start app:    docker start $CONTAINER_NAME"
echo "  Remove app:   docker rm $CONTAINER_NAME"
echo "  Shell access: docker exec -it $CONTAINER_NAME sh"
echo ""
