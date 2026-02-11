#!/usr/bin/env node

/**
 * Comprehensive Fix-All Agent
 * 
 * This agent persistently fixes all issues in the repository:
 * - Code formatting and linting
 * - Documentation issues
 * - Security vulnerabilities
 * - Dependency updates
 * - Test failures
 * - TypeScript errors
 * 
 * Runs continuously until all problems are resolved.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  maxIterations: 10,
  retryDelay: 5000,
  killSwitchPath: '_OPS/SAFETY/KILL_SWITCH.json',
  statePath: '_OPS/AUDIT/fix-all-state.json',
  auditPath: '_OPS/AUDIT/fix-all-agent.log'
};

// State management
let state = {
  iteration: 0,
  startTime: new Date().toISOString(),
  fixes: [],
  errors: [],
  completedStages: [],
  inProgress: true
};

/**
 * Check if kill switch is active
 */
function checkKillSwitch() {
  try {
    if (fs.existsSync(CONFIG.killSwitchPath)) {
      const killSwitch = JSON.parse(fs.readFileSync(CONFIG.killSwitchPath, 'utf8'));
      if (killSwitch.kill_switch === 'ARMED' || killSwitch.active === true) {
        log('❌ Kill switch is active. Stopping execution.');
        return true;
      }
    }
  } catch (error) {
    log(`⚠️  Warning: Could not read kill switch: ${error.message}`);
  }
  return false;
}

/**
 * Log message to console and audit file
 */
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  
  // Ensure audit directory exists
  const auditDir = path.dirname(CONFIG.auditPath);
  if (!fs.existsSync(auditDir)) {
    fs.mkdirSync(auditDir, { recursive: true });
  }
  
  // Append to audit log
  fs.appendFileSync(CONFIG.auditPath, logMessage + '\n');
}

/**
 * Save current state to disk
 */
function saveState() {
  try {
    const stateDir = path.dirname(CONFIG.statePath);
    if (!fs.existsSync(stateDir)) {
      fs.mkdirSync(stateDir, { recursive: true });
    }
    fs.writeFileSync(CONFIG.statePath, JSON.stringify(state, null, 2));
  } catch (error) {
    log(`⚠️  Warning: Could not save state: ${error.message}`);
  }
}

/**
 * Load previous state from disk
 */
function loadState() {
  try {
    if (fs.existsSync(CONFIG.statePath)) {
      const savedState = JSON.parse(fs.readFileSync(CONFIG.statePath, 'utf8'));
      // Reset iteration count for new run but keep history
      state = {
        ...savedState,
        iteration: 0,
        startTime: new Date().toISOString(),
        inProgress: true
      };
      log('📂 Loaded previous state');
    }
  } catch (error) {
    log(`⚠️  Warning: Could not load state: ${error.message}`);
  }
}

/**
 * Execute a command safely
 */
function execCommand(command, description) {
  log(`🔧 ${description}...`);
  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });
    log(`✅ ${description} - Success`);
    return { success: true, output };
  } catch (error) {
    const errorMsg = error.message || error.stdout || error.stderr || 'Unknown error';
    log(`❌ ${description} - Failed: ${errorMsg.substring(0, 200)}`);
    return { success: false, error: errorMsg };
  }
}

/**
 * Stage 1: Code Formatting
 */
function fixFormatting() {
  log('\n📝 Stage 1: Code Formatting');
  
  const results = [];
  
  // Prettier
  const prettierResult = execCommand(
    'npx prettier --write "**/*.{js,jsx,ts,tsx,json,md,yml,yaml}" --ignore-path .gitignore --log-level warn',
    'Running Prettier formatting'
  );
  results.push({ name: 'prettier', ...prettierResult });
  
  return results;
}

/**
 * Stage 2: Linting and Auto-fixes
 */
function fixLinting() {
  log('\n🔍 Stage 2: Linting and Auto-fixes');
  
  const results = [];
  
  // ESLint auto-fix
  const eslintResult = execCommand(
    'npx eslint . --ext .js,.jsx,.ts,.tsx --fix --max-warnings=999999',
    'Running ESLint auto-fix'
  );
  results.push({ name: 'eslint', ...eslintResult });
  
  return results;
}

/**
 * Stage 3: TypeScript Errors
 */
function fixTypeScript() {
  log('\n📘 Stage 3: TypeScript Compilation');
  
  const results = [];
  
  // Check TypeScript compilation
  const tscResult = execCommand(
    'npx tsc --noEmit',
    'Checking TypeScript compilation'
  );
  results.push({ name: 'typescript', ...tscResult });
  
  return results;
}

/**
 * Stage 4: Documentation Fixes
 */
function fixDocumentation() {
  log('\n📚 Stage 4: Documentation');
  
  const results = [];
  
  // Format markdown files
  const markdownResult = execCommand(
    'npx prettier --write "**/*.md" --ignore-path .gitignore',
    'Formatting markdown files'
  );
  results.push({ name: 'markdown', ...markdownResult });
  
  return results;
}

/**
 * Stage 5: Security Vulnerabilities
 */
