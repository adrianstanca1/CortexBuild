#!/bin/bash

echo "🔄 Converting to absolute imports with aliases"

cd src

# Convert all relative imports to absolute
find . -name "*.tsx" -o -name "*.ts" | while read file; do
  echo "Processing: $file"
  
  # Replace ../../components/ with components/
  perl -i -pe "s|from '\.\./\.\./components/|from 'components/|g" "$file"
  perl -i -pe "s|from \"\.\./\.\./components/|from \"components/|g" "$file"
  
  # Replace ../../services/ with services/
  perl -i -pe "s|from '\.\./\.\./services/|from 'services/|g" "$file"
  perl -i -pe "s|from \"\.\./\.\./services/|from \"services/|g" "$file"
  
  # Replace ../../utils/ with utils/
  perl -i -pe "s|from '\.\./\.\./utils/|from 'utils/|g" "$file"
  perl -i -pe "s|from \"\.\./\.\./utils/|from \"utils/|g" "$file"
  
  # Replace ../../hooks/ with hooks/
  perl -i -pe "s|from '\.\./\.\./hooks/|from 'hooks/|g" "$file"
  perl -i -pe "s|from \"\.\./\.\./hooks/|from \"hooks/|g" "$file"
  
  # Replace ../../contexts/ with contexts/
  perl -i -pe "s|from '\.\./\.\./contexts/|from 'contexts/|g" "$file"
  perl -i -pe "s|from \"\.\./\.\./contexts/|from \"contexts/|g" "$file"
  
  # Replace ../../types with types
  perl -i -pe "s|from '\.\./\.\./types'|from 'types'|g" "$file"
  perl -i -pe "s|from \"\.\./\.\./types\"|from \"types\"|g" "$file"
done

cd ..
echo "✅ Converted to absolute imports!"

