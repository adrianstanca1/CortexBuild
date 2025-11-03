// Authentication Middleware for CortexBuild 2.0
const jwt = require('jsonwebtoken');

// JWT Secret - In production, this should be from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-dev-secret-key-2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

class AuthMiddleware {
  constructor() {
    this.publicRoutes = [
      '/api/health',
      '/api/auth/login',
      '/api/auth/register',
      '/devops-report.json'
    ];
  }

  // Generate JWT token
  generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role || 'user',
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.error('Token verification error:', err);
      throw new Error('Invalid or expired token');
    }
  }

  // Extract token from request
  extractToken(req) {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    // Also check for token in cookies
    if (req.cookies && req.cookies.token) {
      return req.cookies.token;
    }
    
    return null;
  }

  // Check if route is public
  isPublicRoute(path) {
    return this.publicRoutes.some(route => {
      if (route.includes('*')) {
        const pattern = route.replace('*', '.*');
        return new RegExp(pattern).test(path);
      }
      return path === route || path.startsWith(route);
    });
  }

  // Main authentication middleware
  authenticate() {
    return (req, res, next) => {
      // Skip authentication for public routes
      if (this.isPublicRoute(req.path)) {
        return next();
      }

      const token = this.extractToken(req);
      
      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'No token provided'
        });
      }

      try {
        const decoded = this.verifyToken(token);
        req.user = decoded;
        next();
      } catch (error) {
        return res.status(401).json({
          success: false,
          error: 'Authentication failed',
          message: error.message
        });
      }
    };
  }

  // Role-based authorization middleware
  authorize(requiredRoles = []) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      if (requiredRoles.length === 0) {
        return next();
      }

      const userRole = req.user.role;
      if (!requiredRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          message: `Required roles: ${requiredRoles.join(', ')}`
        });
      }

      next();
    };
  }

  // Admin-only middleware
  requireAdmin() {
    return this.authorize(['admin']);
  }

  // User or admin middleware
  requireUser() {
    return this.authorize(['user', 'admin']);
  }

  // API key authentication for service-to-service calls
  authenticateApiKey() {
    return (req, res, next) => {
      const apiKey = req.headers['x-api-key'];
      const validApiKeys = [
        process.env.DEVOPS_API_KEY || 'devops-api-key-2024',
        process.env.MONITORING_API_KEY || 'monitoring-api-key-2024'
      ];

      if (!apiKey || !validApiKeys.includes(apiKey)) {
        return res.status(401).json({
          success: false,
          error: 'Invalid API key'
        });
      }

      req.apiKeyAuth = true;
      next();
    };
  }

  // Rate limiting middleware
  rateLimit(maxRequests = 100, windowMs = 15 * 60 * 1000) {
    const requests = new Map();

    return (req, res, next) => {
      const clientId = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      const windowStart = now - windowMs;

      // Clean old requests
      if (requests.has(clientId)) {
        const clientRequests = requests.get(clientId).filter(time => time > windowStart);
        requests.set(clientId, clientRequests);
      }

      const clientRequests = requests.get(clientId) || [];
      
      if (clientRequests.length >= maxRequests) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          message: `Maximum ${maxRequests} requests per ${windowMs / 1000} seconds`
        });
      }

      clientRequests.push(now);
      requests.set(clientId, clientRequests);
      next();
    };
  }

  // Input validation middleware
  validateInput(schema) {
    return (req, res, next) => {
      const { error } = schema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.details.map(detail => detail.message)
        });
      }
      
      next();
    };
  }

  // CSRF protection middleware
  csrfProtection() {
    return (req, res, next) => {
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        const csrfToken = req.headers['x-csrf-token'];
        const sessionToken = req.session?.csrfToken;

        if (!csrfToken || csrfToken !== sessionToken) {
          return res.status(403).json({
            success: false,
            error: 'CSRF token validation failed'
          });
        }
      }
      
      next();
    };
  }
}

// Demo user database (in production, this would be a real database)
const demoUsers = [
  {
    id: 'demo-user-123',
    email: 'demo@cortexbuild.com',
    password: 'demo-password-hash', // In production, this would be properly hashed
    role: 'admin',
    name: 'Demo User'
  },
  {
    id: 'user-456',
    email: 'user@cortexbuild.com',
    password: 'user-password-hash',
    role: 'user',
    name: 'Regular User'
  }
];

// Authentication helper functions
const authHelpers = {
  // Find user by email
  findUserByEmail(email) {
    return demoUsers.find(user => user.email === email);
  },

  // Find user by ID
  findUserById(id) {
    return demoUsers.find(user => user.id === id);
  },

  // Validate password (simplified for demo)
  validatePassword(password) {
    // In production, use bcrypt or similar with hashedPassword
    return password === 'demo-password' || password === 'user-password';
  },

  // Hash password (simplified for demo)
  hashPassword(password) {
    // In production, use bcrypt
    return password + '-hash';
  }
};

module.exports = {
  AuthMiddleware,
  authHelpers,
  JWT_SECRET
};
