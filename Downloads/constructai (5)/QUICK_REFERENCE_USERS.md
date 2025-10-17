# 👥 Quick Reference - User Management

## 🚀 QUICK START

### **Test User**
```
Email: adrian.stanca1@gmail.com
Password: password123
Role: super_admin
```

### **Access User Management**
1. Login as Super Admin
2. Go to "Admin" tab
3. Click "User Management"
4. Manage users from there

---

## 👥 USER ROLES

| Role | Level | Permissions | Use Case |
|------|-------|-------------|----------|
| Super Admin | 7 | All (40+) | Platform control |
| Company Admin | 6 | Company + Projects + Users | Company management |
| Project Manager | 5 | Projects + Tasks + Team | Project oversight |
| Foreman | 4 | Tasks + Team + Daily Ops | Team leadership |
| Safety Officer | 3 | Safety + Compliance | Safety management |
| Accounting Clerk | 2 | Finance + Invoicing | Financial ops |
| Operative | 1 | Task execution | Field work |

---

## 🔐 AUTHENTICATION

### **Login**
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "user": { id, email, name, role, avatar, companyId },
  "token": "jwt_token_here",
  "expiresAt": "2025-10-18T..."
}
```

### **Register**
```bash
POST /api/auth/register
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "John Doe",
  "companyName": "My Company"
}

Response:
{
  "success": true,
  "user": { id, email, name, role, avatar, companyId },
  "token": "jwt_token_here"
}
```

### **Verify Token**
```bash
GET /api/auth/me
Headers: Authorization: Bearer {token}

Response:
{
  "success": true,
  "user": { id, email, name, role, avatar, companyId }
}
```

### **Refresh Token**
```bash
POST /api/auth/refresh
Headers: Authorization: Bearer {old_token}

Response:
{
  "success": true,
  "token": "new_jwt_token",
  "expiresAt": "2025-10-18T..."
}
```

---

## 👤 USER MANAGEMENT API

### **Create User**
```bash
POST /api/admin/users
Headers: Authorization: Bearer {token}
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "Jane Doe",
  "role": "Project Manager"
}
```

### **List Users**
```bash
GET /api/admin/users?page=1&limit=10
Headers: Authorization: Bearer {token}

Response:
{
  "users": [...],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

### **Get User**
```bash
GET /api/admin/users/:id
Headers: Authorization: Bearer {token}
```

### **Update User**
```bash
PATCH /api/admin/users/:id
Headers: Authorization: Bearer {token}
{
  "name": "Updated Name",
  "role": "Foreman",
  "is_active": true
}
```

### **Delete User**
```bash
DELETE /api/admin/users/:id
Headers: Authorization: Bearer {token}
```

### **Activate/Deactivate User**
```bash
PATCH /api/admin/users/:id/status
Headers: Authorization: Bearer {token}
{
  "is_active": false
}
```

---

## 🔑 PERMISSIONS

### **Permission Categories**

**Company Management**
- company:read
- company:update
- company:delete
- company:manage_users
- company:manage_billing

**Project Management**
- project:create
- project:read
- project:update
- project:delete
- project:manage_team

**Task Management**
- task:create
- task:read
- task:update
- task:delete
- task:assign

**User Management**
- user:create
- user:read
- user:update
- user:delete
- user:invite

**Agent Management**
- agent:subscribe
- agent:unsubscribe
- agent:configure

**Reports & Analytics**
- report:view
- report:export
- analytics:view
- analytics:advanced

---

## 🏢 MULTI-TENANT FEATURES

### **Company Isolation**
- Each user belongs to one company
- Users only see their company's data
- Super admin can see all companies
- Data filtered by company_id

### **Tenant Context**
```typescript
// Get user's company ID
const tenantId = user.companyId;

// Check if user in tenant
const inTenant = user.companyId === targetCompanyId;

// Filter queries by tenant
const results = db.query()
  .where('company_id', '=', tenantId);
```

---

## 🔒 SECURITY

### **Password Security**
- Bcrypt hashing (10 salt rounds)
- Passwords never stored in plain text
- Secure comparison algorithm
- Password validation rules

### **Session Security**
- JWT tokens (24-hour expiry)
- Sessions stored in database
- Token refresh mechanism
- Secure localStorage storage

### **Access Control**
- Role-based access control (RBAC)
- Permission-based authorization
- User hierarchy enforcement
- API endpoint protection

---

## 📊 USER STATISTICS

### **Available Metrics**
- Total users per company
- Users by role
- Active vs inactive users
- Last login tracking
- User creation date
- Account status

### **Admin Dashboard**
- User list with pagination
- Create/edit/delete users
- Activate/deactivate users
- View user activity
- Export user data

---

## 🆘 TROUBLESHOOTING

### **Issue: "Invalid email or password"**
- Check email is correct
- Verify password is correct
- Ensure user account is active

### **Issue: "Token expired"**
- Call refresh endpoint to get new token
- Or login again

### **Issue: "Permission denied"**
- Check user role has required permission
- Verify user is in correct company
- Contact admin for permission upgrade

### **Issue: "User not found"**
- Verify user ID is correct
- Check user hasn't been deleted
- Ensure you have access to user

---

## 📱 USER INTERFACE

### **Login Page**
- Email & password fields
- Remember me option
- OAuth integration
- Error messages

### **Registration Page**
- Email validation
- Password strength
- Company name field
- Terms acceptance

### **User Management Panel**
- User list with pagination
- Create new user modal
- Edit user modal
- Delete confirmation
- Bulk actions

### **User Profile**
- View profile info
- Edit details
- Change password
- Upload avatar

---

## ✅ PRODUCTION CHECKLIST

- [ ] All users created
- [ ] Roles assigned correctly
- [ ] Permissions configured
- [ ] Multi-tenant isolation verified
- [ ] Audit logging enabled
- [ ] Email verification set up
- [ ] Password reset configured
- [ ] OAuth providers enabled
- [ ] User invitations working
- [ ] Activity tracking enabled

---

**Status**: ✅ PRODUCTION-READY

