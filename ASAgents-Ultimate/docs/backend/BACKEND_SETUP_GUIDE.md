# 🚀 Backend Setup Guide - Node.js Enabled

Since Node.js is now enabled on your webspace hosting server, here's how to complete the backend setup:

## 📋 **Quick Setup Steps**

### **Step 1: Connect to Your Server**
```bash
ssh a1038987@access-5018479851.webspace-host.com
```
Password: `Cumparavinde1`

### **Step 2: Navigate to Backend Directory**
```bash
cd nodejs
```

### **Step 3: Install Dependencies**
```bash
npm install --production
```

### **Step 4: Setup Environment**
```bash
cp .env.production .env
```

### **Step 5: Start the Backend**
```bash
# Start the backend service
nohup node src/index.js > ../logs/app.log 2>&1 &
```

### **Step 6: Verify It's Running**
```bash
# Check if the process is running
ps aux | grep "node.*src/index"

# Test the API
curl http://localhost:3000/api/system/health
```

## 🔧 **Alternative: One-Command Setup**

You can run all steps at once:
```bash
ssh a1038987@access-5018479851.webspace-host.com "cd nodejs && npm install --production && cp .env.production .env && nohup node src/index.js > ../logs/app.log 2>&1 & echo 'Backend started'"
```

## 🌐 **After Setup - Your URLs**

Once the backend is running:

- **Frontend**: https://access-5018479851.webspace-host.com
- **API Health**: https://access-5018479851.webspace-host.com/api/system/health
- **API Base**: https://access-5018479851.webspace-host.com/api

## 🔍 **Troubleshooting**

### **Check Backend Status**
```bash
# SSH into server
ssh a1038987@access-5018479851.webspace-host.com

# Check if backend is running
ps aux | grep node

# View logs
tail -f logs/app.log

# Restart if needed
pkill -f "node.*src/index"
cd nodejs && nohup node src/index.js > ../logs/app.log 2>&1 &
```

### **Common Issues**

#### **1. Dependencies Not Installing**
```bash
# Clear npm cache and retry
cd nodejs
npm cache clean --force
npm install --production
```

#### **2. Backend Not Starting**
```bash
# Check for errors
cd nodejs
node src/index.js
# (Run without nohup to see errors)
```

#### **3. Port Issues**
The backend runs on port 3000 internally. Make sure your hosting provider allows this port or configure a different port in the environment file.

## 📊 **Database Configuration**

You'll also need to set up a database. Update the database settings in:
```bash
cd nodejs
nano .env
```

Update these variables:
```bash
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
```

## 🎉 **Success Indicators**

You'll know everything is working when:

1. ✅ **Frontend loads**: https://access-5018479851.webspace-host.com shows your ASAgents platform
2. ✅ **API responds**: https://access-5018479851.webspace-host.com/api/system/health returns JSON
3. ✅ **Backend process running**: `ps aux | grep node` shows your Node.js process
4. ✅ **No errors in logs**: `tail logs/app.log` shows successful startup

## 🔄 **Automatic Restart (Optional)**

To ensure your backend restarts automatically, you can set up a cron job:

```bash
# Edit crontab
crontab -e

# Add this line to restart every hour if not running
0 * * * * cd ~/nodejs && pgrep -f "node.*src/index" || nohup node src/index.js > ../logs/app.log 2>&1 &
```

## 📞 **Need Help?**

If you encounter issues:
1. Check the logs: `tail -f logs/app.log`
2. Verify Node.js version: `node --version`
3. Check npm version: `npm --version`
4. Contact your hosting provider if Node.js commands don't work

Your ASAgents platform is almost ready! Just run the setup commands above and you'll have a fully functional construction and engineering management platform with AI capabilities! 🚀
