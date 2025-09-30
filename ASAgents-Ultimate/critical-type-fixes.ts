/**
 * Critical TypeScript Error Fixes
 * Targets the most impactful errors to get app running
 */

import fs from 'fs';
import path from 'path';

interface Fix {
  file: string;
  search: RegExp | string;
  replace: string;
  description: string;
}

const fixes: Fix[] = [
  // Fix: Date string issues in financial components
  {
    file: 'types.ts',
    search: /export interface Expense \{[^}]+\}/s,
    replace: `export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string | Date; // FIX: Allow both string and Date
  status: ExpenseStatus;
  projectId?: string;
  companyId: string;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}`,
    description: 'Fix Expense date type to allow string or Date'
  },
  
  // Fix: Invoice date issues
  {
    file: 'types.ts',
    search: /export interface Invoice \{[^}]+\}/s,
    replace: `export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  projectId?: string;
  companyId: string;
  amount: number;
  date: string | Date; // FIX: Allow both string and Date
  dueDate: string | Date; // FIX: Allow both string and Date
  status: InvoiceStatus;
  items: InvoiceItem[];
  notes?: string;
  createdBy: string;
  createdAt: string;
}`,
    description: 'Fix Invoice date types'
  },

  // Add missing DashboardSummary properties
  {
    file: 'types.ts',
    search: /export interface DashboardSummary \{[^}]+\}/s,
    replace: `export interface DashboardSummary {
  totalProjects: number;
  activeProjects: number;
  totalRevenue: number;
  totalExpenses: number;
  tenants?: number; // FIX: Added missing property
  source?: string; // FIX: Added missing property
  generatedAt?: string; // FIX: Added missing property
}`,
    description: 'Add missing properties to DashboardSummary'
  },

  // Add prioritizedTaskIds to API response types
  {
    file: 'types.ts',
    search: 'export interface Todo {',
    replace: `// FIX: Added prioritized task tracking
export interface PrioritizedTasksResponse {
  prioritizedTaskIds: string[];
  tasks: Todo[];
}

export interface Todo {`,
    description: 'Add PrioritizedTasksResponse interface'
  },
];

console.log('🔧 Starting critical type fixes...\\n');

for (const fix of fixes) {
  const filePath = path.join(process.cwd(), fix.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${fix.file}`);
    continue;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    if (typeof fix.search === 'string') {
      if (content.includes(fix.search)) {
        content = content.replace(fix.search, fix.replace);
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`✅ ${fix.description}`);
      }
    } else {
      if (fix.search.test(content)) {
        content = content.replace(fix.search, fix.replace);
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`✅ ${fix.description}`);
      }
    }
  } catch (error) {
    console.log(`❌ Error fixing ${fix.file}: ${error}`);
  }
}

console.log('\\n✨ Critical fixes complete!');
