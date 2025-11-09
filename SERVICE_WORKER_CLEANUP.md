# Service Worker Cleanup Instructions

## Problem
Browser is trying to load a cached service worker (`sw.js`) that no longer exists, causing network errors.

## Solution

### Option 1: Clear Browser Cache (Recommended)
1. Open Chrome DevTools (F12 or Right-click → Inspect)
2. Go to **Application** tab
3. In the left sidebar, find **Service Workers**
4. Click **Unregister** for any registered service workers
5. Click **Clear storage** in the left sidebar
6. Check "Unregister service workers"
7. Click **Clear site data**
8. Refresh the page (Ctrl+R or Cmd+R)

### Option 2: Hard Reload
1. Press **Ctrl+Shift+R** (Windows/Linux) or **Cmd+Shift+R** (Mac)
2. This will bypass the cache and reload all resources

### Option 3: Incognito/Private Mode
1. Open the site in Incognito/Private browsing mode
2. This will load without any cached service workers

## Files Created
1. **public/sw.js** - Self-unregistering service worker
2. **public/manifest.json** - Empty manifest to prevent icon errors

## Verification
After clearing the cache, you should see:
- ✅ No service worker errors
- ✅ No "Failed to convert value to 'Response'" errors
- ✅ Frontend loads from `http://localhost:3000`
- ✅ API calls proxy to `http://localhost:3001`

## Current Status
- ✅ Frontend server running: http://localhost:3000
- ✅ Backend server running: http://localhost:3001
- ✅ Authentication fixed and working
- ✅ All API routes registered
- ⚠️ Browser cache needs clearing (one-time manual step)

## Quick Test
After clearing cache, visit: http://localhost:3000

You should see the CortexBuild application load without errors.
