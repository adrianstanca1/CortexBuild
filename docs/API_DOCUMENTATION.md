# CortexBuild API Documentation

## Overview

CortexBuild is a comprehensive construction industry SaaS platform with a RESTful API built on Supabase PostgreSQL. This documentation covers all available endpoints, authentication methods, request/response formats, and error handling.

**Base URL:** 
- Production: `https://constructai-5-kmg76x929-adrian-b7e84541.vercel.app/api`
- Development: `http://localhost:3001/api`

**API Version:** v1

---

## Table of Contents

1. [Authentication](#authentication)
2. [Core Endpoints](#core-endpoints)
3. [Request/Response Format](#requestresponse-format)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Webhooks](#webhooks)

---

## Authentication

### Supported Methods

1. **Bearer Token (JWT)**
   - Used for authenticated API requests
   - Token stored in `Authorization` header
   - Format: `Authorization: Bearer <token>`

2. **API Key**
   - For SDK and third-party integrations
   - Header: `X-API-Key: <api-key>`

3. **OAuth 2.0**
   - Google OAuth
   - GitHub OAuth
   - Redirect URI: `{origin}/#dashboard`

### Authentication Flow

```typescript
// Login with email/password
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "company_admin",
    "token": "jwt_token_here"
  }
}
```

### Token Refresh

```typescript
POST /api/auth/refresh
Headers: {
  "Authorization": "Bearer <expired_token>"
}

// Response
{
  "success": true,
  "token": "new_jwt_token"
}
```

---

## Core Endpoints

### User Management

#### Get Current User
```
GET /api/users/me
Authorization: Bearer <token>

Response:
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "role": "company_admin",
  "company_id": "uuid",
  "avatar": "url",
  "created_at": "2024-01-01T00:00:00Z",
  "last_login": "2024-01-15T10:30:00Z",
  "status": "active"
}
```

#### List Users (Admin Only)
```
GET /api/admin/users?page=1&limit=20&role=company_admin
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "User Name",
      "role": "company_admin",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

#### Create User (Admin Only)
```
POST /api/admin/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "name": "New User",
  "password": "secure_password",
  "role": "company_admin",
  "company_id": "uuid"
}

Response:
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "newuser@example.com",
    "name": "New User",
    "role": "company_admin"
  }
}
```

#### Update User
```
PUT /api/admin/users/{userId}
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "role": "project_manager",
  "status": "active"
}

Response:
{
  "success": true,
  "user": { ... }
}
```

#### Delete User (Admin Only)
```
DELETE /api/admin/users/{userId}
Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Projects

#### List Projects
```
GET /api/projects?page=1&limit=20
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Project Name",
      "description": "Project description",
      "status": "active",
      "company_id": "uuid",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Create Project
```
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Project",
  "description": "Project description",
  "company_id": "uuid"
}

Response:
{
  "success": true,
  "project": { ... }
}
```

#### Get Project Details
```
GET /api/projects/{projectId}
Authorization: Bearer <token>

Response:
{
  "success": true,
  "project": { ... }
}
```

#### Update Project
```
PUT /api/projects/{projectId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description",
  "status": "active"
}

Response:
{
  "success": true,
  "project": { ... }
}
```

#### Delete Project
```
DELETE /api/projects/{projectId}
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

## Request/Response Format

### Standard Response Format

All API responses follow this format:

```typescript
{
  "success": boolean,
  "data": any,
  "message": string,
  "timestamp": string,
  "requestId": string
}
```

### Request Headers

```
Content-Type: application/json
Authorization: Bearer <token>
X-Request-ID: <unique-id>
User-Agent: <client-info>
```

### Response Headers

```
Content-Type: application/json
X-Request-ID: <unique-id>
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1234567890
```

---

## Error Handling

### Error Response Format

```typescript
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "uuid"
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful request |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

### Common Error Codes

- `INVALID_CREDENTIALS` - Login failed
- `TOKEN_EXPIRED` - JWT token expired
- `INSUFFICIENT_PERMISSIONS` - User lacks required role
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `VALIDATION_ERROR` - Invalid request parameters
- `RATE_LIMIT_EXCEEDED` - Too many requests

---

## Rate Limiting

### Limits by Plan

| Plan | Requests/Hour | Requests/Day |
|------|---------------|--------------|
| Free | 100 | 1,000 |
| Starter | 1,000 | 10,000 |
| Pro | 10,000 | 100,000 |
| Enterprise | Unlimited | Unlimited |

### Rate Limit Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1234567890
```

---

## Webhooks

### Supported Events

- `user.created`
- `user.updated`
- `user.deleted`
- `project.created`
- `project.updated`
- `project.deleted`
- `task.created`
- `task.updated`
- `task.completed`

### Webhook Payload

```typescript
{
  "id": "webhook_id",
  "event": "project.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "id": "project_id",
    "name": "Project Name",
    ...
  }
}
```

---

## Next Steps

- See [Component Documentation](./COMPONENT_DOCUMENTATION.md) for UI components
- See [Architecture Documentation](./ARCHITECTURE.md) for system design
- See [Deployment Guide](./DEPLOYMENT.md) for production setup

