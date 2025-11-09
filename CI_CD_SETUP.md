# CI/CD Pipeline Setup

## Overview

CortexBuild uses GitHub Actions for continuous integration and deployment. The pipeline automatically runs tests, generates coverage reports, builds the application, and deploys to Vercel.

## Pipeline Stages

### 1. Test Stage

**Runs on**: Every push and pull request to `main` and `develop` branches

**Matrix Testing**:

- Node.js 18.x
- Node.js 20.x

**Steps**:

1. Checkout code
2. Setup Node.js with caching
3. Install dependencies (`npm ci`)
4. Run linter (if available, non-blocking)
5. Run all tests (`npm test`)
6. Generate coverage report (`npm run test:coverage`)
7. Upload coverage to Codecov
8. Display coverage summary in GitHub Actions UI

**Current Test Status**:

```
✅ 27/27 tests passing (100% pass rate)
├── LoginForm.test.tsx: 5 tests
├── api.test.ts: 11 tests
└── Icons.test.tsx: 11 tests
```

**Current Coverage Status**:

```
Overall Coverage: 55.85%
├── Icons.tsx:        76.92% ✅ (exceeds 70% target)
├── LoginForm.tsx:    54.16% ⚠️  (needs improvement)
└── validation.ts:    25.71% ⚠️  (major gap)

Branch Coverage:   23.8%
Function Coverage: 53.73%
Line Coverage:     55.65%
```

**Coverage Targets**:

- **Current**: 55.85%
- **Target**: 70%+
- **Gap**: +14.15% needed

### 2. Build Stage

**Runs on**: After successful test stage

**Steps**:

1. Checkout code
2. Setup Node.js 20.x
3. Install dependencies
4. Build frontend (`npm run build`)
5. Upload build artifacts (retained 7 days)

**Build Outputs**:

- `dist/` - Production frontend build via Vite
- Static assets optimized and minified
- Source maps generated for debugging

### 3. Deploy Preview Stage

**Runs on**: Pull requests only

**Platform**: Vercel Preview Deployments

**Steps**:

1. Checkout code
2. Deploy to Vercel preview environment
3. Generate unique preview URL
4. Comment preview URL on PR (automatic)

**Required Secrets**:

- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID

### 4. Deploy Production Stage

**Runs on**: Push to `main` branch only (after successful build)

**Platform**: Vercel Production

**Steps**:

1. Checkout code
2. Deploy to Vercel production with `--prod` flag
3. Automatic domain update (cortexbuild.com)

**Environment Variables** (set in Vercel dashboard):

- `POSTGRES_URL` - Database connection string
- `JWT_SECRET` - JWT signing secret
- `OPENAI_API_KEY` - OpenAI API key
- `GEMINI_API_KEY` - Google Gemini API key
- `ANTHROPIC_API_KEY` - Anthropic Claude API key
- `NEXT_PUBLIC_ENABLE_AI_AGENTS` - Feature flag for AI
- `ENABLE_SDK_DEVELOPER` - Feature flag for SDK platform

### 5. Security Scan Stage

**Runs on**: Every push (parallel with test stage)

**Steps**:

1. Run `npm audit` with moderate severity threshold
2. Check for high severity vulnerabilities
3. Generate audit report (non-blocking)

**Security Policies**:

- High severity vulnerabilities trigger warnings
- Critical vulnerabilities should block deployment (manual review)
- Regular dependency updates via Dependabot

## GitHub Secrets Configuration

### Required Secrets

Navigate to **Settings → Secrets and variables → Actions** and add:

```
VERCEL_TOKEN=<your-vercel-token>
VERCEL_ORG_ID=<your-org-id>
VERCEL_PROJECT_ID=<your-project-id>
```

### Getting Vercel Credentials

1. **VERCEL_TOKEN**:

   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login and generate token
   vercel login
   vercel whoami --token
   ```

   Or via Vercel Dashboard: Settings → Tokens → Create Token

2. **VERCEL_ORG_ID & VERCEL_PROJECT_ID**:

   ```bash
   # Link project
   vercel link
   
   # View project settings
   cat .vercel/project.json
   ```

   Extract `orgId` and `projectId` from the JSON output.

## Local Development Workflow

### Running Tests Locally

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- tests/LoginForm.test.tsx
```

### Pre-commit Checklist

Before pushing code:

```bash
# 1. Run tests
npm test

# 2. Check coverage
npm run test:coverage
# Ensure overall coverage ≥55% (working toward 70%)

# 3. Run linter (if available)
npm run lint

# 4. Build locally
npm run build

# 5. Commit and push
git add .
git commit -m "Your message"
git push origin your-branch
```

## Pull Request Workflow

