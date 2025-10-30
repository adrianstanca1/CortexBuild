#!/bin/bash

# Script to migrate all api.ts imports to apiClient
# This script will replace all instances of:
# import * as api from '../../api' (or similar)
# with:
# import { apiClient } from '../../lib/api/client'

echo "🚀 Starting API import migration..."
echo ""

# Counter for files modified
count=0

# Find all TypeScript/TSX files in components directory
find components -name "*.tsx" -o -name "*.ts" | while read file; do
    # Check if file contains the old import
    if grep -q "import \* as api from.*api" "$file"; then
        echo "📝 Migrating: $file"
        
        # Replace the import statement
        # This handles various import path variations
        sed -i '' "s|import \* as api from '../../api';|import { apiClient } from '../../lib/api/client';|g" "$file"
        sed -i '' "s|import \* as api from '../../api'|import { apiClient } from '../../lib/api/client'|g" "$file"
        sed -i '' "s|import \* as api from '../api';|import { apiClient } from '../lib/api/client';|g" "$file"
        sed -i '' "s|import \* as api from '../api'|import { apiClient } from '../lib/api/client'|g" "$file"
        
        # Replace api. calls with apiClient.
        # Note: This is a simple replacement and may need manual review
        sed -i '' "s|api\.|apiClient.|g" "$file"
        
        ((count++))
    fi
done

# Find all TypeScript/TSX files in hooks directory
find hooks -name "*.tsx" -o -name "*.ts" 2>/dev/null | while read file; do
    # Check if file contains the old import
    if grep -q "import \* as api from.*api" "$file"; then
        echo "📝 Migrating: $file"
        
        # Replace the import statement
        sed -i '' "s|import \* as api from '../api';|import { apiClient } from '../lib/api/client';|g" "$file"
        sed -i '' "s|import \* as api from '../api'|import { apiClient } from '../lib/api/client'|g" "$file"
        
        # Replace api. calls with apiClient.
        sed -i '' "s|api\.|apiClient.|g" "$file"
        
        ((count++))
    fi
done

echo ""
echo "✅ Migration complete!"
echo "📊 Files modified: $count"
echo ""
echo "⚠️  IMPORTANT: Please review the changes carefully!"
echo "   Some api function calls may need manual adjustment."
echo "   Run 'git diff' to see all changes."
echo ""
echo "🧪 Next steps:"
echo "   1. Review changes: git diff"
echo "   2. Test the application"
echo "   3. Fix any compilation errors"
echo "   4. Commit changes: git add . && git commit -m 'Migrate to apiClient'"

