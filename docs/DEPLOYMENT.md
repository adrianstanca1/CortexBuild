# CortexBuild - Deployment Guide

## Production Deployment

### Current Production URL
https://constructai-5-l4tmssm90-adrian-b7e84541.vercel.app

### Deployment Platform
**Vercel** - Automatic deployments from Git repository

## Quick Deploy

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

## Environment Variables

### Required Variables
Set these in Vercel Dashboard → Project Settings → Environment Variables:

```env
VITE_SUPABASE_URL=https://qglvhxkgbzujglehewsa.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Local Development
Create `.env.local` file:

```env
VITE_SUPABASE_URL=https://qglvhxkgbzujglehewsa.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Setup (Supabase)

### Project Details
- **Project ID**: `qglvhxkgbzujglehewsa`
- **Region**: US East
- **Database**: PostgreSQL

### Initial Setup

1. **Run Base Migration**
   - Go to Supabase Dashboard → SQL Editor
   - Run `supabase/migrations/001_multi_tenant_schema.sql`

2. **Run Authentication Migration**
   - Run `supabase/migrations/20250122_complete_auth_system.sql`

3. **Verify Setup**
   ```sql
   -- Check users table
   SELECT * FROM users;
   
   -- Test authentication
   SELECT public.authenticate_user(
       'adrian.stanca1@gmail.com',
       'a3a2754f94b4f8c1ca8d29290bc37ba90cedf0e13a9e702a829740835e5ed564'
   );
   ```

## Build Configuration

### Vite Config
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'supabase': ['@supabase/supabase-js']
        }
      }
    }
  }
});
```

### Vercel Configuration
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install"
}
```

## Deployment Checklist

### Before Deploying

- [ ] All tests passing locally
- [ ] Environment variables configured in Vercel
- [ ] Database migrations applied in Supabase
- [ ] Authentication functions created
- [ ] RLS policies enabled
- [ ] Test user created with password

### After Deploying

- [ ] Test login with credentials
- [ ] Verify all screens load
- [ ] Check browser console for errors
- [ ] Test CRUD operations
- [ ] Verify real-time features work

## Monitoring

### Vercel Dashboard
- Build logs: https://vercel.com/adrian-b7e84541/constructai-5
- Analytics: Check performance metrics
- Error tracking: Monitor runtime errors

### Supabase Dashboard
- Database health: Monitor query performance
- API logs: Check for errors
- Storage usage: Monitor database size

## Rollback Procedure

### Vercel Rollback
1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Database Rollback
```sql
-- Backup before changes
pg_dump > backup.sql

-- Restore if needed
psql < backup.sql
```

## Performance Optimization

### Frontend
- Lazy loading for screens
- Code splitting by route
- Image optimization
- Minification enabled

### Database
- Indexes on frequently queried columns
- RLS policies optimized
- Connection pooling enabled

## Security

### Frontend
- Environment variables not exposed to client
- HTTPS enforced
- XSS protection enabled

### Database
- RLS enabled on all tables
- SECURITY DEFINER functions for auth
- Password hashing (SHA-256)
- Prepared statements prevent SQL injection

## Troubleshooting

### Build Failures
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Database Connection Issues
- Verify Supabase project is active
- Check environment variables
- Test connection from local

### Authentication Not Working
- Verify functions exist in Supabase
- Run `NOTIFY pgrst, 'reload schema';`
- Check user has password set

## Support

### Documentation
- Authentication: `docs/AUTHENTICATION_SETUP.md`
- Database Schema: `supabase/migrations/`

### Logs
- Vercel: https://vercel.com/adrian-b7e84541/constructai-5/logs
- Supabase: Dashboard → Logs

## Version History

### v1.0.0 (Current)
- Complete authentication system
- All 17 management screens
- Real-time features
- Multi-tenant support
- Production deployment on Vercel

## Next Steps

1. Set up automated testing
2. Configure CI/CD pipeline
3. Add monitoring and alerts
4. Implement backup strategy
5. Set up staging environment

