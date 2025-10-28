# IONOS Deploy Now - Quick Setup Guide

## 🚀 Deploy Your App in 5 Minutes

IONOS Deploy Now automatically builds and deploys your React app from GitHub with zero configuration needed. Every git push triggers automatic deployment.

---

## ✅ Prerequisites

- ✓ GitHub account
- ✓ Repository: https://github.com/adrianstanca1/admin
- ✓ IONOS account (free tier available)

---

## 📝 Step-by-Step Setup

### Step 1: Sign Up for Deploy Now

1. Go to: **https://www.ionos.com/hosting/deploy-now**
2. Click **"Start for free"**
3. Sign up with your email or GitHub account
4. Verify your email if required

### Step 2: Install Deploy Now GitHub App

1. From Deploy Now dashboard, click **"New Project"**
2. Choose **"Deploy from existing repository"**
3. Click **"Install IONOS Deploy Now"** on GitHub
4. Authorize the app to access your repositories
5. Choose one of:
   - **All repositories** (recommended for ease)
   - **Only select repositories** (choose `adrianstanca1/admin`)

### Step 3: Connect Your Repository

1. Back in Deploy Now, select **"adrianstanca1/admin"** from the list
2. Or paste the repository URL: `https://github.com/adrianstanca1/admin`
3. Click **"Continue"**

### Step 4: Configure Deployment

Deploy Now will **automatically detect**:
- ✅ Framework: **React + Vite**
- ✅ Build command: `npm run build`
- ✅ Output directory: `dist`
- ✅ Node version: Latest LTS

**Review the auto-detected settings:**

| Setting | Value |
|---------|-------|
| **Framework** | React (Vite) |
| **Build Command** | `npm ci && npm run build` |
| **Publish Directory** | `dist` |
| **Node Version** | v20.x |
| **Project Type** | Static Site |

**Click "Continue"** if everything looks correct.

### Step 5: Environment Variables (Optional)

If your app needs environment variables:

1. Click **"Add environment variable"**
2. Add any `VITE_*` variables your app needs:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_API_URL=your-api-url
   ```
3. Click **"Continue"**

**Note:** You can add/edit these later in the Deploy Now dashboard.

### Step 6: Deploy!

1. Review all settings one final time
2. Click **"Create project and deploy"**
3. Watch the deployment progress in real-time
4. Wait 2-5 minutes for first deployment

### Step 7: Access Your Site

Once deployed, Deploy Now provides:

- ✅ **Production URL**: `https://your-project.ionos.space`
- ✅ **Preview URLs** for each branch
- ✅ **Automatic SSL certificate**
- ✅ **DDoS protection**
- ✅ **CDN delivery**

---

## 🔄 Automatic Deployments

After initial setup, Deploy Now automatically:

1. **Watches your repository** for changes
2. **Triggers build** on every git push to `main` or `aiconstruct`
3. **Deploys successfully built** versions
4. **Notifies you** of deployment status (success/failure)

### To Deploy:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Deploy Now handles the rest!

---

## 🌿 Staging Deployments

Create preview environments for testing:

1. Create a new branch:
   ```bash
   git checkout -b feature/new-feature
   git push origin feature/new-feature
   ```

2. In Deploy Now dashboard:
   - Click **"Add staging deployment"**
   - Select the branch: `feature/new-feature`
   - Get a unique preview URL: `https://feature-new-feature.your-project.ionos.space`

---

## 🔧 Configuration Files

The project includes:

- **`.deploy-now/config.yaml`** - Deploy Now configuration (optional)
- **Package.json** - Already configured with build scripts

Deploy Now reads these automatically.

---

## 🎯 Deploy Now Features

### ✅ Included in Free Tier:
- 50 MB storage
- 1 production deployment
- 1 staging deployment
- Automatic SSL (HTTPS)
- DDoS protection
- Build automation via GitHub Actions
- Custom domain support (bring your own)

### 🚀 Static Project ($2/month):
- 1 GB storage
- Unlimited production deployments
- 5 staging deployments
- Everything from free tier

