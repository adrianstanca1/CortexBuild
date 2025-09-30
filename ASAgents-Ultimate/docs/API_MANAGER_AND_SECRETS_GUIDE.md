# ASAgents Platform - API Manager & Secrets Management System

## 🎯 **Overview**

This comprehensive system provides enterprise-grade API management and secrets handling for the ASAgents construction platform, ensuring maximum security, integrity, and functionality.

## 🏗️ **Architecture**

### **Core Managers**

1. **SecurityManager** - Encryption, validation, and security utilities
2. **SecretsManager** - Secure secrets storage and management
3. **APIManager** - Comprehensive API request/response handling
4. **ConfigurationManager** - Environment and feature flag management
5. **MonitoringManager** - Logging, metrics, and alerting
6. **ManagersIntegration** - Unified integration layer

### **Key Features**

- 🔐 **AES-256-GCM Encryption** with PBKDF2 key derivation
- 🛡️ **Multi-layer Security** with rate limiting, validation, and sanitization
- 🔄 **Automatic Secret Rotation** with configurable intervals
- 📊 **Comprehensive Monitoring** with metrics and alerts
- ⚡ **High Performance** with intelligent caching
- 🌍 **Environment Management** with feature flags
- 🔌 **Easy Integration** with existing Express applications

## 🚀 **Quick Start**

### **1. Installation**

```bash
# Install required dependencies
npm install express jsonwebtoken express-rate-limit helmet cors
npm install --save-dev @types/express @types/jsonwebtoken
```

### **2. Basic Setup**

```typescript
import { ManagersIntegration } from './services/managers/ManagersIntegration';
import { getCompleteManagersConfig } from './config/managers-config';

// Initialize managers
const config = getCompleteManagersConfig('production');
const managers = await ManagersIntegration.initialize(config);

// Create secure API endpoint
managers.createSecureEndpoint('/api/users', 'GET', async (req, res) => {
  const users = await getUsersFromDatabase();
  res.json({ users });
}, {
  authentication: true,
  permissions: ['users:read'],
  rateLimit: { requests: 100, windowMs: 60000 }
});
```

### **3. Environment Configuration**

```bash
# Required environment variables
MASTER_ENCRYPTION_KEY=your-256-bit-encryption-key
JWT_ACCESS_SECRET=your-jwt-access-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret
NODE_ENV=production
```

## 🔐 **Secrets Management**

### **Storing Secrets**

```typescript
// Store a secret securely
await managers.secrets.setSecret(
  'database_password',
  'super-secure-password',
  {
    type: 'database_credential',
    environment: 'production',
    description: 'Main database password',
    rotationInterval: 90, // days
    permissions: ['admin:database']
  }
);
```

### **Retrieving Secrets**

```typescript
// Get a secret
const dbPassword = await managers.secrets.getSecret(
  'database_password',
  'production'
);
```

### **Secret Rotation**

```typescript
// Rotate a specific secret
const newPassword = await managers.secrets.rotateSecret(
  'database_password',
  'production'
);

// Rotate all secrets
const result = await managers.rotateAllSecrets('production');
console.log(`Rotated: ${result.rotated.length}, Failed: ${result.failed.length}`);
```

## 🌐 **API Management**

### **Creating Secure Endpoints**

```typescript
// Full-featured secure endpoint
managers.createSecureEndpoint('/api/projects', 'POST', async (req, res) => {
  const project = await createProject(req.body);
  res.json({ project });
}, {
  authentication: true,
  permissions: ['projects:create'],
  validation: {
    body: {
      required: ['name', 'description'],
      properties: {
        name: { type: 'string', minLength: 1 },
        description: { type: 'string', maxLength: 1000 }
      }
    }
  },
  rateLimit: { requests: 50, windowMs: 60000 },
  caching: true
});
```

### **API Key Management**

```typescript
// Generate API key
const apiKey = await managers.api.generateAPIKey(
  'Mobile App Key',
  userId,
  ['projects:read', 'tasks:read'],
  ['user:profile'],
  { requests: 1000, windowMs: 60000 },
  new Date('2024-12-31')
);

// Validate API key
const validKey = await managers.api.validateAPIKey(apiKeyString);
```

### **Middleware Usage**

```typescript
import express from 'express';
const app = express();

// Apply security middleware
app.use(managers.api.securityHeadersMiddleware());
app.use('/api', managers.api.authenticationMiddleware());
app.use('/api', managers.api.rateLimitMiddleware());
app.use('/api', managers.api.responseFormattingMiddleware());
```

## ⚙️ **Configuration Management**

### **Setting Configuration**

```typescript
// Set configuration values
await managers.config.setConfig('api_timeout', 30000, 'production', {
  description: 'API request timeout in milliseconds',
  validation: { min: 1000, max: 60000 }
});

// Set secret configuration
await managers.config.setConfig('smtp_password', 'secret-password', 'production', {
  isSecret: true,
  description: 'SMTP server password'
});
```

### **Feature Flags**

```typescript
// Set feature flag
managers.config.setFeatureFlag('new_dashboard', true, 'production', {
  percentage: 50, // 50% rollout
  userRole: ['admin', 'manager']
});

// Check feature flag
const isEnabled = managers.config.isFeatureEnabled('new_dashboard', 'production', {
  userId: 'user123',
  userRole: 'admin'
});
```

### **Configuration Watching**

