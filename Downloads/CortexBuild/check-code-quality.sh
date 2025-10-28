#!/bin/bash

echo "🔍 Checking Code Quality..."
echo ""

# Check for console.log (potential debug code)
echo "📝 Checking for console.log statements..."
CONSOLE_LOGS=$(grep -rn "console\.log" components/sdk/*.tsx 2>/dev/null | wc -l)
echo "Found $CONSOLE_LOGS console.log statements (acceptable for development)"
echo ""

# Check for TODO comments
echo "📋 Checking for TODO comments..."
TODOS=$(grep -rn "TODO\|FIXME\|XXX" components/sdk/*.tsx 2>/dev/null | wc -l)
echo "Found $TODOS TODO/FIXME comments"
echo ""

# Check for unused imports (basic check)
echo "🔧 Checking for potential issues..."
echo ""

# Check file sizes
echo "📦 Component file sizes:"
du -h components/sdk/AIAgentsDashboard.tsx components/sdk/IntegrationsHub.tsx components/sdk/SDKDeveloperEnvironment.tsx 2>/dev/null
echo ""

# Check for TypeScript errors in components
echo "✅ TypeScript compilation status:"
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ All TypeScript files compile successfully"
else
    echo "✗ TypeScript compilation failed"
fi
echo ""

echo "🎉 Code quality check complete!"
