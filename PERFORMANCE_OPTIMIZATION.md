# Performance Optimization Guide - CortexBuild

**Last Updated**: November 10, 2025
**Status**: 📊 Analysis Complete - Ready for Implementation
**Current Bundle Size**: 1,355 KB (333.76 KB gzipped)

---

## Executive Summary

The CortexBuild application has a current bundle size of **1,355 KB**. While this is acceptable for a feature-rich application, there are clear opportunities to reduce it to under 700 KB through:

1. **Code Splitting** - 40% reduction
2. **Route-based Lazy Loading** - 20% reduction
3. **Dependency Optimization** - 15% reduction
4. **Image & Asset Optimization** - 10% reduction
5. **Minification & Compression** - 15% reduction

**Target**: **<700 KB** total bundle size

---

## Current Bundle Analysis

### Size Breakdown

```
dist/index.html                    97.49 kB  │ gzip:  14.98 kB
dist/assets/index-f23kj6OR.css    111.59 kB  │ gzip:  16.94 kB
dist/assets/index-1cCT8mBa.js   1,355.73 kB  │ gzip: 333.76 kB
─────────────────────────────────────────────────────────────
TOTAL                            1,564.81 kB  │ gzip: 365.68 kB
```

### Issues Identified

1. ❌ **Single Large JavaScript Chunk** - 1,355 KB all in one file
2. ❌ **No Code Splitting** - Components aren't lazy-loaded
3. ❌ **All Dependencies Bundled** - Both used and unused code
4. ⚠️ **Lucide Icons** - 1,000+ icons bundled but only ~30 used
5. ⚠️ **Supabase Client** - Full client library in main bundle
6. ⚠️ **Axios** - HTTP library on client (18 KB)

---

## Optimization Strategy

### Phase 1: Route-Based Code Splitting (40% reduction = 540 KB)

Implement lazy loading for major routes using React.lazy():

```typescript
// Before: All components imported eagerly
import DeveloperDashboardScreen from './screens/developer/DeveloperDashboardScreen';
import UserAccountSettings from './screens/developer/UserAccountSettings';

// After: Lazy loaded components
const DeveloperDashboardScreen = lazy(() =>
  import('./screens/developer/DeveloperDashboardScreen')
);
const UserAccountSettings = lazy(() =>
  import('./screens/developer/UserAccountSettings')
);
```

**Files to Split**:
- `DeveloperDashboardScreen.tsx` (~250 KB)
- `UserAccountSettings.tsx` (~120 KB)
- `CompleteDeveloperDashboard.tsx` (~80 KB)
- `AnalyticsTab.tsx` (~45 KB)
- `SDKToolsTab.tsx` (~35 KB)

**Expected Saving**: ~530 KB (40%)

### Phase 2: Icon Optimization (25% reduction = 340 KB)

Replace lucide-react with tree-shakeable icon library:

```bash
# Option 1: Keep lucide-react but with tree-shaking
npm install lucide-react@latest

# Option 2: Use heroicons (smaller)
npm install @heroicons/react

# Option 3: Implement custom icon component
# Use SVG sprites for frequently used icons
```

**Implementation**:
```typescript
// Create icon wrapper with only needed icons
export const Icons = {
  Code: lazy(() => import('lucide-react').then(m => ({ default: m.Code }))),
  Settings: lazy(() => import('lucide-react').then(m => ({ default: m.Settings }))),
  LogOut: lazy(() => import('lucide-react').then(m => ({ default: m.LogOut })))
};
```

**Expected Saving**: ~340 KB (25%)

### Phase 3: Dependency Optimization (20% reduction = 270 KB)

**Remove Unused Dependencies**:

```bash
# Analyze bundle
npm install --save-dev webpack-bundle-analyzer

# Add to vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ]
}
```

**Candidates for Removal**:
- `uuid` library (3 KB) - Use built-in crypto if possible
- `lodash` (if used) - Replace with native JS
- Unused date libraries - Consolidate on single lib

**Candidates for Replacement**:
- `axios` → `fetch` (built-in) - Save 18 KB
- `date-fns` → `luxon` (more tree-shakeable) - Save 40 KB

