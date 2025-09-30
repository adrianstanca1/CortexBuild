# ASAgents Construction Management Platform - Security & Authentication

## Authentication Architecture Overview

The ASAgents platform implements a **dual-backend authentication system** designed for enterprise scalability, AI integration, and multi-tenant security. This architecture combines Node.js for AI services with Java Enterprise for core business operations, unified through JWT-based authentication.

### System Architecture

```
Frontend (React/TypeScript) ← JWT Tokens → Nginx Reverse Proxy
                                                ↓
                                    ┌─────────────────────┐
                                    │  Load Balancer      │
                                    └─────────────────────┘
                                        ↓           ↓
                            ┌─────────────────────┐ ┌─────────────────────┐
                            │  Node.js Backend    │ │  Java Backend       │
                            │  (AI Services)      │ │  (Core Business)    │
                            │  Port: 4000         │ │  Port: 4001         │
                            └─────────────────────┘ └─────────────────────┘
                                        ↓                      ↓
                                    ┌─────────────────────────────────────────┐
                                    │         MySQL Database                  │
                                    │         Multi-Tenant Schema             │
                                    └─────────────────────────────────────────┘
```

### JWT Token Flow

#### 1. Token Generation (Node.js Backend - Port 4000)
- **Issuer**: `asagents-api`
- **Audience**: `asagents-client`
- **Algorithm**: HMAC-SHA256 with 256-bit shared secret
- **Expiry**: 24 hours (configurable)
- **Refresh**: 7 days (separate refresh token)

**Token Claims Structure**:
```json
{
  "iss": "asagents-api",
  "aud": "asagents-client",
  "sub": "user-id",
  "userId": "user-123",
  "email": "user@company.com",
  "role": "admin|manager|worker|viewer",
  "companyId": "company-uuid",
  "tenantId": "tenant-uuid",
  "permissions": ["VIEW_PROJECTS", "EDIT_TASKS", "ADMIN_USERS"],
  "iat": 1640995200,
  "exp": 1641081600
}
```

#### 2. Token Verification (Both Backends)
- **Node.js**: Express middleware with `jsonwebtoken`
- **Java**: Spring Security filter with `jjwt` library
- **Shared Secret**: Environment variable `JWT_SECRET`
- **Validation**: Signature, expiry, issuer, audience, required claims

#### 3. Multi-Tenant Context Propagation

**Node.js Implementation**:
```typescript
// Middleware extracts tenant context from JWT
app.use((req: AuthenticatedRequest, res, next) => {
  if (req.user) {
    req.tenantId = req.user.companyId || req.user.tenantId;
    req.userId = req.user.userId;
  }
  next();
});
```

**Java Implementation**:
```java
// Security filter sets ThreadLocal tenant context
@Component
public class TenantFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, 
                        FilterChain chain) throws IOException, ServletException {
        String tenantId = (String) request.getAttribute("tenantId");
        if (tenantId != null) {
            TenantContext.setCurrentTenant(tenantId);
        }
        try {
            chain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
```

## Authentication Endpoints

### Node.js Backend (Port 4000)

