# 🎯 Complete Render Deployment Guide - Frontend + Backend

## 📦 What You Need to Deploy

1. **Backend Service** (Node.js Web Service) - Runs on port 10000
2. **Frontend Service** (Node.js Web Service) - Runs on port 10000
3. **Environment Variables** - Connect them together

---

## 🔧 STEP 1: Deploy Backend First

### Backend Configuration:

**Service Details:**
- **Name**: `firstbird-backend`
- **Region**: Oregon (US West)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: Node

**Build & Start Commands:**
```bash
# Build Command:
npm install && npx prisma generate && npx prisma db push

# Start Command:
npm start
```

**Environment Variables to Add:**

Click **"+ Add Environment Variable"** and add these:

| NAME_OF_VARIABLE | value |
|------------------|-------|
| `DATABASE_URL` | `file:./dev.db` |
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `SHOPIFY_SHOP` | `your-shop.myshopify.com` |
| `SHOPIFY_API_KEY` | `your_api_key_here` |
| `SHOPIFY_API_SECRET` | `your_secret_here` |
| `SHOPIFY_ACCESS_TOKEN` | `your_token_here` |

**Instance Type:**
- Select **Free** (512 MB RAM, 0.1 CPU)

### ⚠️ IMPORTANT: Add Persistent Disk for Database

After creating the backend service:
1. Go to service **Settings** → **Disks**
2. Click **"Add Disk"**
3. **Name**: `database`
4. **Mount Path**: `/opt/render/project/src/backend`
5. **Size**: 1 GB (free)
6. Click **Save**

### ✅ Deploy Backend
Click **"Deploy Web Service"**

Wait for deployment to complete. You'll get a URL like:
```
https://firstbird-backend.onrender.com
```

**Copy this URL** - you need it for frontend!

---

## 🎨 STEP 2: Deploy Frontend

### Frontend Configuration:

**Service Details:**
- **Name**: `firstbird-frontend` 
- **Region**: Oregon (US West)
- **Branch**: `main`
- **Root Directory**: Leave empty (root of repo)
- **Runtime**: Node

**Build & Start Commands:**
```bash
# Build Command:
npm install && npm run build

# Start Command:
npm start
```

**Environment Variables to Add:**

Click **"+ Add Environment Variable"** and add:

| NAME_OF_VARIABLE | value |
|------------------|-------|
| `VITE_API_URL` | `https://firstbird-backend.onrender.com/api` |

⚠️ **Replace** `firstbird-backend.onrender.com` with YOUR actual backend URL!

**Instance Type:**
- Select **Free** (512 MB RAM, 0.1 CPU)

### ✅ Deploy Frontend
Click **"Deploy Web Service"**

Your frontend will be live at:
```
https://firstbird-frontend.onrender.com
```

---

## 🔌 How Ports & Environment Variables Work

### Backend Port Handling:
```javascript
// backend/src/server.js already has this:
const port = process.env.PORT || 3000;
```
- Render automatically sets `PORT=10000`
- Your backend listens on this port
- Render exposes it publicly

### Frontend Port Handling:
```javascript
// vite.config.js (already created) handles this:
preview: {
  host: '0.0.0.0',
  port: process.env.PORT || 5173
}
```
- Render sets `PORT=10000` 
- Vite preview server binds to `0.0.0.0:10000`
- Render exposes it publicly

### Frontend-Backend Connection:
```javascript
// src/services/api.js (already updated) has this:
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
```
- In production: Uses `VITE_API_URL` from environment
- In development: Uses `localhost:3000`

---

## 📝 Quick Checklist

### Backend Checklist:
- [ ] Root Directory = `backend`
- [ ] Build Command = `npm install && npx prisma generate && npx prisma db push`
- [ ] Start Command = `npm start`
- [ ] Added all environment variables (especially Shopify credentials)
- [ ] Added persistent disk at `/opt/render/project/src/backend`
- [ ] Service deployed successfully
- [ ] Copied backend URL

### Frontend Checklist:
- [ ] Root Directory = empty (leave blank)
- [ ] Build Command = `npm install && npm run build`
- [ ] Start Command = `npm start`
- [ ] Added `VITE_API_URL` with YOUR backend URL + `/api`
- [ ] Service deployed successfully
- [ ] Can access frontend URL in browser

---

## 🧪 Testing Your Deployment

### 1. Test Backend API:
Visit: `https://your-backend-url.onrender.com/api/orders`

Should return JSON data (might be empty array if no orders yet)

### 2. Test Frontend:
Visit: `https://your-frontend-url.onrender.com`

Should load your dashboard!

### 3. Check Connection:
- Open browser console (F12)
- Go to Network tab
- Refresh page
- Should see API calls to your backend URL

---

## 🐛 Troubleshooting

### Frontend shows "No open ports detected":
✅ **Fixed!** Make sure you pushed the latest code with:
- `vite.config.js` 
- Updated `package.json` with `npm start` script

Then redeploy.

### Frontend can't connect to backend:
- Check `VITE_API_URL` environment variable
- Must include `/api` at the end: `https://backend-url.onrender.com/api`
- Rebuild frontend after changing environment variables

### Backend database issues:
- Make sure persistent disk is added
- Check disk is mounted at `/opt/render/project/src/backend`
- Check `DATABASE_URL` is set to `file:./dev.db`

### Services spinning down (cold starts):
- Free tier sleeps after 15 minutes inactivity
- First request takes 30-60 seconds to wake up
- Use [UptimeRobot](https://uptimerobot.com) (free) to ping every 14 minutes

---

## 🔄 Updating Your Deployment

After making code changes:

```powershell
# Commit and push changes
git add .
git commit -m "Update code"
git push
```

Render will auto-deploy! Or click **"Manual Deploy"** in dashboard.

### To update environment variables:
1. Go to service → **Environment**
2. Edit variables
3. Click **Save Changes** (triggers rebuild)

---

## 💰 Free Tier Limits

**Render Free Tier:**
- 750 hours/month per service
- 512 MB RAM
- 0.1 CPU
- Services sleep after 15 min inactivity
- 1 GB persistent disk (free)

**Perfect for this project!** ✅

---

## 🎉 Summary

**Backend URL**: `https://firstbird-backend.onrender.com`
- Serves API on `/api/*` endpoints
- Stores data in SQLite (persistent disk)
- Syncs with Shopify every 5 minutes

**Frontend URL**: `https://firstbird-frontend.onrender.com`  
- Serves your dashboard UI
- Connects to backend via `VITE_API_URL`
- Built with Vite and served via preview mode

**Both run on port 10000** (Render's default) and are publicly accessible!

---

Need help? Check the logs in Render dashboard:
- Service → **Logs** tab
- Shows build output and runtime logs
- Great for debugging! 🔍
