# AI Agents API Documentation

Complete API reference for the CortexBuild AI Agent Marketplace and Execution System.

## Base URL

```
http://localhost:3001/api/agents
```

## Authentication

All endpoints require JWT authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Get Marketplace Agents

Browse all public AI agents available in the marketplace.

**Endpoint:** `GET /api/agents/marketplace`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | string | No | Filter by category: `automation`, `analytics`, `safety`, `financial`, `communication`, `integration` |
| minRating | number | No | Minimum rating (0-5) |
| search | string | No | Search in agent name and description |

**Example Request:**

```bash
curl -X GET "http://localhost:3001/api/agents/marketplace?category=automation&minRating=4" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "agents": [
    {
      "id": "agent-1234567890-abc123",
      "developerId": "dev-456",
      "name": "RFI Auto-Responder",
      "description": "Automatically analyzes RFIs and generates intelligent response drafts",
      "category": "automation",
      "version": "1.0.0",
      "config": {},
      "code": "...",
      "status": "published",
      "isPublic": true,
      "price": 29.99,
      "subscriptions": 145,
      "rating": 4.8,
      "createdAt": "2025-11-01T10:00:00Z",
      "updatedAt": "2025-11-05T14:30:00Z"
    }
  ],
  "count": 1
}
```

**Error Responses:**

- `401 Unauthorized` - Invalid or missing JWT token
- `500 Internal Server Error` - Server error

---

### 2. Get Agent Details

Retrieve detailed information about a specific AI agent.

**Endpoint:** `GET /api/agents/:id`

**Authentication:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Agent ID |

**Example Request:**

```bash
curl -X GET "http://localhost:3001/api/agents/agent-1234567890-abc123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "agent": {
    "id": "agent-1234567890-abc123",
    "developerId": "dev-456",
    "name": "RFI Auto-Responder",
    "description": "Automatically analyzes RFIs and generates intelligent response drafts",
    "category": "automation",
    "version": "1.0.0",
    "config": {
      "temperature": 0.7,
      "maxTokens": 2000
    },
    "code": "...",
    "status": "published",
    "isPublic": true,
    "price": 29.99,
    "subscriptions": 145,
    "rating": 4.8,
    "createdAt": "2025-11-01T10:00:00Z",
    "updatedAt": "2025-11-05T14:30:00Z"
  }
}
```

**Error Responses:**

- `401 Unauthorized` - Invalid or missing JWT token
- `404 Not Found` - Agent not found
- `500 Internal Server Error` - Server error

---

### 3. Create AI Agent

Create a new AI agent (Developer access required).

**Endpoint:** `POST /api/agents`

**Authentication:** Required (Developer or Super Admin role)

**Request Body:**

```json
{
  "name": "Budget Analyzer",
  "description": "AI-powered budget analysis and forecasting",
  "category": "financial",
  "config": {
    "temperature": 0.5,
    "maxTokens": 1500
  },
  "code": "// Agent implementation code",
  "isPublic": false,
  "price": 49.99
}
```

**Field Validation:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | Yes | 3-100 characters |
| description | string | Yes | 10-500 characters |
| category | string | Yes | One of: `automation`, `analytics`, `safety`, `financial`, `communication`, `integration` |
| config | object | No | Agent configuration |
| code | string | Yes | Agent implementation |
| isPublic | boolean | No | Default: false |
| price | number | No | Default: 0 |

**Example Request:**

```bash
curl -X POST "http://localhost:3001/api/agents" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Budget Analyzer",
    "description": "AI-powered budget analysis and forecasting",
    "category": "financial",
    "config": {},
    "code": "// Implementation",
    "isPublic": false,
    "price": 49.99
  }'
```

**Success Response (201 Created):**

```json
{
  "success": true,
  "agentId": "agent-1234567890-xyz789",
  "message": "Agent created successfully"
}
```

**Error Responses:**

- `400 Bad Request` - Validation failed
  ```json
  {
    "error": "Validation failed",
    "details": {
      "name": "Name is required",
      "category": "Category must be one of: automation, analytics, safety, financial, communication, integration"
    }
  }
  ```
- `401 Unauthorized` - Invalid or missing JWT token
- `403 Forbidden` - Developer access required
- `500 Internal Server Error` - Server error

---

### 4. Publish Agent to Marketplace

Publish a draft agent to the public marketplace (Developer only).

**Endpoint:** `POST /api/agents/:id/publish`

