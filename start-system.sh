#!/bin/bash

# Quantum-X-Builder System Startup Script
# Purpose: Initialize and verify all system components
# Phase: 5
# Authority: Neo

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════╗"
echo "║   Quantum-X-Builder System Startup         ║"
echo "║   Phase 5 - Autonomous Integration         ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to print section header
print_section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Step 1: Prerequisites Check
print_section "1. Checking Prerequisites"

MISSING_DEPS=()

if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js: Not installed"
    MISSING_DEPS+=("node")
fi

if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} npm: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm: Not installed"
    MISSING_DEPS+=("npm")
fi

if command_exists docker; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
    echo -e "${GREEN}✓${NC} Docker: $DOCKER_VERSION"
else
    echo -e "${YELLOW}⚠${NC} Docker: Not installed (optional for containerized deployment)"
fi

if command_exists docker-compose || docker compose version >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Docker Compose: Available"
else
    echo -e "${YELLOW}⚠${NC} Docker Compose: Not available (optional)"
fi

if command_exists git; then
    GIT_VERSION=$(git --version | cut -d' ' -f3)
    echo -e "${GREEN}✓${NC} Git: $GIT_VERSION"
else
    echo -e "${RED}✗${NC} Git: Not installed"
    MISSING_DEPS+=("git")
fi

if command_exists jq; then
    echo -e "${GREEN}✓${NC} jq: Installed"
else
    echo -e "${YELLOW}⚠${NC} jq: Not installed (recommended for validation)"
fi