### ⚡ PHP Project ($8/month):
- 10 GB storage
- PHP runtime
- 2 GB MariaDB database
- Everything from Static tier

---

## 🔐 Managing Secrets

For sensitive credentials:

1. Go to Deploy Now dashboard
2. Select your project
3. Click **"Runtime configuration"**
4. Click **"Add secret"**
5. Add your secrets (they're encrypted and hidden)
6. Reference in code as: `import.meta.env.VITE_YOUR_SECRET`

**Never commit secrets to git!**

---

## 🌐 Custom Domain Setup

To use `asagents.co.uk`:

1. In Deploy Now dashboard, click **"Add custom domain"**
2. Enter: `asagents.co.uk`
3. Add the DNS records shown to your IONOS domain settings:
   ```
   Type: CNAME
   Name: @
   Value: [provided by Deploy Now]
   ```
4. Wait for DNS propagation (5-60 minutes)
5. SSL certificate is automatically issued

---

## 📊 Monitoring & Logs

Access deployment logs:

1. Go to **Deploy Now dashboard**
2. Click your project
3. Click **"Deployments"** tab
4. Click any deployment to see:
   - Build logs
   - Deployment status
   - Error messages
   - Build duration

---

## 🛠️ Troubleshooting

### Build Fails

**Check:**
- Build command in Deploy Now matches `package.json`
- All dependencies in `package.json`
- No missing environment variables
- Node version compatibility

**View logs** in Deploy Now dashboard for specific errors.

### Site Not Updating

**Solutions:**
- Force a new deployment: Make a small change and push
- Check deployment status in dashboard
- Verify branch name matches (main vs master)

### Environment Variables Not Working

**Ensure:**
- Variables start with `VITE_`
- Added in Deploy Now dashboard under "Runtime configuration"
- Referenced as `import.meta.env.VITE_VARIABLE_NAME`

---

## 🔄 Rollback Deployments

To rollback to a previous version:

1. Go to **Deployments** tab
2. Find the working deployment
3. Click **"Redeploy"**
4. Confirm

Your site returns to that version instantly.

---

## 📞 Support

- **Deploy Now Docs**: https://docs.ionos.space/
- **Support Email**: deploynow-support@ionos.com
- **Community**: GitHub Discussions on Deploy Now repos
- **Status Page**: Check for service issues

---

## 🎉 Quick Start Checklist

- [ ] Sign up at https://www.ionos.com/hosting/deploy-now
- [ ] Install Deploy Now GitHub App
- [ ] Connect repository: `adrianstanca1/admin`
- [ ] Confirm auto-detected settings (React/Vite)
- [ ] Add environment variables (if needed)
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete
- [ ] Visit your new URL!
- [ ] (Optional) Set up custom domain: asagents.co.uk
- [ ] Push code to trigger automatic deployments

---

## ⚡ One-Click Deploy Alternative

Can't access Deploy Now dashboard? Use this direct link:

**Deploy Button:**
```markdown
[![Deploy to IONOS](https://images.ionos.space/deploy-now-icons/deploy-to-ionos-btn.svg)](https://ionos.space/setup?repo=https://github.com/adrianstanca1/admin)
```

Click to instantly set up deployment!

---

## 📚 Additional Resources

- **Deploy Now Homepage**: https://www.ionos.com/hosting/deploy-now
- **Full Documentation**: https://docs.ionos.space/
- **Framework Guides**: https://docs.ionos.space/docs/framework-guides/
- **Deploy Now Blog**: https://docs.ionos.space/blog/
- **GitHub Marketplace**: https://github.com/marketplace/ionos-deploy-now

---

## 🚀 What Happens Next?

1. **First deployment**: 2-5 minutes
2. **Future deployments**: 1-3 minutes (automatic)
3. **SSL certificate**: Issued automatically
4. **Your site**: Live at `https://your-project.ionos.space`

**That's it! Your app is now deployed with CI/CD! 🎉**

---

**Generated by Claude Code for asagents-ultimate**
**Repository**: https://github.com/adrianstanca1/admin
**Build**: React 18 + Vite 5 + TypeScript
