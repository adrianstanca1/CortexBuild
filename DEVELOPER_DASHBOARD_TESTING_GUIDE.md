# Developer Dashboard Testing Guide

## Quick Start

This guide helps you test the three separate, role-based dashboards in CortexBuild:
1. **Super Admin Dashboard** - Platform-wide control
2. **Company Admin Dashboard** - Business operations
3. **Developer Dashboard** - SDK development platform

---

## Test Credentials

### 1. Super Admin (adrian.stanca1@gmail.com)
```
Email: adrian.stanca1@gmail.com
Password: parola123
Company: ConstructCo (Company 1)
Role: super_admin
```

**Expected Dashboard**: SuperAdminDashboardScreen
- Cross-tenant metrics and analytics
- Platform health monitoring
- Global user and company management
- System-wide SDK usage statistics

### 2. Company Admin (adrian@ascladdingltd.co.uk)
```
Email: adrian@ascladdingltd.co.uk
Password: Lolozania1
Company: Metro Builders (Company 2)
Role: company_admin
```

**Expected Dashboard**: EnhancedDashboard
- Company-scoped project pipeline
- Financial KPIs and budget tracking
- Team management
- Invoice and payment tracking

### 3. Developer (dev@constructco.com)
```
Email: dev@constructco.com
Password: parola123
Company: ConstructCo (Company 1)
Role: developer
```

**Expected Dashboard**: DeveloperDashboardScreen
- SDK app development tools
- Sandbox execution environment
- Workflow automation builder
- API usage analytics

---

## Testing Steps

### Step 1: Start the Application
```bash
# Terminal 1 - Backend (port 3001)
npm run server

# Terminal 2 - Frontend (port 3000)
npm run dev

# Or run both together
npm run dev:all
```

### Step 2: Test Super Admin Dashboard
1. Navigate to http://localhost:3000
2. Click "Sign In" or navigate to login
3. Enter credentials:
   - Email: `adrian.stanca1@gmail.com`
   - Password: `parola123`
4. Verify login successful (JWT token stored in localStorage as `constructai_token`)
5. Dashboard should display **SuperAdminDashboardScreen** with:
   - ✅ Platform metrics (all companies)
   - ✅ System health indicators
   - ✅ Cross-tenant analytics
   - ✅ "Switch to Platform Admin" toggle button
6. Click "Switch to Platform Admin" → should show **PlatformAdminScreen**
7. Click "Back to Super Admin Dashboard" → return to SuperAdminDashboardScreen
8. Logout

### Step 3: Test Company Admin Dashboard
1. Navigate to login
2. Enter credentials:
   - Email: `adrian@ascladdingltd.co.uk`
   - Password: `Lolozania1`
3. Verify login successful
4. Dashboard should display **EnhancedDashboard** with:
   - ✅ Company name: "Metro Builders" (Company 2)
   - ✅ Project pipeline cards
   - ✅ Financial metrics (budget, expenses, revenue)
   - ✅ Team member list
   - ✅ Recent activity feed
5. Verify data is scoped to Company 2 only (no Company 1 data visible)
6. Test navigation:
   - Click on a project → should navigate to project details
   - Return to dashboard
7. Logout

### Step 4: Test Developer Dashboard
1. Navigate to login
2. Enter credentials:
   - Email: `dev@constructco.com`
   - Password: `parola123`
3. Verify login successful
4. Dashboard should display **DeveloperDashboardScreen** with:
   - ✅ Hero section with "Build the future of construction tech" headline
   - ✅ Company: "ConstructCo" (Company 1)
   - ✅ Tenant scope indicator showing `company_id: 1`
   - ✅ Capability indicators (sandbox quota, app/workflow slots)
   - ✅ Quick launch buttons:
     - "Launch SDK Workspace"
     - "Run Sandbox Simulation"
     - "Browse Marketplace"
5. Test hero section buttons:
   - Click "Launch SDK Workspace" → navigates to `sdk-developer` screen
   - Return to dashboard
   - Click "Run Sandbox Simulation" (if quota available) → sandbox executes
   - Check sandbox result display
