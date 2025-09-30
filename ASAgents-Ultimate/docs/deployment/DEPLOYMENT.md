# ASAgents Platform - Deployment Guide

## 🚀 Overview

The ASAgents Platform is a comprehensive construction management system with a React frontend and Express + SQLite backend. This guide covers local development setup, production deployment, and maintenance procedures.

## 📋 Prerequisites

### System Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **Git**: Latest version
- **Operating System**: macOS, Linux, or Windows with WSL2

### Development Tools (Recommended)
- **VS Code** with extensions:
  - TypeScript and JavaScript Language Features
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint

## 🏗️ Architecture Overview

```
ASAgents Platform
├── Frontend (React + TypeScript)
│   ├── Port: 4002
│   ├── Real-time WebSocket connection
│   └── REST API integration
├── Backend (Express + SQLite)
│   ├── Port: 5001
│   ├── SQLite database
│   ├── JWT authentication
│   ├── WebSocket server
│   └── RESTful API endpoints
└── Database (SQLite)
    ├── File: backend/database.sqlite
    ├── 8 tables with relationships
    └── Seed data included
```

## 🛠️ Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/adrianstanca1/final.git
cd final
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Initialize database and run migrations
npm run db:migrate

# Seed the database with sample data
npm run db:seed

# Start the backend server
npm run dev
```

The backend will be available at: `http://localhost:5001`

### 3. Frontend Setup

```bash
# Navigate back to root directory
cd ..

# Install frontend dependencies
npm install

# Start the frontend development server
npm run dev
```

The frontend will be available at: `http://localhost:4002`

### 4. Verify Installation

1. **Backend Health Check**: Visit `http://localhost:5001/api/health`
2. **Frontend**: Visit `http://localhost:4002`
3. **WebSocket**: Connection status shown in the frontend header
4. **Database**: Check `backend/database.sqlite` file exists

## 🔐 Authentication & Demo Accounts

The system includes pre-seeded demo accounts for testing:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | admin@buildcorp.com | password123 | Full system access |
| Manager | manager@buildcorp.com | password123 | Project management |
| Worker | worker@buildcorp.com | password123 | Task execution |
| Client | client@metroproperties.com | password123 | Client portal |

## 📊 Database Schema

### Core Tables
- **companies**: Organization data
- **users**: User accounts and profiles
- **projects**: Construction projects
- **tasks**: Project tasks and assignments
- **invoices**: Billing and invoicing
- **invoice_items**: Invoice line items
- **expenses**: Project expenses
- **documents**: File attachments

### Key Features
- Foreign key relationships
- Automatic timestamps
- Calculated fields (invoice totals)
- Indexes for performance
- Triggers for data consistency

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Projects
- `GET /api/projects` - List projects (with filters)
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Invoices
- `GET /api/invoices` - List invoices (with filters)
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/:id` - Get invoice details
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `GET /api/invoices/summary` - Get invoice statistics

### System
- `GET /api/health` - Health check and system status

## 🔄 Real-time Features

### WebSocket Connection
- **URL**: `ws://localhost:5001/ws`
- **Features**: Live updates, notifications, status monitoring
- **Auto-reconnection**: Automatic reconnection on connection loss
- **Authentication**: JWT token-based authentication

### Live Dashboard
- Real-time project statistics
- Live invoice updates
- System health monitoring
- WebSocket connection status

## 🚀 Production Deployment

### Environment Configuration

Create production environment files:

```bash
# Backend environment (.env)
NODE_ENV=production
PORT=5001
JWT_SECRET=your-super-secure-jwt-secret-here
DATABASE_PATH=./database.sqlite
CORS_ORIGIN=https://your-domain.com
```

```bash
# Frontend environment (.env.production)
VITE_API_URL=https://api.your-domain.com
VITE_WS_URL=wss://api.your-domain.com/ws
```

### Backend Deployment

```bash
# Build the backend
cd backend
npm run build

# Start production server
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start ecosystem.config.js
```

### Frontend Deployment

```bash
# Build the frontend
npm run build

# Serve with a static file server
npm install -g serve
serve -s dist -l 4002

# Or deploy to CDN/hosting service
```

### Database Backup

```bash
# Create database backup
cp backend/database.sqlite backend/database.backup.sqlite

# Automated backup script
npm run db:backup
```

## 🔧 Configuration Options

### Backend Configuration

```javascript
// backend/src/config/index.ts
export const config = {
  port: process.env.PORT || 5001,
  jwtSecret: process.env.JWT_SECRET,
  databasePath: process.env.DATABASE_PATH || './database.sqlite',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4002',
  logLevel: process.env.LOG_LEVEL || 'info'
};
```

### Frontend Configuration

```javascript
// src/config/index.ts
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5001',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:5001/ws',
  environment: import.meta.env.MODE
};
```

## 📈 Monitoring & Maintenance

### Health Checks

The system provides comprehensive health monitoring:

```bash
# Check backend health
curl http://localhost:5001/api/health

# Response includes:
# - Database connectivity
# - Memory usage
# - Uptime
# - Service status
```

### Log Management

```bash
# View backend logs
cd backend
npm run logs

# View specific log levels
npm run logs:error
npm run logs:info
```

### Database Maintenance

```bash
# Run database migrations
npm run db:migrate

# Reset database (development only)
npm run db:reset

# Backup database
npm run db:backup

# Restore database
npm run db:restore backup-file.sqlite
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check what's using the port
   lsof -ti:5001
   
   # Kill the process
   kill -9 $(lsof -ti:5001)
   ```

2. **Database Issues**
   ```bash
   # Reset database
   rm backend/database.sqlite
   npm run db:migrate
   npm run db:seed
   ```

3. **WebSocket Connection Issues**
   - Check backend is running on correct port
   - Verify CORS configuration
   - Check firewall settings

4. **Authentication Issues**
   - Verify JWT secret is set
   - Check token expiration
   - Clear browser localStorage

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Backend debug mode
cd backend
DEBUG=app:* npm run dev
```

## 🔒 Security Considerations

### Production Security
- Use strong JWT secrets
- Enable HTTPS in production
- Implement rate limiting
- Regular security updates
- Database encryption at rest
- Input validation and sanitization

### Environment Variables
Never commit sensitive data to version control:
- JWT secrets
- Database credentials
- API keys
- Production URLs

## 📚 Additional Resources

### Documentation
- [API Documentation](./API.md)
- [Frontend Components](./COMPONENTS.md)
- [Database Schema](./DATABASE.md)

### Support
- GitHub Issues: [Repository Issues](https://github.com/adrianstanca1/final/issues)
- Development Team: Contact for enterprise support

## 🎯 Next Steps

After successful deployment:

1. **Configure monitoring** (logs, metrics, alerts)
2. **Set up automated backups**
3. **Implement CI/CD pipeline**
4. **Configure SSL certificates**
5. **Set up domain and DNS**
6. **Performance optimization**
7. **Security hardening**

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: ASAgents Development Team
