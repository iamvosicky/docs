# Contract Generator Platform - Quick Start Guide

This guide provides quick instructions for setting up and running the Contract Generator platform locally.

## Prerequisites

- Node.js 20 or later
- npm 9 or later
- LibreOffice (for PDF conversion)
- Wrangler CLI (`npm install -g wrangler`)

## Starting the Platform Locally

### 1. Start the Cloudflare Worker API

```bash
cd /Users/iamvosicky/dev/Docs/contract-generator/worker
npm run dev
```

The worker will be available at http://localhost:8787.

### 2. Start the PDF Service

```bash
cd /Users/iamvosicky/dev/Docs/contract-generator/pdf-service
npm run dev
```

The PDF service will be available at http://localhost:8080.

### 3. Start the Next.js Frontend

```bash
cd /Users/iamvosicky/dev/Docs/contract-generator
npm run dev
```

The frontend will be available at http://localhost:3000.

## Testing the Platform

1. Open http://localhost:3000 in your browser
2. Log in with the default credentials (if required)
3. Create a template
4. Generate a contract
5. Download the PDF

## Troubleshooting

### Worker Issues

- Make sure Wrangler is installed globally: `npm install -g wrangler`
- Check if the worker is running: `curl http://localhost:8787`
- Verify the `.dev.vars` file contains the correct environment variables

### PDF Service Issues

- Make sure LibreOffice is installed
- Check if the service is running: `curl http://localhost:8080/health`
- Verify the temp directory exists and is writable

### Frontend Issues

- Check if the frontend is running: `curl http://localhost:3000`
- Verify the `.env.local` file contains the correct environment variables
- Check the browser console for errors

## Next Steps

For more detailed information, see:

- [Local Development Guide](./LOCAL_DEVELOPMENT.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [API Documentation](./API.md) (if available)