#### POST `/api/auth/login`
```json
// Request
{
  "email": "user@company.com",
  "password": "securePassword123",
  "companyId": "optional-company-id"
}

// Response
{
  "success": true,
  "user": {
    "id": "user-123",
    "email": "user@company.com",
    "role": "admin",
    "companyId": "company-uuid"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

#### POST `/api/auth/refresh`
```json
// Request
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Response
{
  "success": true,
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

#### GET `/api/auth/me`
```json
// Response (requires valid JWT)
{
  "success": true,
  "user": {
    "id": "user-123",
    "email": "user@company.com",
    "role": "admin",
    "companyId": "company-uuid",
    "permissions": ["VIEW_PROJECTS", "EDIT_TASKS"]
  }
}
```

### Java Backend (Port 4001)

#### GET `/api/java/auth/validate`
```json
// Response (JWT validation endpoint)
{
  "valid": true,
  "userId": "user-123",
  "role": "admin",
  "tenantId": "company-uuid",
  "expiresAt": "2024-01-15T10:30:00Z"
}
```

#### POST `/api/java/auth/impersonate`
```json
// Request (Admin only - for support purposes)
{
  "targetUserId": "user-456",
  "reason": "Customer support session"
}

// Response
{
  "success": true,
  "impersonationToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "originalUser": "admin-123",
  "targetUser": "user-456"
}
```

## Security Configuration

### Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-256-bit-secret-key-here-minimum-32-characters
JWT_ISSUER=asagents-api
JWT_AUDIENCE=asagents-client
JWT_EXPIRY=24h
JWT_REFRESH_EXPIRY=7d

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,https://yourdomain.com
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security Headers
SECURITY_HSTS_MAX_AGE=31536000
SECURITY_CONTENT_TYPE_NOSNIFF=true
SECURITY_FRAME_OPTIONS=DENY
```

### Docker Compose Configuration

```yaml
version: '3.8'
services:
  node-backend:
    image: asagents/node-backend:latest
    ports:
      - "4000:4000"
    environment:
      JWT_SECRET: ${JWT_SECRET}
      JWT_ISSUER: ${JWT_ISSUER}
      JWT_AUDIENCE: ${JWT_AUDIENCE}
      DATABASE_URL: mysql://root:${MYSQL_ROOT_PASSWORD}@mysql:3306/asagents_db
    depends_on:
      - mysql
    
  java-backend:
    image: asagents/java-backend:latest
    ports:
      - "4001:4001"
    environment:
      JWT_SECRET: ${JWT_SECRET}
      JWT_ISSUER: ${JWT_ISSUER}
      JWT_AUDIENCE: ${JWT_AUDIENCE}
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/asagents_db
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: ${MYSQL_ROOT_PASSWORD}
    depends_on:
      - mysql
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - node-backend
      - java-backend
```

## Role-Based Access Control (RBAC)

### Permission System

```typescript
enum Permission {
  // Project Management
  VIEW_PROJECTS = 'VIEW_PROJECTS',
  CREATE_PROJECTS = 'CREATE_PROJECTS',
  EDIT_PROJECTS = 'EDIT_PROJECTS',
  DELETE_PROJECTS = 'DELETE_PROJECTS',
  
  // Task Management
  VIEW_TASKS = 'VIEW_TASKS',
  CREATE_TASKS = 'CREATE_TASKS',
  EDIT_TASKS = 'EDIT_TASKS',
  ASSIGN_TASKS = 'ASSIGN_TASKS',
  
  // User Management
  VIEW_USERS = 'VIEW_USERS',
  CREATE_USERS = 'CREATE_USERS',
  EDIT_USERS = 'EDIT_USERS',
  DELETE_USERS = 'DELETE_USERS',
  
  // Financial
  VIEW_FINANCIALS = 'VIEW_FINANCIALS',
  EDIT_FINANCIALS = 'EDIT_FINANCIALS',
  APPROVE_EXPENSES = 'APPROVE_EXPENSES',
  
  // System Administration
  ADMIN_SYSTEM = 'ADMIN_SYSTEM',
  ADMIN_COMPANY = 'ADMIN_COMPANY',
  VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS'
}
```

### Role Definitions

```typescript
const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    Permission.VIEW_PROJECTS, Permission.CREATE_PROJECTS, 
    Permission.EDIT_PROJECTS, Permission.DELETE_PROJECTS,
    Permission.VIEW_TASKS, Permission.CREATE_TASKS, 
    Permission.EDIT_TASKS, Permission.ASSIGN_TASKS,
    Permission.VIEW_USERS, Permission.CREATE_USERS, 
    Permission.EDIT_USERS, Permission.DELETE_USERS,
    Permission.VIEW_FINANCIALS, Permission.EDIT_FINANCIALS, 
    Permission.APPROVE_EXPENSES,
    Permission.ADMIN_COMPANY, Permission.VIEW_AUDIT_LOGS
  ],
  
  manager: [
    Permission.VIEW_PROJECTS, Permission.CREATE_PROJECTS, 
    Permission.EDIT_PROJECTS,
    Permission.VIEW_TASKS, Permission.CREATE_TASKS, 
    Permission.EDIT_TASKS, Permission.ASSIGN_TASKS,
    Permission.VIEW_USERS, Permission.VIEW_FINANCIALS, 
    Permission.APPROVE_EXPENSES
  ],
  
  worker: [
    Permission.VIEW_PROJECTS, Permission.VIEW_TASKS, 
    Permission.EDIT_TASKS, Permission.VIEW_FINANCIALS
  ],
  
  viewer: [
    Permission.VIEW_PROJECTS, Permission.VIEW_TASKS, 
    Permission.VIEW_USERS, Permission.VIEW_FINANCIALS
  ]
};
```

## Frontend Integration

### Authentication Context

```typescript
interface AuthContextType {
  user: User | null;
  company: Company | null;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<string>;
  hasPermission: (permission: Permission) => boolean;
  isLoading: boolean;
}

