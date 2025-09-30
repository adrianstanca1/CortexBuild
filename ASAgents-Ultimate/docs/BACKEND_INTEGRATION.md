# Backend Integration Guide

## Overview

This document describes the enhanced backend integration for the ASAgents platform, including database structure, API endpoints, and frontend-backend communication.

## Architecture

### Multi-Tenant Database Design

The platform uses a multi-tenant architecture with the following key components:

- **Tenants**: Organizations using the platform
- **Users**: Individual users within tenants
- **Projects**: Construction/engineering projects
- **Tasks**: Work items within projects
- **Companies**: Client/contractor organizations
- **Expenses**: Financial tracking
- **Equipment**: Asset management
- **Safety Incidents**: Safety tracking
- **Documents**: File management
- **Invoices**: Billing management

### Database Schema

The complete database schema is defined in:
- `docs/db/enhanced_schema.sql` - Complete schema definition
- `server/migrations/001_enhanced_schema.sql` - Migration script

Key tables include:

#### Core Tables
- `tenants` - Organization data
- `users` - User accounts with role-based access
- `oauth_accounts` - Social login integration

#### Business Logic Tables
- `companies` - Client/contractor management
- `projects` - Project management with budget tracking
- `project_assignments` - User-project relationships
- `tasks` - Task management with progress tracking
- `time_entries` - Time tracking for billing

#### Financial Tables
- `expenses` - Expense tracking with approval workflow
- `invoices` - Invoice management
- `invoice_items` - Line items for invoices
- `payments` - Payment tracking

#### Operational Tables
- `equipment` - Equipment/asset management
- `equipment_assignments` - Equipment allocation
- `safety_incidents` - Safety incident tracking
- `documents` - File storage metadata

#### Communication Tables
- `notifications` - User notifications
- `conversations` - Team communication
- `messages` - Individual messages

#### AI/ML Tables
- `multimodal_content` - AI processing results
- `audit_logs` - System audit trail

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Token refresh

### Core Resources
- `GET /api/users` - List users
- `GET /api/me` - Current user info

### Companies
- `GET /api/companies` - List companies
- `POST /api/companies` - Create company
- `GET /api/companies/:id` - Get company
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company
- `GET /api/companies/:id/stats` - Company statistics

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - List tasks (with filters)
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Expenses
- `GET /api/expenses` - List expenses (with filters)
- `POST /api/expenses` - Create expense
- `GET /api/expenses/:id` - Get expense
- `PUT /api/expenses/:id` - Update expense
- `PATCH /api/expenses/:id/approval` - Approve/reject expense
- `DELETE /api/expenses/:id` - Delete expense

### Documents
- `GET /api/documents` - List documents
- `POST /api/documents` - Upload document
- `GET /api/documents/:id` - Get document
- `DELETE /api/documents/:id` - Delete document

### Invoices
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/:id` - Get invoice
- `PUT /api/invoices/:id` - Update invoice

### System
- `GET /api/system/health` - System health check

## Frontend Integration

### Enhanced Backend Service

The `enhancedBackendService.ts` provides intelligent fallback between real backend and mock data:

```typescript
import { enhancedBackend } from './services/enhancedBackendService';

// Automatically uses backend if available, falls back to mock data
const projects = await enhancedBackend.getProjects();
const tasks = await enhancedBackend.getTasks({ projectId: '123' });
```

### Service Configuration

The service automatically detects backend availability and configures itself:

```typescript
const status = enhancedBackend.getStatus();
console.log('Backend available:', status.backendAvailable);
console.log('Using backend:', status.usingBackend);
console.log('Fallback enabled:', status.fallbackEnabled);
```

### Authentication Integration

OAuth integration supports multiple providers:

```typescript
// Google OAuth
await enhancedBackend.login({ 
  provider: 'google', 
  token: 'oauth_token' 
});

// GitHub OAuth
await enhancedBackend.login({ 
  provider: 'github', 
  code: 'auth_code' 
});

// Traditional login
await enhancedBackend.login({ 
  email: 'user@example.com', 
  password: 'password' 
});
```

## Database Setup

### Prerequisites

1. MySQL/MariaDB 10.5+
2. Node.js 18+
3. Environment variables configured

### Environment Configuration

Create `.env` file in server directory:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=asagents_db

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# OAuth Configuration (from previous setup)
GOOGLE_CLIENT_SECRET=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
GITHUB_CLIENT_SECRET=your_github_secret
OAUTH_IO_SECRET_KEY=oonpWCFCxGtW9jUqbE1X8UbNAoA

# Gemini API
GEMINI_API_KEY=AIzaSyB3J8F7b9NmXYIaVDvO6JFkjrWUTaRbEfM
```

### Database Migration

Run the migration to set up the database:

```bash
cd server
npm run migrate
```

Or for a dry run to see what would be executed:

```bash
npm run migrate:dry-run
```

### Manual Setup

If you prefer manual setup:

```bash
mysql -u root -p
CREATE DATABASE asagents_db;
USE asagents_db;
SOURCE docs/db/enhanced_schema.sql;
```

## Development Workflow

### Starting the Backend

```bash
cd server
npm install
npm run migrate  # Set up database
npm run dev      # Start development server
```

### Starting the Frontend

```bash
npm install
npm run dev      # Start frontend development server
```

### Testing Integration

```bash
cd server
npm test         # Run integration tests
```

## Production Deployment

### Database Optimization

The schema includes optimized indexes for performance:

```sql
-- Key indexes for performance
CREATE INDEX idx_users_tenant_email ON users (tenant_id, email);
CREATE INDEX idx_projects_tenant_status ON projects (tenant_id, status);
CREATE INDEX idx_tasks_tenant_status ON tasks (tenant_id, status);
CREATE INDEX idx_expenses_tenant_date ON expenses (tenant_id, expense_date);
```

### Security Considerations

1. **Multi-tenant isolation**: All queries include tenant_id filtering
2. **Role-based access**: User roles control API access
3. **JWT authentication**: Secure token-based authentication
4. **OAuth integration**: Secure social login
5. **Input validation**: All inputs validated and sanitized
6. **SQL injection protection**: Parameterized queries only

### Monitoring

The system includes comprehensive audit logging:

```sql
-- All changes tracked in audit_logs table
SELECT * FROM audit_logs 
WHERE tenant_id = ? 
ORDER BY created_at DESC;
```

## Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check MySQL/MariaDB is running
   - Verify credentials in `.env`
   - Ensure database exists

2. **Migration failed**
   - Check database permissions
   - Verify SQL syntax in migration files
   - Check for existing data conflicts

3. **Authentication not working**
   - Verify JWT secret is set
   - Check OAuth credentials
   - Ensure user exists in database

4. **Frontend can't connect to backend**
   - Check backend server is running on correct port
   - Verify CORS configuration
   - Check network connectivity

### Debug Mode

Enable debug logging:

```bash
DEBUG=asagents:* npm run dev
```

### Health Check

Check system status:

```bash
curl http://localhost:4000/api/system/health
```

Expected response:
```json
{
  "status": "ok",
  "database": true,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Next Steps

1. **Performance Optimization**: Add caching layer (Redis)
2. **Real-time Features**: WebSocket integration
3. **File Storage**: Cloud storage integration (AWS S3)
4. **Analytics**: Advanced reporting and dashboards
5. **Mobile API**: Mobile app support
6. **Backup Strategy**: Automated database backups
7. **Load Balancing**: Multi-instance deployment
8. **Monitoring**: Application performance monitoring
