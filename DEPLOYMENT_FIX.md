# Deployment Fix Guide

## Issues Fixed:
1. ✅ CORS configuration updated
2. ✅ Manual CORS headers added as fallback
3. ✅ Frontend API configuration improved
4. ✅ Better error handling and logging
5. ✅ Fixed missing dependencies (google-auth-library, node-fetch)
6. ✅ Added proper error handling for route loading

## Next Steps:

### 1. Clean and Redeploy Backend (Render)
```bash
cd backend
# Clean npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Commit and push
git add .
git commit -m "Fix dependencies and CORS configuration"
git push origin main
```

### 2. Redeploy Frontend (Vercel)
```bash
cd frontend
git add .
git commit -m "Improve API configuration and error handling"
git push origin main
```

### 3. Verify Environment Variables

**Backend (Render Dashboard):**
- `NODE_ENV=production`
- `FRONTEND_URL=https://lifelink-tan.vercel.app`
- `MONGO_URI=your_mongodb_connection_string`
- `JWT_SECRET=your_jwt_secret`
- `EMAIL_USER=your_email`
- `EMAIL_PASS=your_app_password`

**Frontend (Vercel Dashboard):**
- `VITE_API_URL=https://lifelink-backend-kvbz.onrender.com`

### 4. Test Endpoints

After deployment, test these URLs:

1. **Backend Health Check:**
   - https://lifelink-backend-kvbz.onrender.com/
   - https://lifelink-backend-kvbz.onrender.com/health

2. **CORS Test:**
   - Open browser console on https://lifelink-tan.vercel.app
   - Check if API calls work without CORS errors

### 5. Common Issues & Solutions

**If backend URL doesn't resolve:**
- Check Render deployment logs
- Verify the service is running
- Check if the domain is correct

**If CORS still fails:**
- Verify environment variables are set correctly
- Check Render logs for CORS-related messages
- Ensure frontend URL matches exactly

**If API calls timeout:**
- Render free tier has cold starts (30s delay)
- First request after inactivity may be slow

### 6. Debugging Commands

```bash
# Check if backend is accessible
curl https://lifelink-backend-kvbz.onrender.com/health

# Test CORS from command line
curl -H "Origin: https://lifelink-tan.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://lifelink-backend-kvbz.onrender.com/api/auth/login
```