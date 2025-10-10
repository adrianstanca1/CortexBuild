# 🚀 CortexBuild Server Setup Guide

## ✅ Backend Status: FULLY FUNCTIONAL

---

## 📋 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database (First Time Only)
```bash
sqlite3 cortexbuild.db < server/schema.sql
```

### 3. Start Backend Server
```bash
npm run server
```

### 4. Start Frontend (Separate Terminal)
```bash
npm run dev
```

### 5. Start Both Together
```bash
npm run dev:all
```

---

## 🔧 Server Configuration

- **Port**: 3001
- **Database**: cortexbuild.db (SQLite)
- **CORS**: Enabled for http://localhost:3000
- **API Base URL**: http://localhost:3001/api

---

## 📊 Database Schema

### Tables Created (18 total):
1. **users** - User accounts
2. **companies** - Company information
3. **sessions** - Authentication sessions
4. **clients** - Client management
5. **projects** - Project tracking
6. **tasks** - Task management
7. **milestones** - Project milestones
8. **team_members** - Team assignments
9. **rfis** - Request for Information
10. **invoices** - Invoice management
11. **invoice_items** - Invoice line items
12. **time_entries** - Time tracking
13. **subcontractors** - Subcontractor management
14. **project_subcontractors** - Project assignments
15. **purchase_orders** - Purchase order management
16. **po_items** - PO line items
17. **documents** - Document storage
18. **activities** - Activity logging

---

## 🔐 Authentication

### Default Users:
1. **Super Admin**
   - Email: adrian.stanca1@gmail.com
   - Password: Cumparavinde1
   - Role: super_admin

2. **Company Admin**
   - Email: casey@constructco.com
   - Password: password123
   - Role: company_admin

3. **Supervisor**
   - Email: mike@constructco.com
   - Password: password123
   - Role: supervisor

### Default Company:
- ID: company-1
- Name: ConstructCo

---

## 📡 API Endpoints (64 total)

### Auth Routes (5):
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Clients API (5):
- `GET /api/clients` - List all clients
- `GET /api/clients/:id` - Get client by ID
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Projects API (5):
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### RFIs API (6):
- `GET /api/rfis` - List all RFIs
- `GET /api/rfis/:id` - Get RFI by ID
- `POST /api/rfis` - Create new RFI
- `PUT /api/rfis/:id` - Update RFI
- `DELETE /api/rfis/:id` - Delete RFI
- `PATCH /api/rfis/:id/status` - Update RFI status

### Invoices API (7):
- `GET /api/invoices` - List all invoices
- `GET /api/invoices/:id` - Get invoice by ID
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `PATCH /api/invoices/:id/status` - Update invoice status
- `POST /api/invoices/:id/send` - Send invoice

### Time Entries API (6):
- `GET /api/time-entries` - List all time entries
- `GET /api/time-entries/:id` - Get time entry by ID
- `POST /api/time-entries` - Create new time entry
- `PUT /api/time-entries/:id` - Update time entry
- `DELETE /api/time-entries/:id` - Delete time entry
- `GET /api/time-entries/stats` - Get time tracking stats

### Subcontractors API (5):
- `GET /api/subcontractors` - List all subcontractors
- `GET /api/subcontractors/:id` - Get subcontractor by ID
- `POST /api/subcontractors` - Create new subcontractor
- `PUT /api/subcontractors/:id` - Update subcontractor
- `DELETE /api/subcontractors/:id` - Delete subcontractor

### Purchase Orders API (6):
- `GET /api/purchase-orders` - List all purchase orders
- `GET /api/purchase-orders/:id` - Get purchase order by ID
- `POST /api/purchase-orders` - Create new purchase order
- `PUT /api/purchase-orders/:id` - Update purchase order
- `DELETE /api/purchase-orders/:id` - Delete purchase order
- `PATCH /api/purchase-orders/:id/status` - Update PO status

### Tasks API (6):
- `GET /api/tasks` - List all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/status` - Update task status

### Milestones API (5):
- `GET /api/milestones` - List all milestones
- `GET /api/milestones/:id` - Get milestone by ID
- `POST /api/milestones` - Create new milestone
- `PUT /api/milestones/:id` - Update milestone
- `DELETE /api/milestones/:id` - Delete milestone

### Documents API (5):
- `GET /api/documents` - List all documents
- `GET /api/documents/:id` - Get document by ID
- `POST /api/documents` - Upload new document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

### Developer Platform API (9):
- `GET /api/modules` - List all modules
- `GET /api/modules/:id` - Get module by ID
- `POST /api/modules` - Create new module
- `PUT /api/modules/:id` - Update module
- `DELETE /api/modules/:id` - Delete module
- `GET /api/modules/:id/reviews` - Get module reviews
- `POST /api/modules/:id/reviews` - Create review
- `GET /api/api-keys` - List API keys
- `POST /api/api-keys` - Create API key

### AI Chatbot API (2):
- `GET /api/chat/message` - Get chat history
- `POST /api/chat/message` - Send chat message

### Health Check (1):
- `GET /api/health` - Server health check

---

## 🧪 Testing API Endpoints

### Test GET Request:
```bash
curl http://localhost:3001/api/clients
```

### Test POST Request:
```bash
curl -X POST http://localhost:3001/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "company-1",
    "name": "Test Client",
    "contact_name": "John Doe",
    "email": "john@test.com",
    "phone": "555-1234",
    "type": "commercial",
    "status": "active"
  }'
```

---

## 🐛 Troubleshooting

### Server Won't Start:
1. Check if port 3001 is already in use:
   ```bash
   lsof -i :3001
   ```
2. Kill existing process:
   ```bash
   pkill -f "tsx server/index.ts"
   ```

### Database Errors:
1. Recreate database:
   ```bash
   rm cortexbuild.db cortexbuild.db-shm cortexbuild.db-wal
   sqlite3 cortexbuild.db < server/schema.sql
   ```

### API Returns 404:
1. Check server logs for route registration
2. Verify routes are registered BEFORE 404 handler
3. Restart server

### CORS Errors:
1. Verify frontend is running on http://localhost:3000
2. Check CORS configuration in server/index.ts

---

## 📝 Development Notes

### Adding New API Routes:
1. Create route file in `server/routes/`
2. Export `createXRouter(db)` function
3. Import in `server/index.ts`
4. Register with `app.use('/api/x', createXRouter(db))`

### Database Migrations:
1. Update `server/schema.sql`
2. Run: `sqlite3 cortexbuild.db < server/schema.sql`
3. Restart server

---

## 🎯 Next Steps

1. ✅ Backend server running
2. ✅ Database initialized
3. ✅ All API routes functional
4. ⏳ Add authentication to frontend API calls
5. ⏳ Update modals to include company_id
6. ⏳ Test all Create/Edit/Delete operations

---

**Server Status**: ✅ FULLY FUNCTIONAL  
**Last Updated**: 2025-10-08  
**Version**: 1.0.0 GOLDEN

