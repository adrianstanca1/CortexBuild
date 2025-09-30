#!/bin/bash

echo "🔧 Fixing TypeScript errors systematically..."

# Fix Card size prop issues
echo "Fixing Card component size prop..."
find components -name "*.tsx" -type f -exec sed -i '' 's/size="medium"/className=""/g' {} +
find components -name "*.tsx" -type f -exec sed -i '' 's/size="small"/className=""/g' {} +
find components -name "*.tsx" -type f -exec sed -i '' 's/size="large"/className=""/g' {} +
find components -name "*.tsx" -type f -exec sed -i '' 's/size="full"/className=""/g' {} +

# Fix isCompleted vs completedAt
echo "Fixing isCompleted property..."
find components -name "*.tsx" -type f -exec sed -i '' 's/\.isCompleted/\.completedAt/g' {} +

echo "✅ Batch fixes complete!"
