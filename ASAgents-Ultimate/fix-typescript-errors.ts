#!/usr/bin/env tsx
/**
 * TypeScript Error Fix Script
 * Systematically fixes common TypeScript errors in the ASAgents-Ultimate project
 */

import fs from 'fs';
import path from 'path';

interface FixPattern {
  pattern: RegExp;
  replacement: string | ((match: string, ...groups: string[]) => string);
  description: string;
}

const fixPatterns: FixPattern[] = [
  // Fix: Change 'approved' to ExpenseStatus.APPROVED
  {
    pattern: /(\s+)if\s*\(\s*expense\.status\s*===\s*['"]approved['"]\s*\)/g,
    replacement: '$1if (expense.status === ExpenseStatus.APPROVED)',
    description: 'Fix expense status comparison with enum'
  },
  {
    pattern: /(\s+)if\s*\(\s*expense\.status\s*===\s*['"]pending['"]\s*\)/g,
    replacement: '$1if (expense.status === ExpenseStatus.PENDING)',
    description: 'Fix expense status comparison with enum'
  },
  // Fix: Change 'paid' to InvoiceStatus.PAID
  {
    pattern: /(\s+)if\s*\(\s*invoice\.status\s*===\s*['"]paid['"]\s*\)/g,
    replacement: '$1if (invoice.status === InvoiceStatus.PAID)',
    description: 'Fix invoice status comparison with enum'
  },
  {
    pattern: /(\s+)if\s*\(\s*invoice\.status\s*===\s*['"]sent['"]\s*\)/g,
    replacement: '$1if (invoice.status === InvoiceStatus.SENT)',
    description: 'Fix invoice status comparison with enum'
  },
];

// Files to process
const filesToFix = [
  'components/financial/BudgetManager.tsx',
  'components/financial/FinancialDashboard.tsx',
  'components/financial/FinancialReports.tsx',
];

function applyFixes(filePath: string) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');
  let modified = false;

  for (const fix of fixPatterns) {
    const before = content;
    content = content.replace(fix.pattern, fix.replacement as string);
    if (content !== before) {
      console.log(`✅ Applied: ${fix.description} in ${filePath}`);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`💾 Saved: ${filePath}`);
  }
}

console.log('🚀 Starting TypeScript error fixes...\n');

for (const file of filesToFix) {
  applyFixes(file);
}

console.log('\n✨ Done!');
