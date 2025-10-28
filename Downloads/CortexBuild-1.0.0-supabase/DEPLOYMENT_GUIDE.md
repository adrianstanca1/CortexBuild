# CortexBuild Deployment Guide

## 🚀 Production Deployment Instructions

### **Prerequisites**

Before deploying CortexBuild to production, ensure you have:

- [ ] Vercel account (free tier available)
- [ ] Supabase account (free tier available)
- [ ] Domain name (optional, Vercel provides free subdomain)
- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Third-party service accounts (QuickBooks, Stripe, etc.)

### **Step 1: Environment Setup**

#### **1.1 Supabase Configuration**

1. **Create Supabase Project**:

   ```bash
   # Visit https://supabase.com
   # Create new project
   # Note down Project URL and API Key
   ```

2. **Deploy Database Schema**:

   ```sql
   -- Run the following SQL in Supabase SQL Editor
   -- This creates all necessary tables and RLS policies
   
   -- Enable necessary extensions
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
   
   -- Create users table
   CREATE TABLE IF NOT EXISTS users (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     email TEXT UNIQUE NOT NULL,
     name TEXT NOT NULL,
     company_id UUID,
     role TEXT DEFAULT 'user',
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   
   -- Create companies table
   CREATE TABLE IF NOT EXISTS companies (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     name TEXT NOT NULL,
     industry TEXT,
     size TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   
   -- Create projects table
   CREATE TABLE IF NOT EXISTS projects (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     name TEXT NOT NULL,
     description TEXT,
     company_id UUID REFERENCES companies(id),
     status TEXT DEFAULT 'active',
     priority TEXT DEFAULT 'medium',
     progress INTEGER DEFAULT 0,
     budget DECIMAL(15,2),
     start_date DATE,
     end_date DATE,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   
   -- Create tasks table
   CREATE TABLE IF NOT EXISTS tasks (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     project_id UUID REFERENCES projects(id),
     title TEXT NOT NULL,
     description TEXT,
     status TEXT DEFAULT 'pending',
     priority TEXT DEFAULT 'medium',
     assignee_id UUID REFERENCES users(id),
     due_date DATE,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   
   -- Create notifications table
   CREATE TABLE IF NOT EXISTS notifications (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES users(id),
     title TEXT NOT NULL,
     message TEXT NOT NULL,
     type TEXT NOT NULL,
     category TEXT,
     is_read BOOLEAN DEFAULT FALSE,
     action_url TEXT,
     metadata JSONB DEFAULT '{}',
     created_at TIMESTAMPTZ DEFAULT NOW(),
     read_at TIMESTAMPTZ
   );
   
   -- Enable Row Level Security
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
   ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
   ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
   ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
   
   -- Create RLS policies
   CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
   CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
   
   CREATE POLICY "Users can view company data" ON companies FOR SELECT USING (true);
   CREATE POLICY "Admins can manage companies" ON companies FOR ALL USING (
     EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
   );
   
   CREATE POLICY "Users can view projects" ON projects FOR SELECT USING (true);
   CREATE POLICY "Users can create projects" ON projects FOR INSERT WITH CHECK (true);
   CREATE POLICY "Users can update projects" ON projects FOR UPDATE USING (true);
   
   CREATE POLICY "Users can view tasks" ON tasks FOR SELECT USING (true);
   CREATE POLICY "Users can create tasks" ON tasks FOR INSERT WITH CHECK (true);
   CREATE POLICY "Users can update tasks" ON tasks FOR UPDATE USING (true);
   
   CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
   CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());
   CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);
   ```

3. **Configure Storage Buckets**:

   ```sql
   -- Create storage buckets
   INSERT INTO storage.buckets (id, name, public) VALUES 
   ('documents', 'documents', true),
   ('avatars', 'avatars', true),
   ('images', 'images', true),
   ('drawings', 'drawings', true);
   
   -- Create storage policies
   CREATE POLICY "Users can upload documents" ON storage.objects FOR INSERT WITH CHECK (
     bucket_id = 'documents' AND auth.role() = 'authenticated'
   );
   
   CREATE POLICY "Users can view documents" ON storage.objects FOR SELECT USING (
     bucket_id = 'documents'
   );
   
   CREATE POLICY "Users can update documents" ON storage.objects FOR UPDATE USING (
     bucket_id = 'documents' AND auth.role() = 'authenticated'
   );
   
   CREATE POLICY "Users can delete documents" ON storage.objects FOR DELETE USING (
     bucket_id = 'documents' AND auth.role() = 'authenticated'
   );
   ```

#### **1.2 Environment Variables**

Create a `.env.local` file with the following variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Third-party integrations
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_QUICKBOOKS_CLIENT_ID=your_quickbooks_client_id
VITE_SLACK_CLIENT_ID=your_slack_client_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### **Step 2: Vercel Deployment**

#### **2.1 Install Vercel CLI**

