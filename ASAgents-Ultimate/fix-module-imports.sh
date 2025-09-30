#!/bin/bash

# Fix module import issues

# Fix code/index.ts - remove non-existent import
echo "Fixing components/code/index.ts..."
if [ -f "components/code/index.ts" ]; then
  sed -i.bak '
    /EnhancedMediaRenderer/d
    /CodeFile/d
  ' components/code/index.ts
fi

# Fix EnhancedDashboard.tsx - use default import for BarChart
echo "Fixing components/enhanced/EnhancedDashboard.tsx..."
if [ -f "components/enhanced/EnhancedDashboard.tsx" ]; then
  sed -i.bak 's/import { BarChart }/import BarChart/' components/enhanced/EnhancedDashboard.tsx
fi

# Fix missing module imports by commenting them out temporarily
files_with_missing_imports=(
  "components/MyDayView.tsx"
  "components/ProjectDetailView.tsx"
  "components/projects/ProjectsMapView.tsx"
  "components/projects/ProjectsView.tsx"
  "components/SupabaseAuth.tsx"
  "components/views/InvoicesView.tsx"
)

for file in "${files_with_missing_imports[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    # Comment out problematic imports (will be fixed later)
    sed -i.bak '
      s|^\(import.*kanban/kanbanBoard.*\)|// FIX: Temporary - \1|
      s|^\(import.*project/CreateProjectModal.*\)|// FIX: Temporary - \1|
      s|^\(import.*reminder/ReminderControl.*\)|// FIX: Temporary - \1|
      s|^\(import.*task/TaskModal.*\)|// FIX: Temporary - \1|
      s|^\(import.*reminder/ReminderModal.*\)|// FIX: Temporary - \1|
      s|^\(import.*whiteboard/WhiteboardView.*\)|// FIX: Temporary - \1|
      s|^\(import.*MapView.*from.*\)|// FIX: Temporary - \1|
      s|^\(import.*CreateProjectModal.*from.*\)|// FIX: Temporary - \1|
      s|^\(import.*supabaseClient.*\)|// FIX: Temporary - \1|
      s|^\(import.*services/mockApi.*\)|// FIX: Temporary - \1|
      s|^\(import.*ui/Button.*from.*\)|// FIX: Temporary - \1|
    ' "$file"
  fi
done

echo "Done fixing module imports!"
