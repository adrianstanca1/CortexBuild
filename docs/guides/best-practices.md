# 💎 Best Practices Guide

Learn how to integrate with CortexBuild API like a pro.

## 🎯 General Principles

### 1. Use Environment Variables

**✅ DO:**
```javascript
const API_BASE = process.env.REACT_APP_API_BASE || 'https://api.cortexbuild.com';
const token = process.env.REACT_APP_API_TOKEN;
```

**❌ DON'T:**
```javascript
const API_BASE = 'https://api.cortexbuild.com'; // Hardcoded
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Exposed token
```

### 2. Implement Retry Logic

```javascript
async function apiRequestWithRetry(endpoint, options = {}, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(endpoint, options);
      
      if (response.ok) {
        return response.json();
      }
      
      // Don't retry on client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Client error: ${response.status}`);
      }
      
      // Retry on server errors (5xx)
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      
      throw new Error(`Server error: ${response.status}`);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
}
```

### 3. Handle Rate Limits

```javascript
class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  async throttle() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.requests.push(now);
  }
}

const limiter = new RateLimiter();

async function apiRequest(endpoint, options) {
  await limiter.throttle();
  return fetch(endpoint, options);
}
```

## 🔄 Error Handling

### Comprehensive Error Handler

```javascript
class APIError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(endpoint, options);

    if (!response.ok) {
      const error = await response.json();
      throw new APIError(
        error.message || 'Request failed',
        response.status,
        error.code
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof APIError) {
      // Handle API errors
      switch (error.status) {
        case 401:
          // Redirect to login
          window.location.href = '/login';
          break;
        case 429:
          // Rate limit exceeded
          console.warn('Rate limit exceeded, retrying...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          return apiRequest(endpoint, options);
        default:
          console.error('API Error:', error);
      }
    } else {
      // Handle network errors
      console.error('Network Error:', error);
    }
    throw error;
  }
}
```

## 📊 Performance Optimization

### 1. Batch Requests

**✅ DO:**
```javascript
// Batch multiple requests
const [projects, tasks, notifications] = await Promise.all([
  fetch('/api/projects'),
  fetch('/api/tasks'),
  fetch('/api/notifications')
]);
```

**❌ DON'T:**
```javascript
// Sequential requests (slow)
const projects = await fetch('/api/projects');
const tasks = await fetch('/api/tasks');
const notifications = await fetch('/api/notifications');
```

### 2. Cache Responses

```javascript
class APICache {
  constructor(ttl = 60000) {
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

const cache = new APICache();

async function getCachedProjects() {
  const cached = cache.get('projects');
  if (cached) return cached;

  const projects = await fetch('/api/projects').then(r => r.json());
  cache.set('projects', projects);
  return projects;
}
```

### 3. Use Pagination

```javascript
async function getAllProjects() {
  let allProjects = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(`/api/projects?page=${page}&limit=50`);
    const projects = await response.json();

    allProjects = [...allProjects, ...projects];
    hasMore = projects.length === 50;
    page++;
  }

  return allProjects;
}
```

## 🔐 Security

### 1. Validate Input

```javascript
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validatePassword(password) {
  return password.length >= 8;
}

// Use before API calls
if (!validateEmail(email)) {
  throw new Error('Invalid email');
}
```

### 2. Sanitize Data

```javascript
function sanitizeInput(input) {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
```

### 3. Use HTTPS

```javascript
const API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://api.cortexbuild.com'
  : 'http://localhost:3001/api';
```

## 📱 Offline Support

```javascript
class OfflineQueue {
  constructor() {
    this.queue = JSON.parse(localStorage.getItem('offline_queue') || '[]');
  }

  add(request) {
    this.queue.push(request);
    localStorage.setItem('offline_queue', JSON.stringify(this.queue));
  }

  async processQueue() {
    while (this.queue.length > 0) {
      const request = this.queue[0];
      try {
        await fetch(request.url, request.options);
        this.queue.shift();
        localStorage.setItem('offline_queue', JSON.stringify(this.queue));
      } catch (error) {
        break; // Still offline
      }
    }
  }
}

const offlineQueue = new OfflineQueue();

// Add to queue if offline
if (!navigator.onLine) {
  offlineQueue.add({ url: '/api/projects', options: { method: 'POST', ... } });
}

// Process queue when online
window.addEventListener('online', () => {
  offlineQueue.processQueue();
});
```

## 🧪 Testing

### Mock API Responses

```javascript
// For testing
const mockFetch = (url, options) => {
  if (url.includes('/projects')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        { id: '1', name: 'Test Project' }
      ])
    });
  }
};

// Use in tests
global.fetch = mockFetch;
```

## 📝 Logging

```javascript
class APILogger {
  log(method, endpoint, duration, status) {
    console.log(`[API] ${method} ${endpoint} - ${status} (${duration}ms)`);
  }

  error(method, endpoint, error) {
    console.error(`[API ERROR] ${method} ${endpoint}`, error);
  }
}

const logger = new APILogger();

async function apiRequest(endpoint, options = {}) {
  const start = Date.now();
  const method = options.method || 'GET';

  try {
    const response = await fetch(endpoint, options);
    const duration = Date.now() - start;
    logger.log(method, endpoint, duration, response.status);
    return response.json();
  } catch (error) {
    logger.error(method, endpoint, error);
    throw error;
  }
}
```

## 🎯 TypeScript Support

```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
}

async function getProjects(): Promise<Project[]> {
  const response = await fetch('/api/projects');
  return response.json();
}
```

## 💡 Quick Tips

1. ✅ **Always validate input** before sending to API
2. ✅ **Implement retry logic** for transient failures
3. ✅ **Cache responses** when appropriate
4. ✅ **Use pagination** for large datasets
5. ✅ **Handle offline scenarios** gracefully
6. ✅ **Log API calls** for debugging
7. ✅ **Use TypeScript** for type safety
8. ✅ **Test error scenarios** thoroughly
9. ✅ **Monitor rate limits** proactively
10. ✅ **Keep tokens secure** always

## 🔗 Related Guides

- [Getting Started](./getting-started.md)
- [Authentication](./authentication.md)
- [Error Handling](./error-handling.md)

---

**Code smart, not hard!** 💪

