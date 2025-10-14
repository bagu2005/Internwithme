# Google OAuth Setup Guide

This guide will help you set up Google OAuth for the InternWithMe application.

## Prerequisites

- A Google account
- Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" at the top
3. Click "New Project"
4. Enter project name: "InternWithMe"
5. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API" or "Google Identity"
3. Click on "Google Identity" and then "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in required fields:
     - App name: "InternWithMe"
     - User support email: your email
     - Developer contact: your email
   - Add your domain to authorized domains
   - Save and continue through the steps

4. For Application type, choose "Web application"
5. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
6. Add authorized redirect URIs:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
7. Click "Create"
8. Copy the **Client ID** (you'll need this)

## Step 4: Configure Environment Variables

### Backend (.env file)
Add to your `server/.env` file:
```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Frontend (.env file)
Create a `client/.env` file and add:
```
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## Step 5: Test the Integration

1. Start both servers:
   ```bash
   # Backend
   cd server && npm run dev
   
   # Frontend
   cd client && npm run dev
   ```

2. Go to `http://localhost:3000`
3. Try to register or login
4. You should see a "Continue with Google" button
5. Click it and test the Google OAuth flow

## Troubleshooting

### Common Issues

1. **"Google Sign-In not configured" message**
   - Make sure `VITE_GOOGLE_CLIENT_ID` is set in your frontend `.env` file
   - Restart the frontend server after adding the environment variable

2. **"Invalid client" error**
   - Check that your Client ID is correct
   - Make sure the domain is added to authorized origins in Google Console

3. **"Access blocked" error**
   - Your app might need verification for production use
   - For development, add test users in the OAuth consent screen

4. **CORS errors**
   - Make sure your frontend URL is in the authorized JavaScript origins
   - Check that the backend CORS settings allow your frontend domain

### Development vs Production

- **Development**: Use `http://localhost:3000` in authorized origins
- **Production**: Replace with your actual domain
- **HTTPS**: Google OAuth requires HTTPS in production

## Security Notes

- Never commit your `.env` files to version control
- Use different Client IDs for development and production
- Regularly rotate your OAuth credentials
- Monitor OAuth usage in Google Cloud Console

## Features

With Google OAuth enabled, users can:
- Sign up with their Google account
- Sign in with their Google account
- Link their Google account to existing email/password accounts
- Use either authentication method interchangeably

The system automatically:
- Creates user accounts for new Google users
- Links Google accounts to existing email accounts
- Handles both authentication methods seamlessly
