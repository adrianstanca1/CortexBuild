#!/bin/bash

echo "🔧 Fixing Import Paths in src/ Directory"
echo "========================================"

cd src

# Fix imports in all TypeScript files
find . -name "*.tsx" -o -name "*.ts" | while read file; do
  echo "Processing: $file"
  
  # Fix component imports
  perl -i -pe "s|from ['\"]components/|from '../../components/|g" "$file"
  perl -i -pe "s|from ['\"]\.\./(\.\./)components/|from '../../components/|g" "$file"
  
  # Fix service imports
  perl -i -pe "s|from ['\"]services/|from '../../services/|g" "$file"
  perl -i -pe "s|from ['\"]\.\./(\.\./)services/|from '../../services/|g" "$file"
  
  # Fix utils imports
  perl -i -pe "s|from ['\"]utils/|from '../../utils/|g" "$file"
  perl -i -pe "s|from ['\"]\.\./(\.\./)utils/|from '../../utils/|g" "$file"
  
  # Fix hooks imports
  perl -i -pe "s|from ['\"]hooks/|from '../../hooks/|g" "$file"
  perl -i -pe "s|from ['\"]\.\./(\.\./)hooks/|from '../../hooks/|g" "$file"
  
  # Fix contexts imports
  perl -i -pe "s|from ['\"]contexts/|from '../../contexts/|g" "$file"
  perl -i -pe "s|from ['\"]\.\./(\.\./)contexts/|from '../../contexts/|g" "$file"
  
  # Fix types imports
  perl -i -pe "s|from ['\"]types['\"]|from '../../types'|g" "$file"
  perl -i -pe "s|from ['\"]\.\./(\.\./)types['\"]|from '../../types'|g" "$file"
done

echo "✅ Import paths fixed!"

cd ..
echo ""
echo "🔍 Verifying fixed files..."
grep -r "from ['\"]components/" src/ || echo "✅ No absolute component imports"
grep -r "from ['\"]services/" src/ || echo "✅ No absolute service imports"

