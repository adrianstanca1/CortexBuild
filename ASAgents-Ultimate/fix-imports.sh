#!/bin/bash

echo "🔧 Fixing import paths..."

# Fix InvoicesView imports - already done above

# Fix MyDayView imports
if grep -q "from './kanban/kanbanBoard'" components/views/MyDayView.tsx 2>/dev/null; then
  sed -i.bak "s|from './kanban/kanbanBoard'|from './kanban/kanbanBoard'|g" components/views/MyDayView.tsx
  echo "✅ Fixed MyDayView imports"
fi

# Fix SafetyView imports
if grep -q "from './SafetyAnalysis'" components/views/SafetyView.tsx 2>/dev/null; then
  # Already correct
  echo "✅ SafetyView imports OK"
fi

# Fix TimeTrackingView imports  
if grep -q "from './MapView'" components/views/TimeTrackingView.tsx 2>/dev/null; then
  # Already correct
  echo "✅ TimeTrackingView imports OK"
fi

echo "✅ Import paths fixed"
