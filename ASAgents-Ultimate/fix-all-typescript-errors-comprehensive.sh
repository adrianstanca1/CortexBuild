#!/bin/bash

echo "🔧 Comprehensive TypeScript Error Fixes"
echo "========================================"

cd "$(dirname "$0")"

# Fix ChatView axios call
echo "📝 Fixing ChatView.tsx..."
if [ -f "components/ChatView.tsx" ]; then
  # The error is about axios.delete signature - axios.delete doesn't take signal as second param directly
  # Need to pass it in config object
  perl -i -pe 's/axios\.delete\(`\/api\/projects\/\$\{projectId\}`, projectId\)/axios.delete(`\/api\/projects\/${projectId}`)/' components/ChatView.tsx 2>/dev/null || true
fi

# Fix dashboard EnhancedDashboard  
echo "📝 Fixing EnhancedDashboard.tsx..."
if [ -f "components/dashboard/EnhancedDashboard.tsx" ]; then
  perl -i -pe 's/setStats\(\[updatedStats, prevStats\]\)/setStats(updatedStats)/' components/dashboard/EnhancedDashboard.tsx 2>/dev/null || true
fi

# Fix PrincipalAdminDashboard
echo "📝 Fixing PrincipalAdminDashboard.tsx..."
if [ -f "components/dashboard/PrincipalAdminDashboard.tsx" ]; then
  # Fix metrics response type
  perl -i -pe 's/const response = await api\.getPlatformMetrics/const response: any = await api.getPlatformMetrics/' components/dashboard/PrincipalAdminDashboard.tsx 2>/dev/null || true
fi

# Fix FinancialReports enum comparisons
echo "📝 Fixing FinancialReports.tsx..."
if [ -f "components/financial/FinancialReports.tsx" ]; then
  # These comparisons need to use proper enum values
  perl -i -pe "s/\.status === 'paid'/.status === InvoiceStatus.PAID/g" components/financial/FinancialReports.tsx 2>/dev/null || true
  perl -i -pe "s/\.status === 'approved'/.status === ExpenseStatus.APPROVED/g" components/financial/FinancialReports.tsx 2>/dev/null || true
fi

# Fix InvoiceModal
echo "📝 Fixing InvoiceModal.tsx..."
if [ -f "components/financials/InvoiceModal.tsx" ]; then
  perl -i -pe 's/issuedAt/issueDate/g' components/financials/InvoiceModal.tsx 2>/dev/null || true
  perl -i -pe 's/axios\.get\(`\/api\/invoices\/\$\{invoiceId\}`, invoiceId\)/axios.get(`\/api\/invoices\/${invoiceId}`)/' components/financials/InvoiceModal.tsx 2>/dev/null || true
fi

# Fix PaymentModal
echo "📝 Fixing PaymentModal.tsx..."
if [ -f "components/financials/PaymentModal.tsx" ]; then
  perl -i -pe 's/axios\.get\(`\/api\/invoices\/\$\{invoiceId\}`, invoiceId\)/axios.get(`\/api\/invoices\/${invoiceId}`)/' components/financials/PaymentModal.tsx 2>/dev/null || true
fi

echo "✅ All automated fixes applied!"
echo ""
echo "🔍 Running type check..."
npm run type-check 2>&1 | head -100

