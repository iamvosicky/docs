# Contract Generation Platform

A self-service web application that lets authenticated users generate customized legal documents in .docx and .pdf formats by filling in variable data.

## Project Structure

- `/src` - Next.js frontend application
- `/worker` - Cloudflare Worker backend
- `/pdf-service` - Self-hosted PDF conversion service

## Features

- Secure login (SSO / email link)
- Browse & select predefined templates
- Dynamic form auto-generated from template-schema
- Generate DOCX locally in Worker and PDF via self-hosted service
- Admin dashboard for template & user management
- Cloudflare-native stack (Pages, Workers, R2, D1)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Cloudflare account with Workers, R2, and D1 enabled
- Docker (for PDF service)

### Frontend Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Worker Development

```bash
# Navigate to worker directory
cd worker

# Install dependencies
npm install

# Start development server
npm run dev
```

### PDF Service Development

```bash
# Navigate to PDF service directory
cd pdf-service

# Install dependencies
npm install

# Start development server
npm run dev
```

## Deployment

### Frontend

```bash
# Build for production
npm run build

# Deploy to Cloudflare Pages
npm run deploy
```

### Worker

```bash
# Navigate to worker directory
cd worker

# Deploy to Cloudflare Workers
npm run deploy
```

### PDF Service

```bash
# Navigate to PDF service directory
cd pdf-service

# Build Docker image
docker build -t contract-generator-pdf-service .

# Deploy to Fly.io
fly launch
fly deploy
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
