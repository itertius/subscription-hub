#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

echo -e "${BLUE}🧪 Running Local Tests for Subscription Hub...${NC}\n"

# Function to print test result
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        ((FAILED++))
    fi
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Test 1: Check Node.js
echo -e "${YELLOW}📦 Checking Node.js...${NC}"
if command_exists node; then
    NODE_VERSION=$(node --version)
    test_result 0 "Node.js is installed ($NODE_VERSION)"
else
    test_result 1 "Node.js is not installed"
fi

# Test 2: Check npm
echo -e "${YELLOW}📦 Checking npm...${NC}"
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    test_result 0 "npm is installed ($NPM_VERSION)"
else
    test_result 1 "npm is not installed"
fi

# Test 3: Check Docker
echo -e "${YELLOW}🐳 Checking Docker...${NC}"
if command_exists docker; then
    DOCKER_VERSION=$(docker --version)
    test_result 0 "Docker is installed ($DOCKER_VERSION)"
else
    test_result 1 "Docker is not installed (optional for local testing)"
fi

# Test 4: Check Docker Compose
echo -e "${YELLOW}🐳 Checking Docker Compose...${NC}"
if command_exists docker-compose || docker compose version >/dev/null 2>&1; then
    test_result 0 "Docker Compose is available"
else
    test_result 1 "Docker Compose is not available (optional for local testing)"
fi

# Test 5: Check backend dependencies
echo -e "${YELLOW}📦 Checking backend dependencies...${NC}"
if [ -d "$BACKEND_DIR/node_modules" ]; then
    test_result 0 "Backend dependencies are installed"
else
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd "$BACKEND_DIR" && npm install >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        test_result 0 "Backend dependencies installed successfully"
    else
        test_result 1 "Failed to install backend dependencies"
    fi
fi

# Test 6: Check frontend dependencies
echo -e "${YELLOW}📦 Checking frontend dependencies...${NC}"
if [ -d "$FRONTEND_DIR/node_modules" ]; then
    test_result 0 "Frontend dependencies are installed"
else
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd "$FRONTEND_DIR" && npm install >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        test_result 0 "Frontend dependencies installed successfully"
    else
        test_result 1 "Failed to install frontend dependencies"
    fi
fi

# Test 7: Check backend files
echo -e "${YELLOW}📁 Checking backend files...${NC}"
if [ -f "$BACKEND_DIR/server.js" ] && [ -f "$BACKEND_DIR/database.js" ] && [ -f "$BACKEND_DIR/package.json" ]; then
    test_result 0 "Backend files are present"
else
    test_result 1 "Backend files are missing"
fi

# Test 8: Check frontend files
echo -e "${YELLOW}📁 Checking frontend files...${NC}"
if [ -f "$FRONTEND_DIR/vite.config.js" ] && [ -f "$FRONTEND_DIR/package.json" ] && [ -d "$FRONTEND_DIR/src" ]; then
    test_result 0 "Frontend files are present"
else
    test_result 1 "Frontend files are missing"
fi

# Test 9: Check Docker files
echo -e "${YELLOW}🐳 Checking Docker files...${NC}"
if [ -f "$SCRIPT_DIR/docker-compose.yml" ] && [ -f "$BACKEND_DIR/Dockerfile" ] && [ -f "$FRONTEND_DIR/Dockerfile" ]; then
    test_result 0 "Docker files are present"
else
    test_result 1 "Docker files are missing"
fi

# Test 10: Check GitHub Actions workflows
echo -e "${YELLOW}🔄 Checking GitHub Actions workflows...${NC}"
if [ -f "$SCRIPT_DIR/.github/workflows/ci.yml" ] && [ -f "$SCRIPT_DIR/.github/workflows/deploy.yml" ]; then
    test_result 0 "GitHub Actions workflows are present"
else
    test_result 1 "GitHub Actions workflows are missing"
fi

# Test 11: Test backend syntax
echo -e "${YELLOW}🔍 Testing backend syntax...${NC}"
cd "$BACKEND_DIR"
if node --check server.js >/dev/null 2>&1; then
    test_result 0 "Backend syntax is valid"
else
    test_result 1 "Backend syntax has errors"
fi

# Test 12: Test frontend build
echo -e "${YELLOW}🏗️  Testing frontend build...${NC}"
cd "$FRONTEND_DIR"
if npm run build >/dev/null 2>&1; then
    if [ -d "$FRONTEND_DIR/dist" ] && [ -f "$FRONTEND_DIR/dist/index.html" ]; then
        test_result 0 "Frontend builds successfully"
    else
        test_result 1 "Frontend build output is missing"
    fi
else
    test_result 1 "Frontend build failed"
fi

