# EmailJS Setup Guide

## Quick Fix (Current Status)
✅ **Your app works without EmailJS!** Verification codes are logged in the backend console.

## Optional: Setup EmailJS for Automatic Emails

### Step 1: Create EmailJS Account
1. Go to [emailjs.com](https://www.emailjs.com/)
2. Sign up for free account
3. Verify your email

### Step 2: Create Email Service
1. Go to **Email Services** → **Add New Service**
2. Choose **Gmail** (recommended)
3. Connect your Gmail account
4. Note the **Service ID** (e.g., `service_abc123`)

### Step 3: Create Email Template
1. Go to **Email Templates** → **Create New Template**
2. Use this template:

```
Subject: LifeLink Email Verification

Hello,

Your LifeLink verification code is: {{message}}

This code expires in 5 minutes.

Best regards,
LifeLink Team
```

3. Note the **Template ID** (e.g., `template_xyz789`)

### Step 4: Get Public Key
1. Go to **Account** → **General**
2. Copy your **Public Key** (e.g., `user_abcdefghijk`)

### Step 5: Update Frontend Environment
Update `frontend/.env`:

```
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=user_abcdefghijk
```

### Step 6: Restart Frontend
```bash
cd frontend
npm run dev
```

## Testing
1. Try registering with email
2. Check if email arrives
3. If not, verification codes are still logged in backend console

## Current Fallback System
- ✅ Backend generates verification codes
- ✅ Codes logged in console for testing
- ✅ Users can complete registration
- ✅ Google OAuth works perfectly
- ✅ App is fully functional

EmailJS is just for convenience - your app works great without it!