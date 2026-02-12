#!/bin/bash

# Merge Gate - Local Pre-Merge Validation
# Run this script before creating a PR to ensure it will pass all checks

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

# Track gate results
GATES_PASSED=0
GATES_FAILED=0

echo ""
echo -e "${BOLD}${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${BLUE}║   Quantum-X-Builder Merge Gate System     ║${NC}"
echo -e "${BOLD}${BLUE}║   Local Pre-Merge Validation              ║${NC}"
echo -e "${BOLD}${BLUE}╔════════════════════════════════════════════╗${NC}"
echo ""
echo -e "${BLUE}This script validates your changes before you create a PR.${NC}"
echo -e "${BLUE}All gates must pass before merging to main.${NC}"
echo ""

# Function to run a gate
run_gate() {
    local gate_name="$1"
    local gate_command="$2"
    local critical="${3:-true}"
    
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
    echo -e "${BOLD}Gate: ${gate_name}${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
    
    if eval "$gate_command"; then
        echo -e "${GREEN}✓ PASSED${NC} - ${gate_name}"
        GATES_PASSED=$((GATES_PASSED + 1))
        return 0
    else
        if [ "$critical" = "true" ]; then
            echo -e "${RED}✗ FAILED${NC} - ${gate_name}"
            GATES_FAILED=$((GATES_FAILED + 1))
            return 1
        else
            echo -e "${YELLOW}⚠ WARNING${NC} - ${gate_name}"
            return 0
        fi
    fi
}

# Gate 1: Kill Switch Check
gate_1_check() {
    echo "Checking kill switch status..."
    if [ -f "_OPS/SAFETY/KILL_SWITCH.json" ]; then
        KILL_SWITCH=$(jq -r '.kill_switch' _OPS/SAFETY/KILL_SWITCH.json 2>/dev/null || echo "UNKNOWN")
        # OFF or ARMED are acceptable (ARMED = ready but not activated, OFF = disabled)
        # ON means actively halting operations
        if [ "$KILL_SWITCH" = "OFF" ] || [ "$KILL_SWITCH" = "ARMED" ]; then
            echo "✓ Kill switch status: $KILL_SWITCH (operations enabled)"
            return 0
        elif [ "$KILL_SWITCH" = "ON" ]; then
            echo "✗ Kill switch is ON - operations actively halted"
            echo "  Cannot merge while kill switch is actively ON"
            return 1
        else
            echo "⚠ Unknown kill switch status: $KILL_SWITCH"
            return 0
        fi
    else
        echo "✗ Kill switch file not found"
        return 1
    fi
}

# Gate 2: Git Status Check
gate_2_check() {
    echo "Checking git status..."
    
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        echo "✗ You have uncommitted changes"
        echo "  Please commit or stash your changes before running merge gate"
        git status --short
        return 1
    fi
    
    # Check current branch
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$CURRENT_BRANCH" = "main" ]; then
        echo "⚠ You are on the main branch"
        echo "  It's recommended to work in a feature branch"
    else
        echo "✓ Working in feature branch: $CURRENT_BRANCH"
    fi
    
    # Check if branch is pushed
    if git rev-parse --abbrev-ref --symbolic-full-name @{u} &>/dev/null; then
        echo "✓ Branch is tracking a remote"
    else
        echo "⚠ Branch is not pushed to remote yet"
    fi
    
    return 0
}

# Gate 3: Dependencies Check
gate_3_check() {
    echo "Checking dependencies..."
    
    # Check root dependencies
    if [ -f "package.json" ]; then
        if [ ! -d "node_modules" ]; then
            echo "⚠ Root dependencies not installed"
            echo "  Running: npm install"
            npm install --prefer-offline --no-audit || return 1
        fi
        echo "✓ Root dependencies OK"
    fi
    
    # Check backend dependencies
    if [ -f "backend/package.json" ]; then
        if [ ! -d "backend/node_modules" ]; then
            echo "⚠ Backend dependencies not installed"
            echo "  Running: cd backend && npm install"
            (cd backend && npm install --prefer-offline --no-audit) || return 1
        fi
        echo "✓ Backend dependencies OK"
    fi
    
    # Check frontend dependencies
    if [ -f "frontend/package.json" ]; then
        if [ ! -d "frontend/node_modules" ]; then
            echo "⚠ Frontend dependencies not installed"
            echo "  Running: cd frontend && npm install"
            (cd frontend && npm install --prefer-offline --no-audit) || return 1
        fi
        echo "✓ Frontend dependencies OK"
    fi
    
    return 0
}

# Gate 4: Lint Check
gate_4_check() {
    echo "Running lint checks..."
    npm run lint 2>&1 || {
        echo ""
        echo "✗ Linting failed"
        echo "  Run 'npm run lint:fix' to auto-fix issues"
        return 1
    }
    echo "✓ No linting errors"
    return 0
}

# Gate 5: Type Check
gate_5_check() {
    echo "Running TypeScript type checks..."
    npm run typecheck 2>&1 || {
        echo ""
        echo "✗ Type checking failed"
        echo "  Review and fix TypeScript errors above"
        return 1
    }
    echo "✓ No type errors"
    return 0
}

