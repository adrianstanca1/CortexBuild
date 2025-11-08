# Phase 6: Testing & Deployment - Deployment Guide

## Pre-Deployment Checklist

### Database
- [ ] All 9 migrations executed successfully
- [ ] All 7 tables created and verified
- [ ] All 28 RLS policies active
- [ ] All 9 RPC functions available
- [ ] TEST_SCRIPT.sql executed without errors
- [ ] Database backup created

### React Components
- [ ] All components integrated with database
- [ ] All CRUD operations tested
- [ ] All error handling tested
- [ ] All loading states tested
- [ ] Responsive design verified

### Build
- [ ] `npm run build` successful
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Bundle size acceptable

### Testing
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] All E2E tests passing
- [ ] Performance tests acceptable
- [ ] Security tests passing

---

## Step 1: Final Build Verification

### 1.1 Clean Build
```bash
# Remove node_modules and build artifacts
rm -rf node_modules dist

# Reinstall dependencies
npm install

# Run build
npm run build
```

**Expected Output:**
- Build completes in < 10 seconds
- No errors or warnings
- dist/ folder created with all assets

### 1.2 Check Build Output
```bash
# Check bundle size
npm run build 2>&1 | tail -20

# Check for errors
npm run build 2>&1 | grep -i "error"
```

**Expected:**
- Bundle size < 500KB gzipped
- No errors found

---

## Step 2: Pre-Deployment Testing

### 2.1 Run All Tests
```bash
# Run unit tests (if available)
npm run test

# Run build
npm run build

# Check for console errors
npm run dev 2>&1 | grep -i "error"
```

### 2.2 Manual Testing
1. [ ] Start dev server: `npm run dev`
2. [ ] Test all components in browser
3. [ ] Test on mobile device
4. [ ] Test on tablet
5. [ ] Check console for errors
6. [ ] Check network tab for failed requests

---

## Step 3: Deployment to Vercel

### 3.1 Connect Repository
```bash
# If not already connected
vercel link

# Or create new project
vercel
```

### 3.2 Set Environment Variables
In Vercel Dashboard:
1. Go to Project Settings
2. Click "Environment Variables"
3. Add all required variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - Any other required variables

### 3.3 Deploy to Production
```bash
# Deploy to production
vercel --prod

# Or use git push (if auto-deploy enabled)
git push origin main
```

### 3.4 Monitor Deployment
1. [ ] Check Vercel dashboard for deployment status
2. [ ] Wait for build to complete
3. [ ] Verify deployment URL is accessible
4. [ ] Check for any build errors

---

## Step 4: Post-Deployment Verification

### 4.1 Verify Deployment
1. [ ] Visit deployment URL
2. [ ] Verify page loads correctly
3. [ ] Check console for errors
4. [ ] Test all components
5. [ ] Verify database connectivity

### 4.2 Performance Check
```bash
# Check Lighthouse score
# Use Chrome DevTools > Lighthouse

# Expected scores:
# - Performance: > 80
# - Accessibility: > 90
# - Best Practices: > 90
# - SEO: > 90
```

### 4.3 Monitor Errors
1. [ ] Check Sentry for errors (if configured)
2. [ ] Check browser console for errors
3. [ ] Check network tab for failed requests
4. [ ] Monitor application logs

---

## Step 5: Rollback Plan

### If Deployment Fails

**Option 1: Rollback to Previous Version**
```bash
# In Vercel Dashboard:
# 1. Go to Deployments
# 2. Find previous successful deployment
# 3. Click "Promote to Production"
```

**Option 2: Revert Git Commit**
```bash
# Revert to previous commit
git revert HEAD

# Push to trigger redeploy
git push origin main
```

**Option 3: Manual Rollback**
```bash
# Deploy specific commit
vercel --prod --target=production --commit=<commit-hash>
```

---

## Step 6: Post-Deployment Monitoring

### 6.1 Monitor Performance
- [ ] Check page load times
- [ ] Monitor API response times
- [ ] Check database query performance
- [ ] Monitor error rates

### 6.2 Monitor User Experience
- [ ] Check for user-reported issues
- [ ] Monitor support tickets
- [ ] Check analytics for unusual patterns
- [ ] Monitor conversion rates

### 6.3 Monitor Infrastructure
- [ ] Check Vercel deployment status
- [ ] Check Supabase database status
- [ ] Monitor API rate limits
- [ ] Check storage usage

---

## Step 7: Documentation Updates

### 7.1 Update README
```markdown
# CortexBuild - Phase 6 Complete

## Deployment Status
- ✅ Database Schema: Deployed
- ✅ React Components: Deployed
- ✅ RPC Functions: Deployed
- ✅ RLS Policies: Active

## Live URL
https://your-deployment-url.vercel.app

## Recent Changes
- Phase 5: Database schema with 7 tables
- Phase 4: 6 reusable UI components
- Phase 3: 4 advanced company features
- Phase 2: 3 core company features
- Phase 1: Dashboard cleanup
```

### 7.2 Update Changelog
```markdown
## [1.0.0] - 2024-10-23

### Added
- Complete database schema (7 tables)
- 9 RPC functions for complex operations
- 28 RLS policies for security
- 6 reusable UI components
- 7 company admin features
- Comprehensive documentation

### Changed
- Refactored dashboard architecture
- Updated component structure
- Improved data isolation

### Fixed
- Bundle size optimization
- Performance improvements
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Build successful
- [ ] No console errors
- [ ] Database backup created
- [ ] Environment variables set

### Deployment
- [ ] Code pushed to main branch
- [ ] Vercel build triggered
- [ ] Build completed successfully
- [ ] Deployment URL accessible

### Post-Deployment
- [ ] All components working
- [ ] Database connectivity verified
- [ ] Performance acceptable
- [ ] No errors in console
- [ ] Monitoring configured

### Monitoring
- [ ] Error tracking enabled
- [ ] Performance monitoring enabled
- [ ] Analytics tracking enabled
- [ ] Alerts configured

---

## Troubleshooting

### Issue: Build Fails
**Solution:**
1. Check build logs in Vercel
2. Fix errors locally
3. Push fix to main branch
4. Vercel will auto-redeploy

### Issue: Database Connection Error
**Solution:**
1. Verify environment variables
2. Check Supabase status
3. Verify RLS policies
4. Check network connectivity

### Issue: Components Not Loading
**Solution:**
1. Check browser console for errors
2. Check network tab for failed requests
3. Verify API endpoints
4. Check authentication

### Issue: Performance Issues
**Solution:**
1. Check Lighthouse score
2. Optimize images
3. Enable caching
4. Reduce bundle size

---

## Success Criteria

✅ **Deployment Successful When:**
- [ ] All pages load without errors
- [ ] All components display correctly
- [ ] Database queries work correctly
- [ ] RLS policies prevent unauthorized access
- [ ] Performance is acceptable
- [ ] No console errors
- [ ] Mobile responsive
- [ ] All features working

---

## Sign-Off

- [ ] Deployment completed successfully
- [ ] All verification tests passed
- [ ] Monitoring configured
- [ ] Documentation updated
- [ ] Ready for production use

**Deployment Completed:** _______________
**Deployed By:** _______________
**Date:** _______________
**Deployment URL:** _______________

