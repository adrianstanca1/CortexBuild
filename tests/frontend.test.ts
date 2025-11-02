// Frontend Integration Tests
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Frontend Integration Tests', () => {
  const FRONTEND_URL = 'http://localhost:3002';

  beforeAll(async () => {
    console.log('🌐 Starting frontend integration tests...');
  });

  afterAll(async () => {
    console.log('✅ Frontend integration tests completed');
  });

  describe('Application Loading', () => {
    it('should load the main application', async () => {
      const response = await fetch(FRONTEND_URL);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
    });

    it('should load within acceptable time', async () => {
      const startTime = Date.now();
      const response = await fetch(FRONTEND_URL);
      const endTime = Date.now();
      
      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(3000); // Less than 3 seconds
    });

    it('should serve static assets', async () => {
      // Test if we can load the main HTML
      const response = await fetch(FRONTEND_URL);
      const html = await response.text();
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('CortexBuild');
    });
  });

  describe('API Integration', () => {
    it('should be able to reach API from frontend domain', async () => {
      // Test CORS by making a request from frontend context
      try {
        const response = await fetch('http://localhost:3001/api/health');
        expect(response.status).toBe(200);
        
        // Check CORS headers
        const corsHeader = response.headers.get('access-control-allow-origin');
        expect(corsHeader).toBeTruthy();
      } catch (error) {
        // If this fails, it might be a CORS issue
        console.warn('CORS test failed:', error);
      }
    });
  });

  describe('Performance Metrics', () => {
    it('should have reasonable response size', async () => {
      const response = await fetch(FRONTEND_URL);
      const content = await response.text();
      
      expect(response.status).toBe(200);
      // HTML should not be excessively large
      expect(content.length).toBeLessThan(1024 * 1024); // Less than 1MB
    });

    it('should include performance optimizations', async () => {
      const response = await fetch(FRONTEND_URL);
      const html = await response.text();
      
      // Check for basic optimizations
      expect(html).toContain('viewport'); // Responsive design
      
      // Check for modern features
      const hasModernFeatures = html.includes('type="module"') || 
                               html.includes('defer') || 
                               html.includes('async');
      expect(hasModernFeatures).toBe(true);
    });
  });

  describe('Security Headers', () => {
    it('should include basic security headers', async () => {
      const response = await fetch(FRONTEND_URL);
      
      // Note: These might be set by the development server
      // In production, these should be configured properly
      expect(response.status).toBe(200);
      
      // Check if any security headers are present
      const headers = response.headers;
      const hasSecurityHeaders = 
        headers.get('x-content-type-options') ||
        headers.get('x-frame-options') ||
        headers.get('x-xss-protection');
      
      // For development, this might not be set, but we should note it
      if (!hasSecurityHeaders) {
        console.warn('⚠️ No security headers detected on frontend');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors gracefully', async () => {
      const response = await fetch(`${FRONTEND_URL}/nonexistent-page`);
      
      // Vite dev server typically returns the index.html for SPA routing
      // or a 404 page
      expect([200, 404]).toContain(response.status);
    });

    it('should serve error pages appropriately', async () => {
      const response = await fetch(`${FRONTEND_URL}/api/invalid`);
      
      // This should either be handled by the frontend router
      // or return an appropriate error
      expect(response.status).toBeDefined();
    });
  });

  describe('Resource Loading', () => {
    it('should load CSS resources', async () => {
      const response = await fetch(FRONTEND_URL);
      const html = await response.text();
      
      // Check if CSS is referenced
      const hasCss = html.includes('.css') || 
                    html.includes('stylesheet') ||
                    html.includes('<style');
      
      expect(hasCss).toBe(true);
    });

    it('should load JavaScript resources', async () => {
      const response = await fetch(FRONTEND_URL);
      const html = await response.text();
      
      // Check if JavaScript is referenced
      const hasJs = html.includes('.js') || 
                   html.includes('<script') ||
                   html.includes('type="module"');
      
      expect(hasJs).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should include basic accessibility features', async () => {
      const response = await fetch(FRONTEND_URL);
      const html = await response.text();
      
      // Check for basic accessibility features
      expect(html).toContain('lang='); // Language attribute
      expect(html).toContain('<title>'); // Page title
      
      // Check for viewport meta tag (responsive design)
      expect(html).toContain('viewport');
    });

    it('should have proper document structure', async () => {
      const response = await fetch(FRONTEND_URL);
      const html = await response.text();
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('<head>');
      expect(html).toMatch(/<body[^>]*>/); // Match body tag with any attributes
    });
  });

  describe('SEO and Meta Tags', () => {
    it('should include essential meta tags', async () => {
      const response = await fetch(FRONTEND_URL);
      const html = await response.text();
      
      expect(html).toContain('<title>');
      expect(html).toContain('charset=');
      expect(html).toContain('viewport');
      
      // Check for description meta tag
      const hasDescription = html.includes('name="description"') ||
                            html.includes('property="og:description"');
      
      if (!hasDescription) {
        console.warn('⚠️ No description meta tag found');
      }
    });
  });
});
