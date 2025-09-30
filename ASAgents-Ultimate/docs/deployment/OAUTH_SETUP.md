# Google OAuth Setup Instructions for ASAgents Platform

## Current Issue: redirect_uri_mismatch

This error occurs when the redirect URI in your Google OAuth request doesn't match the ones configured in Google Cloud Console.

## Fix Steps:

### 1. Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Go to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client IDs**
5. Select **Web application**
6. Add these **Authorized redirect URIs**:
   ```
   https://final-8decdnoi8-adrian-b7e84541.vercel.app/auth/google/callback
   https://final-fw3s16733-adrian-b7e84541.vercel.app/auth/google/callback
   http://localhost:5173/auth/google/callback (for development)
   https://localhost:5173/auth/google/callback (for HTTPS development)
   ```
7. Copy the **Client ID** (you'll need this for step 2)

### 2. Vercel Environment Variables

Go to your Vercel dashboard and add these environment variables:

```bash
VITE_GOOGLE_CLIENT_ID=your-actual-google-client-id-here
VITE_GOOGLE_REDIRECT_URI=https://final-8decdnoi8-adrian-b7e84541.vercel.app/auth/google/callback
VITE_ALLOW_MOCK_FALLBACK=true
```

### 3. Alternative: Use Mock Authentication

If you prefer to skip OAuth setup for now, the app supports mock authentication:

1. On the login page, use any email/password combination
2. The system will create a demo account automatically
3. This is perfect for testing and demonstration purposes

### 4. Current Production URLs

- Primary: https://final-8decdnoi8-adrian-b7e84541.vercel.app
- Alternative: https://final-fw3s16733-adrian-b7e84541.vercel.app

### 5. Testing OAuth

After configuration:
1. Visit the production app
2. Click "Continue with Google"
3. Should redirect to Google login
4. After successful login, should redirect back to the app

## Need Help?

If you need assistance with this setup:
1. Ensure you have a Google Cloud Project
2. Make sure billing is enabled (required for OAuth)
3. Check that the OAuth consent screen is configured
4. Verify the redirect URIs match exactly (including trailing slashes)

## Temporary Workaround

For immediate access, use the regular email/password login form with any credentials - the mock authentication system will create a demo account for testing purposes.