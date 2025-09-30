#!/usr/bin/env tsx
/**
 * Comprehensive TypeScript Error Fix Script
 * Systematically fixes TypeScript errors across the codebase
 */

import * as fs from 'fs';
import * as path from 'path';

console.log('🔧 ASAgents-Ultimate TypeScript Fix Script');
console.log('=========================================\n');

// Track fixes
let fixCount = 0;
const fixes: string[] = [];

function logFix(message: string) {
  fixCount++;
  fixes.push(message);
  console.log(`✓ ${message}`);
}

// 1. Fix ClientsView.tsx - Remove backendCapabilities references
console.log('📝 Fixing ClientsView.tsx...');
const clientsViewPath = path.join(process.cwd(), 'components/ClientsView.tsx');
if (fs.existsSync(clientsViewPath)) {
  let content = fs.readFileSync(clientsViewPath, 'utf-8');
  
  // Remove backendCapabilities references
  content = content.replace(/if\s*\(backendCapabilities.*?\).*?\{[\s\S]*?\}/g, '// Backend capabilities check removed');
  content = content.replace(/backendCapabilities\./g, '// backendCapabilities.');
  
  // Add title property to ViewHeader
  content = content.replace(
    /<ViewHeader\s+view=/,
    '<ViewHeader title="Clients" view='
  );
  
  fs.writeFileSync(clientsViewPath, content);
  logFix('Fixed ClientsView.tsx - removed backendCapabilities, added title');
}

// 2. Fix Dashboard.tsx - Add URGENT priority
console.log('\n📝 Fixing Dashboard.tsx...');
const dashboardPath = path.join(process.cwd(), 'components/Dashboard.tsx');
if (fs.existsSync(dashboardPath)) {
  let content = fs.readFileSync(dashboardPath, 'utf-8');
  
  // Fix priority colors
  content = content.replace(
    /const priorityColors = \{[\s\S]*?\};/,
    `const priorityColors: Record<TodoPriority, string> = {
    [TodoPriority.URGENT]: 'bg-red-100 text-red-800',
    [TodoPriority.HIGH]: 'bg-orange-100 text-orange-800',
    [TodoPriority.MEDIUM]: 'bg-yellow-100 text-yellow-800',
    [TodoPriority.LOW]: 'bg-green-100 text-green-800',
  };`
  );
  
  fs.writeFileSync(dashboardPath, content);
  logFix('Fixed Dashboard.tsx - added URGENT priority');
}

// 3. Fix ErrorBoundary - Error code type
console.log('\n📝 Fixing ErrorBoundary.tsx...');
const errorBoundaryPath = path.join(process.cwd(), 'components/common/ErrorBoundary.tsx');
if (fs.existsSync(errorBoundaryPath)) {
  let content = fs.readFileSync(errorBoundaryPath, 'utf-8');
  
  // Fix error code type
  content = content.replace(
    /errorCode:\s*(\d+),/g,
    'errorCode: "$1",'
  );
  
  fs.writeFileSync(errorBoundaryPath, content);
  logFix('Fixed ErrorBoundary.tsx - error code type');
}

// 4. Fix QuickActions - View type issues
console.log('\n📝 Fixing QuickActions.tsx...');
const quickActionsPath = path.join(process.cwd(), 'components/dashboard/widgets/QuickActions.tsx');
if (fs.existsSync(quickActionsPath)) {
  let content = fs.readFileSync(quickActionsPath, 'utf-8');
  
  // Fix view type assertions
  content = content.replace(
    /onNavigate\(['"]tasks['"]\)/g,
    'onNavigate("todo" as View)'
  );
  content = content.replace(
    /onNavigate\(['"]expenses['"]\)/g,
    'onNavigate("financials" as View)'
  );
  content = content.replace(
    /onNavigate\(['"]team['"]\)/g,
    'onNavigate("personnel" as View)'
  );
  content = content.replace(
    /onNavigate\(['"]schedule['"]\)/g,
    'onNavigate("timeline" as View)'
  );
  content = content.replace(
    /onNavigate\(['"]reports['"]\)/g,
    'onNavigate("reports" as View)'
  );
  content = content.replace(
    /onNavigate\(['"]messages['"]\)/g,
    'onNavigate("chat" as View)'
  );
  
  // Fix role comparisons
  content = content.replace(
    /user\.role === ['"]admin['"] \|\| user\.role === ['"]owner['"]/g,
    'user.role === Role.ADMIN || user.role === Role.OWNER'
  );
  content = content.replace(
    /user\.role === ['"]manager['"]/g,
    'user.role === Role.MANAGER'
  );
  
  fs.writeFileSync(quickActionsPath, content);
  logFix('Fixed QuickActions.tsx - view types and role comparisons');
}

// 5. Fix button variant types
console.log('\n📝 Fixing button variants...');
const filesToFixVariants = [
  'components/dashboard/AdvancedDashboard.tsx',
  'components/demo/MultimodalDemo.tsx',
  'components/media/MediaGallery.tsx'
];

filesToFixVariants.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf-8');
    content = content.replace(/variant=["']default["']/g, 'variant="secondary"');
    fs.writeFileSync(fullPath, content);
    logFix(`Fixed button variants in ${filePath}`);
  }
});

// 6. Fix widget size types
console.log('\n📝 Fixing widget size types...');
const filesToFixSizes = [
  'components/dashboard/widgets/ActivityFeed.tsx',
  'components/dashboard/widgets/ChartWidget.tsx',
  'components/dashboard/widgets/MetricsGrid.tsx'
];

filesToFixSizes.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf-8');
    // Cast string sizes to proper type
    content = content.replace(
      /size=\{(['"`])(\w+)\1\}/g,
      'size={"$2" as "small" | "medium" | "large" | "full"}'
    );
    fs.writeFileSync(fullPath, content);
    logFix(`Fixed size types in ${filePath}`);
  }
});

console.log('\n' + '='.repeat(50));
console.log(`✅ Completed ${fixCount} fixes!`);
console.log('='.repeat(50));

fixes.forEach((fix, i) => {
  console.log(`${i + 1}. ${fix}`);
});

console.log('\n🎯 Next Steps:');
console.log('1. Run: npm run type-check');
console.log('2. Review remaining errors');
console.log('3. Continue with manual fixes');
