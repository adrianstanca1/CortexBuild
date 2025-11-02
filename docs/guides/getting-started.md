# 🚀 Getting Started with CortexBuild API

Welcome to the CortexBuild API! This guide will help you get started with integrating our platform into your applications.

## 📋 Prerequisites

Before you begin, make sure you have:
- A CortexBuild account
- Basic knowledge of REST APIs
- Your preferred programming language (JavaScript, Python, etc.)

## 🔑 Authentication

### 1. Create an Account

First, register for a CortexBuild account:

```bash
curl -X POST https://api.cortexbuild.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "your-secure-password",
    "name": "Your Name"
  }'
```

### 2. Login and Get Your Token

Authenticate to receive your JWT token:

```bash
curl -X POST https://api.cortexbuild.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "your-password"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "your@email.com",
    "name": "Your Name",
    "role": "developer"
  }
}
```

### 3. Use Your Token

Include the token in all subsequent requests:

```bash
curl -X GET https://api.cortexbuild.com/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📦 Quick Start Examples

### JavaScript/TypeScript

```javascript
// Initialize API client
const API_BASE = 'https://api.cortexbuild.com';
const token = 'YOUR_TOKEN_HERE';

// Fetch projects
async function getProjects() {
  const response = await fetch(`${API_BASE}/projects`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
}

// Create a project
async function createProject(name, description) {
  const response = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, description })
  });
  return response.json();
}

// Usage
const projects = await getProjects();
const newProject = await createProject('My Project', 'Description');
```

### Python

```python
import requests

API_BASE = 'https://api.cortexbuild.com'
token = 'YOUR_TOKEN_HERE'

# Fetch projects
def get_projects():
    response = requests.get(
        f'{API_BASE}/projects',
        headers={'Authorization': f'Bearer {token}'}
    )
    return response.json()

# Create a project
def create_project(name, description):
    response = requests.post(
        f'{API_BASE}/projects',
        headers={
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        },
        json={'name': name, 'description': description}
    )
    return response.json()

# Usage
projects = get_projects()
new_project = create_project('My Project', 'Description')
```

## 🎯 Common Use Cases

### 1. List All Projects

```javascript
const projects = await fetch(`${API_BASE}/projects`, {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

console.log(projects);
```

### 2. Create a Task

```javascript
const task = await fetch(`${API_BASE}/tasks`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Implement feature',
    description: 'Task description',
    project_id: 'proj_789',
    priority: 'high'
  })
}).then(r => r.json());
```

### 3. Get Notifications

```javascript
const notifications = await fetch(`${API_BASE}/notifications`, {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

console.log(notifications);
```

## ⚠️ Error Handling

Always handle errors properly:

```javascript
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

## 📊 Rate Limits

- **100 requests per minute** per user
- **1000 requests per hour** per user

If you exceed the rate limit, you'll receive a `429 Too Many Requests` response.

## 🔗 Next Steps

- [Authentication Guide](./authentication.md) - Detailed authentication flow
- [Error Handling Guide](./error-handling.md) - Handle errors like a pro
- [Best Practices Guide](./best-practices.md) - Tips for optimal integration
- [API Reference](../api/openapi.yaml) - Complete API documentation

## 💡 Tips

1. **Store your token securely** - Never commit tokens to version control
2. **Implement retry logic** - Handle temporary failures gracefully
3. **Use environment variables** - Keep configuration separate from code
4. **Monitor rate limits** - Track your API usage
5. **Handle errors properly** - Always check response status

## 🆘 Need Help?

- 📚 [Full API Documentation](../api/openapi.yaml)
- 💬 [Community Forum](https://community.cortexbuild.com)
- 📧 [Support Email](mailto:support@cortexbuild.com)
- 🐛 [Report Issues](https://github.com/cortexbuild/issues)

---

**Happy coding!** 🚀

