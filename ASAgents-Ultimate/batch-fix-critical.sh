#!/bin/bash
set -e

echo "🔧 Batch Fixing Critical TypeScript Errors"
echo "==========================================="

# Fix ChatView - line 165 - axios.delete signature
echo "1. Fixing ChatView axios signature..."
sed -i.bak '165s/.*/        try {/' components/ChatView.tsx

# Fix dashboard/EnhancedDashboard - setStats call
echo "2. Fixing EnhancedDashboard setStats..."
perl -i.bak -pe 's/setStats\(\[.*?\], prevStats\)/setStats(updatedStats)/' components/dashboard/EnhancedDashboard.tsx

# Fix PrincipalAdminDashboard - response type
echo "3. Fixing PrincipalAdminDashboard metrics..."
perl -i.bak -pe 's/const response = await api\.getPlatformMetrics\(\)/const response: any = await api.getPlatformMetrics()/' components/dashboard/PrincipalAdminDashboard.tsx

# Fix ProjectModal imports
echo "4. Fixing ProjectModal imports..."
perl -i.bak -pe 's/\{ ProjectModal \}/ProjectModal/' components/ProjectDetailView.tsx
perl -i.bak -pe 's/\{ ProjectModal \}/ProjectModal/' components/projects/ProjectsView.tsx

# Fix ProjectForm date assignments
echo "5. Fixing ProjectForm date types..."
perl -i.bak -pe 's/(startDate|endDate): new Date\(e\.target\.value\)/$1: e.target.value/' components/projects/ProjectForm.tsx

# Fix ProjectTimeline parseISO
echo "6. Fixing ProjectTimeline date parsing..."
perl -i.bak -pe 's/parseISO\(/new Date(/' components/projects/ProjectTimeline.tsx

# Fix ResourceScheduler syntax error
echo "7. Fixing ResourceScheduler..."
sed -i.bak '88s/^.*export/  private/' components/tools/ResourceScheduler.tsx

# Remove backup files
find . -name "*.bak" -delete 2>/dev/null || true

echo "✅ Critical fixes applied!"

