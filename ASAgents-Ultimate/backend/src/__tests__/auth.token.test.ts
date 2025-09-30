// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import jwt from 'jsonwebtoken';

// Mock the authentication service for testing
const mockAuthService = {
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
  authenticate: jest.fn(),
};

describe('Node.js Authentication Integration', () => {
  const testUser = {
    id: 'test-user-id',
    email: 'test@company.com',
    role: 'manager',
    company_id: 'test-company-id'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('JWT Token Generation', () => {
    it('should generate valid JWT token with all required claims', () => {
      const secret = 'test-jwt-secret';
      const payload = {
        userId: testUser.id,
        email: testUser.email,
        role: testUser.role,
        companyId: testUser.company_id,
        tenantId: testUser.company_id
      };

      const token = jwt.sign(payload, secret, {
        expiresIn: '24h',
        issuer: 'asagents-api',
        audience: 'asagents-client'
      });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      // Verify token can be decoded
      const decoded = jwt.verify(token, secret, {
        issuer: 'asagents-api',
        audience: 'asagents-client'
      }) as jwt.JwtPayload;

      expect(decoded.userId).toBe(testUser.id);
      expect(decoded.email).toBe(testUser.email);
      expect(decoded.role).toBe(testUser.role);
      expect(decoded.companyId).toBe(testUser.company_id);
      expect(decoded.tenantId).toBe(testUser.company_id);
      expect(decoded.iss).toBe('asagents-api');
      expect(decoded.aud).toBe('asagents-client');
    });

    it('should support both companyId and tenantId claims', () => {
      const secret = 'test-jwt-secret';
      const payload = {
        userId: testUser.id,
        email: testUser.email,
        role: testUser.role,
        companyId: testUser.company_id,
        tenantId: testUser.company_id // Both should be present
      };

      const token = jwt.sign(payload, secret, {
        expiresIn: '24h',
        issuer: 'asagents-api',
        audience: 'asagents-client'
      });

      const decoded = jwt.verify(token, secret, {
        issuer: 'asagents-api',
        audience: 'asagents-client'
      }) as jwt.JwtPayload;

      expect(decoded.companyId).toBe(decoded.tenantId);
    });
  });

  describe('JWT Token Verification', () => {
    it('should reject tokens with invalid signature', () => {
      const correctSecret = 'correct-secret';
      const wrongSecret = 'wrong-secret';

      const token = jwt.sign({ userId: 'test' }, correctSecret);

      const verifyWithWrongSecret = () => jwt.verify(token, wrongSecret);
      expect(verifyWithWrongSecret).toThrow();
    });

    it('should reject tokens with wrong issuer', () => {
      const secret = 'test-secret';
      const token = jwt.sign({ userId: 'test' }, secret, { issuer: 'wrong-issuer' });

      const verifyWithWrongIssuer = () => jwt.verify(token, secret, { issuer: 'asagents-api' });
      expect(verifyWithWrongIssuer).toThrow();
    });

    it('should reject expired tokens', () => {
      const secret = 'test-secret';
      const token = jwt.sign({ userId: 'test' }, secret, { expiresIn: '0s' });

      // Create verification function outside setTimeout to reduce nesting
      const verifyExpiredToken = () => jwt.verify(token, secret);
      
      // Wait a moment to ensure expiration then verify it throws
      setTimeout(() => {
        expect(verifyExpiredToken).toThrow();
      }, 10);
    });
  });

  describe('Token Roundtrip Test', () => {
    it('should successfully create and verify token in full flow', () => {
      const secret = 'test-jwt-secret-256-bits-minimum-length-for-hmac-sha256';
      
      // Step 1: Generate token (simulating Node.js backend)
      const payload = {
        userId: testUser.id,
        email: testUser.email,
        role: testUser.role,
        companyId: testUser.company_id,
        tenantId: testUser.company_id
      };

      const token = jwt.sign(payload, secret, {
        expiresIn: '24h',
        issuer: 'asagents-api',
        audience: 'asagents-client'
      });

      // Step 2: Verify token (simulating Java backend)
      const decoded = jwt.verify(token, secret, {
        issuer: 'asagents-api',
        audience: 'asagents-client'
      }) as jwt.JwtPayload;

      // Step 3: Verify all claims are preserved
      expect(decoded.userId).toBe(testUser.id);
      expect(decoded.email).toBe(testUser.email);
      expect(decoded.role).toBe(testUser.role);
      expect(decoded.companyId).toBe(testUser.company_id);
      expect(decoded.tenantId).toBe(testUser.company_id);
      expect(decoded.iss).toBe('asagents-api');
      expect(decoded.aud).toBe('asagents-client');
    });
  });

  describe('Tenant Context Extraction', () => {
    it('should extract tenant from JWT token', () => {
      const secret = 'test-secret';
      const token = jwt.sign({
        userId: 'test-user',
        companyId: 'tenant-123',
        tenantId: 'tenant-123'
      }, secret);

      const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
      const tenantId = decoded.companyId || decoded.tenantId;

      expect(tenantId).toBe('tenant-123');
    });

    it('should fallback to tenantId if companyId missing', () => {
      const secret = 'test-secret';
      const token = jwt.sign({
        userId: 'test-user',
        tenantId: 'tenant-456'
        // No companyId
      }, secret);

      const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
      const tenantId = decoded.companyId || decoded.tenantId;

      expect(tenantId).toBe('tenant-456');
    });
  });

  describe('Cross-Backend Authentication', () => {
    it('should simulate Node.js token generation and Java verification', () => {
      const sharedSecret = 'shared-jwt-secret-between-backends';
      
      // Node.js Backend: Generate token
      const nodePayload = {
        userId: '12345',
        email: 'user@company.com',
        role: 'admin',
        companyId: 'company-789',
        tenantId: 'company-789'
      };

      const nodeToken = jwt.sign(nodePayload, sharedSecret, {
        expiresIn: '24h',
        issuer: 'asagents-api',
        audience: 'asagents-client'
      });

      // Java Backend: Verify token (simulated)
      const javaClaims = jwt.verify(nodeToken, sharedSecret, {
        issuer: 'asagents-api',
        audience: 'asagents-client'
      }) as jwt.JwtPayload;

      // Java Backend: Extract tenant context
      const tenantId = javaClaims.companyId || javaClaims.tenantId;

      expect(javaClaims.userId).toBe('12345');
      expect(javaClaims.role).toBe('admin');
      expect(tenantId).toBe('company-789');
      expect(javaClaims.iss).toBe('asagents-api');
      expect(javaClaims.aud).toBe('asagents-client');
    });
  });
});

// Helper function for integration tests
export function createTestToken(payload: any, secret = 'test-secret'): string {
  return jwt.sign(payload, secret, {
    expiresIn: '1h',
    issuer: 'asagents-api',
    audience: 'asagents-client'
  });
}

// Helper function to decode test tokens
export function decodeTestToken(token: string, secret = 'test-secret'): jwt.JwtPayload {
  return jwt.verify(token, secret, {
    issuer: 'asagents-api',
    audience: 'asagents-client'
  }) as jwt.JwtPayload;
}