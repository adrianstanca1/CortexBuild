# 📚 ConstructAI API Documentation

**Version**: 2.0.0  
**Base URL**: `https://constructai-5-5ngg87gpl-adrian-b7e84541.vercel.app/api`  
**Authentication**: Bearer Token (JWT)

---

## 🔐 **Authentication Endpoints**

### **POST /api/auth/login**
Authenticate a user and receive a JWT token.

**Request**:
```json
{
  "email": "adrian.stanca1@gmail.com",
  "password": "Cumparavinde1"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "id": "user-1",
    "email": "adrian.stanca1@gmail.com",
    "name": "Adrian Stanca",
    "role": "super_admin",
    "avatar": null,
    "companyId": "company-1"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2025-10-09T01:35:00.000Z"
}
```

**Rate Limit**: 5 attempts per 15 minutes  
**Headers**:
- `X-RateLimit-Limit: 5`
- `X-RateLimit-Remaining: 4`
- `X-RateLimit-Reset: 2025-10-08T01:50:00.000Z`

**Errors**:
- `400` - Validation failed
- `401` - Invalid credentials
- `429` - Too many attempts
- `500` - Server error

---

### **POST /api/auth/register**
Register a new user and company.

**Request**:
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123",
  "name": "John Doe",
  "companyName": "Acme Corp"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "id": "user-xyz",
    "email": "newuser@example.com",
    "name": "John Doe",
    "role": "company_admin",
    "avatar": null,
    "companyId": "company-xyz"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2025-10-09T01:35:00.000Z"
}
```

**Rate Limit**: 3 registrations per hour  
**Validation**:
- Email: Valid format, max 255 chars
- Password: Min 8 chars, max 100 chars
- Name: Min 2 chars, max 100 chars
- Company Name: Min 2 chars, max 100 chars

**Errors**:
- `400` - Validation failed or email exists
- `429` - Too many registrations
- `500` - Server error

---

### **GET /api/auth/me**
Get current authenticated user information.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "id": "user-1",
    "email": "adrian.stanca1@gmail.com",
    "name": "Adrian Stanca",
    "role": "super_admin",
    "avatar": null,
    "companyId": "company-1",
    "companyName": "ConstructCo"
  },
  "session": {
    "expiresAt": "2025-10-09T01:35:00.000Z"
  }
}
```

**Rate Limit**: 60 requests per minute

**Errors**:
- `401` - Invalid or expired token
- `429` - Too many requests
- `500` - Server error

---

### **POST /api/auth/logout**
Logout and invalidate current session.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Rate Limit**: 60 requests per minute

**Errors**:
- `401` - Invalid token
- `429` - Too many requests
- `500` - Server error

---

### **POST /api/auth/refresh** ✨ NEW
Refresh an expired or expiring token.

**Headers**:
```
Authorization: Bearer <old_token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2025-10-09T01:35:00.000Z",
  "user": {
    "id": "user-1",
    "email": "adrian.stanca1@gmail.com",
    "name": "Adrian Stanca",
    "role": "super_admin",
    "avatar": null,
    "companyId": "company-1"
  }
}
```

**Rate Limit**: 60 requests per minute

**Errors**:
- `401` - Invalid token or session not found
- `429` - Too many requests
- `500` - Server error

---

## 🏥 **System Endpoints**

### **GET /api/health** ✨ NEW
Check API and database health status.

**Response** (200 OK):
```json
{
  "success": true,
  "api": "healthy",
  "database": "healthy",
  "timestamp": "2025-10-08T01:35:00.000Z",
  "uptime": 3600,
  "version": "2.0.0",
  "stats": {
    "users": 3,
    "sessions": 5,
    "companies": 1
  }
}
```

**Response** (503 Service Unavailable):
```json
{
  "success": false,
  "api": "healthy",
  "database": "unhealthy",
  "timestamp": "2025-10-08T01:35:00.000Z",
  "uptime": 3600,
  "version": "2.0.0",
  "error": "Connection timeout"
}
```

---

## 🔒 **Security Features**

### **Rate Limiting**
All endpoints have rate limiting to prevent abuse:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/auth/login` | 5 requests | 15 minutes |
| `/auth/register` | 3 requests | 1 hour |
| `/auth/me` | 60 requests | 1 minute |
| `/auth/logout` | 60 requests | 1 minute |
| `/auth/refresh` | 60 requests | 1 minute |
| `/health` | No limit | - |

### **Security Headers**
All responses include:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy: ...`
- `Strict-Transport-Security: ...` (production only)

### **Input Validation**
All inputs are validated for:
- Type correctness
- Length constraints
- Format requirements (email, etc.)
- SQL injection prevention
- XSS prevention

---

## 📊 **Response Format**

### **Success Response**
```json
{
  "success": true,
  "data": { ... }
}
```

### **Error Response**
```json
{
  "success": false,
  "error": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "email must be a valid email"
    }
  ]
}
```

### **Rate Limit Response**
```json
{
  "success": false,
  "error": "Too many requests. Please try again later.",
  "retryAfter": "2025-10-08T01:50:00.000Z"
}
```

---

## 🔑 **Authentication Flow**

### **1. Login**
```bash
curl -X POST https://api.example.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### **2. Use Token**
```bash
curl -X GET https://api.example.com/api/auth/me \
  -H "Authorization: Bearer <token>"
```

### **3. Refresh Token** (when expiring)
```bash
curl -X POST https://api.example.com/api/auth/refresh \
  -H "Authorization: Bearer <old_token>"
```

### **4. Logout**
```bash
curl -X POST https://api.example.com/api/auth/logout \
  -H "Authorization: Bearer <token>"
```

---

## 🧪 **Testing**

### **Test Credentials**
```
Email: adrian.stanca1@gmail.com
Password: Cumparavinde1
Role: super_admin
```

```
Email: casey@constructco.com
Password: password123
Role: company_admin
```

```
Email: mike@constructco.com
Password: password123
Role: supervisor
```

### **Example: Complete Flow**
```bash
# 1. Login
TOKEN=$(curl -X POST https://api.example.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"adrian.stanca1@gmail.com","password":"Cumparavinde1"}' \
  | jq -r '.token')

# 2. Get current user
curl -X GET https://api.example.com/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# 3. Logout
curl -X POST https://api.example.com/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📈 **Monitoring**

### **Logs**
All requests are logged with:
- Timestamp
- Method and path
- Client IP
- User ID (if authenticated)
- Response status
- Duration

### **Metrics**
Track these metrics:
- Request count per endpoint
- Average response time
- Error rate
- Rate limit hits
- Active sessions

---

## 🚀 **Best Practices**

### **Token Management**
1. Store tokens securely (localStorage or httpOnly cookies)
2. Refresh tokens before expiry
3. Clear tokens on logout
4. Handle 401 errors by redirecting to login

### **Error Handling**
1. Always check `success` field
2. Display user-friendly error messages
3. Log errors for debugging
4. Retry on 429 (rate limit) errors

### **Performance**
1. Cache user data locally
2. Use token refresh instead of re-login
3. Implement request debouncing
4. Monitor API response times

---

## 📞 **Support**

### **Issues**
- Check logs in Vercel dashboard
- Verify environment variables
- Test with health endpoint
- Review rate limit headers

### **Contact**
- GitHub: https://github.com/adrianstanca1/constructai--5-
- Documentation: See project README.md

---

**🎉 API v2.0.0 - Production Ready!** 🚀