```bash
npm install -g vercel
```

#### **2.2 Deploy to Vercel**

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow the prompts:
# - Link to existing project or create new
# - Set build command: npm run build
# - Set output directory: dist
# - Set install command: npm install
```

#### **2.3 Configure Environment Variables in Vercel**

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add all environment variables from `.env.local`
5. Set them for Production, Preview, and Development environments

#### **2.4 Configure Domain (Optional)**

1. Go to Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Enable SSL (automatic with Vercel)

### **Step 3: Post-Deployment Configuration**

#### **3.1 Verify Deployment**

1. **Check Application**: Visit your deployed URL
2. **Test Authentication**: Try logging in/registering
3. **Test Features**: Verify all major features work
4. **Check Console**: Look for any JavaScript errors
5. **Test Mobile**: Check mobile responsiveness

#### **3.2 Configure Third-Party Integrations**

1. **Stripe Setup**:
   - Create Stripe account
   - Get API keys
   - Configure webhook endpoints
   - Test payment processing

2. **QuickBooks Setup**:
   - Create QuickBooks Developer account
   - Set up OAuth application
   - Configure redirect URLs
   - Test API connections

3. **Slack Setup**:
   - Create Slack app
   - Configure OAuth scopes
   - Set up webhook URLs
   - Test message sending

4. **Google Calendar Setup**:
   - Create Google Cloud project
   - Enable Calendar API
   - Configure OAuth consent screen
   - Test calendar integration

#### **3.3 Set Up Monitoring**

1. **Vercel Analytics**: Enable in Vercel dashboard
2. **Error Tracking**: Set up Sentry or similar
3. **Performance Monitoring**: Configure Lighthouse CI
4. **Uptime Monitoring**: Set up Pingdom or similar

### **Step 4: Production Optimization**

#### **4.1 Performance Optimization**

```bash
# Enable compression
# Add to vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Encoding",
          "value": "gzip"
        }
      ]
    }
  ]
}
```

#### **4.2 Security Headers**

```json
// Add to vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

#### **4.3 Caching Strategy**

```json
// Add to vercel.json
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*\\.(js|css|png|jpg|jpeg|gif|ico|svg))",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000"
        }
      ]
    }
  ]
}
```

### **Step 5: Testing & Validation**

#### **5.1 Functional Testing**

- [ ] User registration and login
- [ ] Project creation and management
- [ ] Task assignment and tracking
- [ ] File upload and download
- [ ] Real-time notifications
- [ ] AI recommendations
- [ ] Mobile responsiveness
- [ ] PWA installation
- [ ] Offline functionality

#### **5.2 Performance Testing**

- [ ] Page load times (< 3 seconds)
- [ ] Mobile performance
- [ ] Lighthouse scores (90+)
- [ ] Core Web Vitals
- [ ] Bundle size analysis
- [ ] Database query performance

#### **5.3 Security Testing**

- [ ] Authentication flows
- [ ] Authorization checks
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] HTTPS enforcement

### **Step 6: Go Live Checklist**

#### **6.1 Pre-Launch**

- [ ] All features tested and working
- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Third-party integrations configured
- [ ] SSL certificate active
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] Documentation updated

#### **6.2 Launch Day**

- [ ] Deploy to production
- [ ] Verify all systems operational
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Test critical user flows
- [ ] Monitor user feedback
- [ ] Be ready for quick fixes

#### **6.3 Post-Launch**

- [ ] Monitor system performance
- [ ] Collect user feedback
- [ ] Address any issues quickly
- [ ] Plan feature improvements
- [ ] Scale infrastructure as needed
- [ ] Regular security updates
- [ ] Performance optimization

### **Step 7: Maintenance & Updates**

#### **7.1 Regular Maintenance**

- **Weekly**: Check error logs and performance metrics
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Review and optimize database performance
- **Annually**: Security audit and penetration testing

#### **7.2 Update Process**

```bash
# 1. Test updates locally
npm run build
npm run test

# 2. Deploy to preview
vercel

# 3. Test preview deployment
# 4. Deploy to production
vercel --prod
```

### **🚨 Troubleshooting**

#### **Common Issues**

1. **Build Failures**:
   - Check environment variables
   - Verify all dependencies installed
   - Check for TypeScript errors

2. **Database Connection Issues**:
   - Verify Supabase credentials
   - Check RLS policies
   - Ensure database schema is deployed

3. **Authentication Problems**:
   - Check JWT configuration
   - Verify Supabase auth settings
   - Check CORS configuration

4. **Performance Issues**:
   - Enable Vercel Analytics
   - Check bundle size
   - Optimize images and assets

### **📞 Support**

For deployment support:

1. **Documentation**: Check this guide and code comments
2. **Issues**: Create GitHub issues for bugs
3. **Community**: Join our Discord/Slack community
4. **Professional Support**: Contact our support team

**CortexBuild is now ready for production! 🚀**