# Gate 6: Tests
gate_6_check() {
    echo "Running test suite..."
    if [ -d "tests" ]; then
        npm test 2>&1 || {
            echo ""
            echo "✗ Tests failed"
            echo "  Review and fix test failures above"
            return 1
        }
        echo "✓ All tests passed"
    else
        echo "⚠ No tests directory found"
        echo "  Consider adding tests for your changes"
    fi
    return 0
}

# Gate 7: System Manifest
gate_7_check() {
    echo "Validating system manifest..."
    if [ -f "SYSTEM_INTEGRATION_MANIFEST.json" ]; then
        if jq empty SYSTEM_INTEGRATION_MANIFEST.json 2>/dev/null; then
            echo "✓ System manifest is valid JSON"
            return 0
        else
            echo "✗ System manifest has invalid JSON"
            return 1
        fi
    else
        echo "✗ System manifest not found"
        return 1
    fi
}

# Gate 8: Integration Validation
gate_8_check() {
    echo "Running integration validation..."
    if [ -f "validate-integration.sh" ]; then
        chmod +x validate-integration.sh
        ./validate-integration.sh > /dev/null 2>&1 || {
            echo "⚠ Integration validation found issues"
            echo "  Run './validate-integration.sh' to see details"
            return 0  # Non-critical
        }
        
        LATEST_REPORT=$(ls -t _OPS/OUTPUT/integration_validation_*.json 2>/dev/null | head -1)
        if [ -f "$LATEST_REPORT" ]; then
            OVERALL=$(jq -r '.overall_status' "$LATEST_REPORT")
            FAILED=$(jq -r '.summary.failed' "$LATEST_REPORT")
            
            if [ "$OVERALL" = "CRITICAL" ]; then
                echo "✗ Critical integration issues: $FAILED failures"
                return 1
            elif [ "$OVERALL" = "NEEDS_ATTENTION" ]; then
                echo "⚠ Integration needs attention: $FAILED failures"
            else
                echo "✓ Integration validation passed"
            fi
        fi
    else
        echo "⚠ Integration validation script not found"
    fi
    return 0
}

# Gate 9: Security Audit
gate_9_check() {
    echo "Running security audit..."
    
    # Run audit but don't fail on warnings
    AUDIT_OUTPUT=$(npm audit --production 2>&1)
    
    if echo "$AUDIT_OUTPUT" | grep -q "found 0 vulnerabilities"; then
        echo "✓ No security vulnerabilities"
        return 0
    elif echo "$AUDIT_OUTPUT" | grep -q "critical"; then
        echo "✗ Critical security vulnerabilities found"
        echo "$AUDIT_OUTPUT" | grep -A 5 "critical"
        return 1
    elif echo "$AUDIT_OUTPUT" | grep -q "high"; then
        echo "⚠ High severity vulnerabilities found"
        echo "  Run 'npm audit' for details"
        return 0  # Non-critical
    else
        echo "✓ No critical vulnerabilities (some low/moderate may exist)"
        return 0
    fi
}

# Gate 10: Smoke Test
gate_10_check() {
    echo "Running smoke tests..."
    if [ -f "smoke-test.sh" ]; then
        chmod +x smoke-test.sh
        ./smoke-test.sh > /dev/null 2>&1 || {
            echo "⚠ Some smoke tests failed"
            echo "  Run './smoke-test.sh' to see details"
            return 0  # Non-critical
        }
        echo "✓ Smoke tests passed"
    else
        echo "⚠ Smoke test script not found"
    fi
    return 0
}

# Run all gates
cd "$SCRIPT_DIR"

run_gate "Kill Switch Check" gate_1_check true
run_gate "Git Status Check" gate_2_check true
run_gate "Dependencies Check" gate_3_check true
run_gate "Lint Check" gate_4_check true
run_gate "Type Check" gate_5_check true
run_gate "Tests" gate_6_check true
run_gate "System Manifest" gate_7_check true
run_gate "Integration Validation" gate_8_check false
run_gate "Security Audit" gate_9_check false
run_gate "Smoke Test" gate_10_check false

# Final Summary
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BOLD}MERGE GATE SUMMARY${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""
TOTAL_GATES=$((GATES_PASSED + GATES_FAILED))
echo -e "Total Gates: ${BLUE}${TOTAL_GATES}${NC}"
echo -e "Passed:      ${GREEN}${GATES_PASSED}${NC}"
echo -e "Failed:      ${RED}${GATES_FAILED}${NC}"
echo ""

if [ $GATES_FAILED -eq 0 ]; then
    echo -e "${GREEN}${BOLD}✓ ALL GATES PASSED${NC}"
    echo ""
    echo -e "${GREEN}Your changes are ready to be merged!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Push your branch: git push origin $(git branch --show-current)"
    echo "  2. Create a PR on GitHub"
    echo "  3. Wait for automated validation to complete"
    echo "  4. Merge when all checks are green"
    echo ""
    exit 0
else
    echo -e "${RED}${BOLD}✗ MERGE GATE FAILED${NC}"
    echo ""
    echo -e "${RED}Your changes are NOT ready to be merged.${NC}"
    echo ""
    echo "Please fix the issues above and run this script again."
    echo ""
    echo "Common fixes:"
    echo "  - Lint errors:   npm run lint:fix"
    echo "  - Type errors:   Review TypeScript errors"
    echo "  - Test failures: Fix failing tests"
    echo "  - Dependencies:  npm install"
    echo ""
    exit 1
fi
