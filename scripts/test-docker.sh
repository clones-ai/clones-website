#!/bin/bash

# Docker Image Testing Script
# Tests both development and production Docker images

set -e  # Exit on any error

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧪 Docker Image Testing Suite${NC}"
echo "=================================="

# Clean up function
cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up containers...${NC}"
    docker-compose down --remove-orphans 2>/dev/null || true
    docker container prune -f 2>/dev/null || true
}

# Set up cleanup trap
trap cleanup EXIT

# Test function
test_service() {
    local service=$1
    local port=$2
    local expected_text=$3
    
    echo -e "\n${YELLOW}Testing $service...${NC}"
    
    # Build the service
    echo "Building $service..."
    if ! docker-compose build $service; then
        echo -e "${RED}❌ Build failed for $service${NC}"
        return 1
    fi
    
    # Start the service
    echo "Starting $service..."
    if ! docker-compose up -d $service; then
        echo -e "${RED}❌ Failed to start $service${NC}"
        return 1
    fi
    
    # Wait for service to be ready
    echo "Waiting for $service to be ready..."
    local max_attempts=60
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose ps $service | grep -q "healthy\|Up"; then
            echo -e "${GREEN}✅ $service is running${NC}"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            echo -e "${RED}❌ $service failed to start within timeout${NC}"
            docker-compose logs $service
            return 1
        fi
        
        sleep 2
        attempt=$((attempt + 1))
    done
    
    # Test HTTP response
    echo "Testing HTTP response..."
    local response_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port || echo "000")
    
    if [ "$response_code" = "200" ]; then
        echo -e "${GREEN}✅ $service responds with HTTP 200${NC}"
        
        # Optional: Check for expected content
        if [ -n "$expected_text" ]; then
            if curl -s http://localhost:$port | grep -q "$expected_text"; then
                echo -e "${GREEN}✅ $service serves expected content${NC}"
            else
                echo -e "${YELLOW}⚠️  Expected content not found in $service${NC}"
            fi
        fi
    else
        echo -e "${RED}❌ $service responds with HTTP $response_code${NC}"
        return 1
    fi
    
    # Stop the service
    docker-compose stop $service
    echo -e "${GREEN}✅ $service test completed${NC}"
    return 0
}

# Run lint check first
echo -e "\n${YELLOW}🔍 Running lint check...${NC}"
if npm run lint 2>&1 | grep -q "✖.*errors"; then
    echo -e "${RED}❌ Lint check failed - fix errors before deployment${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Lint check passed (warnings allowed)${NC}"
fi

# Test build locally
echo -e "\n${YELLOW}🏗️  Testing local build...${NC}"
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Local build successful${NC}"
else
    echo -e "${RED}❌ Local build failed${NC}"
    exit 1
fi

# Test development service
if ! test_service "clones-website-dev" "5173" "Clones"; then
    echo -e "${RED}❌ Development service test failed${NC}"
    exit 1
fi

# Test production service
if ! test_service "clones-website-prod" "3000" "Clones"; then
    echo -e "${RED}❌ Production service test failed${NC}"
    exit 1
fi

echo -e "\n${GREEN}🎉 All Docker image tests passed!${NC}"
echo -e "${GREEN}✅ Development image: Ready${NC}"
echo -e "${GREEN}✅ Production image: Ready for deployment${NC}"