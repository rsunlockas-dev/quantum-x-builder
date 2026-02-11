# Testing Guide - Frontend Refactor & GitHub Pages Deployment

This guide provides step-by-step instructions to test the frontend build fixes and GitHub Pages deployment.

## Prerequisites

- Docker (>= 24.0)
- Node.js (>= 20) - for local testing
- Git

## Test 1: Docker Build (Local)

Test that the frontend builds correctly in Docker.

```bash
# Navigate to frontend directory
cd frontend

# Build the Docker image
docker build -t qxb-frontend-test .

# Expected output:
# - Build completes in ~10-15 seconds (without cache)
# - No errors
# - Final size: ~200MB

# Run the container
docker run -d --name qxb-frontend-test -p 3000:3000 qxb-frontend-test

# Test the frontend
curl http://localhost:3000
# Should return HTML

# Access in browser
# Open: http://localhost:3000
# Should show Vizual-X interface

# Clean up
docker stop qxb-frontend-test
docker rm qxb-frontend-test
docker rmi qxb-frontend-test
```

**Expected Results:**
- ✅ Build completes without errors
- ✅ Frontend responds on port 3000
- ✅ UI renders correctly in browser
- ✅ No console errors

## Test 2: Local Build (Mock Mode)

Test the mock mode build configuration.

```bash
cd frontend

# Install dependencies
npm install

# Build with mock mode (GitHub Pages config)
MOCK_MODE=true VITE_MOCK_MODE=true PAGES_BASE=/quantum-x-builder/ npm run build

# Expected output:
# - dist/assets/vendor-*.js (~12 KB gzipped)
# - dist/assets/index-*.js (~90 KB gzipped)
# - dist/.nojekyll file exists
# - dist/index.html exists

# Check build output
ls -lah dist/
cat dist/.nojekyll  # Should be empty file

# Preview the build
npm run preview

# Access in browser
# Open: http://localhost:3000
```

**Expected Results:**
- ✅ Build completes in ~2 seconds
- ✅ dist/ directory created
- ✅ .nojekyll file present
- ✅ Preview server starts on port 3000

## Test 3: Mock Mode Functionality

Test that mock mode provides fallback responses.

```bash
cd frontend

# Build in mock mode
MOCK_MODE=true VITE_MOCK_MODE=true npm run build
npm run preview
```

1. Open http://localhost:3000 in browser
2. Create a new chat session
3. Send a message
4. Verify mock response appears:
   - Should contain "Mock Mode Active 🎭"
   - Should explain demo functionality
   - Should not make real API calls

**Expected Results:**
- ✅ Mock response displays
- ✅ No network errors
- ✅ UI remains interactive
- ✅ Theme switching works

## Test 4: Full Stack Docker

Test the frontend with the full backend stack.

```bash
# From project root
./launch.sh

# Access services
# Frontend: http://localhost:3000
# Backend:  http://localhost:8787

# Verify backend connection
curl http://localhost:8787/health
# Should return: {"status":"ok"}
```

**Expected Results:**
- ✅ All services start
- ✅ Frontend connects to backend
- ✅ Real API integration works
- ✅ No mock mode messages

## Test 5: GitHub Pages Workflow

Test the GitHub Pages deployment workflow (requires push to main).

### Manual Trigger (Recommended for Testing)

1. Go to repository on GitHub
2. Navigate to **Actions** tab
3. Select **Deploy to GitHub Pages** workflow
4. Click **Run workflow**
5. Select `main` branch
6. Click **Run workflow**

Monitor the workflow:
- Build job should complete in ~2-3 minutes
- Deploy job should complete in ~30 seconds
- Site available at: https://infinityxonesystems.github.io/quantum-x-builder/

### Automatic Trigger

Push changes to `main` that modify `frontend/` directory:

```bash
git checkout main
git merge refactor/frontend-pages
git push origin main
```

**Expected Results:**
- ✅ Workflow triggers automatically
- ✅ Build completes successfully
- ✅ Deployment succeeds
- ✅ Site loads at GitHub Pages URL
- ✅ Mock mode enabled on Pages

## Test 6: UI Preservation Check

Verify that no UI components or business logic were changed.

