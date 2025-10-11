# 🧪 TASK 2.4 - TESTING GUIDE

**Data:** 11 Octombrie 2025, 00:20  
**Task:** Testing Task 2.4 - API Error Recovery  
**Duration:** 20 minutes  
**Status:** 🚀 READY TO TEST

---

## 📋 TESTING CHECKLIST

### **Test 1: Retry Logic** (5 minutes)

**Obiectiv:** Verifică că retry logic funcționează corect cu exponential backoff

**Steps:**
```bash
# 1. Start application
npm run dev:all

# 2. Open browser to http://localhost:3000
# 3. Open DevTools Console (F12)
# 4. Watch for retry attempts in console logs
```

**Test Cases:**

✅ **1a. Server Error (500) - Should Retry**
```typescript
// In browser console, simulate 500 error:
fetch('http://localhost:3001/api/test-error-500')
  .catch(err => console.log('500 Error caught:', err));

// Expected: 3 retry attempts with delays: 1s, 2s, 4s
// Check console for: "[API Retry] Attempt 1/3", etc.
```

✅ **1b. Network Timeout (408) - Should Retry**
```typescript
// Simulate timeout
fetch('http://localhost:3001/api/test-timeout')
  .catch(err => console.log('Timeout error:', err));

// Expected: 3 retry attempts
```

✅ **1c. Client Error (404) - Should NOT Retry**
```typescript
// 404 should not retry
fetch('http://localhost:3001/api/nonexistent')
  .catch(err => console.log('404 error:', err));

// Expected: NO retries, immediate error
```

✅ **1d. Unauthorized (401) - Should NOT Retry + Auto Logout**
```typescript
// Simulate unauthorized
fetch('http://localhost:3001/api/protected', {
  headers: { 'Authorization': 'Bearer invalid_token' }
});

// Expected: 
// - NO retries
// - Toast: "Session expired. Please log in again."
// - Redirect to /login after 2 seconds
```

---

### **Test 2: Offline Mode & Queue** (7 minutes)

**Obiectiv:** Verifică offline detection și request queuing

**Steps:**

✅ **2a. Go Offline**
```bash
# In DevTools:
# 1. Open Network tab
# 2. Select "Offline" from throttling dropdown
# OR use browser: Chrome > More tools > Developer tools > Network > Offline
```

**Expected Results:**
- Offline indicator appears in bottom-right corner
- Shows "Offline" status with red background
- Shows WifiOff icon (pulsing)

✅ **2b. Queue Requests While Offline**
```typescript
// In browser console (while offline):
import offlineManager from './src/services/offlineManager';

// Queue a request
await offlineManager.queueRequest({
  method: 'POST',
  url: '/projects',
  data: { name: 'Test Project' },
  priority: 'high'
});

// Check queue status
console.log(offlineManager.getQueueStatus());
```

**Expected Results:**
- Request added to queue
- Queue length shown in offline indicator badge
- Request stored in localStorage

✅ **2c. Go Back Online**
```bash
# In DevTools Network tab:
# Select "No throttling" or "Online"
```

**Expected Results:**
- Offline indicator changes to green "Online"
- Auto-sync starts automatically
- Queued requests execute in order
- Success/failure counts shown
- Toast notifications for results

✅ **2d. Manual Sync**
```typescript
// Hover over offline indicator
// Click "Sync Now" button

// Or in console:
const result = await offlineManager.syncQueue();
console.log('Sync result:', result);
```

---

### **Test 3: User-Friendly Error Messages** (3 minutes)

**Obiectiv:** Verifică că mesajele de eroare sunt user-friendly și în română

**Test Cases:**

✅ **3a. Test Various Error Codes**
```typescript
// In browser console:
import { getUserMessage } from './src/utils/apiErrorMessages';

// Test status codes
console.log('400:', getUserMessage(400, undefined, undefined, 'ro'));
console.log('401:', getUserMessage(401, undefined, undefined, 'ro'));
console.log('403:', getUserMessage(403, undefined, undefined, 'ro'));
console.log('404:', getUserMessage(404, undefined, undefined, 'ro'));
console.log('500:', getUserMessage(500, undefined, undefined, 'ro'));
console.log('503:', getUserMessage(503, undefined, undefined, 'ro'));
```

