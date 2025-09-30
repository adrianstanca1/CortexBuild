#!/bin/bash

# Fix FinancialDashboard.tsx
echo "Fixing FinancialDashboard.tsx..."
sed -i.bak '
s/import { User, Project, Invoice, Expense }/import { User, Project, Invoice, Expense, InvoiceStatus, ExpenseStatus }/g
s/invoice\.status === '"'"'sent'"'"'/invoice.status === InvoiceStatus.SENT/g
s/expense\.status === '"'"'pending'"'"'/expense.status === ExpenseStatus.PENDING/g
s/expense\.status === '"'"'approved'"'"'/expense.status === ExpenseStatus.APPROVED/g
s/invoice\.status === '"'"'paid'"'"'/invoice.status === InvoiceStatus.PAID/g
s/new Date(expense\.date)\.getTime()/new Date(expense.date as string).getTime()/g
s/new Date(invoice\.date)\.getTime()/new Date(invoice.date as string).getTime()/g
s/new Date(invoice\.dueDate)\.getTime()/new Date(invoice.dueDate as string).getTime()/g
s/new Date(expense\.createdAt)\.getTime()/new Date(expense.createdAt).getTime()/g
s/expense\.date\.toDateString()/new Date(expense.date).toDateString()/g
' components/financial/FinancialDashboard.tsx

# Fix FinancialReports.tsx  
echo "Fixing FinancialReports.tsx..."
sed -i.bak '
s/import { Invoice, Expense }/import { Invoice, Expense, InvoiceStatus, ExpenseStatus }/g
s/invoice\.status === '"'"'paid'"'"'/invoice.status === InvoiceStatus.PAID/g
s/expense\.status === '"'"'approved'"'"'/expense.status === ExpenseStatus.APPROVED/g
s/new Date(expense\.date) >= startDate/new Date(expense.date as string) >= startDate/g
s/new Date(expense\.date) <= endDate/new Date(expense.date as string) <= endDate/g
' components/financial/FinancialReports.tsx

echo "Done!"
