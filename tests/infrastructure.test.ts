// Infrastructure Configuration Tests
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Infrastructure Configuration', () => {
  const rootDir = process.cwd();

  describe('Docker Configuration', () => {
    it('should have a valid Dockerfile', () => {
      const dockerfilePath = join(rootDir, 'Dockerfile');
      expect(existsSync(dockerfilePath)).toBe(true);
      
      const dockerfile = readFileSync(dockerfilePath, 'utf-8');
      expect(dockerfile).toContain('FROM node:18-alpine');
      expect(dockerfile).toContain('WORKDIR /app');
      expect(dockerfile).toContain('EXPOSE 3000 3001');
      expect(dockerfile).toContain('USER cortexbuild');
      expect(dockerfile).toContain('HEALTHCHECK');
    });

    it('should have a valid docker-compose.yml', () => {
      const composePath = join(rootDir, 'docker-compose.yml');
      expect(existsSync(composePath)).toBe(true);
      
      const compose = readFileSync(composePath, 'utf-8');
      expect(compose).toContain('version: \'3.8\'');
      expect(compose).toContain('cortexbuild-app:');
      expect(compose).toContain('postgres:');
      expect(compose).toContain('redis:');
      expect(compose).toContain('nginx:');
      expect(compose).toContain('prometheus:');
      expect(compose).toContain('grafana:');
    });

    it('should have proper service dependencies', () => {
      const composePath = join(rootDir, 'docker-compose.yml');
      const compose = readFileSync(composePath, 'utf-8');
      
      expect(compose).toContain('depends_on:');
      expect(compose).toContain('- postgres');
      expect(compose).toContain('- redis');
      expect(compose).toContain('networks:');
      expect(compose).toContain('cortexbuild-network');
    });

    it('should have health checks configured', () => {
      const composePath = join(rootDir, 'docker-compose.yml');
      const compose = readFileSync(composePath, 'utf-8');
      
      expect(compose).toContain('healthcheck:');
      expect(compose).toContain('test:');
      expect(compose).toContain('interval:');
      expect(compose).toContain('timeout:');
      expect(compose).toContain('retries:');
    });
  });

  describe('Nginx Configuration', () => {
    it('should have nginx configuration file', () => {
      const nginxPath = join(rootDir, 'nginx', 'nginx.conf');
      expect(existsSync(nginxPath)).toBe(true);
      
      const nginx = readFileSync(nginxPath, 'utf-8');
      expect(nginx).toContain('upstream cortexbuild_app');
      expect(nginx).toContain('upstream cortexbuild_api');
      expect(nginx).toContain('ssl_certificate');
      expect(nginx).toContain('proxy_pass');
    });

    it('should have security headers configured', () => {
      const nginxPath = join(rootDir, 'nginx', 'nginx.conf');
      const nginx = readFileSync(nginxPath, 'utf-8');
      
      expect(nginx).toContain('X-Frame-Options DENY');
      expect(nginx).toContain('X-Content-Type-Options nosniff');
      expect(nginx).toContain('X-XSS-Protection');
      expect(nginx).toContain('Content-Security-Policy');
      expect(nginx).toContain('Referrer-Policy');
    });

    it('should have rate limiting configured', () => {
      const nginxPath = join(rootDir, 'nginx', 'nginx.conf');
      const nginx = readFileSync(nginxPath, 'utf-8');
      
      expect(nginx).toContain('limit_req_zone');
      expect(nginx).toContain('limit_req zone=api');
      expect(nginx).toContain('limit_req zone=login');
    });

    it('should have SSL/TLS configuration', () => {
      const nginxPath = join(rootDir, 'nginx', 'nginx.conf');
      const nginx = readFileSync(nginxPath, 'utf-8');
      
      expect(nginx).toContain('listen 443 ssl http2');
      expect(nginx).toContain('ssl_protocols TLSv1.2 TLSv1.3');
      expect(nginx).toContain('ssl_ciphers');
      expect(nginx).toContain('ssl_session_cache');
    });

    it('should have gzip compression enabled', () => {
      const nginxPath = join(rootDir, 'nginx', 'nginx.conf');
      const nginx = readFileSync(nginxPath, 'utf-8');
      
      expect(nginx).toContain('gzip on');
      expect(nginx).toContain('gzip_vary on');
      expect(nginx).toContain('gzip_types');
      expect(nginx).toContain('gzip_comp_level');
    });
  });

  describe('Database Configuration', () => {
    it('should have database initialization script', () => {
      const initPath = join(rootDir, 'database', 'init.sql');
      expect(existsSync(initPath)).toBe(true);
      
      const initSql = readFileSync(initPath, 'utf-8');
      expect(initSql).toContain('CREATE TABLE IF NOT EXISTS users');
      expect(initSql).toContain('CREATE TABLE IF NOT EXISTS projects');
      expect(initSql).toContain('CREATE TABLE IF NOT EXISTS tasks');
      expect(initSql).toContain('CREATE TABLE IF NOT EXISTS chat_messages');
    });

    it('should have proper database indexes', () => {
      const initPath = join(rootDir, 'database', 'init.sql');
      const initSql = readFileSync(initPath, 'utf-8');
      
      expect(initSql).toContain('CREATE INDEX IF NOT EXISTS');
      expect(initSql).toContain('idx_users_email');
      expect(initSql).toContain('idx_projects_owner');
      expect(initSql).toContain('idx_tasks_project');
    });

    it('should have UUID extension enabled', () => {
      const initPath = join(rootDir, 'database', 'init.sql');
      const initSql = readFileSync(initPath, 'utf-8');
      
      expect(initSql).toContain('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      expect(initSql).toContain('uuid_generate_v4()');
    });

    it('should have audit logging configured', () => {
      const initPath = join(rootDir, 'database', 'init.sql');
      const initSql = readFileSync(initPath, 'utf-8');
      
      expect(initSql).toContain('CREATE TABLE IF NOT EXISTS audit_logs');
      expect(initSql).toContain('action VARCHAR(100)');
      expect(initSql).toContain('resource_type VARCHAR(50)');
      expect(initSql).toContain('old_values JSONB');
      expect(initSql).toContain('new_values JSONB');
    });
  });

  describe('CI/CD Configuration', () => {
    it('should have GitHub Actions workflow', () => {
      const workflowPath = join(rootDir, '.github', 'workflows', 'ci-cd.yml');
      expect(existsSync(workflowPath)).toBe(true);
      
      const workflow = readFileSync(workflowPath, 'utf-8');
      expect(workflow).toContain('name: CortexBuild CI/CD');
      expect(workflow).toContain('on:');
      expect(workflow).toContain('jobs:');
    });

    it('should have test job configured', () => {
      const workflowPath = join(rootDir, '.github', 'workflows', 'ci-cd.yml');
      const workflow = readFileSync(workflowPath, 'utf-8');
      
      expect(workflow).toContain('test:');
      expect(workflow).toContain('runs-on: ubuntu-latest');
      expect(workflow).toContain('npm ci');
      expect(workflow).toContain('npm run test');
    });

    it('should have security scanning configured', () => {
      const workflowPath = join(rootDir, '.github', 'workflows', 'ci-cd.yml');
      const workflow = readFileSync(workflowPath, 'utf-8');
      
      expect(workflow).toContain('security:');
      expect(workflow).toContain('trivy-action');
      expect(workflow).toContain('npm audit');
    });

    it('should have Docker build and push configured', () => {
      const workflowPath = join(rootDir, '.github', 'workflows', 'ci-cd.yml');
      const workflow = readFileSync(workflowPath, 'utf-8');
      
      expect(workflow).toContain('docker:');
      expect(workflow).toContain('docker/build-push-action');
      expect(workflow).toContain('ghcr.io');
    });

    it('should have deployment jobs configured', () => {
      const workflowPath = join(rootDir, '.github', 'workflows', 'ci-cd.yml');
      const workflow = readFileSync(workflowPath, 'utf-8');
      
      expect(workflow).toContain('deploy-staging:');
      expect(workflow).toContain('deploy-production:');
      expect(workflow).toContain('environment:');
    });
  });

  describe('Monitoring Configuration', () => {
    it('should have Prometheus configuration', () => {
      const prometheusPath = join(rootDir, 'monitoring', 'prometheus.yml');
      expect(existsSync(prometheusPath)).toBe(true);
      
      const prometheus = readFileSync(prometheusPath, 'utf-8');
      expect(prometheus).toContain('global:');
      expect(prometheus).toContain('scrape_configs:');
      expect(prometheus).toContain('cortexbuild-app');
      expect(prometheus).toContain('cortexbuild-api');
    });

    it('should have recording rules configured', () => {
      const prometheusPath = join(rootDir, 'monitoring', 'prometheus.yml');
      const prometheus = readFileSync(prometheusPath, 'utf-8');
      
      expect(prometheus).toContain('recording_rules:');
      expect(prometheus).toContain('cortexbuild:api_response_time_p95');
      expect(prometheus).toContain('cortexbuild:api_error_rate');
      expect(prometheus).toContain('cortexbuild:memory_usage_percent');
    });

    it('should monitor all critical services', () => {
      const prometheusPath = join(rootDir, 'monitoring', 'prometheus.yml');
      const prometheus = readFileSync(prometheusPath, 'utf-8');
      
      expect(prometheus).toContain('job_name: \'postgres\'');
      expect(prometheus).toContain('job_name: \'redis\'');
      expect(prometheus).toContain('job_name: \'nginx\'');
      expect(prometheus).toContain('job_name: \'node-exporter\'');
    });
  });

  describe('Environment Configuration', () => {
    it('should have production environment template', () => {
      const envPath = join(rootDir, '.env.production');
      expect(existsSync(envPath)).toBe(true);
      
      const env = readFileSync(envPath, 'utf-8');
      expect(env).toContain('NODE_ENV=production');
      expect(env).toContain('DATABASE_URL=');
      expect(env).toContain('JWT_SECRET=');
      expect(env).toContain('REDIS_URL=');
    });

    it('should have all required environment variables', () => {
      const envPath = join(rootDir, '.env.production');
      const env = readFileSync(envPath, 'utf-8');
      
      const requiredVars = [
        'NODE_ENV',
        'PORT',
        'API_PORT',
        'DATABASE_URL',
        'JWT_SECRET',
        'REDIS_URL',
        'GEMINI_API_KEY',
        'OPENAI_API_KEY'
      ];
      
      requiredVars.forEach(varName => {
        expect(env).toContain(`${varName}=`);
      });
    });

    it('should have security configuration', () => {
      const envPath = join(rootDir, '.env.production');
      const env = readFileSync(envPath, 'utf-8');
      
      expect(env).toContain('SESSION_SECRET=');
      expect(env).toContain('ENCRYPTION_KEY=');
      expect(env).toContain('CORS_ORIGIN=');
      expect(env).toContain('RATE_LIMIT_');
    });

    it('should have monitoring configuration', () => {
      const envPath = join(rootDir, '.env.production');
      const env = readFileSync(envPath, 'utf-8');
      
      expect(env).toContain('SENTRY_DSN=');
      expect(env).toContain('GRAFANA_PASSWORD=');
      expect(env).toContain('LOG_LEVEL=');
    });
  });
});
