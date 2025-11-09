# Integration Testing Guide

## Test Environment Setup

### Prerequisites

- Backend server running on port 3001
- Frontend server running on port 3000
- SQLite database initialized with test data

### Start Test Environment

```bash
./start-servers.sh
```

## Manual Integration Tests

### 1. Authentication Flow ✅

**Test Case**: User Login

- Navigate to <http://localhost:3000>
- Enter credentials:
  - Email: `adrian.stanca1@gmail.com`
  - Password: `parola123`
- Click "Sign In"
- **Expected**: User logged in, redirected to dashboard
- **Verify**: Token stored in localStorage

**Test Case**: Protected Routes

- Without logging in, try accessing dashboard
- **Expected**: Redirected to login screen
- **Verify**: Authentication middleware working

### 2. AI Agents System ✅

**Test Case**: View Agent Marketplace

- Login as developer or super_admin
- Navigate to AI Agents section
- **Expected**: List of available agents displayed
- **Verify**: Categories filter works

**Test Case**: Agent Execution

- Select an agent from marketplace
- Click "Execute" or "Try Now"
- Provide test input
- **Expected**: Agent executes and returns results
- **Verify**: Execution history logged

### 3. Workflow Automation ✅

**Test Case**: Create Workflow

- Navigate to Workflows section
- Click "Create New Workflow"
- Add trigger: Schedule (cron: `0 9 * * *`)
- Add action: Send Notification
- Save workflow
- **Expected**: Workflow created successfully
- **Verify**: Workflow appears in list

**Test Case**: Test Workflow Execution

- Select created workflow
- Click "Run Now"
- **Expected**: Workflow executes
- **Verify**: Execution logged with status

### 4. Project Management

**Test Case**: Create Project

- Navigate to Projects
- Click "New Project"
- Fill in:
  - Name: "Test Project"
  - Location: "Test Site"
  - Budget: 100000
- **Expected**: Project created
- **Verify**: Appears in project list

**Test Case**: Create Task

- Open project
- Click "Add Task"
- Fill in task details
- Assign to user
- **Expected**: Task created
- **Verify**: Task appears in project tasks

### 5. Developer Dashboard

**Test Case**: View Developer Metrics

- Login as developer role
- Navigate to Developer Dashboard
- **Expected**: See metrics:
  - API Usage
  - Sandbox Runs
  - Active Modules
  - Agent Executions
- **Verify**: Data loads from `/api/developer/dashboard/summary`

**Test Case**: Module Builder

- Navigate to Builder section
- Create new module
- Add code in Monaco editor
- Save module
- **Expected**: Module saved
- **Verify**: Module appears in library

### 6. Webhook System

**Test Case**: Register Webhook

- Navigate to SDK → Webhooks
- Click "Add Webhook"
- Enter URL: `https://webhook.site/...`
- Select events: `project.created`
- **Expected**: Webhook registered
- **Verify**: Webhook appears in list

**Test Case**: Webhook Delivery

- Create a new project
- **Expected**: Webhook fired
- **Verify**: Check webhook.site for delivery

## Automated Test Suite

### Run All Tests

```bash
npm test
```

### Run with Coverage

```bash
npm run test:coverage
```

### Run Specific Test File

```bash
npm test tests/api.test.ts
```

### Watch Mode (for development)

```bash
npm run test:watch
```

### Test UI (interactive)

```bash
npm run test:ui
```

## API Integration Tests

### Authentication Endpoints

- ✅ POST `/api/auth/login` - Login with credentials
- ✅ POST `/api/auth/register` - Create new account
- ✅ POST `/api/auth/logout` - Logout user
- ✅ GET `/api/auth/me` - Get current user

### Workflow Endpoints

- ✅ GET `/api/workflows` - List workflows
- ✅ POST `/api/workflows` - Create workflow
- ✅ PUT `/api/workflows/:id` - Update workflow
- ✅ POST `/api/workflows/:id/toggle` - Activate/deactivate
- ✅ POST `/api/workflows/:id/run` - Execute workflow
- ✅ GET `/api/workflows/builder/blocks` - Get builder blocks
- ✅ GET `/api/workflows/templates` - Get templates

### AI Agents Endpoints

- ✅ GET `/api/agents` - List available agents
- ✅ GET `/api/agents/:id` - Get agent details
- ✅ POST `/api/agents/:id/execute` - Execute agent
- ✅ GET `/api/agents/categories` - Get categories
- ✅ POST `/api/agents/:id/subscribe` - Subscribe to agent

### Project Endpoints

- ✅ GET `/api/projects` - List projects
- ✅ POST `/api/projects` - Create project
- ✅ GET `/api/projects/:id` - Get project
- ✅ PUT `/api/projects/:id` - Update project
- ✅ DELETE `/api/projects/:id` - Delete project

### Developer Endpoints

- ✅ GET `/api/developer/dashboard/summary` - Dashboard data
- ✅ GET `/api/developer/modules` - List modules
- ✅ POST `/api/developer/modules` - Create module
- ✅ POST `/api/developer/sandbox/run` - Run code in sandbox

## Performance Tests

### Load Testing

```bash
# Test concurrent logins
ab -n 100 -c 10 -p login.json -T application/json http://localhost:3001/api/auth/login

# Test workflow creation
ab -n 50 -c 5 -p workflow.json -T application/json -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/workflows
```

### Response Time Benchmarks

- Authentication: < 200ms
- List endpoints: < 500ms
- Create operations: < 1000ms
- Workflow execution: < 3000ms

## Security Tests

### Authentication

- ✅ Reject requests without token
- ✅ Reject requests with invalid token
- ✅ Reject requests with expired token
- ✅ Password hashing with bcrypt
- ✅ JWT token validation

### Authorization

- ✅ Role-based access control
- ✅ Company data isolation
- ✅ Super admin privileges
- ✅ Developer portal access

### Input Validation

- ✅ Email format validation
- ✅ Password strength requirements
- ✅ SQL injection prevention
- ✅ XSS prevention

## Browser Compatibility

### Tested Browsers

- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

### Mobile Testing

- ✅ iOS Safari
- ✅ Android Chrome

## Known Issues

### Current Limitations

1. `api.ts` file contains legacy mock data - not used in production
2. Large bundle size (1.35MB) - needs code splitting
3. Some routes need pagination for large datasets

### Future Improvements

1. Add E2E tests with Playwright/Cypress
2. Implement request rate limiting
3. Add Redis for session management
4. Optimize bundle size with dynamic imports
5. Add WebSocket connection tests

## Test Results

Last test run: 2025-11-09

- Total tests: 45
- Passed: 45
- Failed: 0
- Coverage: 65%

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: CI Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm test
      - run: npm run test:coverage
```

## Reporting Issues

When reporting test failures, include:

1. Test name and file
2. Error message and stack trace
3. Browser/environment details
4. Steps to reproduce
5. Expected vs actual behavior
