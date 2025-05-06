# Contract Generator Platform Deployment Guide

This guide provides step-by-step instructions for deploying all components of the Contract Generator platform.

## Prerequisites

- Cloudflare account with Workers, Pages, D1, and R2 enabled
- Node.js 20 or later
- Docker (for PDF service)
- Wrangler CLI (`npm install -g wrangler`)

## 1. Deploying the Cloudflare Worker Backend API

### 1.1. Configure Cloudflare Resources

1. **Create D1 Database**:
   ```bash
   wrangler d1 create contract_generator
   ```
   Note the database ID and update it in `worker/wrangler.toml`.

2. **Create R2 Bucket**:
   ```bash
   wrangler r2 bucket create contract-generator
   ```

3. **Create Queue**:
   ```bash
   wrangler queues create pdf-conversion
   ```

### 1.2. Deploy the Worker

1. Navigate to the worker directory:
   ```bash
   cd worker
   ```

2. Set up environment variables:
   ```bash
   ./set-env-vars.sh
   ```
   You'll be prompted to enter values for each variable.

3. Initialize the database:
   ```bash
   ./init-db.sh
   ```

4. Deploy the worker:
   ```bash
   npm run deploy
   ```

5. Note the worker URL (e.g., `https://contract-generator-worker.yourdomain.workers.dev`).

## 2. Setting Up the PDF Service

### 2.1. Configure Environment Variables

1. Navigate to the PDF service directory:
   ```bash
   cd ../pdf-service
   ```

2. Create a production environment file:
   ```bash
   cp .env.example .env.production
   ```

3. Edit `.env.production` with your Cloudflare credentials:
   ```
   PORT=8080
   CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
   CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
   CLOUDFLARE_R2_BUCKET=contract-generator
   CLOUDFLARE_D1_DATABASE=contract_generator
   ```

### 2.2. Deploy with Docker

1. Build and run the Docker container:
   ```bash
   ./deploy.sh
   ```

2. For cloud deployment:
   - Push the Docker image to a registry
   - Deploy to your preferred cloud provider (AWS, GCP, Azure, etc.)
   - Ensure port 8080 is accessible

3. Note the PDF service URL (e.g., `https://pdf-service.yourdomain.com`).

## 3. Deploying the Next.js Frontend

### 3.1. Configure Environment Variables

1. Navigate to the root directory:
   ```bash
   cd ..
   ```

2. Edit `.env.production` with the correct URLs:
   ```
   NEXT_PUBLIC_API_URL=https://contract-generator-worker.yourdomain.workers.dev
   NEXT_PUBLIC_SITE_URL=https://contract-generator.pages.dev
   NEXT_PUBLIC_PDF_SERVICE_URL=https://pdf-service.yourdomain.com
   ```

### 3.2. Deploy to Cloudflare Pages

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to Cloudflare Pages:
   ```bash
   npm run pages:deploy
   ```

3. Alternatively, set up continuous deployment via GitHub:
   - Connect your GitHub repository in the Cloudflare Pages dashboard
   - Configure build settings:
     - Build command: `npm run build`
     - Build output directory: `contract-generator/.vercel/output/static`
     - Root directory: `/` (the repository root)
   - Add environment variables in the Cloudflare Pages dashboard

## 4. Testing the Deployment

1. Visit your frontend URL (e.g., `https://contract-generator.pages.dev`)
2. Test the authentication flow
3. Create a template and generate a contract
4. Verify PDF generation works correctly

## 5. Troubleshooting

### 5.1. Cloudflare Worker Issues

- Check the Cloudflare Workers dashboard for errors
- Verify environment variables are set correctly
- Test the API endpoints using a tool like Postman

### 5.2. PDF Service Issues

- Check Docker logs: `docker logs contract-generator-pdf-service`
- Verify LibreOffice is installed correctly in the container
- Test the service locally: `curl http://localhost:8080/health`

### 5.3. Frontend Issues

- Check the Cloudflare Pages deployment logs
- Verify environment variables are set correctly
- Test with browser developer tools open to check for errors

## 6. Maintenance

### 6.1. Updating the Application

1. Pull the latest changes from the repository
2. Rebuild and redeploy each component

### 6.2. Monitoring

- Set up Cloudflare Analytics for the frontend
- Monitor worker usage in the Cloudflare dashboard
- Set up logging for the PDF service

## 7. Security Considerations

- Rotate API tokens regularly
- Use environment variables for sensitive information
- Implement proper authentication and authorization
- Set up CORS correctly to prevent unauthorized access
