#!/usr/bin/env node

/**
 * Build script for VIZUAL X VS Code Extension
 * Compiles TypeScript and creates distributable package
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔨 Building VIZUAL X VS Code Extension...');

try {
  // Step 1: Compile TypeScript
  console.log('📝 Compiling TypeScript...');
  execSync('npm run build', { stdio: 'inherit' });

  // Step 2: Verify build output
  const distPath = path.join(__dirname, 'dist');
  if (!fs.existsSync(distPath)) {
    throw new Error('Build failed: dist directory not created');
  }

  console.log('✅ TypeScript compiled successfully');

  // Step 3: Create package
  console.log('📦 Packaging extension...');
  execSync('vsce package --out vizual-x.vsix', { stdio: 'inherit' });

  console.log('✨ Build complete!');
  console.log('📦 Extension packaged as: vizual-x.vsix');
  console.log('📥 To install locally: code --install-extension vizual-x.vsix');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
