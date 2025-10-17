# 🚀 ConstructAI - Deployment Instructions

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (for OAuth and database)
- Vercel account (for deployment)

## 🔧 Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini AI (optional)
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run Development Server

```bash
npm run dev
```

Application will be available at: `http://localhost:5173`

## 🌐 Production Deployment

### Option 1: Vercel (Recommended)

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Login to Vercel

```bash
vercel login
```

#### Step 3: Deploy

```bash
vercel --prod
```

#### Step 4: Configure Environment Variables

In Vercel Dashboard:
1. Go to Project Settings
2. Navigate to Environment Variables
3. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY` (optional)

### Option 2: Manual Build

#### Step 1: Build for Production

```bash
npm run build
```

#### Step 2: Preview Build

```bash
npm run preview
```

#### Step 3: Deploy `dist` folder

Upload the `dist` folder to your hosting provider.

## 🔐 OAuth Configuration

### Google OAuth Setup

#### 1. Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Navigate to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen:
   - Application name: ConstructAI
   - User support email: your-email@example.com
   - Developer contact: your-email@example.com
6. Create OAuth Client ID:
   - Application type: Web application
   - Name: ConstructAI Web Client
   - Authorized redirect URIs:
     - `https://your-project.supabase.co/auth/v1/callback`
     - `http://localhost:5173/auth/callback` (for development)

#### 2. Supabase Configuration

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to Authentication → Providers
4. Enable Google provider
5. Add Google Client ID and Client Secret
6. Save configuration

### GitHub OAuth Setup

#### 1. GitHub Developer Settings

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in details:
   - Application name: ConstructAI
   - Homepage URL: `https://your-domain.com`
   - Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`
4. Click "Register application"
5. Generate a new client secret

#### 2. Supabase Configuration

1. Go to Supabase Dashboard
2. Navigate to Authentication → Providers
3. Enable GitHub provider
4. Add GitHub Client ID and Client Secret
5. Save configuration

## 🗄️ Database Setup

### Supabase Tables

The application requires the following tables:

1. **profiles** - User profiles
2. **companies** - Company information
3. **projects** - Project data
4. **tasks** - Task management
5. **rfis** - RFI tracking
6. **punch_list_items** - Punch list items
7. **ai_agents** - AI agents marketplace
8. **company_subscriptions** - Company AI subscriptions

### Run Migrations

```sql
-- See MULTI_TENANT_IMPLEMENTATION.md for complete SQL schema
```

## 🧪 Testing

### Run Tests

```bash
npm run test
```

### Test ML Features

1. Login to the application
2. Navigate to ML Analytics
3. Verify predictions are generated
4. Check confidence scores
5. Test different projects

### Test OAuth

1. Click "Sign in with Google"
2. Verify redirect to Google
3. Authorize application
4. Verify redirect back to app
5. Check user profile creation

Repeat for GitHub OAuth.

## 📊 Monitoring

### Vercel Analytics

Enable Vercel Analytics in project settings:
1. Go to Vercel Dashboard
2. Select project
3. Navigate to Analytics
4. Enable Web Analytics

### Supabase Monitoring

Monitor database and auth:
1. Go to Supabase Dashboard
2. Check Database → Logs
3. Check Authentication → Users
4. Monitor API usage

## 🔒 Security Checklist

- [ ] Environment variables configured
- [ ] OAuth redirect URIs whitelisted
- [ ] Supabase RLS policies enabled
- [ ] API keys secured
- [ ] HTTPS enabled in production
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Error logging configured

## 🚀 Performance Optimization

### 1. Code Splitting

Already configured in Vite:
```typescript
// Automatic code splitting for routes
const LazyComponent = lazy(() => import('./Component'));
```

### 2. Image Optimization

Use optimized images:
- WebP format
- Lazy loading
- Responsive images

### 3. Caching

Configure caching headers:
```
Cache-Control: public, max-age=31536000, immutable
```

### 4. CDN

Vercel automatically provides CDN for static assets.

## 📱 Mobile Optimization

The application is responsive and works on:
- Desktop (1920x1080+)
- Tablet (768x1024)
- Mobile (375x667+)

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🐛 Troubleshooting

### Issue: OAuth not working

**Solution**:
1. Check redirect URIs in OAuth provider
2. Verify Supabase configuration
3. Check browser console for errors
4. Ensure HTTPS in production

### Issue: ML predictions not loading

**Solution**:
1. Check browser console for errors
2. Verify project data is complete
3. Check API endpoints
4. Verify neural network initialization

### Issue: Database connection errors

**Solution**:
1. Check Supabase URL and key
2. Verify environment variables
3. Check RLS policies
4. Review database logs

## 📞 Support

For issues or questions:
- Check documentation files
- Review error logs
- Contact support team

## 🎉 Launch Checklist

Before going live:

- [ ] All environment variables set
- [ ] OAuth providers configured
- [ ] Database migrations run
- [ ] Tests passing
- [ ] Performance optimized
- [ ] Security reviewed
- [ ] Monitoring enabled
- [ ] Backup strategy in place
- [ ] Documentation updated
- [ ] Team trained

## 🚀 Post-Deployment

After deployment:

1. **Verify Functionality**
   - Test login (traditional + OAuth)
   - Test ML predictions
   - Test all major features

2. **Monitor Performance**
   - Check response times
   - Monitor error rates
   - Review analytics

3. **User Feedback**
   - Collect user feedback
   - Track usage patterns
   - Identify improvements

4. **Continuous Improvement**
   - Regular updates
   - Security patches
   - Feature enhancements

---

**🎊 Congratulations! ConstructAI is now live!**

**Built with ❤️ using:**
- React + TypeScript
- Vite
- Supabase
- Custom Neural Network
- OAuth 2.0
- Tailwind CSS

