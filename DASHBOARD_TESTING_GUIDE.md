# Dashboard Testing Guide

## Testing Developer and Company Admin Functionality

### Production URL

**<https://cortexbuildcortexbuild-kfqp216jy-adrian-b7e84541.vercel.app>**

---

## Test Accounts

### 1. Developer Account

- **Email**: `dev@constructco.com`
- **Password**: `parola123`
- **Expected Dashboard**: DeveloperDashboardScreen
- **Features to Test**:
  - ✅ Logout button visible in top-right corner
  - ✅ SDK Platform & Tools header visible
  - ✅ Tabs: Overview, SDK Tools, AI Agents, Sandbox, Analytics
  - ✅ Developer statistics cards
  - ✅ API endpoint: `/api/developer/dashboard/summary` should load data

### 2. Company Admin Account

- **Email**: `adrian@ascladdingltd.co.uk`
- **Password**: `Lolozania1`
- **Expected Dashboard**: UnifiedDashboardScreen → EnhancedDashboard
- **Features to Test**:
  - ✅ Logout button visible in top-right corner
  - ✅ "CortexBuild" header with role "company admin"
  - ✅ Enhanced Dashboard with:
    - Project statistics
    - Team members
    - Pending RFIs
    - Open punch items
    - Real-time stats
    - Recent activity
    - Performance charts

### 3. Super Admin Account (for comparison)

- **Email**: `adrian.stanca1@gmail.com`
- **Password**: `parola123`
- **Expected Dashboard**: SuperAdminDashboardScreen
- **Features to Test**:
  - ✅ Logout button visible
  - ✅ "CortexBuild Super Admin" header
  - ✅ Platform administration features

---

## Testing Checklist

### For Developer Account

1. [ ] Login successful
2. [ ] Dashboard loads without errors
3. [ ] User name and email visible in header
4. [ ] Logout button present and clickable
5. [ ] Developer statistics load (check browser console for API call to `/api/developer/dashboard/summary`)
6. [ ] All tabs are clickable (Overview, SDK Tools, AI Agents, Sandbox, Analytics)
7. [ ] No console errors in browser DevTools
8. [ ] Clicking logout returns to login screen

### For Company Admin Account

1. [ ] Login successful
2. [ ] Dashboard loads without errors
3. [ ] User name and email visible in header
4. [ ] Logout button present and clickable
5. [ ] Dashboard shows project statistics
6. [ ] Dashboard shows team information
7. [ ] Real-time stats components render
8. [ ] No console errors in browser DevTools
9. [ ] Clicking logout returns to login screen

---

## How to Check for Errors

### Browser Console (F12 or Cmd+Option+I)

1. Open browser Developer Tools
2. Go to "Console" tab
3. Look for any red error messages
4. Check "Network" tab for failed API calls

### Common Issues to Look For

- ❌ Red error messages in console
- ❌ Failed API calls (status 404, 500, etc.)
- ❌ Blank white screen
- ❌ "Loading..." that never finishes
- ❌ Missing logout button
- ❌ TypeScript/React errors

---

## Expected API Calls

### Developer Dashboard

```
GET /api/developer/dashboard/summary
Authorization: Bearer <token>

Expected Response:
{
  "success": true,
  "tenant": { "userId": "...", "companyId": "..." },
  "profile": { "subscriptionTier": "...", ... },
  "stats": { "totalApps": 0, "activeApps": 0, ... },
  "apps": [],
  "workflows": [],
  "webhooks": [],
  "agents": [],
  ...
}
```

### Company Admin Dashboard

```
Uses local state with mock data initially.
No specific API call required for EnhancedDashboard.
```

---

## Troubleshooting

### If Developer Dashboard Shows Loading Forever

1. Check browser console for errors
2. Check Network tab for failed `/api/developer/dashboard/summary` call
3. Verify backend server is running
4. Check if JWT token is valid

### If Company Admin Dashboard is Blank

1. Check browser console for React errors
2. Verify EnhancedDashboard component is rendering
3. Check if navigation routing is correct
4. Verify user role is exactly "company_admin"

### If Logout Button is Missing

1. Check if `onLogout` prop is being passed from App.tsx
2. Verify component is receiving the prop
3. Check browser window size (button might be hidden on mobile view)

---

## Local Testing (Optional)

If you want to test locally instead of production:

```bash
# Terminal 1: Start backend
npm run server

# Terminal 2: Start frontend
npm run dev

# Then open: http://localhost:3000
```

---

## What "Not Functional" Might Mean

Please specify which of these issues you're experiencing:

1. **Can't login** - Error message when entering credentials
2. **Blank screen** - Page loads but shows nothing
3. **Dashboard doesn't load** - Stuck on loading spinner
4. **Features don't work** - Dashboard loads but buttons/features don't respond
5. **Error messages** - Specific error text appears
6. **No data shows** - Dashboard structure appears but no data
7. **Logout doesn't work** - Button doesn't respond or doesn't redirect

---

## Success Criteria

Both dashboards should:

- ✅ Load within 3 seconds
- ✅ Display user information correctly
- ✅ Show logout button in top-right
- ✅ Logout functionality works (returns to login screen)
- ✅ No console errors
- ✅ All components render properly
- ✅ Navigation/tabs work correctly (for developer)

---

## Current Status

- **Build**: ✅ Successful (no TypeScript errors)
- **Deployment**: ✅ Live on Vercel
- **Backend**: ✅ All 27 API routes registered
- **Developer Dashboard**: ✅ Component exists with logout button
- **Company Admin Dashboard**: ✅ EnhancedDashboard component exists with logout button

---

## Next Steps

1. Test both accounts using the credentials above
2. Document any specific errors you see
3. Check browser console for error messages
4. Take screenshots if helpful
5. Report specific issues (e.g., "Developer dashboard shows 'Failed to load developer dashboard'" or "Company admin dashboard is blank")

This will help me identify and fix the exact problem!