**Authentication:** Required (Developer or Super Admin role)

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Agent ID |

**Example Request:**

```bash
curl -X POST "http://localhost:3001/api/agents/agent-1234567890-xyz789/publish" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Agent published to marketplace"
}
```

**Error Responses:**

- `401 Unauthorized` - Invalid or missing JWT token
- `403 Forbidden` - Developer access required
- `404 Not Found` - Agent not found or already published
- `500 Internal Server Error` - Server error

---

### 5. Subscribe to Agent

Subscribe to an AI agent to gain execution access.

**Endpoint:** `POST /api/agents/:id/subscribe`

**Authentication:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Agent ID |

**Request Body (Optional):**

```json
{
  "config": {
    "customSetting": "value"
  }
}
```

**Example Request:**

```bash
curl -X POST "http://localhost:3001/api/agents/agent-1234567890-abc123/subscribe" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Success Response (201 Created):**

```json
{
  "success": true,
  "subscriptionId": "sub-1234567890-def456",
  "message": "Subscribed to agent successfully"
}
```

**Error Responses:**

- `401 Unauthorized` - Invalid or missing JWT token
- `403 Forbidden` - Agent is not public
- `404 Not Found` - Agent not found
- `500 Internal Server Error` - Server error

---

### 6. Get My Subscriptions

Retrieve all AI agents the user is subscribed to.

**Endpoint:** `GET /api/agents/subscriptions/my`

**Authentication:** Required

**Example Request:**

```bash
curl -X GET "http://localhost:3001/api/agents/subscriptions/my" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "agents": [
    {
      "id": "agent-1234567890-abc123",
      "name": "RFI Auto-Responder",
      "description": "Automatically analyzes RFIs and generates intelligent response drafts",
      "category": "automation",
      "version": "1.0.0",
      "subscription_status": "active",
      "subscribed_at": "2025-11-05T09:00:00Z"
    }
  ],
  "count": 1
}
```

**Error Responses:**

- `401 Unauthorized` - Invalid or missing JWT token
- `500 Internal Server Error` - Server error

---

### 7. Execute AI Agent

Execute a subscribed AI agent with custom input.

**Endpoint:** `POST /api/agents/:id/execute`

**Authentication:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Agent ID |

**Request Body:**

```json
{
  "input": {
    "action": "analyze",
    "data": {
      "projectId": "proj-123",
      "rfiId": "rfi-456"
    }
  }
}
```

**Example Request:**

```bash
curl -X POST "http://localhost:3001/api/agents/agent-1234567890-abc123/execute" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "action": "analyze",
      "data": {
        "projectId": "proj-123"
      }
    }
  }'
```

**Success Response (202 Accepted):**

```json
{
  "success": true,
  "executionId": "exec-1234567890-ghi789",
  "message": "Agent execution started",
  "statusUrl": "/api/agents/executions/exec-1234567890-ghi789"
}
```

**Error Responses:**

- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Invalid or missing JWT token
- `403 Forbidden` - You must subscribe to this agent to execute it
- `500 Internal Server Error` - Server error

---

### 8. Get Execution Status

Check the status and result of an agent execution.

**Endpoint:** `GET /api/agents/executions/:executionId`

**Authentication:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| executionId | string | Execution ID |

**Example Request:**

```bash
curl -X GET "http://localhost:3001/api/agents/executions/exec-1234567890-ghi789" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (200 OK) - Completed:**

```json
{
  "success": true,
  "execution": {
    "id": "exec-1234567890-ghi789",
    "agentId": "agent-1234567890-abc123",
    "userId": "user-123",
    "companyId": "comp-1",
    "input": {
      "action": "analyze",
      "data": {
        "projectId": "proj-123"
      }
    },
    "output": {
      "success": true,
      "analysis": "...",
      "recommendations": []
    },
    "status": "completed",
    "errorMessage": null,
    "startedAt": "2025-11-09T10:00:00Z",
    "completedAt": "2025-11-09T10:00:05Z",
    "duration": 5000
  }
}
```

**Success Response (200 OK) - Running:**

```json
{
  "success": true,
  "execution": {
    "id": "exec-1234567890-ghi789",
    "agentId": "agent-1234567890-abc123",
    "status": "running",
    "startedAt": "2025-11-09T10:00:00Z",
    "completedAt": null,
    "duration": null
  }
}
```

**Success Response (200 OK) - Failed:**

