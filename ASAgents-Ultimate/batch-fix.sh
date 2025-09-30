#!/bin/bash

echo "🔧 Applying batch TypeScript fixes..."

# Fix 1: ErrorBoundary - Line 153
sed -i.bak '153s/retryCount + 1/"retry-" + (retryCount + 1)/' components/common/ErrorBoundary.tsx

# Fix 2: DualBackendDashboard - Remove jsx prop
sed -i.bak '605s/<style jsx>/<style>/' components/enhanced/DualBackendDashboard.tsx
sed -i.bak '605s/{\/\*/<>/' components/enhanced/DualBackendDashboard.tsx

# Fix 3: ProductionMonitoringDashboard - Remove jsx prop  
sed -i.bak '343s/<style jsx>/<style>/' components/monitoring/ProductionMonitoringDashboard.tsx

echo "✅ Batch fixes applied!"