**Expected Romanian Messages:**
- 400: "Cerere invalidă. Verificați datele introduse..."
- 401: "Sesiunea dvs. a expirat. Vă rugăm să vă autentificați..."
- 403: "Nu aveți permisiunea să efectuați această acțiune..."
- 404: "Resursa solicitată nu a fost găsită..."
- 500: "Eroare internă de server. Lucrăm la rezolvare..."
- 503: "Serviciu temporar indisponibil. Efectuăm mentenanță..."

✅ **3b. Test Context-Specific Messages**
```typescript
// Auth errors
console.log('Auth error:', getUserMessage(undefined, 'login_failed', 'auth', 'ro'));

// Project errors
console.log('Project error:', getUserMessage(undefined, 'not_found', 'project', 'ro'));
```

---

### **Test 4: React Hooks (useAPI)** (3 minutes)

**Obiectiv:** Verifică că hooks funcționează corect în componente

**Steps:**

✅ **4a. Create Test Component**
```typescript
// Create: src/components/TestAPIComponent.tsx
import React from 'react';
import { useGET } from '../hooks/useAPI';

export const TestAPIComponent = () => {
  const { data, loading, error, retry } = useGET<any[]>(
    '/api/projects',
    {},
    { autoExecute: true }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return (
    <div>
      <p>Error: {error.userMessage}</p>
      <button onClick={retry}>Retry</button>
    </div>
  );

  return (
    <div>
      <h3>Projects: {data?.length}</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};
```

✅ **4b. Test in Browser**
```typescript
// Add to App.tsx temporarily:
import { TestAPIComponent } from './components/TestAPIComponent';

// In render:
<TestAPIComponent />
```

**Expected Results:**
- Shows "Loading..." initially
- Fetches data automatically
- Displays projects count and data
- If error: Shows error message + Retry button
- Retry button works

✅ **4c. Test Request Cancellation**
```typescript
// Navigate away quickly before request completes
// Expected: Request cancelled, no memory leak
// Check console: "Request was cancelled" or similar
```

---

### **Test 5: Offline Indicator UI** (2 minutes)

**Obiectiv:** Verifică UI-ul offline indicator

**Test Cases:**

✅ **5a. Visual States**
```
Online:
- Green background
- Wifi icon
- "Online" text
- Optional: shows when showWhenOnline=true

Offline:
- Red background
- WifiOff icon (pulsing)
- "Offline" text
- Always visible

With Queue:
- Badge showing queue count
- Clock icon in details panel
```

✅ **5b. Hover Details Panel**
```
Hover over indicator:
- Details panel slides in
- Shows connection status
- Shows queued requests count
- Shows sync button (when online)
- Shows last sync results
- Shows help text
```

✅ **5c. Different Positions**
```typescript
// Test all 4 positions:
<OfflineIndicator position="top-left" />
<OfflineIndicator position="top-right" />
<OfflineIndicator position="bottom-left" />
<OfflineIndicator position="bottom-right" />
```

---

## 🔧 MANUAL TESTING COMMANDS

### **Setup Test Environment**

```bash
# Terminal 1: Start Backend
cd /Users/admin/Desktop/CortexBuild
npm run server

# Terminal 2: Start Frontend
npm run dev

# Terminal 3: Test Commands
cd /Users/admin/Desktop/CortexBuild
```

### **Test API Client Stats**

```typescript
// In browser console:
import apiClient from './src/services/apiClient';

// Make some requests
await apiClient.get('/projects');
await apiClient.get('/tasks');

// Check stats
console.log(apiClient.getStats());
// Expected output:
// {
//   totalRequests: 2,
//   totalFailures: 0,
//   successRate: 100
// }
```

### **Test Offline Queue Persistence**

```bash
# 1. Go offline
# 2. Queue some requests (see Test 2b)
# 3. Close browser tab
# 4. Reopen tab (still offline)
# 5. Check if queue persisted

# In console:
import offlineManager from './src/services/offlineManager';
console.log(offlineManager.getQueueStatus());
// Expected: Queue still has pending requests
```

