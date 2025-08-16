# Supabase Authentication Setup Guide

This guide will help you configure Google and Microsoft OAuth providers in your Supabase project.

## Prerequisites

- Supabase project created and configured
- Access to Supabase Dashboard
- Google Cloud Console access (for Google OAuth)
- Microsoft Azure Portal access (for Microsoft OAuth)

## 1. Configure Google OAuth Provider

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `https://zvpyndcaaccpyjoqwfxy.supabase.co/auth/v1/callback`
     - `http://localhost:5000/auth/v1/callback` (for development)
   - Save the Client ID and Client Secret

### Step 2: Configure in Supabase

1. Go to your Supabase Dashboard
2. Navigate to "Authentication" > "Providers"
3. Find "Google" and click to configure
4. Enable the provider
5. Enter your Google Client ID and Client Secret
6. Set the redirect URL to: `https://zvpyndcaaccpyjoqwfxy.supabase.co/auth/v1/callback`
7. Save the configuration

## 2. Configure Microsoft OAuth Provider

### Step 1: Create Microsoft App Registration

1. Go to [Microsoft Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Fill in the details:
   - Name: "FormCraft App"
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI: `https://zvpyndcaaccpyjoqwfxy.supabase.co/auth/v1/callback`
5. Click "Register"
6. Note down the "Application (client) ID"
7. Go to "Certificates & secrets" > "Client secrets"
8. Click "New client secret" and create a secret
9. Note down the secret value (you won't be able to see it again)

### Step 2: Configure API Permissions

1. In your app registration, go to "API permissions"
2. Click "Add a permission"
3. Choose "Microsoft Graph"
4. Select "Delegated permissions"
5. Add these permissions:
   - `openid`
   - `profile`
   - `email`
6. Click "Grant admin consent" if you have admin rights

### Step 3: Configure in Supabase

1. Go to your Supabase Dashboard
2. Navigate to "Authentication" > "Providers"
3. Find "Azure" and click to configure
4. Enable the provider
5. Enter your Microsoft Application (client) ID and Client Secret
6. Set the redirect URL to: `https://zvpyndcaaccpyjoqwfxy.supabase.co/auth/v1/callback`
7. Save the configuration

## 3. Update Site URL in Supabase

1. Go to "Authentication" > "URL Configuration"
2. Set the Site URL to your production domain (e.g., `https://your-app.vercel.app`)
3. Add redirect URLs:
   - `https://your-app.vercel.app/**`
   - `http://localhost:5000/**` (for development)

## 4. Test the Configuration

1. Start your development server: `npm run dev`
2. Navigate to your app
3. Click the "Account" button
4. Try signing in with both Google and Microsoft
5. Check that the authentication flow works correctly

## 5. Environment Variables

Make sure your `.env` file has the correct Supabase configuration:

```env
# Supabase Configuration (Client-side)
VITE_SUPABASE_URL=https://zvpyndcaaccpyjoqwfxy.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Supabase Configuration (Server-side)
SUPABASE_URL=https://zvpyndcaaccpyjoqwfxy.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Troubleshooting

### Common Issues:

1. **Redirect URI mismatch**: Ensure the redirect URIs in Google/Microsoft match exactly with Supabase
2. **CORS errors**: Check that your site URL is correctly configured in Supabase
3. **Provider not enabled**: Make sure the OAuth providers are enabled in Supabase Dashboard
4. **Invalid credentials**: Double-check your Client IDs and secrets

### Testing Locally:

- Use `http://localhost:5000` as your local development URL
- Make sure to add localhost redirect URIs in both Google and Microsoft configurations
- Test with both development and production URLs

## Security Notes

- Never commit OAuth secrets to version control
- Use environment variables for all sensitive configuration
- Regularly rotate OAuth secrets
- Monitor authentication logs in Supabase Dashboard

## Next Steps

After completing this setup:
1. Test the authentication flow thoroughly
2. Implement user profile management
3. Add role-based access control if needed
4. Set up email templates in Supabase for password reset, etc.
