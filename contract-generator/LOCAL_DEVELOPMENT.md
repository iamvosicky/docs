# Contract Generator Platform - Local Development Guide

This guide provides instructions for setting up and running the Contract Generator platform locally for development.

## Prerequisites

- Node.js 20 or later
- npm 9 or later
- LibreOffice (for PDF conversion)
- Wrangler CLI (`npm install -g wrangler`)

## Important Note About LibreOffice

The PDF service requires LibreOffice to convert DOCX files to PDF. If you don't have LibreOffice installed, you'll see a warning during setup, and PDF conversion will not work. Install LibreOffice using one of these methods:

- **macOS**: `brew install libreoffice`
- **Ubuntu/Debian**: `sudo apt-get install libreoffice`
- **Windows**: Download from [LibreOffice website](https://www.libreoffice.org/download/download/)

## Quick Start

The easiest way to start all components is to use the master script:

```bash
./start-local.sh
```

This script will:
1. Set up the Cloudflare Worker with a local D1 database
2. Set up the PDF service
3. Start all three components in separate terminal windows

## Manual Setup

If you prefer to set up and run each component individually, follow these steps:

### 1. Cloudflare Worker Backend API

#### 1.1. Setup

```bash
cd worker
./setup-local.sh
```

This script will:
- Set up a local database directory
- Create an empty database file if needed

#### 1.2. Run

```bash
cd worker
npm run dev
```

The worker will be available at http://localhost:8787.

### 2. PDF Service

#### 2.1. Setup

```bash
cd pdf-service
./setup-local.sh
```

This script will:
- Check if LibreOffice is installed
- Create the temp directory
- Install dependencies

#### 2.2. Run

```bash
cd pdf-service
npm run dev
```

The PDF service will be available at http://localhost:8080.

### 3. Next.js Frontend

#### 3.1. Setup

The frontend uses environment variables from `.env.local` for local development.

#### 3.2. Run

```bash
npm run dev
```

The frontend will be available at http://localhost:3000.

## Testing the Local Setup

### 1. Test the Worker API

```bash
curl http://localhost:8787/
```

Expected response:
```json
{
  "message": "Contract Generator API",
  "version": "0.1.0"
}
```

### 2. Test the PDF Service

```bash
curl http://localhost:8080/health
```

Expected response:
```json
{
  "status": "ok"
}
```

### 3. Test the Frontend

Open http://localhost:3000 in your browser. You should see the Contract Generator homepage.

## Development Workflow

1. Make changes to the code
2. Test your changes locally
3. Commit your changes
4. Push to the repository
5. Deploy to production (see DEPLOYMENT.md)

## Troubleshooting

### Worker Issues

- Check the terminal output for errors
- Verify that the local D1 database is set up correctly
- Make sure the `.dev.vars` file contains the correct environment variables

### PDF Service Issues

- Check if LibreOffice is installed and accessible
- Verify that the temp directory exists and is writable
- Check the terminal output for errors

### Frontend Issues

- Check the browser console for errors
- Verify that the environment variables in `.env.local` are correct
- Make sure the worker and PDF service are running

## Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Hono Documentation](https://hono.dev/)
- [LibreOffice Documentation](https://documentation.libreoffice.org/)