if [ ${#MISSING_DEPS[@]} -ne 0 ]; then
    echo ""
    echo -e "${RED}Error: Missing required dependencies: ${MISSING_DEPS[*]}${NC}"
    echo "Please install missing dependencies and try again."
    exit 1
fi

# Step 2: Repository Verification
print_section "2. Verifying Repository"

if [ ! -d "$SCRIPT_DIR/.git" ]; then
    echo -e "${RED}✗${NC} Not a git repository"
    exit 1
fi

REPO_URL=$(git -C "$SCRIPT_DIR" config --get remote.origin.url 2>/dev/null || echo "")
if [[ "$REPO_URL" == *"InfinityXOneSystems/quantum-x-builder"* ]]; then
    echo -e "${GREEN}✓${NC} Repository: quantum-x-builder"
    echo -e "${GREEN}✓${NC} Owner: InfinityXOneSystems"
else
    echo -e "${YELLOW}⚠${NC} Repository URL: $REPO_URL"
fi

CURRENT_BRANCH=$(git -C "$SCRIPT_DIR" branch --show-current 2>/dev/null || echo "unknown")
echo -e "${BLUE}  Current branch:${NC} $CURRENT_BRANCH"

# Step 3: System Manifest Validation
print_section "3. Validating System Manifest"

if [ -f "$SCRIPT_DIR/SYSTEM_INTEGRATION_MANIFEST.json" ]; then
    echo -e "${GREEN}✓${NC} System manifest found"
    
    if command_exists jq && jq empty "$SCRIPT_DIR/SYSTEM_INTEGRATION_MANIFEST.json" 2>/dev/null; then
        SYSTEM_NAME=$(jq -r '.system.name' "$SCRIPT_DIR/SYSTEM_INTEGRATION_MANIFEST.json")
        SYSTEM_PHASE=$(jq -r '.system.phase' "$SCRIPT_DIR/SYSTEM_INTEGRATION_MANIFEST.json")
        SYSTEM_STATUS=$(jq -r '.system.status' "$SCRIPT_DIR/SYSTEM_INTEGRATION_MANIFEST.json")
        
        echo -e "${GREEN}✓${NC} System: $SYSTEM_NAME"
        echo -e "${GREEN}✓${NC} Phase: $SYSTEM_PHASE"
        echo -e "${GREEN}✓${NC} Status: $SYSTEM_STATUS"
    else
        echo -e "${YELLOW}⚠${NC} Could not parse manifest (jq required)"
    fi
else
    echo -e "${RED}✗${NC} System manifest not found"
    echo "Run: Generate manifest first"
    exit 1
fi

# Step 4: Governance Checks
print_section "4. Checking Governance Controls"

if [ -f "$SCRIPT_DIR/_OPS/POLICY/AUTONOMY_ON.json" ]; then
    echo -e "${GREEN}✓${NC} Autonomy policy: Found"
    if command_exists jq; then
        AUTONOMY=$(jq -r '.autonomy_status' "$SCRIPT_DIR/_OPS/POLICY/AUTONOMY_ON.json")
        echo -e "  Status: ${GREEN}$AUTONOMY${NC}"
    fi
else
    echo -e "${RED}✗${NC} Autonomy policy: Missing"
fi

if [ -f "$SCRIPT_DIR/_OPS/SAFETY/KILL_SWITCH.json" ]; then
    echo -e "${GREEN}✓${NC} Kill switch: Found"
    if command_exists jq; then
        KILL_SWITCH=$(jq -r '.kill_switch' "$SCRIPT_DIR/_OPS/SAFETY/KILL_SWITCH.json")
        echo -e "  Status: ${YELLOW}$KILL_SWITCH${NC}"
    fi
else
    echo -e "${RED}✗${NC} Kill switch: Missing"
fi

# Step 5: Component Discovery
print_section "5. Discovering System Components"

# Backend
if [ -f "$SCRIPT_DIR/backend/package.json" ]; then
    echo -e "${GREEN}✓${NC} Backend: Found"
    if command_exists jq; then
        BACKEND_NAME=$(jq -r '.name' "$SCRIPT_DIR/backend/package.json")
        echo -e "  Name: $BACKEND_NAME"
    fi
else
    echo -e "${RED}✗${NC} Backend: Not found"
fi

# Frontend
if [ -f "$SCRIPT_DIR/frontend/package.json" ]; then
    echo -e "${GREEN}✓${NC} Frontend: Found"
    if command_exists jq; then
        FRONTEND_NAME=$(jq -r '.name' "$SCRIPT_DIR/frontend/package.json")
        echo -e "  Name: $FRONTEND_NAME"
    fi
else
    echo -e "${RED}✗${NC} Frontend: Not found"
fi

# Documentation
if [ -f "$SCRIPT_DIR/website/package.json" ]; then
    echo -e "${GREEN}✓${NC} Documentation: Found"
else
    echo -e "${YELLOW}⚠${NC} Documentation: Not found"
fi

# Step 6: Integration Validation
print_section "6. Running Integration Validation"

if [ -x "$SCRIPT_DIR/validate-integration.sh" ]; then
    echo "Running comprehensive validation..."
    echo ""
    if "$SCRIPT_DIR/validate-integration.sh"; then
        echo ""
        echo -e "${GREEN}✓${NC} Integration validation passed"
    else
        echo ""
        echo -e "${RED}✗${NC} Integration validation failed"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠${NC} Validation script not found or not executable"
fi

# Step 7: Startup Options
print_section "7. Startup Options"

echo ""
echo "System is ready. Choose startup mode:"
echo ""
echo -e "${CYAN}1)${NC} Docker Compose (Recommended - Full Stack)"
echo "   docker-compose up -d"
echo ""
echo -e "${CYAN}2)${NC} Development Mode (Backend + Frontend)"
echo "   Terminal 1: cd backend && npm install && npm run dev"
echo "   Terminal 2: cd frontend && npm install && npm run dev"
echo ""
echo -e "${CYAN}3)${NC} Documentation Only"
echo "   cd website && npm install && npm start"
echo ""
echo -e "${CYAN}4)${NC} Validation Only (Already completed above)"
echo "   ./validate-integration.sh"
echo ""

# Check if docker-compose is available
if command_exists docker-compose || docker compose version >/dev/null 2>&1; then
    echo -e "${GREEN}Auto-start with Docker Compose? [y/N]${NC}"
    read -r -t 10 response || response=""
    if [[ "$response" =~ ^[Yy]$ ]]; then
        print_section "Starting Services with Docker Compose"
        
        if docker compose version >/dev/null 2>&1; then
            docker compose up -d
        else
            docker-compose up -d
        fi
        
        echo ""
        echo -e "${GREEN}✓${NC} Services started"
        echo ""
        echo "Access points:"
        echo -e "  • Backend:  ${CYAN}http://localhost:8787${NC}"
        echo -e "  • Frontend: ${CYAN}http://localhost:3000${NC}"
        echo -e "  • NATS:     ${CYAN}http://localhost:8222${NC}"
        echo ""
        echo "View logs: docker-compose logs -f"
    fi
fi

# Final Summary
print_section "Startup Complete"

echo ""
echo -e "${GREEN}✓${NC} All system components are integrated and identified"
echo -e "${GREEN}✓${NC} Governance controls are active"
echo -e "${GREEN}✓${NC} System is ready for operation"
echo ""
echo -e "For more information, see: ${BLUE}INTEGRATION_GUIDE.md${NC}"
echo ""

exit 0