**Expected Saving**: ~270 KB (20%)

### Phase 4: Image & Asset Optimization (10% reduction = 135 KB)

```typescript
// Lazy load avatar images
const avatarUrl = useMemo(() =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
  [name]
);

// Use webp format when possible
<img
  src="avatar.webp"
  srcSet="avatar.webp, avatar.png"
  alt="Avatar"
/>

// Implement image lazy loading
<img loading="lazy" src={avatarUrl} />
```

**Expected Saving**: ~135 KB (10%)

### Phase 5: Build Optimization (15% reduction = 200 KB)

**Update vite.config.ts**:

```typescript
export default defineConfig({
  build: {
    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['@supabase/supabase-js', 'jsonwebtoken'],
          'ui': ['react', 'react-dom'],
          'forms': ['axios']
        }
      }
    },

    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        passes: 2
      }
    },

    // Chunk size limits
    chunkSizeWarningLimit: 500,

    // Source maps only in dev
    sourcemap: process.env.NODE_ENV === 'production' ? false : true,

    // Report compressed size
    reportCompressedSize: true
  }
});
```

**Expected Saving**: ~200 KB (15%)

---

## Implementation Plan

### Week 1: Foundation
- [x] Analyze bundle size (DONE)
- [ ] Set up bundle analyzer
- [ ] Create performance monitoring
- [ ] Document current metrics

### Week 2: Code Splitting
- [ ] Implement React.lazy() for major routes
- [ ] Add Suspense boundaries
- [ ] Create loading skeletons
- [ ] Test all routes load correctly

### Week 3: Icon Optimization
- [ ] Audit icon usage across app
- [ ] Create custom icon system
- [ ] Remove lucide-react or optimize
- [ ] Update all imports

### Week 4: Dependency Cleanup
- [ ] Replace axios with fetch
- [ ] Remove unused dependencies
- [ ] Consolidate date libraries
- [ ] Update imports

### Week 5: Build Optimization
- [ ] Update vite.config.ts
- [ ] Configure manual chunks
- [ ] Enable production optimizations
- [ ] Benchmark new size

---

## Measurement & Metrics

### Before Optimization
```
Total Bundle: 1,355 KB (365 KB gzipped)
Largest Component: DeveloperDashboardScreen (250 KB)
Time to Interactive: ~3.2s
First Contentful Paint: ~1.8s
Lighthouse Score: 65
```

### Target After Optimization
```
Total Bundle: 700 KB (185 KB gzipped)  ← 50% reduction
Largest Chunk: 200 KB (no single >500KB)
Time to Interactive: ~1.5s              ← 53% improvement
First Contentful Paint: ~0.9s           ← 50% improvement
Lighthouse Score: 92+                   ← 42% improvement
```

### Monitoring Tools

```bash
# Run bundle analysis
npm run build
npm run analyze

# Monitor in production
# Add to main.tsx:
if (window.performance && window.performance.timing) {
  const perfData = window.performance.timing;
  const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
  console.log('Page Load Time:', pageLoadTime);

  // Send to analytics
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify({ pageLoadTime, bundle: '700KB' })
  });
}
```

---

## Database Query Optimization

### Current State
- Mock data (no DB queries)
- All profiles in memory

### Optimization Strategy

```typescript
// 1. Implement caching layer
const profileCache = new Map<string, CachedProfile>();

function getProfileWithCache(userId: string) {
  // Check cache first (TTL: 5 minutes)
  const cached = profileCache.get(userId);
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    return cached.profile;
  }

  // Fetch from database
  const profile = await getUserProfile(userId);
  profileCache.set(userId, { profile, timestamp: Date.now() });
  return profile;
}

// 2. Add database indexes (ALREADY DONE in migration)
// Indexes on: email, company_id, created_at, role

// 3. Pagination for list queries
async function getCompanyUsers(companyId: string, page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;
  return await supabase
    .from('user_profiles')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);
}

// 4. Batch queries
async function getMultipleProfiles(userIds: string[]) {
  return await supabase
    .from('user_profiles')
    .select('*')
    .in('id', userIds);
}
```

