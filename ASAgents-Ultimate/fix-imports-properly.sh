#!/bin/bash

echo "Fixing import statements..."

# Revert the backup files (undo the commented imports)
for file in components/MyDayView.tsx components/ProjectDetailView.tsx components/projects/ProjectsMapView.tsx components/projects/ProjectsView.tsx components/SupabaseAuth.tsx components/views/InvoicesView.tsx; do
  if [ -f "${file}.bak" ]; then
    mv "${file}.bak" "${file}"
    echo "Reverted $file"
  fi
done

# Fix MyDayView.tsx - use correct import path
sed -i.bak "s|from './kanban/kanbanBoard'|from './kanban/kanbanBoard'|" components/MyDayView.tsx

# Fix ProjectDetailView.tsx - use correct import paths  
sed -i.bak '
s|from '"'"'./project/CreateProjectModal'"'"'|from '"'"'./project/CreateProjectModal'"'"'|
s|from '"'"'./reminder/ReminderControl'"'"'|from '"'"'./reminder/ReminderControl'"'"'|
s|from '"'"'./task/TaskModal'"'"'|from '"'"'./task/TaskModal'"'"'|
s|from '"'"'./reminder/ReminderModal'"'"'|from '"'"'./reminder/ReminderModal'"'"'|
s|from '"'"'./whiteboard/WhiteboardView'"'"'|from '"'"'./whiteboard/WhiteboardView'"'"'|
' components/ProjectDetailView.tsx

# Fix ProjectsMapView.tsx
sed -i.bak "s|from './MapView'|from '../MapView'|" components/projects/ProjectsMapView.tsx

# Fix ProjectsView.tsx  
sed -i.bak "s|from './CreateProjectModal'|from '../project/CreateProjectModal'|" components/projects/ProjectsView.tsx

# Fix SupabaseAuth.tsx
sed -i.bak "s|from '../services/supabaseClient'|from '../services/supabaseClient'|" components/SupabaseAuth.tsx

# Fix InvoicesView.tsx
sed -i.bak '
s|from '"'"'../services/mockApi'"'"'|from '"'"'../../services/mockApi'"'"'|
s|from '"'"'./ui/Button'"'"'|from '"'"'../ui/Button'"'"'|
' components/views/InvoicesView.tsx

echo "✅ Import statements fixed!"
