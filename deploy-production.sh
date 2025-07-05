#!/bin/bash

# Production Deployment Script for Disposable Browser Service with SWAG
# This script sets up a production-grade deployment with SSL, reverse proxy, and proper session management

set -e

echo "🚀 Starting Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="albizblog.online"
SUBDOMAIN="browser"
FULL_DOMAIN="${SUBDOMAIN}.${DOMAIN}"
JWT_SECRET=$(openssl rand -hex 32)

echo -e "${BLUE}Configuration:${NC}"
echo "  Domain: ${DOMAIN}"
echo "  Subdomain: ${SUBDOMAIN}"
echo "  Full Domain: ${FULL_DOMAIN}"
echo "  JWT Secret: ${JWT_SECRET:0:16}..."

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}This script should not be run as root${NC}"
   exit 1
fi

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose V2 is available
if ! docker compose version &> /dev/null; then
    echo -e "${RED}Docker Compose V2 is not available. Please install Docker Compose V2.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose V2 are available${NC}"

# Check if we're in the correct directory (should have Dockerfile and docker-compose.production.yml)
if [ ! -f "Dockerfile" ] || [ ! -f "docker-compose.production.yml" ]; then
    echo -e "${RED}❌ Error: This script must be run from the browser directory${NC}"
    echo "Current directory: $(pwd)"
    echo "Expected files: Dockerfile, docker-compose.production.yml"
    echo "Please run: cd browser && ./deploy-production.sh"
    exit 1
fi

echo -e "${GREEN}✓ Running from correct directory${NC}"

# Create necessary directories
echo -e "${BLUE}Creating directories...${NC}"
mkdir -p swag/config
mkdir -p swag/config/dns-conf
mkdir -p logs
mkdir -p data/redis

# Create .env file for production
echo -e "${BLUE}Creating .env file...${NC}"
cat > .env << EOF
# Production Environment Variables
NODE_ENV=production
JWT_SECRET=${JWT_SECRET}
CHROMIUM_IMAGE=junior039/dispo-chromium:latest
PUBLIC_HOST=${FULL_DOMAIN}
REDIS_URL=redis://redis:6379
SESSION_TIMEOUT=300
EXTEND_DURATION=300
CLEANUP_INTERVAL=60000

# SWAG Configuration
URL=${DOMAIN}
SUBDOMAINS=wildcard
VALIDATION=dns
DNSPLUGIN=cloudflare
EMAIL=jj1982268@gmail.com
EOF

echo -e "${GREEN}✓ Environment file created${NC}"

# Create Cloudflare configuration if it doesn't exist
echo -e "${BLUE}Setting up Cloudflare configuration...${NC}"
mkdir -p swag/config/dns-conf
if [ ! -f "swag/config/dns-conf/cloudflare.ini" ]; then
    cat > swag/config/dns-conf/cloudflare.ini << EOF
# Cloudflare API credentials for SWAG DNS validation
dns_cloudflare_api_token = fNDzHyWd9zndQMjghXypW4bX6ZCGowsaof3q30cH
EOF
    echo -e "${GREEN}✓ Cloudflare configuration created${NC}"
else
    echo -e "${GREEN}✓ Cloudflare configuration already exists${NC}"
fi

# Create SWAG network if it doesn't exist
echo -e "${BLUE}Creating Docker network...${NC}"
if ! docker network ls | grep -q swag_network; then
    docker network create swag_network
    echo -e "${GREEN}✓ SWAG network created${NC}"
else
    echo -e "${YELLOW}✓ SWAG network already exists${NC}"
fi

# Stop any existing containers
echo -e "${BLUE}Stopping existing containers...${NC}"
docker compose -f docker-compose.production.yml down --remove-orphans || true

# Build and start services
echo -e "${BLUE}Building and starting services...${NC}"
docker compose -f docker-compose.production.yml up -d --build

# Wait for services to be ready
echo -e "${BLUE}Waiting for services to be ready...${NC}"
sleep 30

# Check service status
echo -e "${BLUE}Checking service status...${NC}"
docker compose -f docker-compose.production.yml ps

