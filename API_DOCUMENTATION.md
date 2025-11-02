# 🚀 CortexBuild API Documentation

**Version:** 1.0.0
**Last Updated:** 11 October 2025
**Base URL:** `http://localhost:3001/api`

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Projects](#projects)
3. [Marketplace](#marketplace)
4. [Admin](#admin)
5. [AI & Chat](#ai--chat)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)

---

## 🔐 Authentication

All API endpoints (except login/register) require authentication via Bearer token in the Authorization header.

### Login

**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "company_admin",
    "company_id": "company-456"
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Invalid credentials

---

### Register

**POST** `/auth/register`

Create new user account.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "name": "New User",
  "companyName": "Acme Corp"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "124",
    "email": "newuser@example.com",
    "name": "New User",
    "role": "user",
    "company_id": "company-789"
  }
}
```

**Status Codes:**
- `201` - Created successfully
- `400` - User already exists
- `500` - Server error

---

### Logout

**POST** `/auth/logout`

Invalidate user session.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true
}
```

---

### Get Current User

**GET** `/auth/me`

Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "company_admin",
    "company_id": "company-456"
  }
}
```

---

## 📁 Projects

### List Projects

**GET** `/projects`

Get paginated list of projects with optional filtering.

**Query Parameters:**
- `status` (optional) - Project status: `planning`, `active`, `completed`, `on_hold`
- `priority` (optional) - Project priority: `low`, `medium`, `high`
- `client_id` (optional) - Filter by client ID
- `project_manager_id` (optional) - Filter by project manager ID
- `company_id` (optional) - Filter by company ID
- `search` (optional) - Search in name, description, or project number (min 2 chars)
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20, max: 100)

**Headers:**
```
Authorization: Bearer <token>
```

**Example Request:**
```
GET /api/projects?status=active&priority=high&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Downtown Office Complex",
      "description": "Modern office building construction",
      "project_number": "PROJ-2025-001",
      "status": "active",
      "priority": "high",
      "start_date": "2025-01-15",
      "end_date": "2025-12-31",
      "budget": 2500000,
      "spent": 450000,
      "address": "123 Main St",
      "city": "Springfield",
      "state": "IL",
      "zip_code": "62701",
      "client_id": 1,
      "project_manager_id": 5,
      "company_id": 1,
      "created_at": "2025-01-01T10:00:00Z",
      "updated_at": "2025-01-15T14:30:00Z",
      "client_name": "Acme Corporation",
      "manager_name": "Jane Smith"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### Get Project Details

**GET** `/projects/{id}`

Get detailed project information including tasks, milestones, team, and activities.

**Path Parameters:**
- `id` (required) - Project ID

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Downtown Office Complex",
    "description": "Modern office building construction",
    "project_number": "PROJ-2025-001",
    "status": "active",
    "priority": "high",
    "start_date": "2025-01-15",
    "end_date": "2025-12-31",
    "budget": 2500000,
    "spent": 450000,
    "address": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zip_code": "62701",
    "client_id": 1,
    "project_manager_id": 5,
    "company_id": 1,
    "created_at": "2025-01-01T10:00:00Z",
    "updated_at": "2025-01-15T14:30:00Z",
    "client_name": "Acme Corporation",
    "client_email": "contact@acme.com",
    "client_phone": "+1-555-0123",
    "manager_name": "Jane Smith",
    "manager_email": "jane@constructionco.com",
    "tasks": [...],
    "milestones": [...],
    "team": [...],
    "activities": [...]
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - Project not found

---

### Create Project

**POST** `/projects`

Create a new project.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "company_id": 1,
  "name": "New Construction Project",
  "description": "Project description",
  "project_number": "PROJ-2025-002",
  "status": "planning",
  "priority": "medium",
  "start_date": "2025-03-01",
  "end_date": "2025-08-31",
  "budget": 1500000,
  "address": "456 Oak Ave",
  "city": "Riverside",
  "state": "CA",
  "zip_code": "92501",
  "client_id": 2,
  "project_manager_id": 6
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "New Construction Project",
    "description": "Project description",
    "project_number": "PROJ-2025-002",
    "status": "planning",
    "priority": "medium",
    "start_date": "2025-03-01",
    "end_date": "2025-08-31",
    "budget": 1500000,
    "spent": 0,
    "address": "456 Oak Ave",
    "city": "Riverside",
    "state": "CA",
    "zip_code": "92501",
    "client_id": 2,
    "project_manager_id": 6,
    "company_id": 1,
    "created_at": "2025-01-15T16:00:00Z",
    "updated_at": "2025-01-15T16:00:00Z"
  },
  "message": "Project created successfully"
}
```

**Status Codes:**
- `201` - Created successfully
- `400` - Validation error (missing fields, duplicate project number)
- `404` - Referenced company/client/manager not found

---

### Update Project

**PUT** `/projects/{id}`

Update project information.

**Path Parameters:**
- `id` (required) - Project ID

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** (partial update supported)
```json
{
  "name": "Updated Project Name",
  "status": "active",
  "budget": 1750000,
  "description": "Updated project description"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Updated Project Name",
    "description": "Updated project description",
    "status": "active",
    "budget": 1750000,
    "updated_at": "2025-01-15T16:30:00Z"
  },
  "message": "Project updated successfully"
}
```

**Status Codes:**
- `200` - Updated successfully
- `400` - Validation error
- `404` - Project not found

---

### Delete Project

**DELETE** `/projects/{id}`

Delete a project (only if no dependencies exist).

**Path Parameters:**
- `id` (required) - Project ID

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

**Status Codes:**
- `200` - Deleted successfully
- `400` - Cannot delete project with existing dependencies
- `404` - Project not found

---

## 🛒 Marketplace

### Browse Modules

**GET** `/marketplace/modules`

Browse available modules with optional filtering.

**Query Parameters:**
- `category` (optional) - Filter by category slug
- `search` (optional) - Search in name or description
- `sort` (optional) - Sort by: `downloads`, `rating`, `newest`, `name` (default: downloads)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Project Timeline",
      "description": "Advanced project timeline and Gantt chart visualization",
      "version": "1.2.0",
      "category": "project-management",
      "category_name": "Project Management",
      "category_icon": "calendar",
      "status": "published",
      "rating": 4.8,
      "downloads": 1250,
      "install_count": 89,
      "author": "CortexBuild Team",
      "published_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-10T00:00:00Z"
    }
  ]
}
```

