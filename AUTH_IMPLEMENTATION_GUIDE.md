# Authentication Implementation Guide

Quick reference for implementing and maintaining the enhanced login system.

## Quick Start

### Environment Setup
```bash
# 1. Set required environment variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-key
JWT_SECRET=$(openssl rand -hex 32)

# 2. Install dependencies (already included)
npm install bcryptjs jsonwebtoken uuid @supabase/supabase-js

# 3. Run tests
npm test -- tests/auth-login.test.ts
```

---

## API Endpoint: POST /api/auth/login

### Request
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Request Body
```typescript
interface LoginRequest {
  email: string;      // Required, valid email format
  password: string;   // Required, 8-100 characters
}
```

### Success Response (200)
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user",
    "avatar": "https://...",
    "company_id": "company-uuid"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2025-11-10T23:53:04.000Z"
}
```

### Error Responses

#### Invalid Input (400)
```json
{
  "success": false,
  "error": "Invalid email or password format"
}
```

#### Invalid Credentials (401)
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

#### Rate Limited (429)
```json
{
  "success": false,
  "error": "Too many login attempts. Please try again later.",
  "retryAfter": "2025-11-10T00:08:00.000Z"
}
```

#### Server Error (500)
```json
{
  "success": false,
  "error": "Internal server error. Please try again later."
}
```

---

## Features Overview

### 1. Rate Limiting
- **Limit:** 5 login attempts per 15 minutes per IP
- **Response:** HTTP 429 with retry-after header
- **Headers:** X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

### 2. Input Validation
- Email: required, valid format, max 255 chars
- Password: required, 8-100 characters
- Error: generic message to prevent user enumeration

### 3. Security Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Content-Security-Policy: strict
- Referrer-Policy: strict-origin-when-cross-origin
- HSTS: enabled in production

### 4. Structured Logging
- Timestamps, log levels, context
- Request/response tracking
- Performance metrics
- Security events

---

## Code Integration

### Using the Login Token

```typescript
// 1. Login and get token
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { token, user, expiresAt } = await loginResponse.json();

// 2. Store token (currently localStorage, should move to HttpOnly cookie)
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));
localStorage.setItem('expiresAt', expiresAt);

// 3. Use token in API requests
const response = await fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Verifying Token on Backend

```typescript
import jwt from 'jsonwebtoken';

// In your API endpoint
const authHeader = req.headers.authorization;
const token = authHeader?.replace('Bearer ', '');

if (!token) {
  return res.status(401).json({ error: 'No token provided' });
}

try {
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  req.user = payload; // Now you have user info
} catch (error) {
  return res.status(401).json({ error: 'Invalid token' });
}
```

---

## Testing

### Run Tests
```bash
# Run auth tests only
npm test -- tests/auth-login.test.ts

# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Coverage
- 39 unit tests covering:
  - Input validation (7 tests)
  - Rate limiting (5 tests)
  - Security headers (5 tests)
  - Error handling (4 tests)
  - JWT generation (5 tests)
  - Response format (5 tests)
  - CORS (2 tests)
  - Logging (4 tests)
  - Environment (3 tests)
  - Integration (1 test)

### Manual Testing

```bash
# Test successful login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Test invalid email
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid", "password": "password123"}'

# Test rate limiting (5 quick requests)
for i in {1..6}; do
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com", "password": "wrongpass"}'
done
```

---

## Middleware Reference

### Validation Middleware
```typescript
import { validate, emailRule, passwordRule } from '../middleware/validation';

const errors = validate(
  { email, password },
  [emailRule, passwordRule]
);

if (errors.length > 0) {
  // Handle validation errors
}
```

### Rate Limiting Middleware
```typescript
import { loginRateLimit } from '../middleware/rateLimit';

const result = loginRateLimit(clientIp);
if (!result.allowed) {
  return res.status(429).json({
    error: 'Too many attempts',
    retryAfter: result.resetTime
  });
}
```

### Security Middleware
```typescript
import { setSecurityHeaders, getClientIp } from '../middleware/security';

// Set all security headers
setSecurityHeaders(res);

