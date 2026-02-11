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

function validateESLint() {
  console.log('Validating ESLint...');
  if (!fs.existsSync('node_modules/.bin/eslint')) {
    return { passed: true, skipped: true };
  }
  const result = execSafe('npx eslint --ext .js,.ts,.jsx,.tsx . --format json', { silent: true });
  if (result) {
    const eslintResults = JSON.parse(result);
    const errors = eslintResults.reduce((sum, file) => sum + file.errorCount, 0);
    const warnings = eslintResults.reduce((sum, file) => sum + file.warningCount, 0);
    return { passed: errors === 0, errors, warnings };
  }
  return { passed: false };
}

function validatePrettier() {
  console.log('Validating Prettier...');
  if (!fs.existsSync('node_modules/.bin/prettier')) {
    return { passed: true, skipped: true };
  }
  const result = execSafe('npx prettier --check "**/*.{js,ts,jsx,tsx,json,md}" --ignore-path .gitignore', { silent: true });
  return { passed: result !== null };
}

function validateTypeScript() {
  console.log('Validating TypeScript...');
  if (!fs.existsSync('tsconfig.json')) {
    return { passed: true, skipped: true };
  }
  const result = execSafe('npx tsc --noEmit', { silent: true });
  return { passed: result !== null };
}

function validateSecurity() {
  console.log('Running security audit...');
  if (!fs.existsSync('package.json')) {
    return { passed: true, skipped: true };
  }
  const result = execSafe('npm audit --json', { silent: true });
  if (result) {
    const audit = JSON.parse(result);
    const vulnerabilities = audit.metadata?.vulnerabilities || {};
    const total = Object.values(vulnerabilities).reduce((sum, count) => sum + count, 0);
    return { passed: total === 0, vulnerabilities: total };
  }
  return { passed: false };
}

function createValidationReport(results) {
  const reportPath = path.join(__dirname, 'validation-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    pr_number: process.env.PR_NUMBER || 'unknown',
    results,
    approved: Object.values(results).every(r => r.passed)
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Validation report: ${reportPath}`);
  return report;
}

async function main() {
  console.log('Validation Agent Starting...');
  
  const results = {
    eslint: validateESLint(),
    prettier: validatePrettier(),
    typescript: validateTypeScript(),
    security: validateSecurity()
  };
  
  const report = createValidationReport(results);
  
  if (report.approved) {
    console.log('All validation checks passed!');
    process.exit(0);
  } else {
    console.log('Validation checks failed.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
