# 🚀 CortexBuild - Setup Guide

**Quick setup guide for CortexBuild v1.0.0**

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Install Dependencies
```bash
cd CortexBuild
npm install
```

This will install all required packages (~2-3 minutes).

### Step 2: Start the Application
```bash
npm run dev:all
```

This starts both:
- **Frontend** on http://localhost:5173
- **Backend API** on http://localhost:3001

### Step 3: Login
Open http://localhost:5173 in your browser and login with:

```
Email: adrian.stanca1@gmail.com
Password: Cumparavinde1
```

**That's it! You're ready to use CortexBuild!** 🎉

---

## 📋 Detailed Setup

### Prerequisites

Make sure you have installed:
- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)

Check your versions:
```bash
node --version  # Should be v18.x.x or higher
npm --version   # Should be 9.x.x or higher
```

---

## 🔧 Installation Steps

### 1. Navigate to Project
```bash
cd CortexBuild
```

### 2. Install Dependencies
```bash
npm install
```

**What gets installed:**
- React 19.2.0
- TypeScript
- Vite (build tool)
- Tailwind CSS
- Express.js
- SQLite (better-sqlite3)
- bcrypt (password hashing)
- JWT (authentication)
- And more...

**Installation time:** ~2-3 minutes

### 3. Database Setup

The database will be **automatically created** on first run!

If you need to reset the database:
```bash
# Delete existing database
rm cortexbuild.db cortexbuild.db-shm cortexbuild.db-wal

# Restart the server (database will be recreated)
npm run server
```

---

## 🎮 Running the Application

### Option 1: Run Everything (Recommended)
```bash
npm run dev:all
```

This runs both frontend and backend concurrently.

### Option 2: Run Separately

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
npm run server
```

---

## 🌐 Access Points

Once running, you can access:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Main application UI |
| **Backend API** | http://localhost:3001 | REST API endpoints |
| **API Health** | http://localhost:3001/api/health | Health check |

---

## 🔐 Default Credentials

### Admin User
```
Email: adrian.stanca1@gmail.com
Password: Cumparavinde1
Company: CortexBuild Demo
```

This user has full access to all features.

### Creating New Users

You can register new users through the UI:
1. Click "Register" on login page
2. Fill in the form
3. Login with new credentials

Or use the API:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePassword123",
    "name": "New User",
    "company_name": "My Company"
  }'
```

---

## 📊 Testing the Application

### 1. Dashboard
- Navigate to Dashboard
- See analytics charts
- Check KPI cards

### 2. Clients
- Click "Clients" in sidebar
- Click "New Client" button
- Fill in form and save
- Try Edit and Delete buttons

### 3. Projects
- Click "Projects" in sidebar
- Click "New Project" button
- Select a client
- Fill in details and save

### 4. Invoices
- Click "Invoices" in sidebar
- Click "New Invoice" button
- Use Invoice Builder
- Select template
- Add line items
- Preview and save

### 5. Time Tracking
- Click "Time Tracking" in sidebar
- Click "Log Time" button
- Select project
- Enter hours
- Save entry

### 6. RFIs
- Click "RFIs" in sidebar
- Click "New RFI" button
- Fill in RFI details
- Set priority and due date
- Save

### 7. Purchase Orders
- Click "Purchase Orders" in sidebar
- Click "New Purchase Order" button
- Enter vendor and amount
- Save PO

### 8. Documents
- Click "Documents" in sidebar
- Click "Upload Document" button
- Fill in document details
- Save

---

## 🛠️ Development Commands

### Start Development
```bash
npm run dev:all      # Frontend + Backend
npm run dev          # Frontend only
npm run server       # Backend only
```

### Build for Production
```bash
npm run build        # Creates dist/ folder
```

### Preview Production Build
```bash
npm run preview      # Serves production build
```

### Lint Code
```bash
npm run lint         # Check for code issues
```

---

## 🐛 Troubleshooting

### Issue: Port Already in Use

**Error:** `Port 5173 is already in use`

**Solution:**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
PORT=3000 npm run dev
```

### Issue: Database Locked

**Error:** `database is locked`

**Solution:**
```bash
# Stop all running processes
# Delete WAL files
rm cortexbuild.db-shm cortexbuild.db-wal

# Restart server
npm run server
```

### Issue: Module Not Found

**Error:** `Cannot find module 'xyz'`

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: TypeScript Errors

**Error:** Type errors during build

**Solution:**
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Fix errors in code
# Or temporarily disable strict mode in tsconfig.json
```

---

## 📦 Building for Production

### Step 1: Build
```bash
npm run build
```

This creates optimized files in `dist/` folder.

### Step 2: Test Production Build
```bash
npm run preview
```

### Step 3: Deploy

**Option A: Vercel (Recommended)**
```bash
npm install -g vercel
vercel
```

**Option B: Traditional Hosting**
1. Upload `dist/` folder to web server
2. Setup Node.js server for backend
3. Configure environment variables
4. Start backend with `npm run server`

**Option C: Docker**
```bash
# Build image
docker build -t cortexbuild .

# Run container
docker run -p 5173:5173 -p 3001:3001 cortexbuild
```

---

## 🔒 Security Setup

### Environment Variables

Create `.env` file:
```env
# Server
PORT=3001
NODE_ENV=production

# Database
DATABASE_PATH=./cortexbuild.db

# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production

# CORS
CORS_ORIGIN=https://yourdomain.com
```

### Change Default Password

**Important:** Change the default admin password!

1. Login with default credentials
2. Go to Settings (when implemented)
3. Change password

Or update directly in database:
```bash
npm run server
# Then use bcrypt to hash new password
```

---

## 📚 Additional Resources

### Documentation
- `README.md` - Full project documentation
- `CLEAN_VERSION.md` - Clean version details
- `SETUP.md` - This file

### Code Structure
- `components/base44/` - Main application
- `server/` - Backend API
- `server/routes/` - API endpoints

### API Documentation
See `README.md` for full API endpoint list.

---

## 🆘 Getting Help

### Common Questions

**Q: How do I add a new page?**
A: Create component in `components/base44/pages/`, add route in `Base44Clone.tsx`

**Q: How do I add a new API endpoint?**
A: Create route file in `server/routes/`, register in `server/index.ts`

**Q: How do I customize the design?**
A: Edit Tailwind classes in components, or modify `tailwind.config.js`

**Q: How do I add a new database table?**
A: Update `server/schema.sql`, delete database, restart server

### Support
- Email: adrian.stanca1@gmail.com
- Check code comments
- Review existing components for patterns

---

## ✅ Setup Checklist

- [ ] Node.js 18+ installed
- [ ] npm installed
- [ ] Project cloned/downloaded
- [ ] Dependencies installed (`npm install`)
- [ ] Server started (`npm run dev:all`)
- [ ] Accessed http://localhost:5173
- [ ] Logged in successfully
- [ ] Tested creating a client
- [ ] Tested creating a project
- [ ] Tested invoice builder
- [ ] Reviewed dashboard analytics

---

**🎉 Setup Complete! Welcome to CortexBuild!**

Start building smarter, not harder! 🚀

