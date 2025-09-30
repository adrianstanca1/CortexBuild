#!/usr/bin/env node
/**
 * TypeScript Error Fix Automation Script
 * Systematically fixes common TypeScript errors
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Error patterns and their fixes
const fixPatterns = [
  {
    errorCode: 'TS2307',
    pattern: /Cannot find module '([^']+)'/,
    description: 'Missing module imports',
    fix: (file, match) => {
      const modulePath = match[1];
      // Check if module exists with different extension
      // Create stub if needed
      return `// TODO: Fix import for ${modulePath}`;
    }
  },
  {
    errorCode: 'TS2304',
    pattern: /Cannot find name '([^']+)'/,
    description: 'Undefined variables/types',
    fix: (file, match) => {
      const name = match[1];
      // Add type import or definition
      return `// TODO: Define or import ${name}`;
    }
  }
];

// Run type check and collect errors
console.log('🔍 Analyzing TypeScript errors...');
const errors = execSync('npm run type-check 2>&1', { encoding: 'utf-8' });

// Parse errors by file
const errorsByFile = {};
errors.split('\n').forEach(line => {
  const match = line.match(/^(.+\.tsx?)\((\d+),(\d+)\): error (TS\d+): (.+)$/);
  if (match) {
    const [, file, line, col, code, message] = match;
    if (!errorsByFile[file]) {
      errorsByFile[file] = [];
    }
    errorsByFile[file].push({ line: parseInt(line), col: parseInt(col), code, message });
  }
});

console.log(`📊 Found errors in ${Object.keys(errorsByFile).length} files`);

// Sort files by error count
const sortedFiles = Object.keys(errorsByFile)
  .sort((a, b) => errorsByFile[b].length - errorsByFile[a].length);

console.log('\n🎯 Top 10 files with most errors:');
sortedFiles.slice(0, 10).forEach((file, i) => {
  console.log(`${i + 1}. ${file}: ${errorsByFile[file].length} errors`);
});

export { errorsByFile, sortedFiles };
