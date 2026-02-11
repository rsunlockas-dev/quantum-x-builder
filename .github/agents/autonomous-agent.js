#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

function checkEmergencyStop() {
  const stopPath = path.join(process.cwd(), config.emergency.kill_switch_file);
  if (fs.existsSync(stopPath)) {
    const stopSwitch = JSON.parse(fs.readFileSync(stopPath, 'utf8'));
    if (stopSwitch.active === true) {
      console.log('Emergency stop is active. Exiting.');
      process.exit(0);
    }
  }
}

function execSafe(command, options = {}) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: options.silent ? 'pipe' : 'inherit', ...options });
  } catch (error) {
    console.log(`Command failed: ${command}`);
    if (options.throwOnError) throw error;
    return null;
  }
}

function hasGitChanges() {
  const status = execSafe('git status --porcelain', { silent: true });
  return status && status.trim().length > 0;
}

function runFormatting() {
  console.log('Running code formatting...');
  if (fs.existsSync('node_modules/.bin/prettier')) {
    execSafe('npx prettier --write "**/*.{js,ts,jsx,tsx,json,md,yml,yaml}" --ignore-path .gitignore');
  }
}

function runLinting() {
  console.log('Running linter with auto-fix...');
  if (fs.existsSync('node_modules/.bin/eslint')) {
    execSafe('npx eslint --fix --ext .js,.ts,.jsx,.tsx . --ignore-path .gitignore');
  }
}

function createAuditLog(changes) {
  const auditDir = path.join(process.cwd(), '_OPS/AUDIT');
  if (!fs.existsSync(auditDir)) {
    fs.mkdirSync(auditDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logFile = path.join(auditDir, `autonomous-agent-${timestamp}.json`);
  fs.writeFileSync(logFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    agent: 'autonomous-code-agent',
    run_id: process.env.RUN_ID || 'local',
    changes_detected: changes
  }, null, 2));
}

async function main() {
  console.log('Autonomous Code Agent Starting...');
  checkEmergencyStop();
  
  runFormatting();
  runLinting();
  
  const changesDetected = hasGitChanges();
  if (changesDetected && process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, 'has_changes=true\n');
  } else if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, 'has_changes=false\n');
  }
  
  createAuditLog(changesDetected);
  console.log('Autonomous agent completed.');
}

if (require.main === module) {
  main();
}

module.exports = { main };
