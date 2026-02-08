#!/usr/bin/env node

/**
 * Publish script for VIZUAL X VS Code Extension
 * Publishes extension to VS Code Marketplace
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Publishing VIZUAL X to VS Code Marketplace...');

// Check for VSCE token
const token = process.env.VSCE_PAT;
if (!token) {
  console.error('❌ VSCE_PAT environment variable not set');
  console.error('Set your personal access token before publishing');
  process.exit(1);
}

try {
  console.log('🔍 Verifying build...');
  const vsixPath = path.join(__dirname, 'vizual-x.vsix');
  if (!fs.existsSync(vsixPath)) {
    console.log('📦 Building extension first...');
    require('./build.js');
  }

  console.log('📤 Publishing to marketplace...');
  execSync('vsce publish --pat ' + token, { stdio: 'inherit' });
  
  console.log('✨ Published successfully!');
  
} catch (error) {
  console.error('❌ Publish failed:', error.message);
  process.exit(1);
}