---

### Get Module Details

**GET** `/marketplace/modules/{id}`

Get detailed module information including reviews and dependencies.

**Path Parameters:**
- `id` (required) - Module ID

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Project Timeline",
    "description": "Advanced project timeline and Gantt chart visualization",
    "version": "1.2.0",
    "category": "project-management",
    "category_name": "Project Management",
    "status": "published",
    "rating": 4.8,
    "downloads": 1250,
    "install_count": 89,
    "author": "CortexBuild Team",
    "published_at": "2025-01-01T00:00:00Z",
    "reviews": [...],
    "dependencies": [...]
  }
}
```

---

### Install Module

**POST** `/marketplace/install`

Install a module for the current company.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "module_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Module installed successfully"
}
```

**Status Codes:**
- `200` - Installed successfully
- `400` - Module already installed or missing module_id
- `403` - Installation limit reached (upgrade plan)
- `404` - Module not found

---

### Get Installed Modules

**GET** `/marketplace/installed`

Get list of modules installed for the current company.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "module_id": 1,
      "company_id": 1,
      "config": "{}",
      "installed_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z",
      "name": "Project Timeline",
      "description": "Advanced project timeline and Gantt chart visualization",
      "version": "1.2.0",
      "category": "project-management",
      "category_name": "Project Management"
    }
  ]
}
```

---

### Configure Module

**PUT** `/marketplace/configure/{module_id}`

Update module configuration for the current company.

**Path Parameters:**
- `module_id` (required) - Module ID

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "config": {
    "theme": "dark",
    "autoRefresh": true,
    "notifications": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Module configuration updated"
}
```

---

### Uninstall Module

**DELETE** `/marketplace/uninstall/{module_id}`

Uninstall a module from the current company.

**Path Parameters:**
- `module_id` (required) - Module ID

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Module uninstalled successfully"
}
```

---

## 👑 Admin

All admin endpoints require super_admin role.

### Get Dashboard Analytics

**GET** `/admin/analytics/overview`

Get comprehensive dashboard analytics.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1250,
      "active": 890,
      "new_this_week": 45
    },
    "companies": {
      "total": 156,
      "active": 142
    },
    "projects": {
      "total": 789,
      "active": 567
    },
    "sdk": {
      "developers": 234,
      "total_requests": 45678,
      "total_tokens": 1234567,
      "total_cost": 234.56
    },
    "revenue": {
      "total": 125000,
      "monthly": 15000,
      "growth": 12.5
    },
    "system": {
      "uptime": 99.9,
      "cpu": 45,
      "memory": 67,
      "storage": 34
    }
  }
}
```

---

### Get Detailed Users

**GET** `/admin/users/detailed`

Get detailed user list with statistics.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "admin@cortexbuild.com",
      "name": "System Administrator",
      "role": "super_admin",
      "company_id": 1,
      "company_name": "CortexBuild Platform",
      "created_at": "2025-01-01T00:00:00Z",
      "last_login": "2025-01-15T09:30:00Z",
      "project_count": 5,
      "api_requests": 1234,
      "total_cost": 45.67
    }
  ]
}
```

---

### Create User

**POST** `/admin/users/create`

Create new user account (super admin only).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "password": "securePassword123",
  "role": "company_admin",
  "company_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 125,
    "email": "newuser@example.com",
    "name": "New User",
    "role": "company_admin"
  }
}
```

---

### Update User

**PATCH** `/admin/users/{id}`

Update user information (super admin only).

