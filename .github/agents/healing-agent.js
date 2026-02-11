#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

function execSafe(command, options = {}) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: options.silent ? 'pipe' : 'inherit', ...options });
  } catch (error) {
    if (options.throwOnError) throw error;
    return null;
  }
}

function readValidationReport() {
  const reportPath = path.join(__dirname, 'validation-report.json');
  if (!fs.existsSync(reportPath)) {
    console.log('No validation report found. Skipping healing.');
    return null;
  }
  return JSON.parse(fs.readFileSync(reportPath, 'utf8'));
}

function applyFixes() {
  console.log('Applying fixes...');
  let fixesApplied = false;
  
  if (fs.existsSync('node_modules/.bin/eslint')) {
    console.log('Running ESLint --fix...');
    execSafe('npx eslint --fix --ext .js,.ts,.jsx,.tsx . --ignore-path .gitignore');
    fixesApplied = true;
  }
  
  if (fs.existsSync('node_modules/.bin/prettier')) {
    console.log('Running Prettier --write...');
    execSafe('npx prettier --write "**/*.{js,ts,jsx,tsx,json,md}" --ignore-path .gitignore');
    fixesApplied = true;
  }
  
  if (fs.existsSync('package.json')) {
    console.log('Running npm audit fix...');
    execSafe('npm audit fix 2>/dev/null || true');
    fixesApplied = true;
  }
  
  return fixesApplied;
}

function hasGitChanges() {
  const status = execSafe('git status --porcelain', { silent: true });
  return status && status.trim().length > 0;
}

async function main() {
  console.log('Healing Agent Starting...');
  
  const report = readValidationReport();
  if (!report) {
    process.exit(0);
  }
  
  if (report.approved) {
    console.log('Validation already passed. No healing needed.');
    process.exit(0);
  }
  
  console.log('Validation failed. Attempting to heal...');
  applyFixes();
  
  if (hasGitChanges()) {
    console.log('Fixes applied. Changes detected.');
  } else {
    console.log('No changes after healing attempt.');
  }
  
  console.log('Healing agent completed.');
}

if (require.main === module) {
  main();
}

module.exports = { main };