```typescript
// Watch for configuration changes
const unwatch = managers.config.watchConfig('api_timeout', (newValue, environment) => {
  console.log(`API timeout changed to ${newValue} in ${environment}`);
  updateAPITimeout(newValue);
});
```

## 📊 **Monitoring & Logging**

### **Logging**

```typescript
// Different log levels
managers.monitoring.info('User logged in', 'auth', { userId: '123' });
managers.monitoring.warn('High memory usage', 'system', { usage: '85%' });
managers.monitoring.error('Database connection failed', error, 'database');

// Security events
managers.monitoring.logSecurityEvent(
  'suspicious_login',
  'high',
  { attempts: 5, ip: '192.168.1.1' },
  userId,
  ipAddress
);
```

### **Metrics**

```typescript
// Record metrics
managers.monitoring.recordMetric('api_requests', 1, 'counter', { endpoint: '/api/users' });
managers.monitoring.recordGauge('active_users', 150);
managers.monitoring.recordTimer('database_query_time', 250);

// Timer helper
const endTimer = managers.monitoring.startTimer('expensive_operation');
await performExpensiveOperation();
endTimer(); // Automatically records the duration
```

### **Alerts**

```typescript
// Create alerts
managers.monitoring.createAlert(
  'high_error_rate',
  'API error rate > 5%',
  5,
  'critical',
  ['email', 'slack']
);

// Trigger alerts
managers.monitoring.triggerAlert(
  'high_error_rate',
  'API error rate exceeded threshold',
  'critical',
  { currentRate: '7%' }
);
```

## 🛡️ **Security Features**

### **Encryption**

```typescript
// Encrypt sensitive data
const encrypted = await managers.security.encrypt('sensitive-data', masterKey);

// Decrypt data
const decrypted = await managers.security.decrypt(encrypted, masterKey);

// Generate secure tokens
const apiKey = managers.security.generateAPIKey('ak');
const token = managers.security.generateSecureToken(32);
```

### **Validation**

```typescript
// Password validation
const validation = managers.security.validatePassword('MyPassword123!');
if (!validation.isValid) {
  console.log('Password errors:', validation.errors);
}

// Input sanitization
const clean = managers.security.sanitizeInput(userInput);

// Email validation
const isValid = managers.security.validateEmail('user@example.com');
```

### **Security Headers**

```typescript
// Get security headers
const headers = managers.security.getSecurityHeaders();
// Automatically includes: CSP, HSTS, X-Frame-Options, etc.
```

## 🔧 **Advanced Usage**

### **Health Monitoring**

```typescript
// Perform health check
const health = await managers.performHealthCheck();
console.log(`System status: ${health.overall}`);

// Get system statistics
const stats = managers.getSystemStats();
console.log('System stats:', stats);
```

### **Data Export/Import**

```typescript
// Export system configuration
const config = await managers.exportSystemConfiguration('production');

// Export logs and metrics
const logs = managers.monitoring.exportLogs({ level: 'error' });
const metrics = managers.monitoring.exportMetrics('api_requests');
```

### **Graceful Shutdown**

```typescript
// Graceful shutdown
process.on('SIGTERM', async () => {
  await managers.shutdown();
  process.exit(0);
});
```

## 📁 **File Structure**

```
services/managers/
├── SecurityManager.ts          # Encryption & security utilities
├── SecretsManager.ts          # Secrets storage & management
├── APIManager.ts              # API request/response handling
├── ConfigurationManager.ts    # Configuration & feature flags
├── MonitoringManager.ts       # Logging, metrics & alerts
└── ManagersIntegration.ts     # Unified integration layer

types/
└── managers.ts                # TypeScript type definitions

config/
└── managers-config.ts         # Configuration presets

examples/
└── managers-usage-example.ts  # Complete usage example

docs/
└── API_MANAGER_AND_SECRETS_GUIDE.md  # This documentation
```

## 🎯 **Production Deployment**

### **Environment Variables**

```bash
# Required
MASTER_ENCRYPTION_KEY=your-256-bit-key
JWT_ACCESS_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
NODE_ENV=production

# Optional
SECRETS_STORAGE_PATH=/secure/secrets
API_RATE_LIMIT_REQUESTS=1000
MONITORING_ENABLED=true
```

### **Security Checklist**

- ✅ Use strong encryption keys (256-bit minimum)
- ✅ Enable secret rotation in production
- ✅ Configure proper rate limiting
- ✅ Set up monitoring alerts
- ✅ Use HTTPS in production
- ✅ Implement proper CORS policies
- ✅ Enable audit logging
- ✅ Regular security audits

## 🆘 **Troubleshooting**

### **Common Issues**

1. **Secrets not found**: Check environment and key names
2. **Authentication failures**: Verify JWT secrets and API keys
3. **Rate limiting**: Adjust limits or implement user-specific limits
4. **Performance issues**: Enable caching and optimize queries

### **Debug Mode**

```typescript
// Enable debug logging
managers.monitoring.debug('Debug information', 'category', { data: 'value' });

// Check manager health
const health = await managers.performHealthCheck();
```

## 📞 **Support**

For issues or questions:
1. Check the logs: `managers.monitoring.getLogs({ level: 'error' })`
2. Review health status: `await managers.performHealthCheck()`
3. Check system stats: `managers.getSystemStats()`

---

**🎉 Your ASAgents platform now has enterprise-grade API management and secrets handling!**
