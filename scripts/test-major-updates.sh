#!/bin/bash
# Test major dependency updates before merging
# Usage: ./scripts/test-major-updates.sh

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=== Testing Major Dependency Updates ==="
echo ""

# Save current state
echo "Saving current dependency versions..."
git stash push -m "Backup before testing major updates"

# Test Express 5
echo -e "${YELLOW}Testing Express 4→5...${NC}"
cd backend
cp package.json package.json.backup
npm install express@5.2.1 --save
if npm test 2>/dev/null; then
  echo -e "${GREEN}✓ Express 5: Tests passed${NC}"
  EXPRESS_OK=true
else
  echo -e "${RED}✗ Express 5: Tests failed - DEFER${NC}"
  EXPRESS_OK=false
fi
mv package.json.backup package.json
npm install
cd ..

# Test Vite 7
echo -e "${YELLOW}Testing Vite 6→7...${NC}"
cd frontend
cp package.json package.json.backup
npm install vite@7.3.1 --save-dev
if npm run build 2>/dev/null; then
  echo -e "${GREEN}✓ Vite 7: Build successful${NC}"
  VITE_OK=true
else
  echo -e "${RED}✗ Vite 7: Build failed - DEFER${NC}"
  VITE_OK=false
fi
mv package.json.backup package.json
npm install
cd ..

# Test Chokidar 5
echo -e "${YELLOW}Testing Chokidar 3→5...${NC}"
cd backend
cp package.json package.json.backup
npm install chokidar@5.0.0 --save
if npm test 2>/dev/null; then
  echo -e "${GREEN}✓ Chokidar 5: Tests passed${NC}"
  CHOKIDAR_OK=true
else
  echo -e "${RED}✗ Chokidar 5: Tests failed - DEFER${NC}"
  CHOKIDAR_OK=false
fi
mv package.json.backup package.json
npm install
cd ..

# Test googleapis
echo -e "${YELLOW}Testing googleapis 128→171...${NC}"
cd backend
cp package.json package.json.backup
npm install googleapis@171.4.0 --save
if npm test 2>/dev/null; then
  echo -e "${GREEN}✓ googleapis 171: Tests passed${NC}"
  GOOGLEAPIS_OK=true
else
  echo -e "${RED}✗ googleapis 171: Tests failed - DEFER${NC}"
  GOOGLEAPIS_OK=false
fi
mv package.json.backup package.json
npm install
cd ..

# Restore state
git stash pop 2>/dev/null || true

echo ""
echo "=== Test Summary ==="
echo ""
if [ "$EXPRESS_OK" = true ]; then
  echo -e "${GREEN}✓ PR #12 (Express 5): SAFE TO MERGE${NC}"
else
  echo -e "${RED}✗ PR #12 (Express 5): DEFER - needs investigation${NC}"
fi

if [ "$VITE_OK" = true ]; then
  echo -e "${GREEN}✓ PR #15 (Vite 7): SAFE TO MERGE${NC}"
else
  echo -e "${RED}✗ PR #15 (Vite 7): DEFER - needs investigation${NC}"
fi

if [ "$CHOKIDAR_OK" = true ]; then
  echo -e "${GREEN}✓ PR #10 (Chokidar 5): SAFE TO MERGE${NC}"
else
  echo -e "${RED}✗ PR #10 (Chokidar 5): DEFER - needs investigation${NC}"
fi

if [ "$GOOGLEAPIS_OK" = true ]; then
  echo -e "${GREEN}✓ PR #16 (googleapis 171): SAFE TO MERGE${NC}"
else
  echo -e "${RED}✗ PR #16 (googleapis 171): DEFER - needs investigation${NC}"
fi

echo ""
echo "=== Next Steps ==="
echo ""
if [ "$EXPRESS_OK" = true ]; then
  echo "gh pr merge 12 --squash"
fi
if [ "$VITE_OK" = true ]; then
  echo "gh pr merge 15 --squash"
fi
if [ "$CHOKIDAR_OK" = true ]; then
  echo "gh pr merge 10 --squash"
fi
if [ "$GOOGLEAPIS_OK" = true ]; then
  echo "gh pr merge 16 --squash"
fi
