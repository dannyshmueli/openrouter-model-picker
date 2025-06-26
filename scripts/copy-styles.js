#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Cross-platform script to copy styles.d.ts to dist folder
const source = path.join(__dirname, '..', 'src', 'styles.d.ts');
const destination = path.join(__dirname, '..', 'dist', 'styles.d.ts');

// Ensure dist directory exists
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy the file
try {
  fs.copyFileSync(source, destination);
  console.log('✓ Copied styles.d.ts to dist folder');
} catch (error) {
  console.error('✗ Failed to copy styles.d.ts:', error.message);
  process.exit(1);
}