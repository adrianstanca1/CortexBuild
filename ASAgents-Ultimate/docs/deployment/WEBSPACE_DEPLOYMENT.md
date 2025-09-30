# 🚀 ASAgents Platform - Webspace Host Deployment

## 📋 **Quick Deployment Guide**

Your ASAgents platform is ready to deploy to your webspace hosting server:
- **Host**: access-5018479851.webspace-host.com
- **Protocol**: SFTP + SSH
- **Username**: a1038987

## ⚡ **One-Command Deployment**

```bash
# Deploy everything to your webspace host
npm run deploy:webspace
```

This command will:
1. ✅ Build the frontend for production
2. ✅ Connect to your SFTP server
3. ✅ Upload all files to the correct directories
4. ✅ Configure the backend
5. ✅ Start the application

## 🔧 **Manual Step-by-Step Deployment**

### **Step 1: Build for Webspace Host**
```bash
# Build frontend with webspace configuration
npm run build:webspace
```

### **Step 2: Deploy to Server**
```bash
# Deploy using SFTP
npm run deploy:webspace
```

### **Step 3: Verify Deployment**
Visit: https://access-5018479851.webspace-host.com

## 📁 **File Structure on Server**

After deployment, your files will be organized as:

```
/html/                          # Frontend files (web root)
├── index.html                  # Main application
├── assets/                     # CSS, JS, images
├── .htaccess                   # URL rewriting for SPA
└── uploads/                    # User uploaded files

/nodejs/                        # Backend files
├── src/                        # Backend source code
├── package.json               # Dependencies
├── .env                       # Environment configuration
└── node_modules/              # Installed packages

/logs/                         # Application logs
└── app.log                    # Main log file
```

## 🌐 **URLs After Deployment**

- **Frontend**: https://access-5018479851.webspace-host.com
- **Backend API**: https://access-5018479851.webspace-host.com/api
- **Health Check**: https://access-5018479851.webspace-host.com/api/system/health

## ⚙️ **Configuration Details**

### **Frontend Configuration**
- API URL: `https://access-5018479851.webspace-host.com/api`
- Gemini AI: Configured with your API key
- OAuth: Google and GitHub configured
- File uploads: Up to 50MB supported

### **Backend Configuration**
- Port: 3000 (internal)
- Database: MySQL (configure in `.env.webspace`)
- File storage: Local filesystem
- Logging: File-based logging

## 🔐 **Security Features**

- ✅ HTTPS enforced
- ✅ CORS configured for your domain
- ✅ File upload validation
- ✅ Rate limiting enabled
- ✅ Security headers configured

## 📊 **Monitoring**

### **Health Checks**
```bash
# Check if application is running
curl https://access-5018479851.webspace-host.com/api/system/health
```

### **Log Monitoring**
```bash
# View application logs (via SSH)
ssh a1038987@access-5018479851.webspace-host.com
tail -f /logs/app.log
```

## 🛠️ **Troubleshooting**

### **Common Issues**

#### **1. Frontend Not Loading**
- Check if files uploaded to `/html/` directory
- Verify `.htaccess` file exists for SPA routing
- Check browser console for errors

#### **2. API Not Responding**
- Verify backend files in `/nodejs/` directory
- Check if Node.js process is running
- Review logs in `/logs/app.log`

#### **3. Database Connection Issues**
- Update database credentials in `server/.env.webspace`
- Ensure database server is accessible
- Check database permissions

### **Restart Backend Service**
```bash
# SSH into server
ssh a1038987@access-5018479851.webspace-host.com

# Kill existing process
pkill -f "node.*src/index.js"

# Start new process
cd /nodejs
nohup node src/index.js > /logs/app.log 2>&1 &
```

## 🔄 **Updates & Maintenance**

### **Deploy Updates**
```bash
# After making changes, redeploy
npm run deploy:webspace
```

### **Database Updates**
```bash
# If database schema changes, run migrations
ssh a1038987@access-5018479851.webspace-host.com
cd /nodejs
node scripts/production-setup.js
```

### **Backup Important Data**
```bash
# Download uploads and database backups regularly
scp -r a1038987@access-5018479851.webspace-host.com:/uploads ./backups/
```

## 📞 **Support**

### **Hosting Provider Support**
- **Provider**: Webspace Host
- **Control Panel**: Check your hosting control panel for additional tools
- **Support**: Contact your hosting provider for server-related issues

### **Application Support**
- **Logs**: Check `/logs/app.log` for application errors
- **Health Check**: Monitor API health endpoint
- **Performance**: Monitor response times and resource usage

## 🎉 **Success!**

Once deployed, your ASAgents platform will be live at:
**https://access-5018479851.webspace-host.com**

Features available:
- ✅ Complete construction project management
- ✅ AI-powered multimodal content processing
- ✅ Google & GitHub OAuth authentication
- ✅ File upload and processing
- ✅ Real-time collaboration tools
- ✅ Financial management and reporting

Your platform is now ready for production use! 🚀