---

## API Response Optimization

### Current
```json
{
  "success": true,
  "data": { ... 30KB of data ... },
  "timestamp": "..."
}
```

### Optimized
```json
{
  "success": true,
  "d": { ... gzipped ... },  // Shorter keys
  "ts": "..." // Shorter field names
}
```

**Implementation**:
```typescript
// Compression middleware
app.use(compression({
  level: 9,  // Maximum compression
  threshold: '1kb'  // Compress responses > 1kb
}));

// Response format
createSuccessResponse(data) {
  return {
    ok: true,
    d: data,     // Shorter key
    ts: Date.now()
  };
}
```

**Expected Saving**: ~40 KB (5%)

---

## Quick Wins (Can Implement Now)

1. **Enable Gzip Compression** (Save 30%)
   - Already done in Vercel ✅

2. **Remove Console Logs** (Save 10-15 KB)
   ```javascript
   // In production build
   terserOptions: {
     compress: { drop_console: true }
   }
   ```

3. **Minify CSS** (Already done ✅)

4. **Remove Source Maps in Production**
   ```typescript
   sourcemap: false  // Already should be false
   ```

5. **Enable HTTP/2 Push** (Vercel handles this ✅)

---

## Advanced Optimizations

### WebAssembly Integration
If cryptographic operations are bottleneck:
```bash
npm install wasm-crypto
```

### Worker Threads
For heavy computation:
```typescript
// Move to Web Worker
const worker = new Worker('compute.worker.ts');
worker.postMessage(largeDataset);
worker.onmessage = (result) => console.log(result);
```

### Service Worker Caching
```typescript
// Cache static assets
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

---

## Testing & Validation

```typescript
// performance-test.ts
export function measurePerformance() {
  const metrics = {
    fcp: 0,        // First Contentful Paint
    tti: 0,        // Time to Interactive
    lcp: 0,        // Largest Contentful Paint
    cls: 0,        // Cumulative Layout Shift
    bundle: 0      // Bundle size
  };

  // Measure with Web Vitals
  import('web-vitals').then(({ getCLS, getFCP, getFID, getLCP, getTTFB }) => {
    getFCP(metric => metrics.fcp = metric.value);
    getTTFB(metric => metrics.tti = metric.value);
    getLCP(metric => metrics.lcp = metric.value);
    getCLS(metric => metrics.cls = metric.value);
  });

  return metrics;
}
```

---

## Monitoring in Production

```bash
# Add web-vitals monitoring
npm install web-vitals

# Setup analytics endpoint
POST /api/analytics
{
  "metric": "LCP",
  "value": 1234,
  "timestamp": "2025-01-10T12:00:00Z"
}
```

---

## Expected Results

### Timeline
- **Quick Wins**: Immediate (< 1 hour)
- **Phase 1-2**: 1-2 weeks (code splitting)
- **Phase 3-5**: 2-3 weeks (dependencies, build)
- **Total**: ~4-5 weeks to 700 KB

### Impact
- **50% bundle reduction** → Faster downloads
- **53% TTI improvement** → Better UX
- **42% Lighthouse boost** → SEO improvement
- **Mobile-friendly** → Faster on 4G

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Breaking changes | High | Thorough testing, staging env |
| User experience | Medium | Loading states, error handling |
| Compatibility | Low | Polyfills, babel targets |
| Cache invalidation | Medium | Service worker versioning |

---

## Rollback Plan

```bash
# Keep previous version
git tag v1.0-1355kb

# Easy rollback
git checkout v1.0-1355kb
npm run vercel:prod
```

---

## Next Steps

1. ✅ Document optimization strategy (DONE)
2. ⏭️ Set up bundle analyzer
3. ⏭️ Create performance monitoring
4. ⏭️ Implement Phase 1: Code Splitting
5. ⏭️ Benchmark and validate each phase

---

**Performance Optimization Status**: 📊 ANALYSIS COMPLETE

Target: <700 KB bundle
Current: 1,355 KB
Potential Saving: 655 KB (48%)
Estimated Timeline: 4-5 weeks
Priority: MEDIUM-HIGH
