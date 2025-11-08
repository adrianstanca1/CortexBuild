# Phase 6: Testing & Deployment - Execution Guide

## Quick Start

This guide provides step-by-step instructions to execute Phase 6 of the CortexBuild dashboard refactoring project.

---

## Prerequisites

✅ **Completed:**
- Phase 1-5 all completed
- All code committed to git
- Supabase project created
- Vercel project configured

✅ **Required:**
- Supabase SQL Editor access
- Vercel dashboard access
- Node.js and npm installed
- Git configured

---

## Step 1: Database Migration Execution

### 1.1 Backup Database
```bash
# In Supabase Dashboard:
# 1. Go to "Backups" section
# 2. Click "Create backup"
# 3. Wait for backup to complete
```

### 1.2 Execute Migrations
```bash
# Open Supabase SQL Editor
# Copy and paste each migration file in order:

# 1. database/migrations/001_create_departments_table.sql
# 2. database/migrations/002_create_custom_roles_table.sql
# 3. database/migrations/003_create_department_members_table.sql
# 4. database/migrations/004_create_company_analytics_table.sql
# 5. database/migrations/005_create_company_settings_table.sql
# 6. database/migrations/006_create_api_keys_table.sql
# 7. database/migrations/007_create_webhooks_table.sql
# 8. database/migrations/008_create_rpc_functions.sql
# 9. database/migrations/009_create_rpc_functions_part2.sql
```

### 1.3 Verify Migrations
```sql
-- Run verification queries from PHASE6_MIGRATION_CHECKLIST.md
-- Expected: All 7 tables, 28 policies, 9 functions created
```

### 1.4 Test with Sample Data
```bash
# Open database/TEST_SCRIPT.sql
# Replace placeholders with actual IDs
# Execute tests 1-20
```

**Status:** ⏳ TODO

---

## Step 2: React Component Integration

### 2.1 Update CompanyAdminDashboardNew
```bash
# File: components/screens/dashboards/CompanyAdminDashboardNew.tsx
# Follow: database/PHASE6_COMPONENT_INTEGRATION.md
# Tasks:
# - Fetch department count
# - Fetch roles count
# - Fetch analytics data
# - Display real metrics
```

### 2.2 Update DepartmentManagement
```bash
# File: components/screens/company/DepartmentManagement.tsx
# Follow: database/PHASE6_COMPONENT_INTEGRATION.md
# Tasks:
# - Load from departments table
# - Use create_department() RPC
# - Use update_department_budget() RPC
# - Implement real delete
```

### 2.3 Update RoleManagement
```bash
# File: components/screens/company/RoleManagement.tsx
# Follow: database/PHASE6_COMPONENT_INTEGRATION.md
# Tasks:
# - Load from custom_roles table
# - Implement create/update/delete
# - Track user count
```

### 2.4 Update TeamManagement
```bash
# File: components/screens/company/TeamManagement.tsx
# Follow: database/PHASE6_COMPONENT_INTEGRATION.md
# Tasks:
# - Load from users table
# - Use invite_team_member() RPC
# - Use update_team_member_role() RPC
# - Show department assignments
```

### 2.5 Update CompanyAnalytics
```bash
# File: components/screens/company/CompanyAnalytics.tsx
# Follow: database/PHASE6_COMPONENT_INTEGRATION.md
# Tasks:
# - Load from company_analytics table
# - Use get_company_analytics() RPC
# - Implement date range filtering
# - Test export functionality
```

### 2.6 Update CompanySettings
```bash
# File: components/screens/company/CompanySettings.tsx
# Follow: database/PHASE6_COMPONENT_INTEGRATION.md
# Tasks:
# - Load from company_settings table
# - Load API keys from api_keys table
# - Load webhooks from webhooks table
# - Use create_api_key() RPC
```

### 2.7 Verify RoleSelector
```bash
# File: components/ui/RoleSelector.tsx
# Already fetches from custom_roles table
# Tasks:
# - Test that roles load correctly
# - Test search/filter
# - Test multi-select
# - Verify RLS policies work
```

### 2.8 Verify DepartmentSelector
```bash
# File: components/ui/DepartmentSelector.tsx
# Already fetches from departments table
# Tasks:
# - Test that departments load correctly
# - Test search/filter
# - Test multi-select
# - Verify RLS policies work
```

**Status:** ⏳ TODO

---

## Step 3: Testing

### 3.1 Database Testing
```bash
# Follow: database/PHASE6_TESTING_GUIDE.md
# Run all database tests:
# - Table creation tests
# - RLS policy tests
# - RPC function tests
# - Data validation tests
```

### 3.2 Component Testing
```bash
# Follow: database/PHASE6_TESTING_GUIDE.md
# Test each component:
# - Load data
# - Create operations
# - Update operations
# - Delete operations
# - Error handling
```

### 3.3 Integration Testing
```bash
# Follow: database/PHASE6_TESTING_GUIDE.md
# Test end-to-end workflows:
# - Create department
# - Invite team member
# - Assign to department
# - Create role
# - Assign role
# - View analytics
# - Export report
```