**Path Parameters:**
- `id` (required) - User ID

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "developer",
  "company_id": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully"
}
```

---

### Delete User

**DELETE** `/admin/users/{id}`

Delete user account (super admin only).

**Path Parameters:**
- `id` (required) - User ID

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## ❌ Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Invalid request data | 400 |
| `NOT_FOUND` | Resource not found | 404 |
| `UNAUTHORIZED` | Authentication required | 401 |
| `FORBIDDEN` | Access denied | 403 |
| `CONFLICT` | Resource conflict | 409 |
| `RATE_LIMITED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Server error | 500 |

### Authentication Errors

```json
{
  "success": false,
  "error": "Invalid email or password",
  "code": "AUTH_INVALID_CREDENTIALS"
}
```

### Validation Errors

```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": "Email is required",
    "password": "Password must be at least 8 characters"
  }
}
```

### Not Found Errors

```json
{
  "success": false,
  "error": "Project not found",
  "code": "NOT_FOUND"
}
```

---

## 🤖 AI & Chat

### AI Chat

**POST** `/ai/chat`

Send message to AI assistant and receive intelligent response with project context.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "What are the current project risks?",
  "mode": "analyze",
  "conversationId": "optional-conversation-id",
  "history": [
    {
      "role": "user",
      "content": "Previous message"
    },
    {
      "role": "assistant",
      "content": "Previous response"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "response": "Based on your current projects, I can identify several key risk areas...",
  "context": {
    "mode": "analyze",
    "projectsCount": 3,
    "tasksCount": 15,
    "tokensUsed": 245
  }
}
```

**Chat Modes:**
- `chat` (default) - General conversation and Q&A
- `analyze` - Detailed data analysis and insights
- `predict` - Project outcome predictions and forecasting

**Status Codes:**
- `200` - Success
- `400` - Missing message
- `401` - Unauthorized
- `500` - AI service error

---

### Get Conversation History

**GET** `/ai/conversations`

Get user's AI conversation history.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "conversations": [
    {
      "id": 1,
      "model": "gpt-4-turbo-preview",
      "prompt": "What are the current project risks?",
      "response": "Based on your current projects...",
      "tokens_used": 245,
      "cost": 0.007,
      "created_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

---

### Get AI Usage Statistics

**GET** `/ai/usage`

Get user's AI usage statistics and recent requests.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalRequests": 45,
    "totalTokens": 12500,
    "totalCost": 0.375,
    "avgTokensPerRequest": 278
  },
  "recentRequests": [
    {
      "model": "gpt-4-turbo-preview",
      "tokens_used": 245,
      "cost": 0.007,
      "created_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

---

### Smart Suggestions

**POST** `/ai/suggest`

Get AI-powered suggestions for project planning and management.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "context": {
    "projectType": "office building",
    "budget": 2000000,
    "timeline": "6 months"
  },
  "type": "project_name"
}
```

**Suggestion Types:**
- `project_name` - Generate project name suggestions
- `task_breakdown` - Break down project into tasks
- `budget_estimate` - Provide budget estimates by category
- `risk_analysis` - Identify potential risks and mitigation

**Response:**
```json
{
  "success": true,
  "suggestions": [
    "Modern Downtown Office Complex",
    "Riverside Corporate Center",
    "Metropolitan Business Hub",
    "Urban Professional Building",
    "Contemporary Office Tower"
  ]
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid suggestion type or missing context
- `401` - Unauthorized
- `500` - AI service error

---

## 📚 Best Practices

### Authentication

1. **Always include Authorization header** for protected endpoints
2. **Store tokens securely** - never expose in client-side code
3. **Handle token expiration** - implement refresh logic
4. **Use HTTPS only** in production

### Request Format

1. **Use appropriate HTTP methods** - GET for retrieval, POST for creation, etc.
2. **Include Content-Type** header for POST/PUT requests
3. **Validate data** on both client and server
4. **Use pagination** for large datasets

### Error Handling

1. **Check response success field** - don't rely only on HTTP status
2. **Handle common errors** - 401, 403, 404, 500
3. **Display user-friendly messages** - use the `userMessage` field when available
4. **Implement retry logic** for retryable errors

### Performance

1. **Use appropriate page sizes** - typically 10-50 items per page
2. **Cache responses** when appropriate
3. **Avoid unnecessary requests** - use conditional requests when possible
4. **Monitor API usage** - track rate limits

### Security

1. **Validate all inputs** - never trust client data
2. **Use parameterized queries** - prevent SQL injection
3. **Implement rate limiting** - prevent abuse
4. **Log security events** - monitor for suspicious activity

---

## 🔄 Rate Limiting

- **Authentication endpoints:** 5 requests per 15 minutes per IP
- **General API endpoints:** 100 requests per minute per user
- **File upload endpoints:** 10 uploads per hour per user
- **Admin endpoints:** 1000 requests per hour per admin user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 📞 Support

For API support or questions:
- **Documentation Issues:** Update this file
- **Technical Support:** Check server logs
- **Feature Requests:** Create GitHub issue

---

**API Version:** 1.0.0
**Generated:** 11 October 2025
**Status:** ✅ Production Ready
