# Phase 6: Testing & Deployment - Testing Guide

## Testing Strategy

This guide provides comprehensive testing procedures for all components and database functionality.

---

## 1. Database Testing

### 1.1 Table Creation Tests

**Test:** Verify all tables exist
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('departments', 'custom_roles', 'department_members', 
                   'company_analytics', 'company_settings', 'api_keys', 'webhooks')
ORDER BY table_name;
```
**Expected:** 7 rows

**Test:** Verify table structures
```sql
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'departments'
ORDER BY ordinal_position;
```
**Expected:** All columns present with correct types

---

### 1.2 RLS Policy Tests

**Test:** Verify RLS is enabled
```sql
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('departments', 'custom_roles', 'department_members', 
                  'company_analytics', 'company_settings', 'api_keys', 'webhooks');
```
**Expected:** All tables have rowsecurity = true

**Test:** Verify policies exist
```sql
SELECT COUNT(*) FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('departments', 'custom_roles', 'department_members', 
                  'company_analytics', 'company_settings', 'api_keys', 'webhooks');
```
**Expected:** 28 policies

---

### 1.3 RPC Function Tests

**Test:** Verify functions exist
```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('invite_team_member', 'update_team_member_role', 
                     'create_department', 'assign_user_to_department',
                     'get_company_analytics', 'create_api_key',
                     'update_department_budget', 'get_department_members',
                     'get_department_budget_summary')
