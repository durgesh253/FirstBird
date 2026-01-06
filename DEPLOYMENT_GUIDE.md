# 🚀 Deployment Guide - Free Hosting with Render

This guide will help you deploy your FirstBird Dashboard (Frontend + Backend + Database) for **FREE** using Render.

## 📋 Prerequisites

1. **GitHub Account** - Sign up at [github.com](https://github.com)
2. **Render Account** - Sign up at [render.com](https://render.com) (use GitHub to sign in)
3. **Git Installed** - Download from [git-scm.com](https://git-scm.com)

---

## 🎯 Quick Start (5 Steps)

### Step 1: Push Your Code to GitHub

```powershell
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your code
git commit -m "Initial commit - ready for deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Render

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file
5. Click **"Apply"**

### Step 3: Configure Environment Variables

After deployment starts, go to each service and add environment variables:

#### Backend Service Environment Variables:
- `SHOPIFY_SHOP` = your-shop.myshopify.com
- `SHOPIFY_API_KEY` = your_shopify_api_key
- `SHOPIFY_API_SECRET` = your_shopify_api_secret
- `SHOPIFY_ACCESS_TOKEN` = your_shopify_access_token

### Step 4: Update Frontend API URL

After backend is deployed, Render will give you a URL like:
```
https://firstbird-backend.onrender.com
```

1. Go to **Frontend Service** → **Environment**
2. Add: `VITE_API_URL` = `https://your-backend-url.onrender.com/api`
3. Click **"Save Changes"** (this will trigger a rebuild)

### Step 5: Access Your App

- **Frontend**: https://firstbird-frontend.onrender.com
- **Backend API**: https://firstbird-backend.onrender.com/api

---

## 🔧 Alternative: Manual Deployment (If Blueprint Doesn't Work)

### Deploy Backend Manually:

1. **New Web Service**
   - Connect GitHub repo
   - Name: `firstbird-backend`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install && npx prisma generate && npx prisma db push`
   - Start Command: `npm start`
   - Plan: **Free**

2. **Add Persistent Disk** (for SQLite database)
   - Go to service settings → Storage
   - Add disk: Mount at `/opt/render/project/src/backend`
   - Size: 1GB

3. **Environment Variables**:
   ```
   DATABASE_URL=file:./dev.db
   NODE_ENV=production
   PORT=10000
   SHOPIFY_SHOP=your-shop.myshopify.com
   SHOPIFY_API_KEY=your_key
   SHOPIFY_API_SECRET=your_secret
   SHOPIFY_ACCESS_TOKEN=your_token
   ```

### Deploy Frontend Manually:

1. **New Static Site**
   - Connect GitHub repo
   - Name: `firstbird-frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Plan: **Free**

2. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

3. **Add Rewrite Rule** (for SPA routing)
   - Go to **Redirects/Rewrites**
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`

---

## 🌟 Alternative Free Hosting Options

### Option 2: Vercel (Frontend) + Render (Backend)

**Frontend on Vercel:**
```powershell
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variable:
# VITE_API_URL = https://your-backend.onrender.com/api
```

**Backend on Render:** Follow backend manual deployment steps above.

### Option 3: Railway (All-in-One)

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. **New Project** → **Deploy from GitHub**
4. Railway will auto-detect and deploy both services
5. Add a **PostgreSQL database** (free 500MB)
6. Update `schema.prisma` to use PostgreSQL instead of SQLite
7. Add environment variables

### Option 4: Fly.io (All-in-One)

```powershell
# Install Fly CLI
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# Deploy Backend
cd backend
fly launch

# Deploy Frontend
cd ..
fly launch
```

---

## ⚠️ Important Notes

### Free Tier Limitations:

**Render Free Tier:**
- Backend spins down after 15 minutes of inactivity (cold start ~30 seconds)
- 750 hours/month free compute
- Disk storage persists even when service is sleeping

**Workarounds:**
- Use a free uptime monitor like [UptimeRobot](https://uptimerobot.com) to ping your backend every 14 minutes
- Consider upgrading to paid tier ($7/month) for always-on service

### Database Considerations:

- **SQLite** (current): Works on Render with persistent disk
- **PostgreSQL** (recommended for production):
  - Free options: Neon, Supabase, Railway
  - Update `schema.prisma` datasource to `postgresql`
  - Change `DATABASE_URL` to PostgreSQL connection string

---

## 🐛 Troubleshooting

### Build Fails:
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node version compatibility

### Frontend Can't Connect to Backend:
- Check `VITE_API_URL` is set correctly
- Verify backend CORS settings allow frontend domain
- Check backend is running (visit API URL directly)

### Database Issues:
- Ensure persistent disk is mounted correctly
- Check `DATABASE_URL` in environment variables
- Run migrations manually if needed

---

## 📞 Need Help?

- **Render Docs**: https://render.com/docs
- **Deployment Issues**: Check service logs in Render dashboard
- **CORS Errors**: Update backend CORS configuration in `backend/src/app.js`

---

## 🎉 After Deployment

Your app is now live! Share your URLs:
- **Dashboard**: https://firstbird-frontend.onrender.com
- **API**: https://firstbird-backend.onrender.com/api

**Next Steps:**
1. Set up a custom domain (optional)
2. Configure uptime monitoring
3. Set up error tracking (Sentry, LogRocket)
4. Enable HTTPS (automatic on Render)
5. Monitor usage and performance

---

Made with ❤️ for free deployment!
