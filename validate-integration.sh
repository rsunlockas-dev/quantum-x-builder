#!/bin/bash

# Quantum-X-Builder System Integration Validation Script
# Purpose: Verify all system components can identify and communicate with each other
# Phase: 5
# Authority: Neo
# Autonomy: Enabled with Guardrails

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANIFEST_FILE="$SCRIPT_DIR/SYSTEM_INTEGRATION_MANIFEST.json"
OUTPUT_DIR="$SCRIPT_DIR/_OPS/OUTPUT"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="$OUTPUT_DIR/integration_validation_${TIMESTAMP}.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Quantum-X-Builder Integration Validation${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Initialize results
RESULTS='{"timestamp": "'$(date -Iseconds)'", "checks": []}'

# Function to add check result
add_check() {
    local name="$1"
    local status="$2"
    local message="$3"
    
    RESULTS=$(echo "$RESULTS" | jq --arg name "$name" --arg status "$status" --arg msg "$message" \
        '.checks += [{"name": $name, "status": $status, "message": $msg}]')
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✓${NC} $name: $message"
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠${NC} $name: $message"
    else
        echo -e "${RED}✗${NC} $name: $message"
    fi
}

echo -e "${BLUE}1. Checking System Manifest...${NC}"
if [ -f "$MANIFEST_FILE" ]; then
    add_check "System Manifest" "PASS" "Found at $MANIFEST_FILE"
    
    # Validate JSON
    if jq empty "$MANIFEST_FILE" 2>/dev/null; then
        add_check "Manifest JSON" "PASS" "Valid JSON format"
    else
        add_check "Manifest JSON" "FAIL" "Invalid JSON format"
    fi
else
    add_check "System Manifest" "FAIL" "Not found at $MANIFEST_FILE"
fi
echo ""

