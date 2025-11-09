# Webhook Integration Guide

Complete guide for integrating webhooks into your applications to receive real-time events from CortexBuild.

## Table of Contents

1. [Introduction](#introduction)
2. [Webhook Basics](#webhook-basics)
3. [Registering Webhooks](#registering-webhooks)
4. [Event Types](#event-types)
5. [Payload Structure](#payload-structure)
6. [Security & Verification](#security--verification)
7. [Handling Events](#handling-events)
8. [Retry Logic](#retry-logic)
9. [Testing Webhooks](#testing-webhooks)
10. [Code Examples](#code-examples)

---

## Introduction

Webhooks allow your application to receive real-time notifications when events occur in CortexBuild. Instead of polling the API repeatedly, webhooks push data to your server immediately when something happens.

### Use Cases

- Real-time project updates
- Task completion notifications
- Invoice payment alerts
- Safety incident reports
- Document approval workflows
- Team member activity tracking

### Benefits

- **Real-time**: Instant notifications when events occur
- **Efficient**: No need for constant API polling
- **Scalable**: Handle high-volume events with ease
- **Reliable**: Built-in retry logic for failed deliveries

---

## Webhook Basics

### How Webhooks Work

```text
1. Your app registers a webhook URL with CortexBuild
2. An event occurs (e.g., task created)
3. CortexBuild sends HTTP POST to your webhook URL
4. Your server receives and processes the event
5. Your server responds with 200 OK
```

### Requirements

- **HTTPS Endpoint**: Your webhook URL must use HTTPS (HTTP allowed for localhost testing)
- **Fast Response**: Respond within 10 seconds to avoid timeout
- **2xx Status Code**: Return 200-299 to indicate successful receipt

---

## Registering Webhooks

### API Endpoint

**POST** `/api/webhooks`

### Request

```typescript
import axios from 'axios';

const registerWebhook = async () => {
  const response = await axios.post(
    'http://localhost:3001/api/webhooks',
    {
      url: 'https://your-domain.com/webhooks/cortexbuild',
      events: ['project.created', 'task.completed', 'invoice.paid'],
      description: 'Main webhook for project updates'
    },
    {
      headers: {
        Authorization: `Bearer ${your_jwt_token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  console.log('Webhook ID:', response.data.webhookId);
  console.log('Webhook Secret:', response.data.secret);
  
  // IMPORTANT: Store the secret securely!
  // You'll need it to verify webhook signatures
};
```

### Response

```json
{
  "success": true,
  "webhookId": "webhook-1234567890-abc123",
  "secret": "whsec_K2Fj8sL3mN9pQ4rT7vX1yZ5bC6dE8fG",
  "message": "Webhook registered successfully"
}
```

### Managing Webhooks

**List Webhooks**

```bash
GET /api/webhooks
```

**Update Webhook**

```bash
PUT /api/webhooks/:webhookId
```

**Delete Webhook**

```bash
DELETE /api/webhooks/:webhookId
```

**Test Webhook**

```bash
POST /api/webhooks/:webhookId/test
```

---

## Event Types

### Project Events

| Event | Description | Payload |
|-------|-------------|---------|
| `project.created` | New project created | Project object |
| `project.updated` | Project details updated | Updated project |
| `project.completed` | Project marked complete | Project object |
| `project.status_changed` | Project status changed | Project with old/new status |
| `project.deleted` | Project deleted | Project ID |

### Task Events

| Event | Description | Payload |
|-------|-------------|---------|
| `task.created` | New task created | Task object |
| `task.assigned` | Task assigned to user | Task with assignee |
| `task.updated` | Task details updated | Updated task |
| `task.completed` | Task marked complete | Task object |
| `task.overdue` | Task became overdue | Task object |
| `task.deleted` | Task deleted | Task ID |

### Financial Events

| Event | Description | Payload |
|-------|-------------|---------|
| `invoice.created` | New invoice created | Invoice object |
| `invoice.sent` | Invoice sent to client | Invoice object |
| `invoice.paid` | Invoice marked paid | Invoice with payment |
| `invoice.overdue` | Invoice became overdue | Invoice object |
| `expense.created` | New expense recorded | Expense object |
| `expense.approved` | Expense approved | Expense object |

### Safety Events

| Event | Description | Payload |
|-------|-------------|---------|
| `incident.reported` | Safety incident reported | Incident object |
| `incident.resolved` | Incident resolved | Incident object |
| `inspection.completed` | Safety inspection done | Inspection object |
| `safety.violation` | Safety violation detected | Violation object |

### Document Events

| Event | Description | Payload |
|-------|-------------|---------|
| `document.uploaded` | Document uploaded | Document object |
| `document.approved` | Document approved | Document object |
| `document.rejected` | Document rejected | Document with reason |
| `drawing.revised` | Drawing revision uploaded | Drawing object |

### User Events

| Event | Description | Payload |
|-------|-------------|---------|
| `user.joined` | New user added to company | User object |
| `user.updated` | User details updated | Updated user |
| `user.deactivated` | User deactivated | User object |

### AI Agent Events

| Event | Description | Payload |
|-------|-------------|---------|
| `agent.executed` | AI agent execution completed | Execution result |
| `agent.subscribed` | User subscribed to agent | Subscription object |
| `agent.published` | Agent published to marketplace | Agent object |

---

## Payload Structure

### Standard Webhook Payload

```json
{
  "event": "task.completed",
  "timestamp": 1699545600000,
  "data": {
    "id": "task-123",
    "title": "Install electrical panels",
    "status": "completed",
    "projectId": "proj-456",
    "assignedTo": "user-789",
    "completedAt": "2025-11-09T14:30:00Z"
  },
  "companyId": "comp-1",
  "userId": "user-789"
}
```

### Payload Fields

| Field | Type | Description |
|-------|------|-------------|
| `event` | string | Event type (e.g., `task.completed`) |
| `timestamp` | number | Unix timestamp (milliseconds) |
| `data` | object | Event-specific data |
| `companyId` | string | Company ID that triggered event |
| `userId` | string | User ID that triggered event |

---

## Security & Verification

### HMAC Signature Verification

Every webhook request includes an HMAC-SHA256 signature in the `X-CortexBuild-Signature` header. **Always verify this signature** to ensure the request came from CortexBuild.

### Verification Process

```javascript
// Node.js/Express example
const crypto = require('crypto');

function verifyWebhookSignature(req, webhookSecret) {
  const signature = req.headers['x-cortexbuild-signature'];
  const timestamp = req.headers['x-cortexbuild-timestamp'];
  
  // Verify timestamp to prevent replay attacks (within 5 minutes)
  const currentTime = Date.now();
  if (Math.abs(currentTime - parseInt(timestamp)) > 5 * 60 * 1000) {
    throw new Error('Webhook timestamp too old');
  }
  
  // Compute expected signature
  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');
  
  // Timing-safe comparison
  const signatureBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');
  
  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    throw new Error('Invalid webhook signature');
  }
  
  return true;
}

// Express route
app.post('/webhooks/cortexbuild', (req, res) => {
  try {
    // Verify signature
    verifyWebhookSignature(req, process.env.CORTEXBUILD_WEBHOOK_SECRET);
    
    // Process event
    const { event, data } = req.body;
    handleWebhookEvent(event, data);
    
    // Respond quickly
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook verification failed:', error);
    res.status(401).json({ error: 'Invalid signature' });
  }
});
```

### Request Headers

| Header | Description | Example |
|--------|-------------|---------|
| `X-CortexBuild-Event` | Event type | `task.completed` |
| `X-CortexBuild-Signature` | HMAC-SHA256 signature | `a3f8b2c...` |
| `X-CortexBuild-Timestamp` | Unix timestamp (ms) | `1699545600000` |
| `X-CortexBuild-Webhook-Id` | Webhook ID | `webhook-123` |
| `Content-Type` | Content type | `application/json` |

---

## Handling Events

### Event Handler Pattern

```javascript
const eventHandlers = {
  'task.completed': async (data) => {
    console.log(`Task ${data.title} completed!`);
    
    // Update internal database
    await updateTaskStatus(data.id, 'completed');
    
    // Send notification
    await sendEmail(data.assignedTo, 'Task Completed', `${data.title} is done`);
  },
  
  'invoice.paid': async (data) => {
    console.log(`Invoice ${data.id} paid: $${data.amount}`);
    
    // Update accounting system
    await updateAccounting(data);
    
    // Trigger QuickBooks sync
    await syncQuickBooks(data);
  },
  
  'incident.reported': async (data) => {
    console.log(`URGENT: Safety incident at ${data.location}`);
    
    // Alert safety officers
    await alertSafetyTeam(data);
    
    // Create incident report
    await generateIncidentReport(data);
  }
};

async function handleWebhookEvent(event, data) {
  const handler = eventHandlers[event];
  
  if (handler) {
    await handler(data);
  } else {
    console.log(`No handler for event: ${event}`);
  }
}
```

### Async Processing

Respond to webhooks quickly (< 1 second), then process asynchronously:

```javascript
app.post('/webhooks/cortexbuild', async (req, res) => {
  try {
    // Verify signature
    verifyWebhookSignature(req, webhookSecret);
    
    // Respond immediately
    res.status(200).json({ received: true });
    
    // Process asynchronously (don't await)
    const { event, data } = req.body;
    processWebhookAsync(event, data).catch(error => {
      console.error('Async processing failed:', error);
    });
    
  } catch (error) {
    res.status(401).json({ error: 'Invalid signature' });
  }
});

async function processWebhookAsync(event, data) {
  // Queue for background processing
  await jobQueue.add('webhook', { event, data });
}
```

---

## Retry Logic

### CortexBuild Retry Behavior

If your webhook endpoint fails (non-2xx response or timeout), CortexBuild will:

1. **Retry Schedule**: 5 attempts with exponential backoff
   - Attempt 1: Immediate
   - Attempt 2: 1 minute later
   - Attempt 3: 5 minutes later
   - Attempt 4: 15 minutes later
   - Attempt 5: 1 hour later

2. **Auto-Disable**: After 10 consecutive failures, webhook is disabled

3. **Delivery Logs**: All delivery attempts logged in dashboard

### Handling Retries

```javascript
// Store processed webhook IDs to handle duplicates
const processedWebhooks = new Set();

app.post('/webhooks/cortexbuild', async (req, res) => {
  try {
    verifyWebhookSignature(req, webhookSecret);
    
    const webhookId = req.headers['x-cortexbuild-delivery-id'];
    
    // Check if already processed
    if (processedWebhooks.has(webhookId)) {
      console.log('Duplicate webhook, already processed');
      return res.status(200).json({ received: true });
    }
    
    // Process event
    await handleWebhookEvent(req.body.event, req.body.data);
    
    // Mark as processed
    processedWebhooks.add(webhookId);
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});
```

---

## Testing Webhooks

### Local Testing with ngrok

```bash
# Install ngrok
npm install -g ngrok

# Start your local server
node server.js  # Running on localhost:3000

# Create tunnel
ngrok http 3000

# Output:
# Forwarding: https://abc123.ngrok.io -> http://localhost:3000

# Register webhook with ngrok URL
curl -X POST http://localhost:3001/api/webhooks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://abc123.ngrok.io/webhooks/cortexbuild",
    "events": ["task.completed"]
  }'
```

### Manual Testing

```bash
# Trigger test event
curl -X POST http://localhost:3001/api/webhooks/webhook-123/test \
  -H "Authorization: Bearer $TOKEN"
```

### Webhook Inspector

Use online tools to inspect webhook payloads:

- RequestBin: <https://requestbin.com>
- Webhook.site: <https://webhook.site>
- Beeceptor: <https://beeceptor.com>

**Example:**

```bash
# 1. Get temporary webhook URL from webhook.site
# 2. Register it with CortexBuild
curl -X POST http://localhost:3001/api/webhooks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://webhook.site/unique-url",
    "events": ["project.created"]
  }'

# 3. Create project to trigger webhook
# 4. View payload in webhook.site dashboard
```

---

## Code Examples

### Node.js / Express

```javascript
const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const WEBHOOK_SECRET = process.env.CORTEXBUILD_WEBHOOK_SECRET;

// Webhook endpoint
app.post('/webhooks/cortexbuild', (req, res) => {
  try {
    // 1. Verify signature
    const signature = req.headers['x-cortexbuild-signature'];
    const payload = JSON.stringify(req.body);
    
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // 2. Process event
    const { event, data } = req.body;
    
    console.log(`Received ${event}:`, data);
    
    switch (event) {
      case 'task.completed':
        handleTaskCompleted(data);
        break;
      case 'invoice.paid':
        handleInvoicePaid(data);
        break;
      default:
        console.log('Unhandled event:', event);
    }
    
    // 3. Respond quickly
    res.status(200).json({ received: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});

function handleTaskCompleted(task) {
  console.log(`Task "${task.title}" completed by ${task.assignedTo}`);
  // Your business logic here
}

function handleInvoicePaid(invoice) {
  console.log(`Invoice ${invoice.id} paid: $${invoice.amount}`);
  // Your business logic here
}

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

### Python / Flask

```python
from flask import Flask, request, jsonify
import hmac
import hashlib
import json
import os

app = Flask(__name__)

WEBHOOK_SECRET = os.environ['CORTEXBUILD_WEBHOOK_SECRET']

@app.route('/webhooks/cortexbuild', methods=['POST'])
def handle_webhook():
    try:
        # 1. Verify signature
        signature = request.headers.get('X-CortexBuild-Signature')
        payload = request.get_data()
        
        expected_signature = hmac.new(
            WEBHOOK_SECRET.encode(),
            payload,
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(signature, expected_signature):
            return jsonify({'error': 'Invalid signature'}), 401
        
        # 2. Process event
        data = request.get_json()
        event = data['event']
        event_data = data['data']
        
        print(f"Received {event}:", event_data)
        
        if event == 'task.completed':
            handle_task_completed(event_data)
        elif event == 'invoice.paid':
            handle_invoice_paid(event_data)
        
        # 3. Respond quickly
        return jsonify({'received': True}), 200
        
    except Exception as e:
        print(f"Webhook error: {e}")
        return jsonify({'error': 'Processing failed'}), 500

def handle_task_completed(task):
    print(f"Task \"{task['title']}\" completed by {task['assignedTo']}")
    # Your business logic here

def handle_invoice_paid(invoice):
    print(f"Invoice {invoice['id']} paid: ${invoice['amount']}")
    # Your business logic here

if __name__ == '__main__':
    app.run(port=3000)
```

### PHP

```php
<?php
// webhook.php

$webhookSecret = getenv('CORTEXBUILD_WEBHOOK_SECRET');

// 1. Get request data
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_CORTEXBUILD_SIGNATURE'] ?? '';

// 2. Verify signature
$expectedSignature = hash_hmac('sha256', $payload, $webhookSecret);

if (!hash_equals($signature, $expectedSignature)) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid signature']);
    exit;
}

// 3. Process event
$data = json_decode($payload, true);
$event = $data['event'];
$eventData = $data['data'];

error_log("Received $event: " . json_encode($eventData));

switch ($event) {
    case 'task.completed':
        handleTaskCompleted($eventData);
        break;
    case 'invoice.paid':
        handleInvoicePaid($eventData);
        break;
}

// 4. Respond
http_response_code(200);
echo json_encode(['received' => true]);

function handleTaskCompleted($task) {
    error_log("Task \"{$task['title']}\" completed");
    // Your business logic here
}

function handleInvoicePaid($invoice) {
    error_log("Invoice {$invoice['id']} paid: \${$invoice['amount']}");
    // Your business logic here
}
?>
```

### Next.js API Route

```typescript
// pages/api/webhooks/cortexbuild.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.CORTEXBUILD_WEBHOOK_SECRET!;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Verify signature
    const signature = req.headers['x-cortexbuild-signature'] as string;
    const payload = JSON.stringify(req.body);
    
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // 2. Process event
    const { event, data } = req.body;
    
    console.log(`Received ${event}:`, data);
    
    await handleWebhookEvent(event, data);
    
    // 3. Respond
    res.status(200).json({ received: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
}

async function handleWebhookEvent(event: string, data: any) {
  switch (event) {
    case 'task.completed':
      await handleTaskCompleted(data);
      break;
    case 'invoice.paid':
      await handleInvoicePaid(data);
      break;
    default:
      console.log('Unhandled event:', event);
  }
}

async function handleTaskCompleted(task: any) {
  console.log(`Task "${task.title}" completed`);
  // Your business logic here
}

async function handleInvoicePaid(invoice: any) {
  console.log(`Invoice ${invoice.id} paid: $${invoice.amount}`);
  // Your business logic here
}
```

---

## Advanced Topics

### Filtering Events by Project

```javascript
app.post('/webhooks/cortexbuild', async (req, res) => {
  try {
    verifyWebhookSignature(req, webhookSecret);
    
    const { event, data } = req.body;
    
    // Only process events for specific projects
    const monitoredProjects = ['proj-123', 'proj-456'];
    
    if (data.projectId && !monitoredProjects.includes(data.projectId)) {
      console.log('Ignoring event for unmonitored project');
      return res.status(200).json({ received: true });
    }
    
    await handleWebhookEvent(event, data);
    res.status(200).json({ received: true });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Database Logging

```javascript
async function handleWebhookEvent(event, data) {
  // Log to database
  await db.webhookLogs.insert({
    event,
    data: JSON.stringify(data),
    receivedAt: new Date(),
    processed: false
  });
  
  // Process event
  await processEvent(event, data);
  
  // Mark as processed
  await db.webhookLogs.update({
    where: { event, receivedAt },
    data: { processed: true }
  });
}
```

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many webhook requests'
});

app.post('/webhooks/cortexbuild', webhookLimiter, async (req, res) => {
  // Handle webhook
});
```

---

## Troubleshooting

### Common Issues

**Issue: Webhook not receiving events**

- Check webhook is registered: `GET /api/webhooks`
- Verify URL is correct and publicly accessible
- Check webhook is active (not disabled after failures)
- Test with webhook.site to verify connectivity

**Issue: Signature verification failing**

- Verify you're using the correct webhook secret
- Check you're hashing the raw request body (not parsed JSON)
- Ensure timing-safe comparison for security

**Issue: Timeouts**

- Respond to webhooks within 10 seconds
- Process heavy tasks asynchronously after responding
- Use job queues for background processing

**Issue: Duplicate events**

- Store processed webhook IDs to detect duplicates
- Use `X-CortexBuild-Delivery-Id` header for deduplication

---

## Best Practices

1. **Always verify signatures** - Never process unverified webhooks
2. **Respond quickly** - Acknowledge receipt within 1 second
3. **Process asynchronously** - Queue heavy work for background jobs
4. **Handle duplicates** - Use delivery IDs to prevent double-processing
5. **Log everything** - Record all webhook receipts for debugging
6. **Monitor failures** - Alert on webhook delivery failures
7. **Use HTTPS** - Secure webhook endpoints in production
8. **Validate payloads** - Check data structure before processing

---

## Support

- **API Documentation**: `/docs/API_AGENTS_DOCUMENTATION.md`
- **Developer Guide**: `/docs/AI_AGENT_DEVELOPER_GUIDE.md`
- **Support Email**: dev@cortexbuild.com
- **Webhook Dashboard**: Access in Developer Portal → Webhooks

---

## Changelog

### Version 1.0.0 (2025-11-09)

- Initial release
- HMAC-SHA256 signature verification
- Automatic retry with exponential backoff
- 20+ event types supported
- Delivery logging and monitoring