6. Verify dashboard sections:
   - ✅ Impact Snapshot cards (SDK Apps, Automation Pipelines, Webhooks, AI Agents)
   - ✅ Quick Actions panel
   - ✅ Sandbox workflow presets
   - ✅ SDK app orchestrator presets
   - ✅ System Analytics (peak hour, API trends)
   - ✅ Recent developer activity feed
   - ✅ Builder modules library
   - ✅ Builder module editor
   - ✅ Developer sandbox controls
   - ✅ Community marketplace launchpad
   - ✅ SDK applications list
   - ✅ Operational workflows list
   - ✅ Sandbox run history
7. Test sandbox execution:
   - Click "Run Sandbox Simulation" in hero section
   - Wait for execution (should complete in 1-3 seconds)
   - Verify sandbox result appears below hero section
   - Check sandbox quota decrements (e.g., "9 of 10 simulations remaining")
8. Test workflow preset:
   - Scroll to "Sandbox-ready workflow presets" card
   - Click "Run in sandbox" on first preset
   - Verify execution and result display
9. Test builder module:
   - Scroll to "Builder Module Editor"
   - Click "Add Step"
   - Configure a simple node (name: "Test", type: "trigger")
   - Enter test payload: `{"test": "value"}`
   - Click "Save Module" → verify success toast
   - Click "Run in Sandbox" → verify execution
10. Logout

---

## Verification Checklist

### Super Admin Dashboard ✅
- [ ] Displays SuperAdminDashboardScreen by default
- [ ] Shows cross-tenant metrics
- [ ] Platform admin toggle works
- [ ] Data includes all companies (1 and 2)
- [ ] User info shows: adrian.stanca1@gmail.com, company_id: 1, role: super_admin

### Company Admin Dashboard ✅
- [ ] Displays EnhancedDashboard
- [ ] Shows Company 2 (Metro Builders) data only
- [ ] Financial metrics visible
- [ ] Project pipeline cards display
- [ ] Team management accessible
- [ ] No access to SDK development tools
- [ ] User info shows: adrian@ascladdingltd.co.uk, company_id: 2, role: company_admin

### Developer Dashboard ✅
- [ ] Displays DeveloperDashboardScreen
- [ ] Hero section with mission statement
- [ ] Company 1 (ConstructCo) tenant scope
- [ ] Capability indicators display correctly
- [ ] Quick launch buttons functional
- [ ] Impact snapshot cards show metrics
- [ ] Sandbox execution works (if quota available)
- [ ] Workflow presets execute successfully
- [ ] Builder module editor functional
- [ ] Save and run controls work
- [ ] Community marketplace accessible
- [ ] SDK applications list displays
- [ ] Sandbox run history visible
- [ ] User info shows: dev@constructco.com, company_id: 1, role: developer

---

## Data Isolation Testing

### Verify Tenant Separation
After logging in with each user, check browser DevTools:

1. Open DevTools → Network tab
2. Filter by "XHR" or "Fetch"
3. Inspect API requests:
   - Super Admin: Should see requests with no company filter (cross-tenant)
   - Company Admin: Should see requests with `company_id: 2` filter
   - Developer: Should see requests with `company_id: 1` filter

### Verify JWT Token
1. Open DevTools → Application → Local Storage → `http://localhost:3000`
2. Find key: `constructai_token`
3. Copy JWT token value
4. Decode at https://jwt.io
5. Verify payload contains:
   - `userId`: matches user ID
   - `companyId`: matches expected company
   - `role`: matches user role
   - `email`: matches login email

---

## Common Issues & Solutions

### Issue 1: Dashboard Not Routing Correctly
**Symptom**: Wrong dashboard displays after login

**Solution**:
1. Clear localStorage: `localStorage.clear()` in browser console
2. Logout and login again
3. Verify JWT token has correct `role` field
4. Check `UnifiedDashboardScreen.tsx` routing logic

### Issue 2: Sandbox Quota Reached
**Symptom**: "Daily sandbox run limit reached" message

**Solution**:
1. Check capability indicators in hero section
2. Current quota visible as: "X of Y simulations remaining"
3. For testing, you can:
   - Wait until next day (resets midnight UTC)
   - Manually reset in database:
     ```sql
     DELETE FROM developer_console_events 
     WHERE user_id = 3 AND event_type = 'sandbox.run';
     ```
   - Increase quota in `server/utils/capabilities.ts`

### Issue 3: Login Fails with 401
**Symptom**: "Invalid credentials" error

