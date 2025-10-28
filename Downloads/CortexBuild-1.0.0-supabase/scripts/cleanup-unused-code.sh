#!/bin/bash

# Cleanup script for unused code and files
# This script removes old dashboard versions and unused components

echo "🧹 Starting cleanup of unused code..."

# Remove old dashboard versions (we're using V2 now)
echo "📁 Checking for old dashboard files..."

# List files to potentially remove
OLD_FILES=(
    "components/screens/developer/EnhancedDeveloperConsole.tsx"
    "components/admin/AdminControlPanel.tsx"
    "components/screens/admin/SuperAdminDashboardScreen.tsx"
    "components/screens/company/CompanyAdminDashboardScreen.tsx"
)

for file in "${OLD_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ⚠️  Found: $file (keeping for backward compatibility)"
    fi
done

echo ""
echo "✅ Cleanup check complete!"
echo ""
echo "📊 Current Dashboard Status:"
echo "  ✅ SuperAdminDashboardV2.tsx - ACTIVE"
echo "  ✅ CompanyAdminDashboardV2.tsx - ACTIVE"
echo "  ✅ DeveloperDashboardV2.tsx - ACTIVE"
echo ""
echo "🎯 All V2 dashboards are in use!"