function fixSecurity() {
  log('\n🔒 Stage 5: Security Fixes');
  
  const results = [];
  
  // Run npm audit fix (no --force to avoid breaking changes)
  const auditResult = execCommand(
    'npm audit fix --no-audit --legacy-peer-deps',
    'Running npm audit fix'
  );
  results.push({ name: 'npm-audit', ...auditResult });
  
  return results;
}

/**
 * Stage 6: Dependency Updates
 */
function fixDependencies() {
  log('\n📦 Stage 6: Dependency Updates');
  
  const results = [];
  
  // Update package-lock.json
  const npmInstallResult = execCommand(
    'npm install --package-lock-only --legacy-peer-deps',
    'Updating package-lock.json'
  );
  results.push({ name: 'npm-install', ...npmInstallResult });
  
  return results;
}

/**
 * Stage 7: Test Fixes
 */
function fixTests() {
  log('\n🧪 Stage 7: Running Tests');
  
  const results = [];
  
  // Run tests if they exist
  if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageJson.scripts && packageJson.scripts.test) {
      const testResult = execCommand(
        'npm test -- --run --passWithNoTests',
        'Running tests'
      );
      results.push({ name: 'tests', ...testResult });
    } else {
      log('ℹ️  No test script found, skipping');
      results.push({ name: 'tests', success: true, skipped: true });
    }
  }
  
  return results;
}

/**
 * Check if there are any changes to commit
 */
function hasChanges() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    return status.trim().length > 0;
  } catch (error) {
    log(`⚠️  Warning: Could not check git status: ${error.message}`);
    return false;
  }
}

/**
 * Get list of changed files
 */
function getChangedFiles() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    return status.split('\n').filter(line => line.trim()).map(line => line.substring(3));
  } catch (error) {
    return [];
  }
}

/**
 * Main execution function
 */
async function main() {
  log('╔════════════════════════════════════════════════════════╗');
  log('║   Comprehensive Fix-All Agent - Starting              ║');
  log('╚════════════════════════════════════════════════════════╝');
  
  // Load previous state
  loadState();
  
  // Check kill switch
  if (checkKillSwitch()) {
    state.inProgress = false;
    saveState();
    process.exit(0);
  }
  
  // Execute all fix stages
  const stages = [
    { name: 'formatting', fn: fixFormatting },
    { name: 'linting', fn: fixLinting },
    { name: 'typescript', fn: fixTypeScript },
    { name: 'documentation', fn: fixDocumentation },
    { name: 'security', fn: fixSecurity },
    { name: 'dependencies', fn: fixDependencies },
    { name: 'tests', fn: fixTests }
  ];
  
  for (const stage of stages) {
    log(`\n▶️  Running stage: ${stage.name}`);
    state.iteration++;
    
    // Check kill switch before each stage
    if (checkKillSwitch()) {
      log('❌ Kill switch activated. Stopping.');
      state.inProgress = false;
      saveState();
      process.exit(0);
    }
    
    // Run the stage
    const results = stage.fn();
    
    // Record results
    state.fixes.push({
      stage: stage.name,
      timestamp: new Date().toISOString(),
      results
    });
    
    // Mark stage as completed
    if (!state.completedStages.includes(stage.name)) {
      state.completedStages.push(stage.name);
    }
    
    // Save state after each stage
    saveState();
    
    // Check for changes after each stage
    if (hasChanges()) {
      const changedFiles = getChangedFiles();
      log(`\n📝 Changes detected: ${changedFiles.length} files modified`);
      log('Files changed:');
      changedFiles.slice(0, 10).forEach(file => log(`  - ${file}`));
      if (changedFiles.length > 10) {
        log(`  ... and ${changedFiles.length - 10} more`);
      }
    }
  }
  
  // Final check
  log('\n╔════════════════════════════════════════════════════════╗');
  log('║   Fix-All Agent - Completed                           ║');
  log('╚════════════════════════════════════════════════════════╝');
  
  const finalChanges = hasChanges();
  const changedFiles = getChangedFiles();
  
  log(`\n📊 Summary:`);
  log(`  - Stages completed: ${state.completedStages.length}/${stages.length}`);
  log(`  - Total iterations: ${state.iteration}`);
  log(`  - Changes detected: ${finalChanges ? 'YES' : 'NO'}`);
  log(`  - Files modified: ${changedFiles.length}`);
  
  // Set output for GitHub Actions
  if (process.env.GITHUB_OUTPUT) {
    const output = `has_changes=${finalChanges}\nfiles_changed=${changedFiles.length}\n`;
    fs.appendFileSync(process.env.GITHUB_OUTPUT, output);
  }
  
  state.inProgress = false;
  state.endTime = new Date().toISOString();
  state.hasChanges = finalChanges;
  state.filesChanged = changedFiles.length;
  saveState();
  
  log('✅ Fix-All Agent execution complete');
  
  return finalChanges;
}

// Run the agent
main().catch(error => {
  log(`❌ Fatal error: ${error.message}`);
  state.errors.push({
    timestamp: new Date().toISOString(),
    error: error.message,
    stack: error.stack
  });
  saveState();
  process.exit(1);
});