**Causes**:
- Password hash mismatch in database
- User not found in `users` table

**Solution**:
1. Verify user exists:
   ```bash
   sqlite3 cortexbuild.db
   SELECT id, email, role, company_id FROM users WHERE email = 'dev@constructco.com';
   ```
2. If user missing, re-run seed data:
   ```bash
   sqlite3 cortexbuild.db < CREATE_INITIAL_DATA.sql
   ```
3. Verify password hash generated correctly (bcrypt cost 10)

### Issue 4: No Data Showing in Dashboard
**Symptom**: Dashboard loads but cards show "0" or "No data"

**Solution**:
1. Verify seed data loaded:
   ```bash
   sqlite3 cortexbuild.db
   SELECT COUNT(*) FROM sdk_apps WHERE developer_id = 2;
   SELECT COUNT(*) FROM sdk_workflows WHERE developer_id = 2;
   ```
2. If counts are 0, re-run seed data:
   ```bash
   sqlite3 cortexbuild.db < CREATE_INITIAL_DATA.sql
   ```
3. Check API endpoint responses in Network tab (should return demo data if DB empty)

---

## API Endpoint Testing

### Test Developer Dashboard Summary Endpoint
```bash
# Get JWT token from localStorage after logging in as dev@constructco.com
# Replace <JWT_TOKEN> with actual token

curl -X GET http://localhost:3001/developer/dashboard/summary \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json"
```

**Expected Response**:
```json
{
  "success": true,
  "profile": {
    "apiRequestsUsed": 2450,
    "apiRequestsLimit": 100000,
    "subscriptionTier": "enterprise"
  },
  "apps": [
    {
      "id": "sdk-app-smart-scheduler",
      "name": "Smart Scheduler",
      "description": "AI-assisted scheduling assistant",
      "status": "approved",
      "version": "1.2.0"
    }
  ],
  "workflows": [...],
  "webhooks": [...],
  "stats": {
    "totalApps": 1,
    "activeApps": 1,
    "totalWorkflows": 1,
    "activeWorkflows": 1
  }
}
```

### Test Sandbox Execution Endpoint
```bash
curl -X POST http://localhost:3001/developer/sandbox/run \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Sandbox Run",
    "definition": {
      "nodes": [
        {"id": "start", "type": "trigger", "name": "Start"}
      ]
    },
    "payload": {"test": "value"}
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "result": {
    "executedAt": "2025-10-10T...",
    "result": "Simulation completed successfully",
    "logs": ["Sandbox initialized", "Module executed"]
  },
  "runId": "sandbox-run-...",
  "duration": 842
}
```

---

## Performance Testing

### Dashboard Load Time
1. Open DevTools → Performance tab
2. Click "Record"
3. Navigate to dashboard
4. Stop recording after dashboard fully loads
5. Expected load times:
   - Super Admin: < 1.5 seconds
   - Company Admin: < 1.2 seconds
   - Developer: < 2.0 seconds (larger component)

### Sandbox Execution Time
1. Click "Run Sandbox Simulation"
2. Measure time from click to result display
3. Expected: 1-3 seconds for simple workflows

---

## Success Criteria

All three dashboards are properly separated if:
- ✅ Super Admin sees SuperAdminDashboardScreen with cross-tenant data
- ✅ Company Admin sees EnhancedDashboard with Company 2 data only
- ✅ Developer sees DeveloperDashboardScreen with SDK tools and Company 1 scope
- ✅ Each dashboard has distinct UI, features, and data
- ✅ Navigation between dashboards not possible without re-login
- ✅ Tenant isolation verified via API requests
- ✅ JWT tokens contain correct role and company_id
- ✅ All sandbox and builder features functional for developer role

---

## Next Steps

After successful testing:
1. Document any bugs or issues found
2. Update `.github/copilot-instructions.md` with any new patterns
3. Consider adding automated E2E tests with Playwright or Cypress
4. Update user documentation with screenshots
5. Create video walkthrough for each dashboard

---

## Support

For issues or questions:
- Check `DEVELOPER_DASHBOARD_ARCHITECTURE.md` for architecture details
- Review `CREDENTIALS.md` for all test credentials
- See `.github/copilot-instructions.md` for development patterns
- Check `API_DOCUMENTATION.md` for endpoint details
