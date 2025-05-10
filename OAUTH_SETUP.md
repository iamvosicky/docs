# OAuth Setup Guide

This guide explains how to set up OAuth credentials for Google and Apple Sign In.

## Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" and select "OAuth client ID"
5. Select "Web application" as the application type
6. Add your application name
7. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Your production domain (e.g., `https://your-app.com`)
8. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://your-app.com/api/auth/callback/google` (for production)
9. Click "Create"
10. Copy the Client ID and Client Secret to your `.env.local` file:
    ```
    GOOGLE_CLIENT_ID=your-client-id
    GOOGLE_CLIENT_SECRET=your-client-secret
    ```

## Apple Sign In Setup

1. Go to the [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to "Certificates, Identifiers & Profiles"
3. Under "Identifiers", add a new identifier or select an existing one
4. Enable "Sign In with Apple" capability
5. Configure your domain and return URLs:
   - Return URLs: `http://localhost:3000/api/auth/callback/apple` (for development) and `https://your-app.com/api/auth/callback/apple` (for production)
6. Create a Services ID for your application
7. Generate a key for Sign In with Apple
8. Download the key and note the Key ID
9. Add the following to your `.env.local` file:
    ```
    APPLE_CLIENT_ID=your-services-id
    APPLE_CLIENT_SECRET=your-generated-secret
    ```

## NextAuth Secret

Generate a secure random string for your NextAuth secret:

```bash
openssl rand -base64 32
```

Add this to your `.env.local` file:

```
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=http://localhost:3000
```

For production, set `NEXTAUTH_URL` to your production URL.

## Cloudflare Pages Environment Variables

When deploying to Cloudflare Pages, add these environment variables in the Cloudflare Dashboard:

1. Go to your Cloudflare Pages project
2. Navigate to Settings > Environment variables
3. Add all the variables from your `.env.local` file
4. Make sure to set different values for production and preview environments if needed