1. **Create Feature Branch**:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes & Test**:

   ```bash
   npm test
   npm run test:coverage
   ```

3. **Push to GitHub**:

   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create Pull Request**:
   - GitHub Actions automatically runs CI pipeline
   - Vercel creates preview deployment
   - Review test results and coverage report
   - Preview URL posted as comment on PR

5. **Code Review**:
   - Request review from team members
   - Address feedback and push updates
   - CI/CD re-runs automatically on each push

6. **Merge to Main**:
   - Once approved, merge PR
   - Production deployment triggers automatically
   - Monitor deployment in Vercel dashboard

## Improving Coverage

### Priority Areas for Test Coverage

**1. validation.ts (Currently 25.71%)**

- Test `validateEmail()` with valid/invalid emails
- Test `validatePassword()` with various lengths
- Test `validateName()` with edge cases
- Expected gain: +15-20% overall coverage

**2. LoginForm.tsx SSO Handlers (Currently 54.16%)**

- Test Google OAuth button click (lines 58-69)
- Test GitHub OAuth button click (lines 70-87)
- Test registration flow (lines 184-206)
- Test form state edge cases
- Expected gain: +5-10% overall coverage

**3. Branch Coverage (Currently 23.8%)**

- Add edge case tests for error paths
- Test conditional logic branches
- Test error handling code paths
- Expected gain: Branch coverage to 50%+

### Test Writing Guidelines

```typescript
// Example: Testing validation functions
import { validateEmail, validatePassword } from '../utils/validation';

describe('validateEmail', () => {
  it('should accept valid emails', () => {
    expect(validateEmail('user@example.com')).toEqual({
      isValid: true,
      errors: []
    });
  });

  it('should reject invalid emails', () => {
    const result = validateEmail('invalid-email');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should reject empty emails', () => {
    const result = validateEmail('');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Email is required');
  });
});
```

## Monitoring & Debugging

### GitHub Actions Dashboard

- View workflow runs: **Actions** tab in GitHub repo
- Click on workflow run to see detailed logs
- Download artifacts from successful builds

### Vercel Deployments

- View deployments: Vercel dashboard → Deployments
- Check deployment logs for errors
- Monitor function logs for serverless routes

### Coverage Reports

- Coverage summary displayed in GitHub Actions
- Detailed HTML report: `coverage/index.html` (local only)
- Codecov integration: <https://codecov.io/gh/your-org/cortexbuild>

### Common Issues

**1. Tests Failing in CI but Pass Locally**

- Check Node.js version matches (18.x or 20.x)
- Ensure `npm ci` installs exact versions from package-lock.json
- Check for environment-specific issues (timezone, file paths)

**2. Build Fails in CI**

- Review build logs in GitHub Actions
- Ensure all dependencies are listed in package.json
- Check for TypeScript errors: `npx tsc --noEmit`

**3. Deployment Fails**

- Verify Vercel secrets are configured correctly
- Check Vercel project settings match configuration
- Review Vercel deployment logs

**4. Coverage Drops Below Target**

- Run `npm run test:coverage` locally
- Identify uncovered files in coverage report
- Add tests for critical uncovered code
- Aim for 70%+ overall coverage before merging

## Continuous Improvement

### Monthly Tasks

- [ ] Review and update dependencies
- [ ] Check for security vulnerabilities
- [ ] Review coverage trends
- [ ] Update Node.js version if needed

### Quarterly Tasks

- [ ] Review and optimize CI/CD pipeline
- [ ] Update GitHub Actions versions
- [ ] Review Vercel deployment settings
- [ ] Audit test suite performance

### Coverage Milestones

- ✅ **Current**: 55.85% (27 tests)
- 🎯 **Q1 2025**: 70% (add validation & LoginForm tests)
- 🎯 **Q2 2025**: 80% (full component coverage)
- 🎯 **Q3 2025**: 90% (integration tests)

## Status Badges

Add to README.md:

```markdown
![CI/CD](https://github.com/your-org/cortexbuild/workflows/CI%2FCD%20Pipeline/badge.svg)
![Coverage](https://codecov.io/gh/your-org/cortexbuild/branch/main/graph/badge.svg)
![Deployment](https://img.shields.io/badge/deployment-vercel-black)
```

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment Documentation](https://vercel.com/docs)
- [Vitest Testing Guide](https://vitest.dev/guide/)
- [Coverage Best Practices](https://vitest.dev/guide/coverage.html)

## Support

For CI/CD issues:

1. Check workflow logs in GitHub Actions
2. Review this documentation
3. Contact DevOps team
4. Open issue in GitHub repository

---

**Last Updated**: January 2025
**Pipeline Version**: 1.0
**Maintained By**: CortexBuild DevOps Team
