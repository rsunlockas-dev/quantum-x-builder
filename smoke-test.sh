#!/bin/bash

# Quantum-X-Builder Smoke Test Suite
# Purpose: Quick validation that all critical components are working
# Run this after any merge to main to ensure system health

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="${SCRIPT_DIR}/_OPS/OUTPUT/smoke_test_${TIMESTAMP}.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Results array
RESULTS='{"timestamp": "'$(date -Iseconds)'", "tests": []}'

# Add test result
add_test() {
    local name="$1"
    local status="$2"
    local message="$3"
    local duration="${4:-0}"
    
    TESTS_RUN=$((TESTS_RUN + 1))
    
    if [ "$status" = "PASS" ]; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo -e "${GREEN}✓${NC} $name: $message (${duration}ms)"
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo -e "${RED}✗${NC} $name: $message"
    fi
    
    RESULTS=$(echo "$RESULTS" | jq --arg name "$name" --arg status "$status" --arg msg "$message" --arg dur "$duration" \
        '.tests += [{"name": $name, "status": $status, "message": $msg, "duration": ($dur|tonumber)}]')
}

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  Quantum-X-Builder Smoke Test Suite  ${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

# Test 1: Repository Structure
echo -e "${BLUE}[1/10] Testing Repository Structure...${NC}"
START=$(date +%s%3N)
if [ -d "$SCRIPT_DIR/backend" ] && [ -d "$SCRIPT_DIR/frontend" ] && [ -d "$SCRIPT_DIR/_OPS" ]; then
    END=$(date +%s%3N)
    add_test "Repository Structure" "PASS" "All critical directories present" $((END - START))
else
    END=$(date +%s%3N)
    add_test "Repository Structure" "FAIL" "Missing critical directories" $((END - START))
fi

# Test 2: Configuration Files
echo -e "${BLUE}[2/10] Testing Configuration Files...${NC}"
START=$(date +%s%3N)
CONFIG_FILES=(
    "package.json"
    "backend/package.json"
    "frontend/package.json"
    "SYSTEM_INTEGRATION_MANIFEST.json"
)
ALL_CONFIGS_PRESENT=true
for file in "${CONFIG_FILES[@]}"; do
    if [ ! -f "$SCRIPT_DIR/$file" ]; then
        ALL_CONFIGS_PRESENT=false
        break
    fi
done
END=$(date +%s%3N)
if $ALL_CONFIGS_PRESENT; then
    add_test "Configuration Files" "PASS" "All config files present" $((END - START))
else
    add_test "Configuration Files" "FAIL" "Missing config files" $((END - START))
fi

# Test 3: Kill Switch Status
echo -e "${BLUE}[3/10] Testing Kill Switch...${NC}"
START=$(date +%s%3N)
if [ -f "$SCRIPT_DIR/_OPS/SAFETY/KILL_SWITCH.json" ]; then
    KILL_SWITCH=$(jq -r '.kill_switch' "$SCRIPT_DIR/_OPS/SAFETY/KILL_SWITCH.json" 2>/dev/null || echo "UNKNOWN")
    END=$(date +%s%3N)
    # OFF or ARMED are acceptable states (ARMED means ready but not activated)
    # ON means it's actively halting operations
    if [ "$KILL_SWITCH" = "OFF" ] || [ "$KILL_SWITCH" = "ARMED" ]; then
        add_test "Kill Switch" "PASS" "Kill switch status: $KILL_SWITCH (operations enabled)" $((END - START))
    elif [ "$KILL_SWITCH" = "ON" ]; then
        add_test "Kill Switch" "FAIL" "Kill switch is ON - operations halted" $((END - START))
    else
        add_test "Kill Switch" "FAIL" "Unknown kill switch status: $KILL_SWITCH" $((END - START))
    fi
else
    END=$(date +%s%3N)
    add_test "Kill Switch" "FAIL" "Kill switch file not found" $((END - START))
fi

# Test 4: System Manifest Validation
echo -e "${BLUE}[4/10] Testing System Manifest...${NC}"
START=$(date +%s%3N)
if [ -f "$SCRIPT_DIR/SYSTEM_INTEGRATION_MANIFEST.json" ]; then
    if jq empty "$SCRIPT_DIR/SYSTEM_INTEGRATION_MANIFEST.json" 2>/dev/null; then
        SYSTEM_NAME=$(jq -r '.system.name' "$SCRIPT_DIR/SYSTEM_INTEGRATION_MANIFEST.json")
        END=$(date +%s%3N)
        add_test "System Manifest" "PASS" "Valid JSON - System: $SYSTEM_NAME" $((END - START))
    else
        END=$(date +%s%3N)
        add_test "System Manifest" "FAIL" "Invalid JSON format" $((END - START))
    fi
else
    END=$(date +%s%3N)
    add_test "System Manifest" "FAIL" "Manifest file not found" $((END - START))
fi

# Test 5: Backend Package Validation
echo -e "${BLUE}[5/10] Testing Backend Package...${NC}"
START=$(date +%s%3N)
if [ -f "$SCRIPT_DIR/backend/package.json" ]; then
    if jq empty "$SCRIPT_DIR/backend/package.json" 2>/dev/null; then
        BACKEND_NAME=$(jq -r '.name' "$SCRIPT_DIR/backend/package.json")
        END=$(date +%s%3N)
        add_test "Backend Package" "PASS" "Valid - Name: $BACKEND_NAME" $((END - START))
    else
        END=$(date +%s%3N)
        add_test "Backend Package" "FAIL" "Invalid package.json" $((END - START))
    fi
else
    END=$(date +%s%3N)
    add_test "Backend Package" "FAIL" "package.json not found" $((END - START))
fi

# Test 6: Frontend Package Validation
echo -e "${BLUE}[6/10] Testing Frontend Package...${NC}"
START=$(date +%s%3N)
if [ -f "$SCRIPT_DIR/frontend/package.json" ]; then
    if jq empty "$SCRIPT_DIR/frontend/package.json" 2>/dev/null; then
        FRONTEND_NAME=$(jq -r '.name' "$SCRIPT_DIR/frontend/package.json")
        END=$(date +%s%3N)
        add_test "Frontend Package" "PASS" "Valid - Name: $FRONTEND_NAME" $((END - START))
    else
        END=$(date +%s%3N)
        add_test "Frontend Package" "FAIL" "Invalid package.json" $((END - START))
    fi
else
    END=$(date +%s%3N)
    add_test "Frontend Package" "FAIL" "package.json not found" $((END - START))
fi

# Test 7: Backend Health Check (if running)
echo -e "${BLUE}[7/10] Testing Backend Health (if running)...${NC}"
START=$(date +%s%3N)
BACKEND_PORT=8787
if command -v curl &> /dev/null; then
    if curl -s -f "http://localhost:${BACKEND_PORT}/health" > /dev/null 2>&1; then
        END=$(date +%s%3N)
        add_test "Backend Health" "PASS" "Backend responding on port $BACKEND_PORT" $((END - START))
    else
        END=$(date +%s%3N)
        add_test "Backend Health" "FAIL" "Backend not responding (may not be started)" $((END - START))
    fi
else
    END=$(date +%s%3N)
    add_test "Backend Health" "FAIL" "curl not available for health check" $((END - START))
fi

# Test 8: Git Repository Status
echo -e "${BLUE}[8/10] Testing Git Repository...${NC}"
START=$(date +%s%3N)
if [ -d "$SCRIPT_DIR/.git" ]; then
    BRANCH=$(git -C "$SCRIPT_DIR" branch --show-current 2>/dev/null || echo "unknown")
    REMOTE=$(git -C "$SCRIPT_DIR" config --get remote.origin.url 2>/dev/null || echo "unknown")
    END=$(date +%s%3N)
    if [[ "$REMOTE" == *"quantum-x-builder"* ]]; then
        add_test "Git Repository" "PASS" "Valid repo on branch: $BRANCH" $((END - START))
    else
        add_test "Git Repository" "FAIL" "Unexpected remote: $REMOTE" $((END - START))
    fi
else
    END=$(date +%s%3N)
    add_test "Git Repository" "FAIL" "Not a git repository" $((END - START))
fi

# Test 9: Documentation
echo -e "${BLUE}[9/10] Testing Documentation...${NC}"
START=$(date +%s%3N)
CRITICAL_DOCS=(
    "README.md"
    "SAFE_MERGE_STRATEGY.md"
    "QUICKSTART.md"
)
DOCS_PRESENT=true
for doc in "${CRITICAL_DOCS[@]}"; do
    if [ ! -f "$SCRIPT_DIR/$doc" ]; then
        DOCS_PRESENT=false
        break
    fi
done
END=$(date +%s%3N)
if $DOCS_PRESENT; then
    add_test "Documentation" "PASS" "Critical documentation present" $((END - START))
else
    add_test "Documentation" "FAIL" "Missing critical documentation" $((END - START))
fi

# Test 10: Autonomous Agent Configuration
echo -e "${BLUE}[10/10] Testing Autonomous Agents...${NC}"
START=$(date +%s%3N)
if [ -f "$SCRIPT_DIR/.github/agents/config.json" ]; then
    if jq empty "$SCRIPT_DIR/.github/agents/config.json" 2>/dev/null; then
        END=$(date +%s%3N)
        add_test "Autonomous Agents" "PASS" "Agent configuration valid" $((END - START))
    else
        END=$(date +%s%3N)
        add_test "Autonomous Agents" "FAIL" "Invalid agent configuration" $((END - START))
    fi
else
    END=$(date +%s%3N)
    add_test "Autonomous Agents" "FAIL" "Agent configuration not found" $((END - START))
fi

# Generate Summary
echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}           Test Summary                ${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "Total Tests:  ${BLUE}${TESTS_RUN}${NC}"
echo -e "Passed:       ${GREEN}${TESTS_PASSED}${NC}"
echo -e "Failed:       ${RED}${TESTS_FAILED}${NC}"
echo ""

# Overall Status
if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "Status: ${GREEN}✓ ALL TESTS PASSED${NC}"
    OVERALL_STATUS="PASS"
    EXIT_CODE=0
elif [ $TESTS_FAILED -le 2 ]; then
    echo -e "Status: ${YELLOW}⚠ SOME TESTS FAILED${NC}"
    OVERALL_STATUS="WARN"
    EXIT_CODE=0
else
    echo -e "Status: ${RED}✗ CRITICAL FAILURES${NC}"
    OVERALL_STATUS="FAIL"
    EXIT_CODE=1
fi

# Add summary to results
RESULTS=$(echo "$RESULTS" | jq --arg total "$TESTS_RUN" --arg passed "$TESTS_PASSED" --arg failed "$TESTS_FAILED" --arg status "$OVERALL_STATUS" \
    '.summary = {"total": ($total|tonumber), "passed": ($passed|tonumber), "failed": ($failed|tonumber), "overall_status": $status}')

# Save report
mkdir -p "$(dirname "$REPORT_FILE")"
echo "$RESULTS" | jq '.' > "$REPORT_FILE"

echo ""
echo -e "Report saved: ${BLUE}$REPORT_FILE${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

exit $EXIT_CODE