**Status:** ⏳ TODO

---

## Step 4: Build & Verification

### 4.1 Clean Build
```bash
cd /Users/admin/Desktop/proiecte\ web/CortexBuild

# Remove old build
rm -rf node_modules dist

# Reinstall dependencies
npm install

# Run build
npm run build
```

**Expected:** Build completes in < 10 seconds with no errors

### 4.2 Check for Errors
```bash
# Check build output
npm run build 2>&1 | tail -20

# Check for TypeScript errors
npm run build 2>&1 | grep -i "error"
```

**Expected:** No errors found

### 4.3 Check Bundle Size
```bash
# View bundle size
npm run build 2>&1 | grep "dist/"
```

**Expected:** Bundle size < 500KB gzipped

**Status:** ⏳ TODO

---

## Step 5: Deployment

### 5.1 Deploy to Vercel
```bash
# Option 1: Push to main branch (if auto-deploy enabled)
git push origin main

# Option 2: Manual deployment
vercel --prod

# Option 3: Deploy specific commit
vercel --prod --target=production
```

### 5.2 Monitor Deployment
```bash
# In Vercel Dashboard:
# 1. Go to Deployments
# 2. Watch build progress
# 3. Wait for deployment to complete
# 4. Verify deployment URL is accessible
```

### 5.3 Post-Deployment Verification
```bash
# 1. Visit deployment URL
# 2. Test all components
# 3. Check console for errors
# 4. Verify database connectivity
# 5. Test on mobile device
```

**Status:** ⏳ TODO

---

## Documentation Files

### Migration & Setup
- `database/SCHEMA_DOCUMENTATION.md` - Complete schema reference
- `database/SETUP_GUIDE.md` - Database setup instructions
- `database/PHASE6_MIGRATION_CHECKLIST.md` - Migration execution checklist

### Integration & Testing
- `database/PHASE6_COMPONENT_INTEGRATION.md` - Component integration guide
- `database/PHASE6_TESTING_GUIDE.md` - Testing procedures
- `database/PHASE6_DEPLOYMENT_GUIDE.md` - Deployment instructions

### Summary & Reference
- `database/PHASE5_SUMMARY.md` - Phase 5 summary
- `database/PHASE6_FINAL_SUMMARY.md` - Complete project summary
- `database/TEST_SCRIPT.sql` - Test queries

---

## Execution Checklist

### Step 1: Database Migration
- [ ] Database backed up
- [ ] All 9 migrations executed
- [ ] All 7 tables created
- [ ] All 28 RLS policies active
- [ ] All 9 RPC functions available
- [ ] TEST_SCRIPT.sql executed successfully

### Step 2: Component Integration
- [ ] CompanyAdminDashboardNew updated
- [ ] DepartmentManagement updated
- [ ] RoleManagement updated
- [ ] TeamManagement updated
- [ ] CompanyAnalytics updated
- [ ] CompanySettings updated
- [ ] RoleSelector verified
- [ ] DepartmentSelector verified

### Step 3: Testing
- [ ] Database tests passed
- [ ] Component tests passed
- [ ] Integration tests passed
- [ ] Error handling tested
- [ ] Performance acceptable
- [ ] Responsive design verified

### Step 4: Build
- [ ] npm run build successful
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Bundle size acceptable

### Step 5: Deployment
- [ ] Deployed to Vercel
- [ ] Deployment URL accessible
- [ ] All components working
- [ ] Database connectivity verified
- [ ] No errors in console
- [ ] Monitoring configured

---

## Troubleshooting

### Build Fails
1. Check error message
2. Fix locally
3. Run `npm run build` again
4. Push to main branch

### Database Connection Error
1. Verify environment variables
2. Check Supabase status
3. Verify RLS policies
4. Check network connectivity

### Component Not Loading
1. Check browser console
2. Check network tab
3. Verify API endpoints
4. Check authentication

### Performance Issues
1. Check Lighthouse score
2. Optimize images
3. Enable caching
4. Reduce bundle size

---

## Success Criteria

✅ **Phase 6 Complete When:**
- [ ] All migrations executed successfully
- [ ] All components integrated with database
- [ ] All tests passing
- [ ] Build successful with no errors
- [ ] Deployed to production
- [ ] All features working correctly
- [ ] No console errors
- [ ] Performance acceptable

---

## Next Steps After Phase 6

1. **Monitor Production**
   - Watch for errors
   - Monitor performance
   - Collect user feedback

2. **Iterate & Improve**
   - Fix any issues
   - Optimize performance
   - Add new features

3. **Scale & Expand**
   - Add more features
   - Expand to other dashboards
   - Develop mobile app

---

## Support

For issues or questions:
1. Check relevant documentation file
2. Review TEST_SCRIPT.sql for examples
3. Check component code comments
4. Review git commit history

---

## Sign-Off

**Phase 6 Status:** Ready for Execution

**Start Date:** _______________
**Completion Date:** _______________
**Completed By:** _______________

