# Google OAuth Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "LifeLink Blood Donation"
4. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API" 
3. Click on it and press "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. If prompted, configure OAuth consent screen:
   - Choose "External" user type
   - Fill in app name: "LifeLink"
   - Add your email as developer contact
   - Save and continue through all steps
4. For Application type, select "Web application"
5. Add Authorized JavaScript origins:
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`
6. Click "Create"
7. Copy the Client ID (looks like: `1087339977234-abc123def456.apps.googleusercontent.com`)

## Step 4: Update Your Code

1. **Frontend**: Replace the `GOOGLE_CLIENT_ID` in `RegisterWithVerification.jsx`:
   ```javascript
   const GOOGLE_CLIENT_ID = 'YOUR_ACTUAL_CLIENT_ID_HERE';
   ```

2. **Backend**: Update `.env` file:
   ```
   GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE
   ```

## Step 5: Test

1. Restart your backend server: `npm run dev`
2. Restart your frontend: `npm run dev`
3. Go to registration page
4. Click "Sign up with Google"
5. Select your Google account
6. Should redirect to dashboard

## Troubleshooting

- **404 Error**: Make sure Client ID is correct in both frontend and backend
- **Invalid Client**: Check that localhost:5173 is in authorized origins
- **Popup Blocked**: Allow popups for localhost in browser settings

## Production Setup

For production, add your production domain to authorized origins:
- `https://yourdomain.com`
- `https://www.yourdomain.com`