// Usage in components
const ProtectedComponent: React.FC = () => {
  const { user, hasPermission } = useAuth();
  
  if (!user) {
    return <Redirect to="/login" />;
  }
  
  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      {hasPermission(Permission.CREATE_PROJECTS) && (
        <Button onClick={createProject}>Create Project</Button>
      )}
    </div>
  );
};
```

### API Service Integration

```typescript
class BackendApiService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await this.authService.getValidAccessToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Tenant-ID': this.authService.getTenantId()
    };
  }
  
  async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options?.headers }
    });
    
    if (response.status === 401) {
      // Token expired, try refresh
      await this.authService.refreshAccessToken();
      // Retry request with new token
      const newHeaders = await this.getAuthHeaders();
      const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: { ...newHeaders, ...options?.headers }
      });
      return retryResponse.json();
    }
    
    return response.json();
  }
}
```

## Testing Strategy

### JWT Authentication Tests

```typescript
// Node.js Backend Tests
describe('JWT Authentication', () => {
  test('should generate valid JWT token on login', async () => {
    const loginData = {
      email: 'test@company.com',
      password: 'password123'
    };
    
    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(200);
      
    expect(response.body.tokens.accessToken).toBeDefined();
    
    // Verify token can be decoded
    const decoded = jwt.verify(response.body.tokens.accessToken, JWT_SECRET);
    expect(decoded.userId).toBeDefined();
    expect(decoded.email).toBe(loginData.email);
  });
  
  test('should validate JWT tokens correctly', async () => {
    const token = generateTestToken({ userId: 'test-123', role: 'admin' });
    
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
      
    expect(response.body.user.id).toBe('test-123');
  });
});
```

```java
// Java Backend Tests
@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {
    
    @Test
    void shouldProcessValidJwtToken() throws Exception {
        String token = createValidTestToken();
        request.addHeader("Authorization", "Bearer " + token);
        
        jwtFilter.doFilterInternal(request, response, filterChain);
        
        verify(filterChain).doFilter(request, response);
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals("test-company-123", request.getAttribute("tenantId"));
    }
    
    @Test
    void shouldHandleInvalidTokenGracefully() throws Exception {
        request.addHeader("Authorization", "Bearer invalid.token.here");
        
        jwtFilter.doFilterInternal(request, response, filterChain);
        
        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }
}
```

## Deployment Security

### Production Checklist

- [ ] **JWT Secret**: Generate cryptographically secure 256-bit secret
- [ ] **HTTPS Only**: All communication over TLS 1.3
- [ ] **CORS Policy**: Restrict origins to production domains
- [ ] **Rate Limiting**: Implement per-user and per-IP limits
- [ ] **Security Headers**: HSTS, CSP, X-Frame-Options, etc.
- [ ] **Token Rotation**: Implement refresh token rotation
- [ ] **Audit Logging**: Log all authentication events
- [ ] **Session Management**: Implement proper logout and session invalidation
- [ ] **Database Encryption**: Encrypt sensitive data at rest
- [ ] **Environment Isolation**: Separate secrets per environment

### Security Monitoring

```typescript
// Authentication event logging
interface AuthEvent {
  userId?: string;
  email?: string;
  action: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'TOKEN_REFRESH' | 'LOGOUT';
  ipAddress: string;
  userAgent: string;
  tenantId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

class SecurityLogger {
  static logAuthEvent(event: AuthEvent) {
    // Log to centralized logging system
    console.log(JSON.stringify({
      type: 'SECURITY_EVENT',
      severity: event.action.includes('FAILED') ? 'WARN' : 'INFO',
      ...event
    }));
    
    // Send to monitoring system
    this.sendToMonitoring(event);
  }
}
```

## Troubleshooting

### Common Issues

1. **Token Verification Failures**
   - Check JWT secret consistency across services
   - Verify token format and required claims
   - Confirm issuer/audience validation

2. **CORS Issues**
   - Update `CORS_ORIGINS` environment variable
   - Check preflight request handling
   - Verify credentials flag setting

3. **Multi-tenant Context Issues**
   - Confirm `tenantId`/`companyId` in JWT claims
   - Check ThreadLocal cleanup in Java backend
   - Verify middleware order in Node.js

4. **Session Management**
   - Implement proper token refresh logic
   - Handle concurrent session limits
   - Clear client storage on logout

This authentication system provides enterprise-grade security with horizontal scalability, comprehensive audit trails, and seamless multi-tenant operation across the dual-backend architecture.