# CortexBuild Production Dockerfile
# Multi-stage build for optimized production deployment

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S cortexbuild -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=cortexbuild:nodejs /app/dist ./dist
COPY --from=builder --chown=cortexbuild:nodejs /app/public ./public
COPY --from=builder --chown=cortexbuild:nodejs /app/api-server-simple.cjs ./

# Copy additional necessary files
COPY --chown=cortexbuild:nodejs auth ./auth
COPY --chown=cortexbuild:nodejs utils ./utils

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV API_PORT=3001

# Expose ports
EXPOSE 3000 3001

# Switch to non-root user
USER cortexbuild

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Copy startup script for process management
COPY --chown=cortexbuild:nodejs scripts/start-production.sh ./scripts/start-production.sh
RUN chmod +x ./scripts/start-production.sh

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application using process manager script
CMD ["./scripts/start-production.sh"]