### **Test Cache**

```typescript
// In console:
import { useGET, getCacheStats } from './src/hooks/useAPI';

// Make request with cacheKey
const { data } = useGET('/projects', {}, { 
  cacheKey: 'projects_list',
  autoExecute: true 
});

// Check cache
console.log(getCacheStats());
// Expected: { size: 1, keys: ['projects_list'] }

// Wait 10 seconds and request again
// Expected: Uses cached data (no network request)
```

---

## ✅ SUCCESS CRITERIA

### **All Tests Pass If:**

- ✅ Retry logic works for 500, 502, 503, 504, 408, 429
- ✅ No retry for 4xx errors (except 408, 429)
- ✅ Offline indicator shows correct status
- ✅ Requests queue when offline
- ✅ Auto-sync works when back online
- ✅ Error messages in Romanian
- ✅ useAPI hook loads data correctly
- ✅ Request cancellation works
- ✅ Cache works (5 min TTL)
- ✅ Toast notifications appear
- ✅ No console errors
- ✅ No memory leaks

---

## 🐛 COMMON ISSUES & FIXES

### **Issue: Retry not working**
```typescript
// Check config in apiClient.ts:
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  retryableStatuses: [408, 429, 500, 502, 503, 504]
};
```

### **Issue: Offline indicator not showing**
```typescript
// Make sure it's added to App.tsx:
import OfflineIndicator from './src/components/OfflineIndicator';

<OfflineIndicator position="bottom-right" />
```

### **Issue: Queue not persisting**
```typescript
// Check localStorage:
console.log(localStorage.getItem('cortexbuild_offline_queue'));
```

### **Issue: Error messages in English**
```typescript
// Check language param:
getUserMessage(500, undefined, undefined, 'ro'); // Use 'ro' for Romanian
```

---

## 📊 PERFORMANCE CHECKS

### **Network Tab Analysis**
```
✅ Check retry delays in Network tab:
   - Attempt 1: ~1 second after error
   - Attempt 2: ~2 seconds after attempt 1
   - Attempt 3: ~4 seconds after attempt 2

✅ Check request headers:
   - Authorization: Bearer <token>
   - Content-Type: application/json

✅ Check response times:
   - Most requests < 500ms
   - No hanging requests
```

### **Memory Profiling**
```
✅ Take heap snapshot before/after:
   - Navigate between screens
   - Make API calls
   - Check for memory leaks
   
Expected: Memory usage stable, no growing arrays/objects
```

---

## 📸 SCREENSHOTS TO CAPTURE

1. **Offline Indicator - Online State**
2. **Offline Indicator - Offline State with Queue**
3. **Offline Indicator - Details Panel**
4. **Toast Notification - Error Message (Romanian)**
5. **DevTools Console - Retry Attempts**
6. **Network Tab - Exponential Backoff Timing**

---

## 🎯 FINAL CHECKLIST

Before marking Task 2.4 as fully tested:

- [ ] All 5 test categories completed
- [ ] Screenshots captured
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Build successful: `npm run build`
- [ ] All features work in production build
- [ ] Documentation updated
- [ ] Performance acceptable (< 500ms API calls)
- [ ] Memory usage stable
- [ ] User experience smooth

---

## 📝 TEST RESULTS TEMPLATE

```markdown
# Task 2.4 - Test Results

**Date:** [Date]
**Tester:** [Your Name]
**Duration:** [Minutes]

## Results Summary
- ✅ Retry Logic: PASS
- ✅ Offline Mode: PASS
- ✅ Error Messages: PASS
- ✅ React Hooks: PASS
- ✅ UI Indicator: PASS

## Issues Found
1. [Issue description]
2. [Issue description]

## Performance Metrics
- Average API response time: XXXms
- Retry timing accuracy: XX%
- Memory usage: XXmb

## Screenshots
[Attach screenshots]

## Recommendations
[Any suggestions for improvements]
```

---

**🚀 Ready to start testing! Begin with Test 1 (Retry Logic).**

*Generated: 11 Oct 2025, 00:20*