# Test 13: Start backend server and test API
echo -e "${YELLOW}🚀 Testing backend API...${NC}"
cd "$BACKEND_DIR"

# Kill any existing backend server
pkill -f "node.*server.js" 2>/dev/null || true
sleep 1

# Start backend server in background
npm start > /tmp/backend-test.log 2>&1 &
BACKEND_PID=$!

# Wait for server to start
echo -e "${YELLOW}⏳ Waiting for backend to start...${NC}"
for i in {1..15}; do
    if curl -s http://localhost:3001/api/health >/dev/null 2>&1; then
        test_result 0 "Backend server started successfully"
        
        # Test health endpoint
        HEALTH_RESPONSE=$(curl -s http://localhost:3001/api/health)
        if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
            test_result 0 "Backend health endpoint works"
        else
            test_result 1 "Backend health endpoint failed"
        fi
        
        # Test subscriptions endpoint
        SUBS_RESPONSE=$(curl -s http://localhost:3001/api/subscriptions)
        if [ $? -eq 0 ]; then
            test_result 0 "Backend subscriptions endpoint works"
        else
            test_result 1 "Backend subscriptions endpoint failed"
        fi
        
        # Test stats endpoint
        STATS_RESPONSE=$(curl -s http://localhost:3001/api/subscriptions/stats/summary)
        if [ $? -eq 0 ]; then
            test_result 0 "Backend stats endpoint works"
        else
            test_result 1 "Backend stats endpoint failed"
        fi
        
        # Test creating a subscription
        CREATE_RESPONSE=$(curl -s -X POST http://localhost:3001/api/subscriptions \
            -H "Content-Type: application/json" \
            -d '{"name":"Test Subscription","service_provider":"Test Provider","amount":9.99,"currency":"USD","billing_cycle":"monthly","next_billing_date":"2025-12-01","status":"active"}')
        if echo "$CREATE_RESPONSE" | grep -q "id"; then
            test_result 0 "Backend create subscription works"
            # Extract ID and clean up
            TEST_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)
            if [ ! -z "$TEST_ID" ]; then
                curl -s -X DELETE "http://localhost:3001/api/subscriptions/$TEST_ID" >/dev/null 2>&1
            fi
        else
            test_result 1 "Backend create subscription failed"
        fi
        
        break
    fi
    sleep 1
done

if [ $i -eq 15 ]; then
    test_result 1 "Backend server failed to start"
fi

# Kill backend server
kill $BACKEND_PID 2>/dev/null || true
pkill -f "node.*server.js" 2>/dev/null || true

# Test 14: Test Docker Compose (if Docker is available)
if command_exists docker && (command_exists docker-compose || docker compose version >/dev/null 2>&1); then
    echo -e "${YELLOW}🐳 Testing Docker Compose build...${NC}"
    cd "$SCRIPT_DIR"
    
    # Stop any running containers
    docker-compose down >/dev/null 2>&1 || docker compose down >/dev/null 2>&1 || true
    
    # Build images
    if docker-compose build >/dev/null 2>&1 || docker compose build >/dev/null 2>&1; then
        test_result 0 "Docker Compose build successful"
    else
        test_result 1 "Docker Compose build failed"
    fi
    
    # Clean up
    docker-compose down >/dev/null 2>&1 || docker compose down >/dev/null 2>&1 || true
else
    echo -e "${YELLOW}⏭️  Skipping Docker tests (Docker not available)${NC}"
fi

# Test 15: Check environment files
echo -e "${YELLOW}📝 Checking configuration files...${NC}"
if [ -f "$SCRIPT_DIR/.gitignore" ] && [ -f "$SCRIPT_DIR/README.md" ] && [ -f "$SCRIPT_DIR/package.json" ]; then
    test_result 0 "Configuration files are present"
else
    test_result 1 "Configuration files are missing"
fi

# Test 16: Check start script
echo -e "${YELLOW}🚀 Checking start script...${NC}"
if [ -f "$SCRIPT_DIR/start.sh" ] && [ -x "$SCRIPT_DIR/start.sh" ]; then
    test_result 0 "Start script is present and executable"
else
    if [ -f "$SCRIPT_DIR/start.sh" ]; then
        chmod +x "$SCRIPT_DIR/start.sh"
        test_result 0 "Start script permissions fixed"
    else
        test_result 1 "Start script is missing"
    fi
fi

# Summary
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Test Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Ready to push to GitHub.${NC}\n"
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "1. Review changes: ${BLUE}git status${NC}"
    echo -e "2. Add files: ${BLUE}git add .${NC}"
    echo -e "3. Commit: ${BLUE}git commit -m 'Add Docker and CI/CD setup'${NC}"
    echo -e "4. Push: ${BLUE}git push origin main${NC}\n"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please fix the issues before pushing.${NC}\n"
    exit 1
fi