```json
{
  "success": true,
  "execution": {
    "id": "exec-1234567890-ghi789",
    "agentId": "agent-1234567890-abc123",
    "status": "failed",
    "errorMessage": "Invalid input format",
    "startedAt": "2025-11-09T10:00:00Z",
    "completedAt": "2025-11-09T10:00:02Z",
    "duration": 2000
  }
}
```

**Error Responses:**

- `401 Unauthorized` - Invalid or missing JWT token
- `403 Forbidden` - Access denied (not your execution)
- `404 Not Found` - Execution not found
- `500 Internal Server Error` - Server error

---

### 9. Get Agent Execution History

Retrieve execution history for a specific agent.

**Endpoint:** `GET /api/agents/:id/executions`

**Authentication:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Agent ID |

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| limit | number | No | 50 | Maximum number of results |

**Example Request:**

```bash
curl -X GET "http://localhost:3001/api/agents/agent-1234567890-abc123/executions?limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "executions": [
    {
      "id": "exec-1234567890-ghi789",
      "status": "completed",
      "startedAt": "2025-11-09T10:00:00Z",
      "completedAt": "2025-11-09T10:00:05Z",
      "duration": 5000
    }
  ],
  "count": 1
}
```

**Error Responses:**

- `401 Unauthorized` - Invalid or missing JWT token
- `403 Forbidden` - Access denied (not subscribed to agent)
- `500 Internal Server Error` - Server error

---

## Agent Categories

| Category | Description | Use Cases |
|----------|-------------|-----------|
| automation | Workflow automation | RFI responses, report generation, task scheduling |
| analytics | Data analysis | Budget forecasting, performance metrics, trend analysis |
| safety | Safety monitoring | Incident prediction, compliance checks, risk assessment |
| financial | Financial operations | Invoice processing, expense tracking, budget analysis |
| communication | Communication tools | Email automation, notifications, team updates |
| integration | Third-party integrations | QuickBooks sync, Slack notifications, API connectors |

---

## Execution Status Flow

```
pending → running → completed
                  → failed
```

**Status Descriptions:**

- `pending` - Execution queued, waiting to start
- `running` - Agent currently executing
- `completed` - Execution finished successfully
- `failed` - Execution encountered an error

---

## Rate Limits

- **Marketplace Browse:** 100 requests/minute
- **Agent Execution:** 50 executions/hour per agent
- **Subscription Management:** 20 requests/minute

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Error message",
  "details": {
    "field": "Specific error details"
  }
}
```

Common HTTP status codes:

- `200 OK` - Request successful
- `201 Created` - Resource created
- `202 Accepted` - Async operation started
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Code Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
const token = 'your_jwt_token';

// Browse marketplace
const agents = await axios.get(`${API_URL}/agents/marketplace`, {
  headers: { Authorization: `Bearer ${token}` },
  params: { category: 'automation', minRating: 4 }
});

// Subscribe to agent
await axios.post(`${API_URL}/agents/agent-123/subscribe`, {}, {
  headers: { Authorization: `Bearer ${token}` }
});

// Execute agent
const execution = await axios.post(`${API_URL}/agents/agent-123/execute`, {
  input: { action: 'analyze', data: { projectId: 'proj-456' } }
}, {
  headers: { Authorization: `Bearer ${token}` }
});

// Check execution status
const status = await axios.get(
  `${API_URL}/agents/executions/${execution.data.executionId}`,
  { headers: { Authorization: `Bearer ${token}` } }
);
```

### Python

```python
import requests

API_URL = 'http://localhost:3001/api'
token = 'your_jwt_token'
headers = {'Authorization': f'Bearer {token}'}

# Browse marketplace
response = requests.get(
    f'{API_URL}/agents/marketplace',
    headers=headers,
    params={'category': 'automation', 'minRating': 4}
)
agents = response.json()['agents']

# Execute agent
execution = requests.post(
    f'{API_URL}/agents/agent-123/execute',
    headers=headers,
    json={'input': {'action': 'analyze', 'data': {'projectId': 'proj-456'}}}
)
execution_id = execution.json()['executionId']

# Check status
status = requests.get(
    f'{API_URL}/agents/executions/{execution_id}',
    headers=headers
)
```

---

## Support

For API support or to report issues:
- Email: dev@cortexbuild.com
- Documentation: https://docs.cortexbuild.com/api/agents
- GitHub: https://github.com/cortexbuild/platform