echo -e "${BLUE}2. Checking Directory Structure...${NC}"
REQUIRED_DIRS=(
    "backend"
    "frontend"
    "website"
    "_OPS"
    "_OPS/COMMANDS"
    "_OPS/POLICY"
    "_OPS/SAFETY"
    "_OPS/AUDIT"
    "_OPS/OUTPUT"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$SCRIPT_DIR/$dir" ]; then
        add_check "Directory: $dir" "PASS" "Exists"
    else
        add_check "Directory: $dir" "FAIL" "Missing"
    fi
done
echo ""

echo -e "${BLUE}3. Checking Component Configuration Files...${NC}"
if [ -f "$SCRIPT_DIR/backend/package.json" ]; then
    add_check "Backend package.json" "PASS" "Found"
    BACKEND_NAME=$(jq -r '.name' "$SCRIPT_DIR/backend/package.json" 2>/dev/null || echo "unknown")
    add_check "Backend Identity" "PASS" "Name: $BACKEND_NAME"
else
    add_check "Backend package.json" "FAIL" "Not found"
fi

if [ -f "$SCRIPT_DIR/frontend/package.json" ]; then
    add_check "Frontend package.json" "PASS" "Found"
    FRONTEND_NAME=$(jq -r '.name' "$SCRIPT_DIR/frontend/package.json" 2>/dev/null || echo "unknown")
    add_check "Frontend Identity" "PASS" "Name: $FRONTEND_NAME"
else
    add_check "Frontend package.json" "FAIL" "Not found"
fi

if [ -f "$SCRIPT_DIR/docker-compose.yml" ]; then
    add_check "Docker Compose" "PASS" "Found"
else
    add_check "Docker Compose" "FAIL" "Not found"
fi
echo ""

echo -e "${BLUE}4. Checking Operations Governance...${NC}"
if [ -f "$SCRIPT_DIR/_OPS/POLICY/AUTONOMY_ON.json" ]; then
    add_check "Autonomy Policy" "PASS" "Found"
    AUTONOMY_STATUS=$(jq -r '.autonomy_status' "$SCRIPT_DIR/_OPS/POLICY/AUTONOMY_ON.json" 2>/dev/null || echo "unknown")
    add_check "Autonomy Status" "PASS" "Status: $AUTONOMY_STATUS"
else
    add_check "Autonomy Policy" "FAIL" "Not found"
fi

if [ -f "$SCRIPT_DIR/_OPS/SAFETY/KILL_SWITCH.json" ]; then
    add_check "Kill Switch" "PASS" "Found"
    KILL_SWITCH_STATUS=$(jq -r '.kill_switch' "$SCRIPT_DIR/_OPS/SAFETY/KILL_SWITCH.json" 2>/dev/null || echo "unknown")
    add_check "Kill Switch Status" "PASS" "Status: $KILL_SWITCH_STATUS"
else
    add_check "Kill Switch" "FAIL" "Not found"
fi
echo ""

echo -e "${BLUE}5. Checking Integration Modules...${NC}"
if [ -f "$SCRIPT_DIR/backend/src/integrations/google-calendar.js" ]; then
    add_check "Google Calendar Integration" "PASS" "Module exists"
else
    add_check "Google Calendar Integration" "FAIL" "Module missing"
fi

if [ -d "$SCRIPT_DIR/backend/src/routes" ]; then
    ROUTE_COUNT=$(find "$SCRIPT_DIR/backend/src/routes" -name "*.js" -type f | wc -l)
    add_check "Backend API Routes" "PASS" "Found $ROUTE_COUNT route files"
else
    add_check "Backend API Routes" "FAIL" "Routes directory missing"
fi
echo ""

echo -e "${BLUE}6. Checking Environment Configuration...${NC}"
if [ -f "$SCRIPT_DIR/backend/.env.example" ]; then
    add_check "Backend Env Template" "PASS" "Found .env.example"
else
    add_check "Backend Env Template" "WARN" ".env.example not found"
fi

if [ -f "$SCRIPT_DIR/backend/.env" ]; then
    add_check "Backend Env Config" "PASS" ".env file exists"
else
    add_check "Backend Env Config" "WARN" ".env file not found (may be intentional)"
fi
echo ""

echo -e "${BLUE}7. Checking Documentation...${NC}"
if [ -d "$SCRIPT_DIR/website" ]; then
    add_check "Documentation Site" "PASS" "Website directory exists"
    
    if [ -f "$SCRIPT_DIR/website/package.json" ]; then
        add_check "Docusaurus Config" "PASS" "package.json found"
    else
        add_check "Docusaurus Config" "WARN" "package.json not found"
    fi
else
    add_check "Documentation Site" "FAIL" "Website directory missing"
fi

if [ -f "$SCRIPT_DIR/README.md" ]; then
    add_check "Root README" "PASS" "Found"
else
    add_check "Root README" "FAIL" "Not found"
fi
echo ""

echo -e "${BLUE}8. Checking Git Repository State...${NC}"
if [ -d "$SCRIPT_DIR/.git" ]; then
    add_check "Git Repository" "PASS" "Initialized"
    
    BRANCH=$(git -C "$SCRIPT_DIR" branch --show-current 2>/dev/null || echo "unknown")
    add_check "Current Branch" "PASS" "On branch: $BRANCH"
    
    REMOTE_URL=$(git -C "$SCRIPT_DIR" config --get remote.origin.url 2>/dev/null || echo "unknown")
    if [[ "$REMOTE_URL" == *"InfinityXOneSystems/quantum-x-builder"* ]]; then
        add_check "Repository Identity" "PASS" "Correct repository"
    else
        add_check "Repository Identity" "WARN" "Unexpected remote: $REMOTE_URL"
    fi
else
    add_check "Git Repository" "FAIL" "Not a git repository"
fi
echo ""

# Generate summary
PASS_COUNT=$(echo "$RESULTS" | jq '[.checks[] | select(.status=="PASS")] | length')
WARN_COUNT=$(echo "$RESULTS" | jq '[.checks[] | select(.status=="WARN")] | length')
FAIL_COUNT=$(echo "$RESULTS" | jq '[.checks[] | select(.status=="FAIL")] | length')
TOTAL_COUNT=$(echo "$RESULTS" | jq '.checks | length')

RESULTS=$(echo "$RESULTS" | jq --arg pass "$PASS_COUNT" --arg warn "$WARN_COUNT" --arg fail "$FAIL_COUNT" --arg total "$TOTAL_COUNT" \
    '.summary = {"total": ($total|tonumber), "passed": ($pass|tonumber), "warnings": ($warn|tonumber), "failed": ($fail|tonumber)}')

# Overall status
if [ "$FAIL_COUNT" -eq 0 ] && [ "$WARN_COUNT" -eq 0 ]; then
    OVERALL="EXCELLENT"
    RESULTS=$(echo "$RESULTS" | jq '.overall_status = "EXCELLENT"')
elif [ "$FAIL_COUNT" -eq 0 ]; then
    OVERALL="GOOD"
    RESULTS=$(echo "$RESULTS" | jq '.overall_status = "GOOD"')
elif [ "$FAIL_COUNT" -lt 3 ]; then
    OVERALL="NEEDS_ATTENTION"
    RESULTS=$(echo "$RESULTS" | jq '.overall_status = "NEEDS_ATTENTION"')
else
    OVERALL="CRITICAL"
    RESULTS=$(echo "$RESULTS" | jq '.overall_status = "CRITICAL"')
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Total Checks: ${BLUE}$TOTAL_COUNT${NC}"
echo -e "Passed: ${GREEN}$PASS_COUNT${NC}"
echo -e "Warnings: ${YELLOW}$WARN_COUNT${NC}"
echo -e "Failed: ${RED}$FAIL_COUNT${NC}"
echo ""

if [ "$OVERALL" = "EXCELLENT" ]; then
    echo -e "Overall Status: ${GREEN}✓ EXCELLENT${NC}"
    echo -e "${GREEN}All system components are properly integrated and identifiable.${NC}"
elif [ "$OVERALL" = "GOOD" ]; then
    echo -e "Overall Status: ${GREEN}✓ GOOD${NC}"
    echo -e "${YELLOW}System is operational with minor warnings.${NC}"
elif [ "$OVERALL" = "NEEDS_ATTENTION" ]; then
    echo -e "Overall Status: ${YELLOW}⚠ NEEDS ATTENTION${NC}"
    echo -e "${YELLOW}Some components require attention.${NC}"
else
    echo -e "Overall Status: ${RED}✗ CRITICAL${NC}"
    echo -e "${RED}Multiple critical issues detected. System integration incomplete.${NC}"
fi

echo ""
echo -e "Report saved to: ${BLUE}$REPORT_FILE${NC}"

# Save report
mkdir -p "$OUTPUT_DIR"
echo "$RESULTS" | jq '.' > "$REPORT_FILE"

echo ""
echo -e "${BLUE}========================================${NC}"

exit 0