ORDER BY routine_name;
```
**Expected:** 9 functions

**Test:** Test invite_team_member RPC
```sql
SELECT public.invite_team_member(
    'YOUR_COMPANY_ID',
    'test@example.com',
    'project_manager'
);
```
**Expected:** JSON with success = true

---

## 2. Component Testing

### 2.1 DepartmentManagement Tests

**Test Case 1: Load Departments**
- [ ] Navigate to Department Management
- [ ] Verify departments load from database
- [ ] Verify loading state shows while fetching
- [ ] Verify empty state if no departments

**Test Case 2: Create Department**
- [ ] Click "Add Department" button
- [ ] Fill in form (name, description, budget, manager)
- [ ] Click "Save"
- [ ] Verify department appears in list
- [ ] Verify data saved to database

**Test Case 3: Edit Department**
- [ ] Click edit button on department
- [ ] Modify fields
- [ ] Click "Save"
- [ ] Verify changes appear in list
- [ ] Verify data updated in database

**Test Case 4: Delete Department**
- [ ] Click delete button on department
- [ ] Confirm deletion
- [ ] Verify department removed from list
- [ ] Verify data deleted from database

**Test Case 5: Budget Tracking**
- [ ] Verify budget displays correctly
- [ ] Verify member count displays
- [ ] Verify spending calculation

---

### 2.2 RoleManagement Tests

**Test Case 1: Load Roles**
- [ ] Navigate to Role Management
- [ ] Verify roles load from database
- [ ] Verify permissions display correctly

**Test Case 2: Create Role**
- [ ] Click "Create Role" button
- [ ] Fill in form (name, description, permissions)
- [ ] Select permissions
- [ ] Click "Save"
- [ ] Verify role appears in list

**Test Case 3: Edit Role**
- [ ] Click edit button on role
- [ ] Modify permissions
- [ ] Click "Save"
- [ ] Verify changes appear

**Test Case 4: Delete Role**
- [ ] Click delete button on role
- [ ] Confirm deletion
- [ ] Verify role removed from list

---

### 2.3 TeamManagement Tests

**Test Case 1: Load Team Members**
- [ ] Navigate to Team Management
- [ ] Verify team members load from database
- [ ] Verify member details display

**Test Case 2: Invite Team Member**
- [ ] Click "Invite Member" button
- [ ] Enter email and role
- [ ] Click "Send Invitation"
- [ ] Verify member appears in list
- [ ] Verify invitation sent

**Test Case 3: Update Member Role**
- [ ] Click role dropdown for member
- [ ] Select new role
- [ ] Verify role updated in database

**Test Case 4: Remove Team Member**
- [ ] Click remove button for member
- [ ] Confirm removal
- [ ] Verify member removed from list

---

### 2.4 CompanyAnalytics Tests

**Test Case 1: Load Analytics**
- [ ] Navigate to Analytics
- [ ] Verify metrics load from database
- [ ] Verify charts display correctly

**Test Case 2: Date Range Filter**
- [ ] Select date range using DateRangeFilter
- [ ] Verify analytics update for date range
- [ ] Test preset ranges (Today, Last 7 days, etc.)

**Test Case 3: Export to CSV**
- [ ] Click "Export" button
- [ ] Select "CSV" format
- [ ] Verify file downloads
- [ ] Verify data in CSV matches display

**Test Case 4: Export to PDF**
- [ ] Click "Export" button
- [ ] Select "PDF" format
- [ ] Verify file downloads
- [ ] Verify PDF displays correctly

---

### 2.5 CompanySettings Tests

**Test Case 1: Load Settings**
- [ ] Navigate to Settings
- [ ] Verify settings load from database
- [ ] Verify all tabs display

**Test Case 2: Branding Tab**
- [ ] Update theme color
- [ ] Update logo URL
- [ ] Click "Save"
- [ ] Verify changes saved to database

**Test Case 3: Email Tab**
- [ ] Update email template
- [ ] Click "Save"
- [ ] Verify changes saved

**Test Case 4: Security Tab**
- [ ] Toggle 2FA requirement
- [ ] Update IP whitelist
- [ ] Click "Save"
- [ ] Verify changes saved

**Test Case 5: API Tab**
- [ ] Click "Generate API Key"
- [ ] Enter key name
- [ ] Verify key generated and displayed
- [ ] Verify key saved to database

**Test Case 6: Webhooks Tab**
- [ ] Click "Add Webhook"
- [ ] Enter webhook URL
- [ ] Select events
- [ ] Click "Save"
- [ ] Verify webhook saved to database

---

## 3. RLS Policy Testing

### Test: Company Admin Access
```sql
-- As company admin, should see their company's data
SELECT COUNT(*) FROM public.departments 
WHERE company_id = 'COMPANY_ID_1';
```
**Expected:** Can see departments

### Test: Cross-Company Access Prevention
```sql
-- As company admin, should NOT see other companies' data
SELECT COUNT(*) FROM public.departments 
WHERE company_id = 'COMPANY_ID_2';
```
**Expected:** Cannot see departments (RLS blocks)

### Test: Super Admin Access
```sql
-- As super admin, should see all data
SELECT COUNT(*) FROM public.departments;
```
**Expected:** Can see all departments

---

## 4. Error Handling Tests

**Test Case 1: Invalid Input**
- [ ] Try to create department with empty name
- [ ] Verify error message displays
- [ ] Verify form not submitted

**Test Case 2: Duplicate Names**
- [ ] Try to create department with existing name
- [ ] Verify error message displays
- [ ] Verify database constraint prevents duplicate

**Test Case 3: Negative Budget**
- [ ] Try to set negative budget
- [ ] Verify error message displays
- [ ] Verify database constraint prevents negative

**Test Case 4: Network Error**
- [ ] Simulate network error
- [ ] Verify error message displays
- [ ] Verify retry functionality works

---

## 5. Performance Testing

**Test Case 1: Load Time**
- [ ] Measure time to load departments list
- [ ] Expected: < 1 second
- [ ] Verify indexes are being used

**Test Case 2: Search Performance**
- [ ] Search for department with 100+ records
- [ ] Expected: < 500ms response time
- [ ] Verify search uses indexes

**Test Case 3: Export Performance**
- [ ] Export 1000+ records to CSV
- [ ] Expected: < 5 seconds
- [ ] Verify no memory issues

---

## 6. Responsive Design Testing

**Test Case 1: Mobile (375px)**
- [ ] All components display correctly
- [ ] Buttons are clickable
- [ ] Forms are usable
- [ ] Tables are scrollable

**Test Case 2: Tablet (768px)**
- [ ] Layout adapts correctly
- [ ] All features accessible
- [ ] No horizontal scrolling

**Test Case 3: Desktop (1920px)**
- [ ] Full layout displays
- [ ] All features visible
- [ ] Proper spacing

---

## 7. Build & Deployment Testing

**Test Case 1: Build Success**
```bash
npm run build
```
**Expected:** Build completes without errors

**Test Case 2: No TypeScript Errors**
```bash
npm run build 2>&1 | grep -i "error"
```
**Expected:** No errors found

**Test Case 3: Bundle Size**
```bash
npm run build 2>&1 | grep "dist/"
```
**Expected:** Bundle size reasonable (< 500KB gzipped)

---

## 8. Integration Testing

**Test Case 1: End-to-End Workflow**
1. [ ] Create department
2. [ ] Invite team member
3. [ ] Assign member to department
4. [ ] Create custom role
5. [ ] Assign role to member
6. [ ] View analytics
7. [ ] Export report

**Expected:** All steps complete successfully

---

## Testing Checklist

### Database Tests
- [ ] All 7 tables created
- [ ] All 28 RLS policies active
- [ ] All 9 RPC functions available
- [ ] All 23 indexes created
- [ ] All 7 triggers working

### Component Tests
- [ ] DepartmentManagement CRUD working
- [ ] RoleManagement CRUD working
- [ ] TeamManagement CRUD working
- [ ] CompanyAnalytics displaying data
- [ ] CompanySettings saving data
- [ ] RoleSelector loading roles
- [ ] DepartmentSelector loading departments

### Security Tests
- [ ] RLS policies preventing unauthorized access
- [ ] Company data isolation verified
- [ ] Super admin access working

### Performance Tests
- [ ] Load times acceptable
- [ ] Search performance good
- [ ] Export performance acceptable

### Responsive Design Tests
- [ ] Mobile layout working
- [ ] Tablet layout working
- [ ] Desktop layout working

### Build Tests
- [ ] npm run build successful
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Bundle size acceptable

---

## Sign-Off

- [ ] All tests passed
- [ ] No critical issues
- [ ] Ready for deployment

**Testing Completed:** _______________
**Tested By:** _______________
**Date:** _______________