// Get client IP (handles proxies)
const ip = getClientIp(req);
```

### Logging Middleware
```typescript
import { logger, logRequest, logResponse } from '../middleware/logger';

logRequest('POST', '/api/auth/login', { ip });
logger.info('Login successful', { userId, email });
logger.error('Login failed', error, { email });
logResponse('POST', '/api/auth/login', 200, duration);
```

---

## Common Issues & Solutions

### Issue: JWT_SECRET not set
**Error:** `JWT_SECRET must be set in production`

**Solution:**
```bash
# Set environment variable
export JWT_SECRET=$(openssl rand -hex 32)

# Or in Vercel dashboard:
# Settings > Environment Variables > JWT_SECRET
```

### Issue: Supabase not configured
**Error:** `Service temporarily unavailable`

**Solution:**
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Both must be set for login to work
```

### Issue: Rate limited during testing
**Error:** `Too many login attempts`

**Solution:**
```bash
# Wait 15 minutes, or
# Change your test IP/client identifier, or
# Clear rate limit store (restart server in development)
```

### Issue: Token validation fails
**Error:** `Invalid token`

**Solution:**
```typescript
// Ensure token is sent correctly
const authHeader = req.headers.authorization;
const token = authHeader?.split('Bearer ')[1]; // Correct extraction

// Ensure JWT secret matches
// (Same secret used to generate and verify token)
```

---

## Performance Considerations

### Response Times
- Typical login: 50-200ms
- Rate limit check: <5ms
- Validation: <5ms
- Password verification: 100-150ms (bcrypt)
- Database query: 10-50ms
- Token generation: <5ms

### Optimization Tips
1. Cache frequently accessed user data
2. Use connection pooling for Supabase
3. Implement response caching for public endpoints
4. Monitor slow queries in database

---

## Security Checklist

- [ ] JWT_SECRET is set in production
- [ ] SUPABASE_SERVICE_ROLE_KEY is secure
- [ ] CORS_ORIGIN is restricted (not '*' in production)
- [ ] HTTPS enforced in production
- [ ] Rate limiting enabled
- [ ] Input validation enabled
- [ ] Security headers present
- [ ] Structured logging enabled
- [ ] Tests passing
- [ ] No hardcoded secrets in code

---

## Related Files

### Modified Files
- `api/auth/login.ts` - Main endpoint implementation

### Supporting Files
- `api/middleware/cors.ts` - CORS handling
- `api/middleware/security.ts` - Security headers & validation
- `api/middleware/rateLimit.ts` - Rate limiting logic
- `api/middleware/validation.ts` - Input validation rules
- `api/middleware/logger.ts` - Structured logging

### Test Files
- `tests/auth-login.test.ts` - Comprehensive test suite
- `tests/api.test.ts` - Integration tests

### Documentation
- `SECURITY_IMPROVEMENTS.md` - Detailed security documentation
- `AUTH_IMPLEMENTATION_GUIDE.md` - This file

---

## Development Workflow

### Local Development
```bash
# 1. Start development server
npm run dev

# 2. In another terminal, start backend
npm run server

# 3. Test endpoint
curl http://localhost:3001/api/auth/login

# 4. Run tests
npm test -- tests/auth-login.test.ts
```

### Before Committing
```bash
# 1. Run tests
npm test

# 2. Check linting
npm run lint

# 3. Build project
npm run build

# 4. Commit changes
git add .
git commit -m "feat: enhance login security"
```

### Deployment
```bash
# 1. Ensure all tests pass
npm test

# 2. Build for production
npm run build

# 3. Deploy to Vercel
npm run vercel:prod

# 4. Verify deployment
curl https://your-domain.vercel.app/api/auth/login
```

---

## Support

### Documentation
- SECURITY_IMPROVEMENTS.md - Full security details
- AUTH_IMPLEMENTATION_GUIDE.md - This file
- OWASP Authentication Cheat Sheet - Best practices

### Code Examples
All features are covered in tests: `tests/auth-login.test.ts`

### Getting Help
1. Check test suite for examples
2. Review middleware implementations
3. Check security documentation
4. Look at Vercel logs for detailed error messages

---

**Version:** 1.0
**Last Updated:** November 9, 2025
**Author:** Claude Code
