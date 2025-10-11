# 🔐 Authentication Guide

Complete guide to authenticating with the CortexBuild API.

## 🎯 Overview

CortexBuild uses **JWT (JSON Web Tokens)** for authentication. All API requests (except login and register) require a valid token.

## 🔑 Authentication Flow

```
1. Register/Login → 2. Receive Token → 3. Use Token in Requests → 4. Refresh Token (optional)
```

## 📝 Registration

### Endpoint
```
POST /api/auth/register
```

### Request
```json
{
  "email": "user@example.com",
  "password": "secure-password",
  "name": "John Doe",
  "role": "developer"
}
```

### Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "developer"
  }
}
```

### Example
```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'secure-password',
    name: 'John Doe'
  })
});

const { token, user } = await response.json();
localStorage.setItem('token', token);
```

## 🔓 Login

### Endpoint
```
POST /api/auth/login
```

### Request
```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

### Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "developer"
  }
}
```

### Example
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'your-password'
  })
});

const { token, user } = await response.json();
localStorage.setItem('token', token);
```

## 🎫 Using the Token

Include the token in the `Authorization` header:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Example
```javascript
const token = localStorage.getItem('token');

const response = await fetch('/api/projects', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 👤 Get Current User

### Endpoint
```
GET /api/auth/me
```

### Example
```javascript
const response = await fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const user = await response.json();
```

## 🔄 Token Refresh (Optional)

Tokens expire after 24 hours. Implement token refresh to maintain sessions:

```javascript
async function refreshToken() {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${oldToken}`
    }
  });

  const { token } = await response.json();
  localStorage.setItem('token', token);
  return token;
}
```

## 🛡️ Security Best Practices

### 1. Store Tokens Securely

**✅ DO:**
```javascript
// Use localStorage or sessionStorage
localStorage.setItem('token', token);

// Or use secure cookies (httpOnly, secure)
document.cookie = `token=${token}; secure; httpOnly; sameSite=strict`;
```

**❌ DON'T:**
```javascript
// Never store in plain JavaScript variables
window.token = token; // BAD!

// Never commit tokens to version control
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // BAD!
```

### 2. Handle Token Expiration

```javascript
async function apiRequest(endpoint, options = {}) {
  let token = localStorage.getItem('token');

  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });

  // Token expired
  if (response.status === 401) {
    // Redirect to login
    window.location.href = '/login';
    return;
  }

  return response.json();
}
```

### 3. Logout Properly

```javascript
function logout() {
  // Clear token
  localStorage.removeItem('token');
  
  // Optional: Call logout endpoint
  fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  // Redirect to login
  window.location.href = '/login';
}
```

## ⚠️ Common Errors

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

**Solution:** Login again to get a new token.

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

**Solution:** Check user role and permissions.

## 🔐 Role-Based Access

Different roles have different permissions:

| Role | Permissions |
|------|-------------|
| **admin** | Full access to all resources |
| **developer** | Create/edit projects, tasks, apps |
| **user** | View projects, create tasks |

### Check User Role
```javascript
const user = await fetch('/api/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

if (user.role === 'admin') {
  // Admin-only features
}
```

## 📱 Multi-Device Support

Tokens work across devices. Users can login from multiple devices simultaneously.

## 🔄 Session Management

```javascript
// Check if user is logged in
function isAuthenticated() {
  const token = localStorage.getItem('token');
  return !!token;
}

// Redirect if not authenticated
if (!isAuthenticated()) {
  window.location.href = '/login';
}
```

## 💡 Tips

1. **Always use HTTPS** in production
2. **Implement token refresh** for better UX
3. **Handle 401 errors** gracefully
4. **Clear tokens on logout**
5. **Never expose tokens** in URLs or logs

## 🔗 Related Guides

- [Getting Started](./getting-started.md)
- [Error Handling](./error-handling.md)
- [Best Practices](./best-practices.md)

---

**Stay secure!** 🔒

