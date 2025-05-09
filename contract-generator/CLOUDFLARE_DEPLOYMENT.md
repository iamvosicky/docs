# Cloudflare Pages Deployment Guide

This guide provides instructions for deploying the Contract Generator application to Cloudflare Pages, addressing the Node.js version requirements.

## Node.js Version Requirements

The Contract Generator uses Next.js 15.3.1, which requires Node.js version 18.18.0 or higher. Cloudflare Pages may default to an older version, causing build failures.

## Deployment Options

### Option 1: Deploy via Cloudflare Dashboard

1. Log in to the Cloudflare Dashboard
2. Navigate to Pages
3. Click "Create a project"
4. Connect your GitHub repository
5. Configure the build settings:
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Build output directory**: `.vercel/output/static`
   - **Root directory**: `/contract-generator` (if your repo has multiple projects)
   - **Node.js version**: Select 20.x (or at least 18.18.0)

6. Add environment variables:
   - `NODE_VERSION`: `20.10.0`
   - Add all variables from `.env.production`

7. Click "Save and Deploy"

### Option 2: Deploy via Wrangler CLI

1. Make sure you have Wrangler CLI installed:
   ```
   npm install -g wrangler
   ```

2. Log in to Cloudflare:
   ```
   wrangler login
   ```

3. Navigate to your project directory:
   ```
   cd contract-generator
   ```

4. Build the project:
   ```
   npm run build
   ```

5. Deploy to Cloudflare Pages:
   ```
   npx @cloudflare/next-on-pages
   wrangler pages deploy .vercel/output/static
   ```

## Troubleshooting Node.js Version Issues

If you encounter Node.js version errors during deployment, try the following:

1. **Check the Node.js version in Cloudflare Pages**:
   - In the Cloudflare Dashboard, go to Pages > Your Project > Settings > Environment variables
   - Add `NODE_VERSION` with value `20.10.0`

2. **Verify the configuration files**:
   - `.node-version`: Should contain `20.10.0`
   - `.nvmrc`: Should contain `20.10.0`
   - `package.json`: Should have `"engines": { "node": ">=20.10.0" }`
   - `cloudflare-pages.json`: Should have `"NODE_VERSION": "20.10.0"`

3. **Manual build with specific Node.js version**:
   ```
   NODE_VERSION=20.10.0 npm run build
   ```

## Post-Deployment Verification

After successful deployment:

1. Visit your Cloudflare Pages URL (e.g., `https://contract-generator.pages.dev`)
2. Test all functionality:
   - User authentication
   - Document generation
   - PDF preview
   - Form submissions

## Setting Up a Custom Domain

1. In the Cloudflare Pages dashboard:
   - Go to your project
   - Click on "Custom domains"
   - Click "Set up a custom domain"
   - Follow the instructions to add your domain

## Continuous Deployment

Cloudflare Pages automatically sets up continuous deployment from your GitHub repository. When you push changes to your repository, Cloudflare Pages will automatically build and deploy your site.

To disable automatic deployments:
1. Go to Pages > Your Project > Settings > Builds & deployments
2. Toggle off "Enable automatic deployments"

## Monitoring and Logs

To view build logs and monitor your deployment:
1. Go to Pages > Your Project > Deployments
2. Click on a deployment to view details and logs

## Rollback to Previous Deployment

If needed, you can rollback to a previous deployment:
1. Go to Pages > Your Project > Deployments
2. Find the deployment you want to rollback to
3. Click the three dots menu (⋮)
4. Select "Rollback to this deployment"
