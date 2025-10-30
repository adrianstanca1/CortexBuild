# 🚀 CortexBuild v2.0 - Deployment Guide

## 📋 **QUICK START**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Git

### **1. Clone & Install**
```bash
git clone https://github.com/adrianstanca1/CortexBuild.git
cd CortexBuild
npm install
```

### **2. Environment Setup**
Create `.env` file:
```env
# AI API Keys
OPENAI_API_KEY=your_openai_key
GOOGLE_AI_API_KEY=your_gemini_key
ANTHROPIC_API_KEY=your_claude_key

# Database
DATABASE_URL=your_database_url
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# JWT
JWT_SECRET=your_jwt_secret

# Server
PORT=3001
VITE_API_URL=http://localhost:3001
```

### **3. Start Development**
```bash
# Start backend server
npm run server

# Start frontend (new terminal)
npm run dev
```

### **4. Access Platform**
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **API Docs**: http://localhost:3001/api

---

## 🏗️ **ADVANCED FEATURES ACCESS**

### **N8N + Procore + Zapier MEGA BUILDER**
1. Navigate to **SDK** section
2. Click **"N8N + Procore Builder"**
3. Start building visual workflows with 60+ Procore APIs

### **Workflow Templates**
1. Open any workflow builder
2. Click **"Templates"** button
3. Choose from professional templates:
   - Daily Project Report
   - RFI Approval Workflow
   - Safety Incident Response

### **AI Agents**
Available throughout the platform:
- **Predictive Maintenance**: Equipment monitoring
- **Intelligent Router**: Task automation
- **Commercial Guardian**: Contract management
- **HSE Sentinel**: Safety monitoring
- **Financial Forecaster**: Budget analysis

---

## 🔧 **PRODUCTION DEPLOYMENT**

### **Environment Variables (Production)**
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@host:5432/cortexbuild
JWT_SECRET=your_secure_jwt_secret_256_bits
OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=AI...
ANTHROPIC_API_KEY=sk-ant-...
```

### **Build for Production**
```bash
# Build frontend
npm run build

# Build backend
npm run build:server

# Start production server
npm start
```

### **Docker Deployment**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### **Vercel Deployment**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## 📊 **API ENDPOINTS**

### **Core APIs (64 endpoints)**
```
GET    /api/projects          # List projects
POST   /api/projects          # Create project
GET    /api/projects/:id      # Get project
PUT    /api/projects/:id      # Update project
DELETE /api/projects/:id      # Delete project

GET    /api/rfis              # List RFIs
POST   /api/rfis              # Create RFI
GET    /api/rfis/:id          # Get RFI
PUT    /api/rfis/:id          # Update RFI
DELETE /api/rfis/:id          # Delete RFI
POST   /api/rfis/:id/respond  # Respond to RFI

# ... 52 more endpoints for:
# Clients, Invoices, Time Tracking, Subcontractors,
# Purchase Orders, Documents, Tasks, Milestones,
# Developer Platform APIs
```

### **AI APIs**
```
POST   /api/ai/chat           # AI chat interface
POST   /api/ai/suggest        # AI suggestions
GET    /api/ai/usage          # AI usage stats
GET    /api/ai/conversations  # Chat history
```

### **Authentication**
```
POST   /api/auth/register     # User registration
POST   /api/auth/login        # User login
GET    /api/auth/me           # Get current user
POST   /api/auth/refresh      # Refresh token
```

---

## 🔐 **SECURITY FEATURES**

### **Authentication & Authorization**
- **JWT Tokens**: Secure authentication
- **Role-Based Access Control**: super_admin, company_admin, developer
- **Row Level Security**: Multi-tenant data isolation
- **API Rate Limiting**: DDoS protection

### **Data Security**
- **Encrypted Storage**: Sensitive data encryption
- **Secure Headers**: CORS, CSP, HSTS
- **Input Validation**: SQL injection prevention
- **Audit Logging**: Complete activity tracking

---

## 🚀 **PERFORMANCE OPTIMIZATION**

### **Frontend Optimization**
- **Code Splitting**: React.lazy() for components
- **Bundle Optimization**: Vite build optimization
- **Caching Strategy**: Browser and CDN caching
- **Image Optimization**: Lazy loading and compression

### **Backend Optimization**
- **Database Indexing**: 20+ performance indexes
- **Connection Pooling**: Efficient database connections
- **Caching Layer**: Redis for session management
- **API Optimization**: Pagination and filtering

---

## 📈 **MONITORING & ANALYTICS**

### **Application Monitoring**
```javascript
// Health check endpoint
GET /api/health

// Metrics endpoint
GET /api/metrics

// Performance monitoring
GET /api/performance
```

### **Error Tracking**
- **Comprehensive Logging**: Winston logger
- **Error Boundaries**: React error handling
- **API Error Handling**: Structured error responses
- **Real-time Alerts**: Critical issue notifications

---

## 🔄 **CI/CD PIPELINE**

### **GitHub Actions**
```yaml
name: Deploy CortexBuild
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm test
      - name: Deploy to production
        run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

---

## 🆘 **TROUBLESHOOTING**

### **Common Issues**

**1. Dependencies Error**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**2. Database Connection**
```bash
# Check database URL
echo $DATABASE_URL

# Test connection
npm run db:test
```

**3. AI API Issues**
```bash
# Verify API keys
echo $OPENAI_API_KEY
echo $GOOGLE_AI_API_KEY
```

### **Support**
- **Documentation**: Check ADVANCED_FEATURES_v2.md
- **Issues**: GitHub Issues
- **Community**: Discord/Slack channels

---

## 🎯 **SUCCESS METRICS**

### **Performance Targets**
- **Page Load**: < 2 seconds
- **API Response**: < 500ms
- **Uptime**: 99.9%
- **Error Rate**: < 0.1%

### **User Experience**
- **Workflow Creation**: < 5 minutes
- **AI Response**: < 3 seconds
- **Template Loading**: < 1 second
- **Real-time Updates**: < 100ms

---

**CortexBuild v2.0** is production-ready with enterprise-grade security, performance, and scalability. Deploy with confidence! 🚀

**Need Help?** Check our comprehensive documentation or reach out to our support team.