```bash
# Compare UI code with main branch
git diff main..refactor/frontend-pages -- frontend/App.tsx
git diff main..refactor/frontend-pages -- frontend/components/
git diff main..refactor/frontend-pages -- frontend/src/

# Should show NO differences
```

**Expected Results:**
- ✅ No changes to App.tsx
- ✅ No changes to components/
- ✅ No changes to src/ (except backend service mock mode)

## Test 7: Documentation Verification

Verify documentation is accurate and helpful.

```bash
# Check documentation files exist
ls docs/GITHUB_PAGES_DEPLOYMENT.md
ls QUICK_START.md
ls frontend/README.md

# Read and verify content
cat docs/GITHUB_PAGES_DEPLOYMENT.md | grep -i "mock mode"
cat QUICK_START.md | grep -i "github pages"
cat frontend/README.md | grep -i "deployment"
```

**Expected Results:**
- ✅ All docs exist
- ✅ Documentation mentions mock mode
- ✅ Instructions are clear
- ✅ Examples are correct

## Test 8: Environment Variables

Test that environment variables work correctly.

```bash
cd frontend

# Test 1: No env vars (mock mode fallback)
npm run build
npm run preview
# Should use mock mode

# Test 2: With backend URL
VITE_BACKEND_URL=http://localhost:8787 npm run build
npm run preview
# Should attempt backend connection

# Test 3: Pages configuration
PAGES_BASE=/quantum-x-builder/ npm run build
# Check dist/index.html for correct base path
grep "/quantum-x-builder/" dist/index.html
```

**Expected Results:**
- ✅ Mock mode works without env vars
- ✅ Backend URL respected when set
- ✅ Base path configured correctly

## Troubleshooting

### Issue: Docker build fails

**Solution:**
```bash
# Check Docker is running
docker info

# Clear Docker cache
docker builder prune -a

# Rebuild
cd frontend && docker build -t qxb-frontend-test .
```

### Issue: npm install fails

**Solution:**
```bash
# Clear npm cache
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Issue: Port already in use

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
npm run preview -- --port 3001
```

### Issue: Mock mode not working

**Solution:**
```bash
# Verify environment variables
MOCK_MODE=true VITE_MOCK_MODE=true npm run build

# Check build output
grep "MOCK_MODE" dist/assets/index-*.js
```

## Success Criteria

All tests should pass with these results:

- ✅ Docker build completes without errors
- ✅ Frontend runs in Docker on port 3000
- ✅ Mock mode provides fallback responses
- ✅ Full stack works with backend
- ✅ GitHub Pages workflow deploys successfully
- ✅ No UI code was modified
- ✅ Documentation is complete and accurate
- ✅ Environment variables work correctly

## Automated Validation

Run all tests with a single script:

```bash
#!/bin/bash
# Save as test-frontend-refactor.sh

echo "🧪 Testing Frontend Refactor"

# Test 1: Docker Build
echo "Test 1: Docker Build"
cd frontend
docker build -t qxb-frontend-test . || exit 1
docker run -d --name qxb-frontend-test -p 3000:3000 qxb-frontend-test
sleep 5
curl -f http://localhost:3000 > /dev/null || exit 1
docker stop qxb-frontend-test && docker rm qxb-frontend-test
docker rmi qxb-frontend-test

# Test 2: Local Build
echo "Test 2: Local Build"
npm install
MOCK_MODE=true npm run build || exit 1
[ -f dist/.nojekyll ] || exit 1

# Test 3: UI Preservation
echo "Test 3: UI Preservation"
cd ..
git diff main..HEAD -- frontend/App.tsx frontend/components/ | wc -l | grep -q "^0$" || exit 1

echo "✅ All tests passed!"
```

## Next Steps

After all tests pass:

1. Request code review
2. Run security scan
3. Merge to main branch
4. Monitor GitHub Pages deployment
5. Verify live demo at: https://infinityxonesystems.github.io/quantum-x-builder/

## Related Documentation

- [GitHub Pages Deployment Guide](GITHUB_PAGES_DEPLOYMENT.md)
- [Quick Start Guide](../QUICK_START.md)
- [Docker Deployment Guide](../DOCKER_DEPLOYMENT_GUIDE.md)
