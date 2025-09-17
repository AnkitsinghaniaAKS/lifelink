# Professional Email Setup with Resend

## Why Resend?
- ✅ Works reliably on Render/Vercel
- ✅ 3,000 free emails per month
- ✅ Professional email service
- ✅ No SMTP blocking issues

## Setup Steps (5 minutes)

### 1. Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up with your email
3. Verify your account

### 2. Get API Key
1. Go to **API Keys** in dashboard
2. Click **Create API Key**
3. Name: `LifeLink Production`
4. Copy the API key (starts with `re_`)

### 3. Add to Render
1. Go to Render Dashboard → Your Service → Environment
2. Add new variable:
   ```
   RESEND_API_KEY=re_your_api_key_here
   ```
3. Click **Save Changes**

### 4. Test
1. Wait 2-3 minutes for deployment
2. Try email verification on your site
3. Check your email inbox

## Alternative: Use Your Domain (Optional)

### 1. Add Domain in Resend
1. Go to **Domains** in Resend dashboard
2. Add your domain (e.g., `yourdomain.com`)
3. Add DNS records as shown

### 2. Update Code
Change the `from` field in email route:
```javascript
from: 'LifeLink <noreply@yourdomain.com>',
```

## Current Status
- ✅ Professional email template ready
- ✅ Resend integration implemented
- ✅ Fallback logging for debugging
- ✅ Rate limiting and security

Your email verification will work professionally once you add the Resend API key!