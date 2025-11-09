# Next Steps Checklist

## ✅ What's Already Done

- ✅ All 27 tests passing (100% pass rate)
- ✅ Coverage at 55.85% (up from 43.69%)
- ✅ CI/CD pipeline configured (.github/workflows/ci-cd.yml)
- ✅ Comprehensive documentation created
- ✅ GitHub Actions workflow ready to use

## 🎯 Immediate Next Steps (DO THESE NOW)

### 1. Increase Coverage to 70%+

**Priority 1: Test validation utilities** (Expected: +15-20% coverage)

```bash
# Create tests/validation.test.ts
# Test these functions:
- validateEmail(email: string) → {isValid: boolean, errors: string[]}
- validatePassword(password: string) → {isValid: boolean, errors: string[]}
- validateName(name: string) → {isValid: boolean, errors: string[]}

# Test cases needed:
✓ Valid inputs
✓ Invalid inputs
✓ Empty strings
✓ Edge cases
✓ All error messages
```

**Priority 2: Test LoginForm edge cases** (Expected: +5-10% coverage)

```bash
# Extend tests/LoginForm.test.tsx
# Add tests for:
- Google SSO button click (lines 58-69)
- GitHub SSO button click (lines 70-87)
- Registration navigation (lines 32-34)
- Registration flow (lines 184-206)
```

**Verify**:

```bash
npm run test:coverage
# Target: ≥70% overall coverage
```

### 2. Configure GitHub Secrets

**Get Vercel Credentials**:

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Get your credentials
cat .vercel/project.json
# Extract: orgId and projectId

# Get token
vercel whoami --token
```

**Add to GitHub**:

1. Go to: <https://github.com/YOUR_USERNAME/CortexBuild-1/settings/secrets/actions>
2. Click "New repository secret"
3. Add these three secrets:
   - Name: `VERCEL_TOKEN`, Value: [token from above]
   - Name: `VERCEL_ORG_ID`, Value: [orgId from project.json]
   - Name: `VERCEL_PROJECT_ID`, Value: [projectId from project.json]

### 3. Test the CI/CD Pipeline

**Push to trigger workflow**:

```bash
# Commit everything
git add .
git commit -m "Add CI/CD pipeline and test improvements"
git push origin main

# Monitor workflow
# Go to: https://github.com/YOUR_USERNAME/CortexBuild-1/actions
# Click on your workflow run
# Verify all stages pass:
✓ Test stage (both Node 18.x and 20.x)
✓ Build stage
✓ Deploy production (if on main branch)
✓ Security scan
```

## 📋 Optional Enhancements

### Add Status Badges to README

```markdown
# Add to README.md at the top
![CI/CD](https://github.com/YOUR_USERNAME/CortexBuild-1/workflows/CI%2FCD%20Pipeline/badge.svg)
![Tests](https://img.shields.io/badge/tests-27%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-55.85%25-yellow)
```

### Setup Codecov (Optional)

1. Go to <https://codecov.io>
2. Sign in with GitHub
3. Add your repository
4. Copy the upload token
5. Add `CODECOV_TOKEN` to GitHub Secrets

### Enable Dependabot

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
```

## 📊 Success Criteria

Before considering this complete, verify:

- [ ] All tests passing (27/27)
- [ ] Coverage ≥70% overall
- [ ] validation.ts ≥70% coverage
- [ ] LoginForm.tsx ≥70% coverage
- [ ] GitHub Secrets configured (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)
- [ ] CI/CD workflow runs successfully
- [ ] Deployments work (preview & production)
- [ ] Documentation is complete

## 🚨 Common Issues & Solutions

**Issue**: Tests fail in GitHub Actions but pass locally

- **Solution**: Check Node.js version matches (18.x or 20.x)
- Run: `node --version` locally and ensure it's 18 or 20

**Issue**: Vercel deployment fails

- **Solution**: Verify secrets are correctly configured in GitHub
- Check: Settings → Secrets → Actions → Verify all 3 secrets exist

**Issue**: Coverage doesn't improve

- **Solution**: Make sure new test files are in `tests/` directory
- Verify: `npm run test:coverage` shows new tests running

**Issue**: Build fails

- **Solution**: Run `npm run build` locally first
- Fix any TypeScript errors before pushing

## 📖 Reference Documentation

Created files:

- `CI_CD_SETUP.md` - Complete CI/CD documentation
- `TESTING_IMPLEMENTATION_SUMMARY.md` - What was done and why
- `NEXT_STEPS_CHECKLIST.md` - This file
- `.github/workflows/ci-cd.yml` - GitHub Actions workflow

Existing files to review:

- `.github/copilot-instructions.md` - Project guidelines
- `vitest.config.ts` - Test configuration
- `package.json` - Available scripts

## 🎯 Timeline Estimate

**Today (30 minutes)**:

1. Create validation tests → 15 min
2. Add LoginForm edge case tests → 10 min
3. Run coverage verification → 5 min

**Today (15 minutes)**:
4. Get Vercel credentials → 5 min
5. Configure GitHub Secrets → 5 min
6. Push and verify workflow → 5 min

**Optional (15 minutes)**:
7. Add README badges → 3 min
8. Setup Codecov → 7 min
9. Enable Dependabot → 5 min

**Total Time**: ~1 hour to complete everything

---

**Current Status**: 2/3 tasks complete

- ✅ Task 1: Run npm test to verify all fixes work
- ⏳ Task 2: Increase code coverage to >70% (at 55.85%)
- ✅ Task 3: Set up CI/CD integration

**Next Action**: Create validation tests to reach 70% coverage
