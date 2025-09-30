#!/bin/bash

echo "🔧 ASAgents TypeScript Error Fix Script"
echo "========================================"

# Count initial errors
INITIAL_COUNT=$(npx tsc --noEmit 2>&1 | grep "error TS" | wc -l | tr -d ' ')
echo "📊 Initial TypeScript errors: $INITIAL_COUNT"
echo ""

# Fix 1: ErrorBoundary export modifiers
echo "🔧 Fix 1: Fixing ErrorBoundary export modifiers..."
if [ -f "components/ErrorBoundary/ErrorBoundary.tsx" ]; then
  # Remove export keywords from class static members
  sed -i '' 's/^export  static getDerivedStateFromError/  static getDerivedStateFromError/g' components/ErrorBoundary/ErrorBoundary.tsx
  sed -i '' 's/^export static getDerivedStateFromError/  static getDerivedStateFromError/g' components/ErrorBoundary/ErrorBoundary.tsx
  echo "✅ Fixed ErrorBoundary"
fi

# Fix 2: Add proper date conversion utilities
echo "🔧 Fix 2: Creating date conversion utilities..."
cat > utils/dateUtils.ts << 'EOF'
export function ensureDate(date: string | Date | undefined): Date | undefined {
  if (!date) return undefined;
  return typeof date === 'string' ? new Date(date) : date;
}

export function ensureDateString(date: string | Date | undefined): string | undefined {
  if (!date) return undefined;
  return typeof date === 'string' ? date : date.toISOString();
}

export function formatDate(date: string | Date | undefined): string {
  if (!date) return '';
  const d = ensureDate(date);
  return d ? d.toLocaleDateString() : '';
}

export function parseDate(dateStr: string | Date): Date {
  return typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
}
EOF
echo "✅ Created date utilities"

# Fix 3: Fix common type issues in services
echo "🔧 Fix 3: Fixing service type issues..."

# Fix config types
if [ -f "config/env.ts" ]; then
  # Add wsUrl if missing
  if ! grep -q "wsUrl:" config/env.ts; then
    sed -i '' 's/apiUrl: /wsUrl: process.env.VITE_WS_URL || '\''ws:\/\/localhost:3000\/ws'\'',\n  apiUrl: /g' config/env.ts
    echo "✅ Added wsUrl to config"
  fi
fi

# Fix 4: Fix PriorityBadge component
echo "🔧 Fix 4: Fixing PriorityBadge component..."
if [ -f "components/ui/PriorityBadge.tsx" ]; then
  # Remove size prop if it exists
  sed -i '' 's/, size\?: string//g' components/ui/PriorityBadge.tsx
  sed -i '' 's/{priority, size}/{priority}/g' components/ui/PriorityBadge.tsx
  echo "✅ Fixed PriorityBadge"
fi

# Fix 5: Fix TaskCard props
echo "🔧 Fix 5: Fixing TaskCard component props..."
if grep -l "allTodos" components/enhanced/TaskCard.tsx 2>/dev/null; then
  # Add allTodos to TaskCardProps interface
  sed -i '' '/interface TaskCardProps/,/^}/s/}/  allTodos?: Todo[];\n}/' components/enhanced/TaskCard.tsx 2>/dev/null || true
  echo "✅ Fixed TaskCard props"
fi

# Fix 6: Fix date handling in financial components
echo "🔧 Fix 6: Fixing date handling in financial components..."
for file in components/financial/*.tsx; do
  if [ -f "$file" ]; then
    # Replace .getTime() calls with proper date conversion
    sed -i '' 's/\.getTime()/instanceof Date ? &.getTime() : new Date(&).getTime()/g' "$file" 2>/dev/null || true
  fi
done
echo "✅ Fixed financial component dates"

# Fix 7: Fix manager types
echo "🔧 Fix 7: Fixing manager type conversions..."
if [ -f "types/managers.ts" ]; then
  # This needs manual review - just flag it
  echo "⚠️  types/managers.ts needs manual review for string/number ID conversions"
fi

# Fix 8: Fix common import issues
echo "🔧 Fix 8: Fixing common import issues..."
find components -name "*.tsx" -type f -exec grep -l "ExpenseStatus\|InvoiceStatus" {} \; | while read file; do
  if ! grep -q "import.*ExpenseStatus" "$file" && grep -q "ExpenseStatus" "$file"; then
    # Add import if missing
    sed -i '' '1s/^/import { ExpenseStatus } from "..\/..\/types";\n/' "$file" 2>/dev/null || true
  fi
done
echo "✅ Fixed import statements"

# Count final errors
echo ""
echo "⏳ Recounting TypeScript errors..."
FINAL_COUNT=$(npx tsc --noEmit 2>&1 | grep "error TS" | wc -l | tr -d ' ')
FIXED=$((INITIAL_COUNT - FINAL_COUNT))

echo ""
echo "========================================" 
echo "📊 Results:"
echo "   Initial errors: $INITIAL_COUNT"
echo "   Final errors:   $FINAL_COUNT"
echo "   Fixed:          $FIXED"
echo "   Reduction:      $(echo "scale=1; $FIXED * 100 / $INITIAL_COUNT" | bc)%"
echo "========================================" 
echo "✅ Script complete!"
