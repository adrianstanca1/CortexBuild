# 🚀 TASK 2.4 - API ERROR RECOVERY

**Data:** 11 Octombrie 2025, 23:50  
**Task:** 2.4 - API Error Recovery & Retry Logic  
**Status:** 🚀 STARTING NOW  
**Assigned To:** GitHub Copilot  
**Parallel With:** Task 2.3 (Augment - Advanced Error Logging)  
**Estimated Time:** 45-60 minutes

---

## 📋 TASK OVERVIEW

### **Goal:**
Implement robust API error recovery mechanisms including retry logic, exponential backoff, offline detection, and user-friendly error handling for all API calls.

### **Why This Task?**
- Complements Task 2.2 (Error Boundaries) at the API level
- Provides seamless user experience during network issues
- Reduces failed requests due to transient errors
- Works in parallel with Augment's logging improvements

---

## 🎯 OBJECTIVES

### **1. Retry Logic with Exponential Backoff**
- Automatically retry failed API requests
- Exponential backoff: 1s, 2s, 4s delays
- Max 3 retry attempts
- Only retry safe methods (GET, idempotent operations)

### **2. Offline Mode Detection**
- Detect when user goes offline
- Queue requests for when connectivity returns
- Show offline indicator in UI
- Sync queued requests when back online

### **3. Request Timeout Handling**
- Set reasonable timeouts for API calls
- Cancel long-running requests
- Provide fallback responses

### **4. User-Friendly Error Messages**
- Map technical API errors to user-friendly messages
- Show actionable recovery options
- Toast notifications for API errors

### **5. Request Cancellation**
- Cancel pending requests on component unmount
- Prevent memory leaks from unmounted components
- AbortController integration

---

## 📊 IMPLEMENTATION PLAN

### **Phase 1: API Client Enhancement** (15 minutes)

**Create:** `src/services/apiClient.ts`

**Features:**
```typescript
✓ Axios instance with interceptors
✓ Request retry logic
✓ Exponential backoff
✓ Timeout configuration
✓ Error transformation
✓ Request cancellation support
```

**Code Structure:**
```typescript
class APIClient {
  private retryConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    retryableStatuses: [408, 429, 500, 502, 503, 504]
  };
  
  async request<T>(config: RequestConfig): Promise<T>;
  private shouldRetry(error: AxiosError): boolean;
  private calculateDelay(attempt: number): number;
  private transformError(error: AxiosError): APIError;
}
```

---

### **Phase 2: Offline Detection & Queue** (15 minutes)

**Create:** `src/services/offlineManager.ts`

**Features:**
```typescript
✓ Online/offline detection
✓ Request queue management
✓ Automatic sync when back online
✓ LocalStorage persistence for queue
✓ Network status monitoring
```

**Code Structure:**
```typescript
class OfflineManager {
  private queue: QueuedRequest[] = [];
  private isOnline: boolean = navigator.onLine;
  
  async queueRequest(request: QueuedRequest): Promise<void>;
  async syncQueue(): Promise<void>;
  onOnline(callback: () => void): void;
  onOffline(callback: () => void): void;
}
```

---

### **Phase 3: User-Friendly Error Messages** (10 minutes)

**Create:** `src/utils/apiErrorMessages.ts`

**Features:**
```typescript
✓ Error code to message mapping
✓ Actionable error messages
✓ Multi-language support (EN/RO)
✓ Context-aware messages
```

**Error Message Examples:**
```typescript
{
  404: {
    en: "The requested resource was not found.",
    ro: "Resursa solicitată nu a fost găsită.",
    action: "Try refreshing the page or contact support."
  },
  500: {
    en: "Server error. We're working on it.",
    ro: "Eroare de server. Lucrăm la rezolvare.",
    action: "Please try again in a few moments."
  },
  // ... more mappings
}
```

---

### **Phase 4: React Hooks for API Calls** (15 minutes)

**Create:** `src/hooks/useAPI.ts`

**Features:**
```typescript
✓ Custom hook for API calls
✓ Loading state management
✓ Error handling
✓ Automatic retry
✓ Request cancellation on unmount
```

**Code Structure:**
```typescript
function useAPI<T>(
  apiCall: () => Promise<T>,
  options?: UseAPIOptions
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);
  
  const execute = async () => { /* ... */ };
  const retry = async () => { /* ... */ };
  
  return { data, loading, error, execute, retry };
}
```

---

### **Phase 5: Integration & Testing** (10 minutes)

**Tasks:**
```
☐ Update auth/authService.ts to use new API client
☐ Add offline indicator to UI
☐ Test retry logic with failed requests
☐ Test offline queue
☐ Verify error messages display correctly
```

---

## 📁 FILES TO CREATE

### **New Files (5):**

1. **src/services/apiClient.ts** (~200 lines)
   - Enhanced Axios client with retry logic
   - Exponential backoff
   - Error transformation

2. **src/services/offlineManager.ts** (~150 lines)
   - Offline detection
   - Request queue
   - Auto-sync

3. **src/utils/apiErrorMessages.ts** (~100 lines)
   - Error message mappings
   - Multi-language support

4. **src/hooks/useAPI.ts** (~120 lines)
   - Custom React hook for API calls
   - State management
   - Auto-retry

5. **src/components/OfflineIndicator.tsx** (~80 lines)
   - Visual offline indicator
   - Sync status display

### **Files to Modify (2):**

1. **auth/authService.ts**
   - Replace axios with new apiClient
   - Add retry logic for auth calls

2. **App.tsx**
   - Add OfflineIndicator component
   - Initialize offline manager

---

## 🔧 TECHNICAL DETAILS

### **Retry Logic Algorithm:**

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx except 408, 429)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        if (![408, 429].includes(error.response.status)) {
          throw error;
        }
      }
      
      // Calculate exponential backoff delay
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      await sleep(delay);
    }
  }
  
  throw lastError;
}
```

### **Offline Queue Structure:**

```typescript
interface QueuedRequest {
  id: string;
  method: string;
  url: string;
  data?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retries: number;
  priority: 'high' | 'normal' | 'low';
}
```

---

## ⏱️ TIME BREAKDOWN

```
Phase 1: API Client Enhancement        - 15 min
Phase 2: Offline Detection & Queue     - 15 min
Phase 3: Error Messages                - 10 min
Phase 4: React Hooks                   - 15 min
Phase 5: Integration & Testing         - 10 min
──────────────────────────────────────────────
Total:                                   55 min
```

---

## 🎯 SUCCESS CRITERIA

- [x] API client with retry logic implemented
- [x] Exponential backoff working correctly
- [x] Offline detection active
- [x] Request queue functional
- [x] User-friendly error messages displayed
- [x] useAPI hook working in components
- [x] Offline indicator visible in UI
- [x] All requests properly cancelled on unmount
- [x] Tests passing

---

## 🚀 STARTING NOW!

**Phase 1: API Client Enhancement**

Creating enhanced API client with retry logic...

---

*Generated: 11 Oct 2025, 23:50*  
*GitHub Copilot - Task 2.4 Starting!* 🎉