# Check SWAG logs for SSL certificate generation
echo -e "${BLUE}Checking SWAG logs for SSL certificate...${NC}"
echo "Waiting for SSL certificate generation (this may take a few minutes)..."
timeout 300 bash -c 'until docker logs swag 2>&1 | grep -q "Server ready"; do sleep 5; done' || {
    echo -e "${YELLOW}SSL certificate generation may still be in progress. Check logs with:${NC}"
    echo "docker logs swag -f"
}

# Test the API
echo -e "${BLUE}Testing API endpoints...${NC}"
sleep 10

# Test health endpoint
if curl -f -s "https://${FULL_DOMAIN}/api/health" > /dev/null; then
    echo -e "${GREEN}✓ API health check passed${NC}"
else
    echo -e "${YELLOW}⚠ API health check failed (may still be starting up)${NC}"
fi

# Test token generation
if curl -f -s "https://${FULL_DOMAIN}/api/dev/token" > /dev/null; then
    echo -e "${GREEN}✓ Token generation endpoint working${NC}"
else
    echo -e "${YELLOW}⚠ Token generation endpoint failed (may still be starting up)${NC}"
fi

# Display deployment information
echo -e "${GREEN}"
echo "🎉 Deployment Complete!"
echo "========================"
echo "Service URLs:"
echo "  API Base: https://${FULL_DOMAIN}/api/"
echo "  Health Check: https://${FULL_DOMAIN}/api/health"
echo "  Token Generation: https://${FULL_DOMAIN}/api/dev/token"
echo ""
echo "Session Management:"
echo "  Start Session: POST https://${FULL_DOMAIN}/api/browser/start"
echo "  Stop Session: POST https://${FULL_DOMAIN}/api/browser/stop"
echo "  Extend Session: POST https://${FULL_DOMAIN}/api/browser/extend"
echo ""
echo "Management Commands:"
echo "  View logs: docker compose -f docker-compose.production.yml logs -f"
echo "  Stop services: docker compose -f docker-compose.production.yml down"
echo "  Restart services: docker compose -f docker-compose.production.yml restart"
echo "  Update services: docker compose -f docker-compose.production.yml pull && docker compose -f docker-compose.production.yml up -d"
echo ""
echo "Monitoring:"
echo "  SWAG logs: docker logs swag -f"
echo "  Backend logs: docker logs browser-backend -f"
echo "  Redis logs: docker logs browser-redis -f"
echo "  Cleanup worker: docker logs browser-cleanup-worker -f"
echo ""
echo "Security Notes:"
echo "  - SSL certificates are automatically managed by SWAG"
echo "  - All traffic is encrypted via HTTPS"
echo "  - WebSocket connections are properly proxied"
echo "  - Sessions are automatically cleaned up after 5 minutes"
echo "${NC}"

# Test session creation
echo -e "${BLUE}Testing session creation...${NC}"
echo "This will create a test session to verify everything is working:"

# Get a test token
TOKEN_RESPONSE=$(curl -s "https://${FULL_DOMAIN}/api/dev/token")
TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✓ Got test token${NC}"
    
    # Create a test session
    SESSION_RESPONSE=$(curl -s -X POST "https://${FULL_DOMAIN}/api/browser/start" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d '{"userId": "test-user"}')
    
    if echo "$SESSION_RESPONSE" | grep -q "sessionId"; then
        SESSION_ID=$(echo "$SESSION_RESPONSE" | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)
        GUI_URL=$(echo "$SESSION_RESPONSE" | grep -o '"gui_url":"[^"]*"' | cut -d'"' -f4)
        
        echo -e "${GREEN}✓ Test session created successfully!${NC}"
        echo "  Session ID: $SESSION_ID"
        echo "  GUI URL: $GUI_URL"
        echo ""
        echo -e "${YELLOW}You can now access the Chromium browser at:${NC}"
        echo "  $GUI_URL"
        echo ""
        echo -e "${YELLOW}The session will automatically expire in 5 minutes.${NC}"
    else
        echo -e "${RED}✗ Failed to create test session${NC}"
        echo "Response: $SESSION_RESPONSE"
    fi
else
    echo -e "${RED}✗ Failed to get test token${NC}"
    echo "Response: $TOKEN_RESPONSE"
fi

echo ""
echo -e "${GREEN}Deployment script completed successfully!${NC}" 